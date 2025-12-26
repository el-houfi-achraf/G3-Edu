"""
Middleware pour la gestion des sessions uniques.

Ce middleware vérifie à chaque requête si la session de l'utilisateur
est toujours valide (n'a pas été invalidée par une connexion ailleurs).
"""

from django.contrib.auth import logout
from django.contrib import messages
from django.shortcuts import redirect
from .models import UserSession
import logging

logger = logging.getLogger(__name__)


class SingleSessionMiddleware:
    """
    Middleware qui vérifie la validité de la session utilisateur.
    
    Si un utilisateur se connecte sur un autre appareil, sa session précédente
    est invalidée. Ce middleware détecte cette invalidation et déconnecte
    l'utilisateur de l'ancien appareil avec un message approprié.
    """
    
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Vérifier seulement pour les utilisateurs authentifiés
        if request.user.is_authenticated:
            session_key = request.session.session_key
            
            if session_key:
                # Vérifier si cette session existe encore dans UserSession
                try:
                    session_exists = UserSession.objects.filter(
                        user=request.user,
                        session__session_key=session_key
                    ).exists()
                    
                    if not session_exists:
                        # La session a été invalidée (connexion depuis un autre appareil)
                        logger.info(
                            f"Session invalidée détectée pour {request.user.username}. "
                            "Connexion depuis un autre appareil."
                        )
                        
                        # Déconnecter l'utilisateur
                        logout(request)
                        
                        # Ajouter un message informatif (avec try/except pour éviter l'erreur)
                        try:
                            messages.warning(
                                request,
                                "Votre session a été interrompue car vous vous êtes connecté "
                                "depuis un autre appareil. Une seule session active est autorisée."
                            )
                        except Exception:
                            pass  # Ignorer si messages n'est pas disponible
                        
                        # Rediriger vers la page de connexion
                        return redirect('accounts:login')
                except Exception as e:
                    # En cas d'erreur de base de données, continuer normalement
                    logger.warning(f"Erreur dans SingleSessionMiddleware: {e}")

        response = self.get_response(request)
        return response
