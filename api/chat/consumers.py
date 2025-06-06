from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer 
import json
import base64

from django.db.models.functions import Coalesce

from .serializers import UserSerializer, SearchSerializer, RequestSerializer, FriendSerializer, MessageSerializer
from io import BytesIO
from PIL import Image as PILImage
import os
from django.db.models import Q, OuterRef, Exists
from .models import User, Connection, Message

class ChatConsumer(WebsocketConsumer):
    
    def connect(self):
        user = self.scope['user']
        print(user, user.is_authenticated)
        if not user.is_authenticated:
            return
        self.username = user.username

        # Add user to group
        async_to_sync(self.channel_layer.group_add)(
            self.username, self.channel_name
        )
        self.accept()

    def disconnect(self, close_code):
        # Remove user from group
        async_to_sync(self.channel_layer.group_discard)(
            self.username, self.channel_name
        )
        pass

    #----------------------
    #   Handle Requests 
    #----------------------
    
    def receive(self, text_data=None):
        # Parse JSON data
        data = json.loads(text_data)
        data_source = data.get('source')
        print('receive', json.dumps(data, indent=2))
        
        # Handle thumbnail
        if data_source == 'thumbnail':
            self.receive_thumbnail(data)
        
        # Handle search
        if data_source == 'search':
            self.receive_search(data)
        
        # Handle request connect
        if data_source == 'request.connect':
            self.receive_request_connect(data)
        
        # Handle request list
        if data_source == 'request.list':
            self.receive_request_list(data)
        
        # Handle request accept
        if data_source == 'request.accept':
            self.receive_request_accept(data)
        
        # Handle request decline
        if data_source == 'request.decline':
            self.receive_request_decline(data)

        # Get message list 
        if data_source == 'message.list':
            self.receive_message_list(data)

        # Get friends list 
        if (data_source == 'friends.list'):
            self.receive_friends_list(data)

        if (data_source == 'message.send'):
            self.receive_message_send(data)
      
    
    def receive_message_send(self, data):
        user = self.scope['user']
        connectionId = data.get('connectionId')
        message_text = data.get('message')
        
        try:
            connection = Connection.objects.get(pk=connectionId)
        except Connection.DoesNotExist:
            print(f"Connection {connectionId} does not exist")
            return
        
        # Create message
        message = Message.objects.create(
            connection=connection,
            user=user,
            text=message_text
        )

        #Get recipient friend 
        recipient = connection.sender
        if (connection.sender == user):
            recipient = connection.receiver
        
        serialized_message = MessageSerializer(message, 
        context={
            'user': user
        })

        serialized_friend = UserSerializer(recipient)

        data = {
            'message': serialized_message.data,
            'friend': serialized_friend.data
        }
        
        # Send message back to sender 
        self.send_group(user.username, 'message.send', data)

        serialized_message = MessageSerializer(message,
        context={
            'user': recipient
        })

        serialized_friend = UserSerializer(user)

        data = {
            'message': serialized_message.data,
            'friend': serialized_friend.data
        }
        
        # Send message to recipient
        self.send_group(recipient.username, 'message.send', data)
        
    def receive_message_list(self, data): 
        connectionId = data.get('connectionId')
        page = data.get('page')
        user = self.scope['user']

        #Get connection 
        try: 
            connection = Connection.objects.get(pk=connectionId)
        except Connection.DoesNotExist:
            print(f"Connection {connectionId} does not exist")
            return

        messages = Message.objects.filter(connection=connection).order_by('-created')

        serialized_message = MessageSerializer(messages, 
        context = {
            'user': user
        },
        many=True)

        #Get recipient
        recipient = connection.sender 
        if connection.sender == user:
            recipient = connection.receiver
        
        # Serialize friend 
        serialized_friend = UserSerializer(recipient)

        data = {
            'messages': serialized_message.data,
            'friend': serialized_friend.data
        }

        self.send_group(user.username, 'message.list', data)


    def receive_friends_list(self, data): 
        user = self.scope['user']
        # Latest message 
        latest_message = Message.objects.filter(connection=OuterRef('id')).order_by('-created')[:1]
      
        connections = Connection.objects.filter(
            Q(sender=user, accepted=True) | Q(receiver=user, accepted=True)
        ).annotate(
            latest_text=latest_message.values('text'),
            latest_created=latest_message.values('created')
        ).order_by(
            Coalesce('latest_created', 'updated')
        )
        
        serialized = FriendSerializer(connections, context={'user': user}, many=True)
        self.send_group(user.username, 'friends.list', serialized.data)

    def receive_request_accept(self, data):
        username = data.get('username')
        try:
            connection = Connection.objects.get(
                sender__username = username,
                receiver = self.scope['user']
            )
        except Connection.DoesNotExist:
            print('Error: connection does not exist')
            return

        connection.accepted = True 
        connection.save()

        serialized = RequestSerializer(connection)

        #Send to both users 
        self.send_group(connection.sender.username, 'request.accept', serialized.data)
        self.send_group(connection.receiver.username, 'request.accept', serialized.data)
        
    def receive_thumbnail(self, data):
        user = self.scope['user']

        try:
            base64_image = data.get('base64')
            
            if ',' in base64_image:
                base64_image = base64_image.split(',')[1]
                
            image_data = base64.b64decode(base64_image)
            
            buffer = BytesIO(image_data)
            image = PILImage.open(buffer)
            
            if image.mode == 'RGBA':
                image = image.convert('RGB')
                
            max_size = (400, 400)
            image.thumbnail(max_size, PILImage.LANCZOS)
            
            output_buffer = BytesIO()
            image.save(output_buffer, format='JPEG', quality=100)
            output_buffer.seek(0)
            
            encoded_image = base64.b64encode(output_buffer.getvalue()).decode('utf-8')
            
            output_buffer.seek(0)
            
            filename = data.get('filename')
            if not filename.lower().endswith('.jpg'):
                filename = os.path.splitext(filename)[0] + '.jpg'
                
            user.thumbnail.save(filename, output_buffer, save=True)
            
            serialized = UserSerializer(user)
            user_data = serialized.data
            
            user_data['thumbnail_base64'] = f"data:image/jpeg;base64,{encoded_image}"
            
            print("Sending user data with base64 thumbnail")
            
            # Add detailed logging
            print("User data structure:", user_data)
            print("Thumbnail base64 exists:", "thumbnail_base64" in user_data)
            
            # Send the data back to the client directly
            self.send(text_data=json.dumps({
                'source': 'thumbnail',
                'user': user_data
            }))
            
            print(f"Image processed and saved successfully: {user.thumbnail.url}")
            
        except Exception as e:
            print(f"Error processing image: {str(e)}")
            # Send error back to client
            self.send(text_data=json.dumps({
                'error': f"Error processing image: {str(e)}"
            }))
    
    def receive_search(self, data):
        
        query = data.get('query')
        
        # Search users
        users = User.objects.filter(
            Q(username__icontains=query) | Q(first_name__icontains=query) | Q(last_name__icontains=query)
        ).exclude(
            username=self.username
        ).annotate(
            pending_them=Exists(
                Connection.objects.filter(
                    sender=self.scope['user'],
                    receiver=OuterRef('pk'),
                    accepted=False
                )
            ),
            pending_me=Exists(
                Connection.objects.filter(
                    receiver=self.scope['user'],
                    sender=OuterRef('pk'),
                    accepted=False
                )
            ),
            connected=Exists(
                Connection.objects.filter(
                    Q(sender=self.scope['user'], receiver=OuterRef('pk'), accepted=True) |
                    Q(receiver=self.scope['user'], sender=OuterRef('pk'), accepted=True),
                    accepted=True
                )
            )
        )
        
        # Serialize users
        serialized_users = SearchSerializer(users, many=True).data
        
   
        # Send back to client
        self.send(text_data=json.dumps({
            'source': 'search',
            'results': serialized_users
        }))
   
    def receive_request_connect(self, data):
        username = data.get('username')
        print(username)
        
        #Attempt to fetch receiver name 
        try:
            receiver = User.objects.get(username=username)
            receiver_serialized = UserSerializer(receiver).data
        except User.DoesNotExist:
            print(f"User {username} does not exist")
            receiver = None
            return
        
        # Send back to client
        self.send(text_data=json.dumps({
            'source': 'request.connect',
            'receiver': receiver_serialized
        }))

        # Create connection
        connection, _ = Connection.objects.get_or_create(
            sender = self.scope['user'],
            receiver = receiver
        )

        serialized = RequestSerializer(connection)

        self.send_group(connection.sender.username, 'request.connect', serialized.data)

        self.send_group(connection.receiver.username, 'request.connect', serialized.data)
    # Catch broadcast to client helpers 

    def receive_request_list(self, data):
        user = self.scope['user']
        connections = Connection.objects.filter(receiver=user, accepted=False)
        
        serialized = RequestSerializer(connections, many=True)

        self.send_group(user.username, 'request.list', serialized.data)
        
    def send_group(self, group, source, data):
        reponse = {
            'type': 'broadcast_group',
            'source': source,
            'data': data
        }
        async_to_sync(self.channel_layer.group_send)(
            group, reponse
        )
    
    def broadcast_group(self, data):
        '''
        data: 
            - type: broadcast_group
            - source: where it originated from 
            - data: whatever you want to send as a dictionary
        '''
        data.pop('type')
        # only send the source + data
        self.send(text_data=json.dumps(data))