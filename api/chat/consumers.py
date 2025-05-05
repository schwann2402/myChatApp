from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer 
import json
import base64

from .serializers import UserSerializer, SearchSerializer, RequestSerializer, FriendSerializer
from io import BytesIO
from PIL import Image as PILImage
import os
from django.db.models import Q, OuterRef, Exists
from .models import User, Connection

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
        #print('receive', json.dumps(data, indent=2))
        
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

        # Get friends list 
        if (data_source == 'friends.list'):
            self.receive_friends_list(data)
      

    def receive_friends_list(self, data): 
        user = self.scope['user']
        connections = Connection.objects.filter(
            Q(sender=user, accepted=True) | Q(receiver=user, accepted=True)
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