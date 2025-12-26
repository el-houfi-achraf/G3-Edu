"""
URLs API pour l'administration.
"""

from django.urls import path
from .admin_api_views import (
    # Users
    AdminUserListAPIView,
    AdminUserDetailAPIView,
    AdminInvalidateUserSessionsAPIView,
    # Categories
    AdminCategoryListAPIView,
    AdminCategoryDetailAPIView,
    # Videos
    AdminVideoListAPIView,
    AdminVideoDetailAPIView,
    # Dashboard
    AdminDashboardAPIView,
)

app_name = 'admin_api'

urlpatterns = [
    # Dashboard
    path('dashboard/', AdminDashboardAPIView.as_view(), name='dashboard'),
    
    # Users
    path('users/', AdminUserListAPIView.as_view(), name='user_list'),
    path('users/<int:user_id>/', AdminUserDetailAPIView.as_view(), name='user_detail'),
    path('users/<int:user_id>/invalidate-sessions/', AdminInvalidateUserSessionsAPIView.as_view(), name='invalidate_sessions'),
    
    # Categories
    path('categories/', AdminCategoryListAPIView.as_view(), name='category_list'),
    path('categories/<int:category_id>/', AdminCategoryDetailAPIView.as_view(), name='category_detail'),
    
    # Videos
    path('videos/', AdminVideoListAPIView.as_view(), name='video_list'),
    path('videos/<int:video_id>/', AdminVideoDetailAPIView.as_view(), name='video_detail'),
]
