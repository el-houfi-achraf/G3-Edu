"""
URLs API pour l'authentification.
"""

from django.urls import path
from .api_views import (
    LoginAPIView,
    LogoutAPIView,
    CurrentUserAPIView,
    UserSessionsAPIView,
    RefreshTokenAPIView,
)

app_name = 'accounts_api'

urlpatterns = [
    path('login/', LoginAPIView.as_view(), name='login'),
    path('logout/', LogoutAPIView.as_view(), name='logout'),
    path('refresh/', RefreshTokenAPIView.as_view(), name='refresh'),
    path('me/', CurrentUserAPIView.as_view(), name='me'),
    path('sessions/', UserSessionsAPIView.as_view(), name='sessions'),
]
