"""
Serializers pour l'API d'authentification.
"""

from rest_framework import serializers
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import UserSession


class UserSerializer(serializers.ModelSerializer):
    """Serializer pour les informations utilisateur."""
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'date_joined']
        read_only_fields = ['id', 'username', 'is_active', 'is_staff', 'date_joined']


class LoginSerializer(serializers.Serializer):
    """Serializer pour la connexion."""
    
    username = serializers.CharField(max_length=150, required=True)
    password = serializers.CharField(max_length=128, required=True, write_only=True)
    
    def validate(self, data):
        username = data.get('username')
        password = data.get('password')
        
        if username and password:
            user = authenticate(username=username, password=password)
            
            if user is None:
                raise serializers.ValidationError("Identifiants incorrects.")
            
            if not user.is_active:
                raise serializers.ValidationError("Compte désactivé.")
            
            data['user'] = user
        else:
            raise serializers.ValidationError("Nom d'utilisateur et mot de passe requis.")
        
        return data


class UserSessionSerializer(serializers.ModelSerializer):
    """Serializer pour les sessions utilisateur."""
    
    class Meta:
        model = UserSession
        fields = ['id', 'created_at', 'ip_address', 'user_agent']
        read_only_fields = ['id', 'created_at', 'ip_address', 'user_agent']


class TokenResponseSerializer(serializers.Serializer):
    """Serializer pour la réponse de connexion avec tokens."""
    
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = UserSerializer()
    message = serializers.CharField()
