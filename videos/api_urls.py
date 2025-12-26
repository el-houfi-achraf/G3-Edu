"""
URLs API pour les vidéos.
"""

from django.urls import path
from .api_views import (
    DashboardAPIView,
    VideoListAPIView,
    VideoDetailAPIView,
    CategoryListAPIView,
    CategoryDetailAPIView,
)

app_name = 'videos_api'

urlpatterns = [
    path('dashboard/', DashboardAPIView.as_view(), name='dashboard'),
    path('videos/', VideoListAPIView.as_view(), name='video_list'),
    path('videos/<int:video_id>/', VideoDetailAPIView.as_view(), name='video_detail'),
    path('categories/', CategoryListAPIView.as_view(), name='category_list'),
    path('categories/<int:category_id>/', CategoryDetailAPIView.as_view(), name='category_detail'),
]
