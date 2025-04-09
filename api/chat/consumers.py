from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer 
import json
import base64
from .serializers import UserSerializer

from django.core.files.base import ContentFile

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
        
        if data_source == 'thumbnail':
            self.receive_thumbnail(data)
      
    def receive_thumbnail(self, data):
        user = self.scope['user']

        #convert base64 to image
        base64_image = data.get('base64')
        image = ContentFile(base64_image)
        #Update user thumbnail
        filename = data.get('filename')
        user.thumbnail.save(filename, image, save=True)
        #Serialize user data
        serialized = UserSerializer(user)

        self.send_group(self.username, 'thumbnail', serialized.data)
    
    # Catch broadcast to client helpers 
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
            