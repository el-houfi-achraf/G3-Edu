"""
API Views pour les vidéos.

Endpoints:
- GET /api/videos/ : Liste des vidéos publiées
- GET /api/videos/<id>/ : Détail d'une vidéo
- GET /api/categories/ : Liste des catégories
- GET /api/categories/<id>/ : Catégorie avec ses vidéos
- GET /api/dashboard/ : Données pour le dashboard (catégories + vidéos)
"""

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Video, Category
from .serializers import (
    VideoSerializer, 
    VideoListSerializer, 
    CategorySerializer,
    CategoryWithVideosSerializer
)


class DashboardAPIView(APIView):
    """
    API pour le dashboard.
    
    GET /api/dashboard/
    
    Retourne toutes les données nécessaires pour le dashboard :
    - Catégories avec leurs vidéos
    - Vidéos sans catégorie
    - Statistiques
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Catégories avec vidéos publiées
        categories = Category.objects.prefetch_related(
            'videos'
        ).filter(
            videos__is_published=True
        ).distinct().order_by('order', 'name')
        
        # Vidéos sans catégorie
        uncategorized_videos = Video.objects.filter(
            is_published=True,
            category__isnull=True
        ).order_by('order', '-created_at')
        
        # Total des vidéos
        total_videos = Video.objects.filter(is_published=True).count()
        
        # Sérialisation
        categories_data = []
        for category in categories:
            cat_videos = category.videos.filter(is_published=True).order_by('order', '-created_at')
            categories_data.append({
                'id': category.id,
                'name': category.name,
                'description': category.description,
                'order': category.order,
                'videos': VideoListSerializer(cat_videos, many=True).data
            })
        
        return Response({
            'categories': categories_data,
            'uncategorized_videos': VideoListSerializer(uncategorized_videos, many=True).data,
            'total_videos': total_videos,
            'user': {
                'first_name': request.user.first_name,
                'username': request.user.username,
            }
        }, status=status.HTTP_200_OK)


class VideoListAPIView(APIView):
    """
    API liste des vidéos.
    
    GET /api/videos/
    GET /api/videos/?category=<id>
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        videos = Video.objects.filter(is_published=True)
        
        # Filtre par catégorie
        category_id = request.query_params.get('category')
        if category_id:
            videos = videos.filter(category_id=category_id)
        
        videos = videos.order_by('category__order', 'order', '-created_at')
        
        return Response({
            'videos': VideoListSerializer(videos, many=True).data,
            'count': videos.count()
        }, status=status.HTTP_200_OK)


class VideoDetailAPIView(APIView):
    """
    API détail d'une vidéo.
    
    GET /api/videos/<id>/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, video_id):
        video = get_object_or_404(Video, id=video_id, is_published=True)
        
        # Vidéos similaires
        if video.category:
            related_videos = Video.objects.filter(
                is_published=True,
                category=video.category
            ).exclude(id=video.id)[:5]
        else:
            related_videos = Video.objects.filter(
                is_published=True
            ).exclude(id=video.id)[:5]
        
        return Response({
            'video': VideoSerializer(video).data,
            'related_videos': VideoListSerializer(related_videos, many=True).data
        }, status=status.HTTP_200_OK)


class CategoryListAPIView(APIView):
    """
    API liste des catégories.
    
    GET /api/categories/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        categories = Category.objects.all().order_by('order', 'name')
        
        return Response({
            'categories': CategorySerializer(categories, many=True).data,
            'count': categories.count()
        }, status=status.HTTP_200_OK)


class CategoryDetailAPIView(APIView):
    """
    API détail d'une catégorie avec ses vidéos.
    
    GET /api/categories/<id>/
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request, category_id):
        category = get_object_or_404(Category, id=category_id)
        videos = category.videos.filter(is_published=True).order_by('order', '-created_at')
        
        return Response({
            'category': CategorySerializer(category).data,
            'videos': VideoListSerializer(videos, many=True).data,
            'count': videos.count()
        }, status=status.HTTP_200_OK)
