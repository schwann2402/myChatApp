from typing import override
from rest_framework import serializers
from .models import User

class SignUpSeralizer(serializers.ModelSerializer):
    avatar = serializers.JSONField(required=False)
    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'password', 'avatar']
        extra_kwargs = {
            'password': {'write_only': True},
            'avatar': {'required': False}
        }

    @override
    def create(self, validated_data):
        username = validated_data['username'].lower()
        first_name = validated_data['first_name'].lower()
        last_name = validated_data['last_name'].lower()
        email = validated_data['email'].lower()
        avatar = validated_data['avatar']

        user = User.objects.create(
            username = username,
            first_name = first_name,
            last_name = last_name,
            email = email,
            avatar = avatar
        )
        password = validated_data['password']
        user.set_password(password)
        user.save()
        return user
        
class UserSerializer(serializers.ModelSerializer):
   name = serializers.SerializerMethodField()
   avatar = serializers.SerializerMethodField()
   
   class Meta:
        model = User
        fields = ['username', 'name', 'password', 'thumbnail', 'avatar']
    
   def get_name(self, obj):
        fname = obj.first_name.capitalize()
        lname = obj.last_name.capitalize()
        return f'{fname} {lname}'
        
   def get_avatar(self, obj):
        import json
        if obj.avatar and isinstance(obj.avatar, str):
            try:
                return json.loads(obj.avatar)
            except:
                pass
        return obj.avatar
