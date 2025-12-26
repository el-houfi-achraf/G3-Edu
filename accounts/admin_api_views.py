"""
API Views d'administration pour la gestion des utilisateurs, vidéos et catégories.
Accès réservé aux administrateurs (is_staff=True).
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from django.shortcuts import get_object_or_404
from videos.models import Video, Category
from videos.serializers import VideoSerializer, CategorySerializer
from .serializers import UserSerializer
from .models import UserSession
import logging

logger = logging.getLogger(__name__)


class IsAdminPermission(IsAdminUser):
    """Permission personnalisée pour vérifier si l'utilisateur est admin."""
    message = "Accès réservé aux administrateurs."


# =============================================================================
# GESTION DES UTILISATEURS
# =============================================================================

class AdminUserListAPIView(APIView):
    """
    Liste et création des utilisateurs.
    
    GET /api/admin/users/ - Liste tous les utilisateurs
    POST /api/admin/users/ - Crée un nouvel utilisateur
    """
    permission_classes = [IsAuthenticated, IsAdminPermission]
    
    def get(self, request):
        from .models import ActiveToken
        users = User.objects.all().order_by('-date_joined')
        data = []
        for user in users:
            user_data = UserSerializer(user).data
            user_data['is_staff'] = user.is_staff
            user_data['is_superuser'] = user.is_superuser
            # Compter les sessions actives (1 si token actif existe, 0 sinon)
            user_data['active_sessions'] = 1 if ActiveToken.objects.filter(user=user).exists() else 0
            data.append(user_data)
        return Response({
            'users': data,
            'count': len(data)
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        is_staff = request.data.get('is_staff', False)
        
        if not username or not password:
            return Response({
                'error': 'Nom d\'utilisateur et mot de passe requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if User.objects.filter(username=username).exists():
            return Response({
                'error': 'Ce nom d\'utilisateur existe déjà'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = User.objects.create(
            username=username,
            email=email,
            first_name=first_name,
            last_name=last_name,
            is_staff=is_staff,
            password=make_password(password)
        )
        
        logger.info(f"Utilisateur créé: {username} par {request.user.username}")
        
        return Response({
            'message': 'Utilisateur créé avec succès',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)


class AdminUserDetailAPIView(APIView):
    """
    Détail, modification et suppression d'un utilisateur.
    
    GET /api/admin/users/<id>/ - Détail d'un utilisateur
    PUT /api/admin/users/<id>/ - Modifie un utilisateur
    DELETE /api/admin/users/<id>/ - Supprime un utilisateur
    """
    permission_classes = [IsAuthenticated, IsAdminPermission]
    
    def get(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        user_data = UserSerializer(user).data
        user_data['is_staff'] = user.is_staff
        user_data['is_superuser'] = user.is_superuser
        user_data['active_sessions'] = UserSession.objects.filter(user=user).count()
        return Response({'user': user_data}, status=status.HTTP_200_OK)
    
    def put(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        
        # Empêcher de modifier son propre statut admin
        if user == request.user and 'is_staff' in request.data:
            return Response({
                'error': 'Vous ne pouvez pas modifier votre propre statut administrateur'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Mise à jour des champs
        if 'email' in request.data:
            user.email = request.data['email']
        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'is_staff' in request.data:
            user.is_staff = request.data['is_staff']
        if 'is_active' in request.data:
            user.is_active = request.data['is_active']
        if 'password' in request.data and request.data['password']:
            user.password = make_password(request.data['password'])
        
        user.save()
        
        logger.info(f"Utilisateur modifié: {user.username} par {request.user.username}")
        
        return Response({
            'message': 'Utilisateur modifié avec succès',
            'user': UserSerializer(user).data
        }, status=status.HTTP_200_OK)
    
    def delete(self, request, user_id):
        user = get_object_or_404(User, id=user_id)
        
        # Empêcher de se supprimer soi-même
        if user == request.user:
            return Response({
                'error': 'Vous ne pouvez pas supprimer votre propre compte'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        username = user.username
        user.delete()
        
        logger.info(f"Utilisateur supprimé: {username} par {request.user.username}")
        
        return Response({
            'message': f'Utilisateur {username} supprimé avec succès'
        }, status=status.HTTP_200_OK)


class AdminInvalidateUserSessionsAPIView(APIView):
    """
    Invalide toutes les sessions d'un utilisateur et blackliste ses tokens JWT.
    
    POST /api/admin/users/<id>/invalidate-sessions/
    """
    permission_classes = [IsAuthenticated, IsAdminPermission]
    
    def post(self, request, user_id):
        from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
        from .models import ActiveToken
        
        user = get_object_or_404(User, id=user_id)
        
        # 1. Invalider les sessions Django
        session_count = UserSession.invalidate_user_sessions(user)
        
        # 2. Supprimer le token actif (déconnexion immédiate)
        ActiveToken.invalidate_token(user)
        
        # 3. Blacklister tous les tokens JWT de l'utilisateur
        token_count = 0
        try:
            tokens = OutstandingToken.objects.filter(user=user)
            for token in tokens:
                try:
                    _, created = BlacklistedToken.objects.get_or_create(token=token)
                    if created:
                        token_count += 1
                except Exception:
                    pass
        except Exception as e:
            logger.warning(f"Erreur lors du blacklisting des tokens: {e}")
        
        logger.info(f"Sessions invalidées pour {user.username}: {session_count} sessions, {token_count} tokens par {request.user.username}")
        
        return Response({
            'message': f'Session invalidée pour {user.username}',
            'sessions_invalidated': session_count,
            'tokens_blacklisted': token_count
        }, status=status.HTTP_200_OK)


# =============================================================================
# GESTION DES CATÉGORIES
# =============================================================================

class AdminCategoryListAPIView(APIView):
    """
    Liste et création des catégories.
    
    GET /api/admin/categories/ - Liste toutes les catégories
    POST /api/admin/categories/ - Crée une nouvelle catégorie
    """
    permission_classes = [IsAuthenticated, IsAdminPermission]
    
    def get(self, request):
        categories = Category.objects.all().order_by('order', 'name')
        return Response({
            'categories': CategorySerializer(categories, many=True).data,
            'count': categories.count()
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        name = request.data.get('name')
        description = request.data.get('description', '')
        order = request.data.get('order', 0)
        
        if not name:
            return Response({
                'error': 'Le nom de la catégorie est requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        category = Category.objects.create(
            name=name,
            description=description,
            order=order
        )
        
        logger.info(f"Catégorie créée: {name} par {request.user.username}")
        
        return Response({
            'message': 'Catégorie créée avec succès',
            'category': CategorySerializer(category).data
        }, status=status.HTTP_201_CREATED)


class AdminCategoryDetailAPIView(APIView):
    """
    Détail, modification et suppression d'une catégorie.
    """
    permission_classes = [IsAuthenticated, IsAdminPermission]
    
    def get(self, request, category_id):
        category = get_object_or_404(Category, id=category_id)
        return Response({
            'category': CategorySerializer(category).data
        }, status=status.HTTP_200_OK)
    
    def put(self, request, category_id):
        category = get_object_or_404(Category, id=category_id)
        
        if 'name' in request.data:
            category.name = request.data['name']
        if 'description' in request.data:
            category.description = request.data['description']
        if 'order' in request.data:
            category.order = request.data['order']
        
        category.save()
        
        return Response({
            'message': 'Catégorie modifiée avec succès',
            'category': CategorySerializer(category).data
        }, status=status.HTTP_200_OK)
    
    def delete(self, request, category_id):
        category = get_object_or_404(Category, id=category_id)
        name = category.name
        category.delete()
        
        return Response({
            'message': f'Catégorie "{name}" supprimée avec succès'
        }, status=status.HTTP_200_OK)


# =============================================================================
# GESTION DES VIDÉOS
# =============================================================================

class AdminVideoListAPIView(APIView):
    """
    Liste et création des vidéos.
    
    GET /api/admin/videos/ - Liste toutes les vidéos
    POST /api/admin/videos/ - Crée une nouvelle vidéo
    """
    permission_classes = [IsAuthenticated, IsAdminPermission]
    
    def get(self, request):
        videos = Video.objects.all().order_by('-created_at')
        return Response({
            'videos': VideoSerializer(videos, many=True).data,
            'count': videos.count()
        }, status=status.HTTP_200_OK)
    
    def post(self, request):
        title = request.data.get('title')
        youtube_url = request.data.get('youtube_url')
        description = request.data.get('description', '')
        category_id = request.data.get('category')
        order = request.data.get('order', 0)
        is_published = request.data.get('is_published', True)
        
        if not title or not youtube_url:
            return Response({
                'error': 'Titre et URL YouTube requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        category = None
        if category_id:
            category = get_object_or_404(Category, id=category_id)
        
        video = Video.objects.create(
            title=title,
            youtube_url=youtube_url,
            description=description,
            category=category,
            order=order,
            is_published=is_published
        )
        
        logger.info(f"Vidéo créée: {title} par {request.user.username}")
        
        return Response({
            'message': 'Vidéo créée avec succès',
            'video': VideoSerializer(video).data
        }, status=status.HTTP_201_CREATED)


class AdminVideoDetailAPIView(APIView):
    """
    Détail, modification et suppression d'une vidéo.
    """
    permission_classes = [IsAuthenticated, IsAdminPermission]
    
    def get(self, request, video_id):
        video = get_object_or_404(Video, id=video_id)
        return Response({
            'video': VideoSerializer(video).data
        }, status=status.HTTP_200_OK)
    
    def put(self, request, video_id):
        video = get_object_or_404(Video, id=video_id)
        
        if 'title' in request.data:
            video.title = request.data['title']
        if 'youtube_url' in request.data:
            video.youtube_url = request.data['youtube_url']
        if 'description' in request.data:
            video.description = request.data['description']
        if 'category' in request.data:
            if request.data['category']:
                video.category = get_object_or_404(Category, id=request.data['category'])
            else:
                video.category = None
        if 'order' in request.data:
            video.order = request.data['order']
        if 'is_published' in request.data:
            video.is_published = request.data['is_published']
        
        video.save()
        
        return Response({
            'message': 'Vidéo modifiée avec succès',
            'video': VideoSerializer(video).data
        }, status=status.HTTP_200_OK)
    
    def delete(self, request, video_id):
        video = get_object_or_404(Video, id=video_id)
        title = video.title
        video.delete()
        
        return Response({
            'message': f'Vidéo "{title}" supprimée avec succès'
        }, status=status.HTTP_200_OK)


# =============================================================================
# STATISTIQUES DASHBOARD ADMIN
# =============================================================================

class AdminDashboardAPIView(APIView):
    """
    Statistiques pour le dashboard admin.
    
    GET /api/admin/dashboard/
    """
    permission_classes = [IsAuthenticated, IsAdminPermission]
    
    def get(self, request):
        total_users = User.objects.count()
        total_videos = Video.objects.count()
        published_videos = Video.objects.filter(is_published=True).count()
        total_categories = Category.objects.count()
        active_sessions = UserSession.objects.count()
        
        # Derniers utilisateurs
        recent_users = User.objects.order_by('-date_joined')[:5]
        
        # Dernières vidéos
        recent_videos = Video.objects.order_by('-created_at')[:5]
        
        return Response({
            'stats': {
                'total_users': total_users,
                'total_videos': total_videos,
                'published_videos': published_videos,
                'total_categories': total_categories,
                'active_sessions': active_sessions,
            },
            'recent_users': [
                {
                    'id': u.id,
                    'username': u.username,
                    'email': u.email,
                    'date_joined': u.date_joined
                } for u in recent_users
            ],
            'recent_videos': [
                {
                    'id': v.id,
                    'title': v.title,
                    'is_published': v.is_published,
                    'created_at': v.created_at
                } for v in recent_videos
            ]
        }, status=status.HTTP_200_OK)
