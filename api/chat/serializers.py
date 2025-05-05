from typing import override
from rest_framework import serializers
from .models import User, Connection
from django.core.files.base import ContentFile
import base64
import os

class SignUpSeralizer(serializers.ModelSerializer):
    thumbnail = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'thumbnail']
        extra_kwargs = {
            'password': {'write_only': True},
        }

    def create(self, validated_data):
        username = validated_data['username'].lower()
        first_name = validated_data['first_name'].lower()
        last_name = validated_data['last_name'].lower()
        email = validated_data['email'].lower()
        password = validated_data['password']
        thumbnail_data = validated_data.get('thumbnail')

        user = User.objects.create(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
        )
        
        if thumbnail_data:
            try:
                # Extract the base64 data (remove the data:image/jpeg;base64, prefix)
                format, imgstr = thumbnail_data.split(';base64,')
                ext = format.split('/')[-1]
                
                # Create a ContentFile from the base64 data
                data = ContentFile(base64.b64decode(imgstr))
                
                # Generate a filename
                filename = f"{username}_avatar.{ext}"
                
                # Save the file
                user.thumbnail.save(filename, data, save=True)
            except Exception as e:
                print(f"Error saving thumbnail: {e}")

        user.set_password(password)
        user.save()
        return user
        
class UserSerializer(serializers.ModelSerializer):
   name = serializers.SerializerMethodField()
   
   class Meta:
        model = User
        fields = ['username', 'name', 'password', 'thumbnail']
    
   def get_name(self, obj):
        fname = obj.first_name.capitalize()
        lname = obj.last_name.capitalize()
        return f'{fname} {lname}'
  

class SearchSerializer(UserSerializer):
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = User 
        fields = ['username', 'name', 'thumbnail', 'status']

    def get_status(self, obj):
        if obj.pending_them:
            return 'pending-them'
        elif obj.pending_me:
            return 'pending-me'
        elif obj.connected:
            return 'connected'
        return 'no-connection'

class RequestSerializer(serializers.ModelSerializer):
    sender = UserSerializer()
    receiver = UserSerializer()
    
    class Meta:
        model = Connection
        fields = ['id', 'sender', 'receiver', 'created']

class FriendSerializer(serializers.ModelSerializer):
    friend = serializers.SerializerMethodField()
    preview = serializers.SerializerMethodField()
    
    class Meta:
        model = Connection
        fields = ['id', 'friend', 'preview', 'updated']
    
    def get_friend(self, obj): 
        if self.context['user'] == obj.sender:
            return UserSerializer(obj.receiver).data
        elif self.context['user'] == obj.receiver:
            return UserSerializer(obj.sender).data
        else: 
            return None   

    def get_preview(self, obj): 
        return 'You made a connection'