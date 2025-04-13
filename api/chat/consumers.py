from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer 
import json
import base64
from .serializers import UserSerializer
from django.core.files.base import ContentFile
from io import BytesIO
from PIL import Image as PILImage
import os

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