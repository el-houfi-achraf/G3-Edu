"""
Configuration de l'admin pour l'application videos.
"""

from django.contrib import admin
from .models import Video, Category


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    """
    Administration des catégories de vidéos.
    """
    list_display = ('name', 'order', 'video_count', 'created_at')
    list_editable = ('order',)
    search_fields = ('name', 'description')
    ordering = ('order', 'name')


@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    """
    Administration des vidéos.
    
    Interface complète pour le CRUD des vidéos.
    """
    list_display = ('title', 'category', 'is_published', 'order', 'created_at', 'updated_at')
    list_filter = ('is_published', 'category', 'created_at')
    list_editable = ('is_published', 'order')
    search_fields = ('title', 'description')
    ordering = ('category__order', 'order', '-created_at')
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Informations principales', {
            'fields': ('title', 'description', 'youtube_url')
        }),
        ('Organisation', {
            'fields': ('category', 'order', 'is_published')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('category')
    
    actions = ['publish_videos', 'unpublish_videos']
    
    def publish_videos(self, request, queryset):
        count = queryset.update(is_published=True)
        self.message_user(request, f"{count} vidéo(s) publiée(s).")
    publish_videos.short_description = "Publier les vidéos sélectionnées"
    
    def unpublish_videos(self, request, queryset):
        count = queryset.update(is_published=False)
        self.message_user(request, f"{count} vidéo(s) dépubliée(s).")
    unpublish_videos.short_description = "Dépublier les vidéos sélectionnées"
