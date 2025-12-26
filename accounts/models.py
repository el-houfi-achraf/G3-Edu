"""
Models pour la gestion des sessions utilisateurs.

Ce module implémente le mécanisme de SESSION UNIQUE par utilisateur :
- Chaque utilisateur ne peut avoir qu'une seule session active à la fois
- Une nouvelle connexion invalide automatiquement les anciennes sessions
"""

from django.db import models
from django.contrib.auth.models import User
from django.contrib.sessions.models import Session
from django.utils import timezone
import logging

logger = logging.getLogger(__name__)


class ActiveToken(models.Model):
    """
    Stocke le JTI (JWT ID) du token actif pour chaque utilisateur.
    Permet d'implémenter la session unique : un seul token valide à la fois.
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='active_token',
        verbose_name='Utilisateur'
    )
    jti = models.CharField(
        max_length=255,
        verbose_name='JWT ID actif'
    )
    created_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Dernière connexion'
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name='Adresse IP'
    )
    user_agent = models.CharField(
        max_length=500,
        blank=True,
        default='',
        verbose_name='User Agent'
    )

    class Meta:
        verbose_name = 'Token Actif'
        verbose_name_plural = 'Tokens Actifs'

    def __str__(self):
        return f"{self.user.username} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"

    @classmethod
    def set_active_token(cls, user, jti, ip_address=None, user_agent=''):
        """Définit le token actif pour un utilisateur (remplace l'ancien)."""
        obj, created = cls.objects.update_or_create(
            user=user,
            defaults={
                'jti': jti,
                'ip_address': ip_address,
                'user_agent': user_agent[:500]
            }
        )
        action = "créé" if created else "mis à jour"
        logger.info(f"Token actif {action} pour {user.username}")
        return obj

    @classmethod
    def is_token_active(cls, user, jti):
        """Vérifie si le JTI donné est le token actif de l'utilisateur."""
        try:
            active = cls.objects.get(user=user)
            return active.jti == jti
        except cls.DoesNotExist:
            return False

    @classmethod
    def invalidate_token(cls, user):
        """Invalide le token actif d'un utilisateur."""
        deleted, _ = cls.objects.filter(user=user).delete()
        if deleted:
            logger.info(f"Token invalidé pour {user.username}")
        return deleted


class UserSession(models.Model):
    """
    Modèle pour tracker les sessions actives de chaque utilisateur.
    
    Ce modèle permet d'implémenter la règle : UN utilisateur = UNE session.
    À chaque connexion, on supprime les anciennes sessions et on crée une nouvelle.
    """
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sessions',
        verbose_name='Utilisateur'
    )
    session = models.OneToOneField(
        Session,
        on_delete=models.CASCADE,
        verbose_name='Session'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de création'
    )
    ip_address = models.GenericIPAddressField(
        null=True,
        blank=True,
        verbose_name='Adresse IP'
    )
    user_agent = models.CharField(
        max_length=500,
        blank=True,
        default='',
        verbose_name='User Agent'
    )

    class Meta:
        verbose_name = 'Session Utilisateur'
        verbose_name_plural = 'Sessions Utilisateurs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.created_at.strftime('%d/%m/%Y %H:%M')}"

    @classmethod
    def invalidate_user_sessions(cls, user, exclude_session_key=None):
        """
        Invalide TOUTES les sessions d'un utilisateur.
        
        Args:
            user: L'utilisateur dont on veut invalider les sessions
            exclude_session_key: Clé de session à exclure (la session actuelle)
        
        Cette méthode est appelée à chaque nouvelle connexion pour garantir
        qu'un utilisateur n'a qu'une seule session active.
        """
        user_sessions = cls.objects.filter(user=user)
        
        if exclude_session_key:
            user_sessions = user_sessions.exclude(session__session_key=exclude_session_key)
        
        count = 0
        for user_session in user_sessions:
            try:
                # Supprimer la session Django
                user_session.session.delete()
                count += 1
            except Session.DoesNotExist:
                # La session a déjà été supprimée
                pass
            # Le UserSession sera supprimé en cascade
        
        if count > 0:
            logger.info(
                f"Sessions invalidées pour {user.username}: {count} session(s) supprimée(s)"
            )
        
        return count

    @classmethod
    def create_session(cls, user, session_key, request=None):
        """
        Crée une nouvelle entrée UserSession.
        
        Args:
            user: L'utilisateur authentifié
            session_key: La clé de la session Django
            request: La requête HTTP (pour extraire IP et User-Agent)
        """
        try:
            session = Session.objects.get(session_key=session_key)
        except Session.DoesNotExist:
            logger.warning(f"Session {session_key} non trouvée pour {user.username}")
            return None

        # Extraire les informations de la requête
        ip_address = None
        user_agent = ''
        
        if request:
            # Récupérer l'IP (prend en compte les proxies)
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip_address = x_forwarded_for.split(',')[0].strip()
            else:
                ip_address = request.META.get('REMOTE_ADDR')
            
            user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]

        user_session = cls.objects.create(
            user=user,
            session=session,
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        logger.info(
            f"Nouvelle session créée pour {user.username} depuis {ip_address}"
        )
        
        return user_session

    @classmethod
    def cleanup_expired_sessions(cls):
        """
        Nettoie les UserSession dont la session Django a expiré.
        À appeler périodiquement (par exemple via une tâche cron).
        """
        expired_sessions = cls.objects.filter(
            session__expire_date__lt=timezone.now()
        )
        count = expired_sessions.count()
        expired_sessions.delete()
        
        if count > 0:
            logger.info(f"Nettoyage: {count} session(s) expirée(s) supprimée(s)")
        
        return count
