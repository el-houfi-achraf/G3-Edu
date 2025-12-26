"""
API Views pour l'authentification.

Endpoints:
- POST /api/auth/login/ : Connexion (invalide les anciennes sessions)
- POST /api/auth/logout/ : Déconnexion
- GET /api/auth/me/ : Informations utilisateur courant
- GET /api/auth/sessions/ : Sessions actives de l'utilisateur
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from django.contrib.auth import login
from .models import UserSession
from .serializers import LoginSerializer, UserSerializer, UserSessionSerializer
import logging

logger = logging.getLogger(__name__)


class LoginAPIView(APIView):
    """
    API de connexion avec gestion de session unique.
    
    POST /api/auth/login/
    Body: { "username": "...", "password": "..." }
    
    Retourne les tokens JWT et invalide les anciennes sessions.
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # ============================================
            # MÉCANISME DE SESSION UNIQUE
            # ============================================
            
            # 1. Invalider toutes les sessions précédentes
            invalidated_count = UserSession.invalidate_user_sessions(user)
            
            if invalidated_count > 0:
                logger.info(
                    f"API Login: {invalidated_count} ancienne(s) session(s) invalidée(s) pour {user.username}"
                )
            
            # 2. Blacklister tous les anciens tokens JWT de l'utilisateur
            try:
                tokens = OutstandingToken.objects.filter(user=user)
                for token in tokens:
                    try:
                        BlacklistedToken.objects.get_or_create(token=token)
                    except Exception:
                        pass
            except Exception as e:
                logger.warning(f"Erreur lors du blacklisting des tokens: {e}")
            
            # 3. Générer de nouveaux tokens JWT
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            # 4. Stocker le JTI comme token actif (SESSION UNIQUE)
            from .models import ActiveToken
            ip_address = self._get_client_ip(request)
            user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
            
            # Le JTI du access token est utilisé pour identifier la session
            jti = refresh.access_token.get('jti')
            ActiveToken.set_active_token(user, jti, ip_address, user_agent)
            
            logger.info(f"API Login réussi pour {user.username} depuis {ip_address}")
            
            return Response({
                'access': access_token,
                'refresh': refresh_token,
                'user': UserSerializer(user).data,
                'message': 'Connexion réussie',
                'sessions_invalidated': invalidated_count,
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def _get_client_ip(self, request):
        """Récupère l'IP du client."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            return x_forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')


class LogoutAPIView(APIView):
    """
    API de déconnexion.
    
    POST /api/auth/logout/
    Body: { "refresh": "..." } (optionnel, pour blacklister le token)
    """
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Blacklister le refresh token si fourni
            refresh_token = request.data.get('refresh')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
            
            logger.info(f"API Logout pour {request.user.username}")
            
            return Response({
                'message': 'Déconnexion réussie'
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            logger.error(f"Erreur lors du logout: {e}")
            return Response({
                'message': 'Déconnexion effectuée'
            }, status=status.HTTP_200_OK)


class CurrentUserAPIView(APIView):
    """
    API pour obtenir les informations de l'utilisateur courant.
    
    GET /api/auth/me/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        return Response({
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)


class UserSessionsAPIView(APIView):
    """
    API pour obtenir les sessions actives de l'utilisateur.
    
    GET /api/auth/sessions/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        sessions = UserSession.objects.filter(user=request.user)
        return Response({
            'sessions': UserSessionSerializer(sessions, many=True).data,
            'count': sessions.count()
        }, status=status.HTTP_200_OK)


class RefreshTokenAPIView(APIView):
    """
    API pour rafraîchir le token d'accès.
    
    POST /api/auth/refresh/
    Body: { "refresh": "..." }
    """
    permission_classes = [AllowAny]
    
    def post(self, request):
        refresh_token = request.data.get('refresh')
        
        if not refresh_token:
            return Response({
                'error': 'Refresh token requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
            return Response({
                'access': access_token,
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({
                'error': 'Token invalide ou expiré'
            }, status=status.HTTP_401_UNAUTHORIZED)
