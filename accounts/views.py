"""
Vues pour l'authentification.

IMPORTANT: Pas de vue d'inscription (signup) - les comptes sont créés
uniquement par l'administrateur via Django Admin.
"""

from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_protect
from .models import UserSession
import logging

logger = logging.getLogger(__name__)


@csrf_protect
@require_http_methods(["GET", "POST"])
def login_view(request):
    """
    Vue de connexion personnalisée avec gestion de session unique.
    
    À chaque connexion réussie :
    1. Invalide toutes les sessions précédentes de l'utilisateur
    2. Crée une nouvelle session unique
    """
    # Rediriger si déjà connecté
    if request.user.is_authenticated:
        return redirect('videos:dashboard')
    
    if request.method == 'POST':
        username = request.POST.get('username', '').strip()
        password = request.POST.get('password', '')
        
        if not username or not password:
            messages.error(request, "Veuillez remplir tous les champs.")
            return render(request, 'accounts/login.html')
        
        # Authentifier l'utilisateur
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            if user.is_active:
                # ============================================
                # MÉCANISME DE SESSION UNIQUE
                # ============================================
                
                # 1. Invalider TOUTES les sessions précédentes de l'utilisateur
                invalidated_count = UserSession.invalidate_user_sessions(user)
                
                if invalidated_count > 0:
                    logger.info(
                        f"Connexion de {username}: {invalidated_count} ancienne(s) "
                        "session(s) invalidée(s)"
                    )
                
                # 2. Connecter l'utilisateur (crée une nouvelle session Django)
                login(request, user)
                
                # 3. S'assurer que la session est sauvegardée
                request.session.save()
                
                # 4. Créer l'entrée UserSession pour tracker cette session
                UserSession.create_session(
                    user=user,
                    session_key=request.session.session_key,
                    request=request
                )
                
                # Message de bienvenue
                messages.success(request, f"Bienvenue, {user.first_name or user.username} !")
                
                logger.info(f"Connexion réussie pour {username}")
                
                # Rediriger vers la page demandée ou le dashboard
                next_url = request.GET.get('next', 'videos:dashboard')
                return redirect(next_url)
            else:
                messages.error(
                    request, 
                    "Votre compte est désactivé. Contactez l'administrateur."
                )
                logger.warning(f"Tentative de connexion avec compte désactivé: {username}")
        else:
            messages.error(request, "Identifiants incorrects.")
            logger.warning(f"Échec de connexion pour: {username}")
    
    return render(request, 'accounts/login.html')


@login_required
@require_http_methods(["GET", "POST"])
def logout_view(request):
    """
    Vue de déconnexion.
    
    Supprime la session utilisateur et déconnecte l'utilisateur.
    """
    if request.method == 'POST':
        username = request.user.username
        session_key = request.session.session_key
        
        # Supprimer l'entrée UserSession
        UserSession.objects.filter(
            user=request.user,
            session__session_key=session_key
        ).delete()
        
        # Déconnecter
        logout(request)
        
        messages.info(request, "Vous avez été déconnecté avec succès.")
        logger.info(f"Déconnexion de {username}")
        
        return redirect('accounts:login')
    
    # GET request - afficher page de confirmation
    return render(request, 'accounts/logout_confirm.html')


@login_required
def profile_view(request):
    """
    Vue du profil utilisateur (lecture seule).
    """
    # Récupérer les sessions actives de l'utilisateur
    active_sessions = UserSession.objects.filter(user=request.user)
    
    context = {
        'active_sessions': active_sessions,
    }
    
    return render(request, 'accounts/profile.html', context)
