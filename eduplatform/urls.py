"""
URL configuration for eduplatform project.
"""

from django.contrib import admin
from django.urls import path, include
from django.shortcuts import redirect

urlpatterns = [
    # Admin Django
    path('admin/', admin.site.urls),
    
    # =========================================
    # API REST (pour Next.js frontend)
    # =========================================
    path('api/auth/', include('accounts.api_urls', namespace='accounts_api')),
    path('api/admin/', include('accounts.admin_api_urls', namespace='admin_api')),
    path('api/', include('videos.api_urls', namespace='videos_api')),
    
    # =========================================
    # Templates Django (optionnel, peut être supprimé)
    # =========================================
    path('accounts/', include('accounts.urls', namespace='accounts')),
    path('videos/', include('videos.urls', namespace='videos')),
    
    # Redirect root to admin (API doesn't need a root page)
    path('', lambda request: redirect('admin:index'), name='home'),
]

# Customisation de l'admin
admin.site.site_header = "EduPlatform Administration"
admin.site.site_title = "EduPlatform Admin"
admin.site.index_title = "Gestion de la Plateforme Éducative"
