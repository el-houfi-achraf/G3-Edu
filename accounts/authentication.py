"""
Authentification JWT personnalisée pour la session unique.
Vérifie que le token utilisé est le token actif de l'utilisateur.
"""

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, AuthenticationFailed
from .models import ActiveToken
import logging

logger = logging.getLogger(__name__)


class SingleSessionJWTAuthentication(JWTAuthentication):
    """
    Authentification JWT qui vérifie que le token est le token actif de l'utilisateur.
    Si l'utilisateur s'est connecté ailleurs, ce token devient invalide.
    """
    
    def get_validated_token(self, raw_token):
        """Valide le token et vérifie qu'il est le token actif."""
        validated_token = super().get_validated_token(raw_token)
        return validated_token
    
    def get_user(self, validated_token):
        """Récupère l'utilisateur et vérifie que le token est actif."""
        user = super().get_user(validated_token)
        
        # Récupérer le JTI du token
        jti = validated_token.get('jti')
        
        if jti and user:
            # Vérifier si c'est le token actif
            if not ActiveToken.is_token_active(user, jti):
                logger.warning(
                    f"Token invalide pour {user.username}: n'est pas le token actif "
                    "(connexion depuis un autre appareil)"
                )
                raise AuthenticationFailed(
                    'Votre session a été interrompue car vous vous êtes connecté '
                    'depuis un autre appareil.',
                    code='token_not_active'
                )
        
        return user
