from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserSerializer, SignUpSeralizer
from .models import User

def get_auth_for_user(user):
    tokens = RefreshToken.for_user(user)
    print('tokens', tokens)
    print('token', tokens.access_token)
    return {
        'refresh': str(tokens),
        'access': str(tokens.access_token),
        'user': UserSerializer(user).data,
    }

# Create your views here.
class SignInView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        if not username or not password:
            return Response(status=400, data={"error": "Username and password are required"})
        
        user = authenticate(username=username, password=password)
        print('user', user)
        if not user:
            return Response(status=401, data={"error": "Invalid credentials"})
        
        user_data = get_auth_for_user(user)

        return Response(status=200, data=user_data)

class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        print(request.data)
        new_user = SignUpSeralizer(data=request.data)
        new_user.is_valid(raise_exception=True)
        user = new_user.save()


        user_data = get_auth_for_user(user)

        return Response(user_data)