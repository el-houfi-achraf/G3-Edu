"""
Serializers pour l'API des vidéos.
"""

from rest_framework import serializers
from .models import Video, Category


class CategorySerializer(serializers.ModelSerializer):
    """Serializer pour les catégories."""
    
    video_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'order', 'video_count', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_video_count(self, obj):
        return obj.videos.filter(is_published=True).count()


class VideoSerializer(serializers.ModelSerializer):
    """Serializer pour les vidéos."""
    
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    embed_url = serializers.SerializerMethodField()
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description', 'youtube_url',
            'category', 'category_name', 'order', 'is_published',
            'embed_url', 'thumbnail_url',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_embed_url(self, obj):
        return obj.get_embed_url()
    
    def get_thumbnail_url(self, obj):
        return obj.get_thumbnail_url()


class VideoListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour la liste des vidéos."""
    
    category_name = serializers.CharField(source='category.name', read_only=True, allow_null=True)
    thumbnail_url = serializers.SerializerMethodField()
    
    class Meta:
        model = Video
        fields = [
            'id', 'title', 'description',
            'category', 'category_name',
            'thumbnail_url', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_thumbnail_url(self, obj):
        return obj.get_thumbnail_url()


class CategoryWithVideosSerializer(serializers.ModelSerializer):
    """Serializer pour les catégories avec leurs vidéos."""
    
    videos = VideoListSerializer(many=True, read_only=True)
    video_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'order', 'video_count', 'videos', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_video_count(self, obj):
        return obj.videos.filter(is_published=True).count()
