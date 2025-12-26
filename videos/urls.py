"""
URLs pour l'application videos.
"""

from django.urls import path
from . import views

app_name = 'videos'

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('list/', views.video_list, name='video_list'),
    path('video/<int:video_id>/', views.video_detail, name='video_detail'),
    path('category/<int:category_id>/', views.category_detail, name='category_detail'),
]
