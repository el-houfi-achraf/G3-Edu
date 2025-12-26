"""
Modèles pour la gestion des vidéos éducatives.

Les vidéos sont hébergées sur YouTube en mode non répertorié.
La base de données stocke uniquement les métadonnées.
"""

from django.db import models
from django.core.validators import URLValidator
from django.core.exceptions import ValidationError
import re


def validate_youtube_url(value):
    """
    Valide qu'une URL est bien une URL YouTube valide.
    Accepte les formats :
    - https://www.youtube.com/watch?v=VIDEO_ID
    - https://youtu.be/VIDEO_ID
    - https://www.youtube.com/embed/VIDEO_ID
    """
    youtube_patterns = [
        r'(https?://)?(www\.)?youtube\.com/watch\?v=[\w-]+',
        r'(https?://)?(www\.)?youtu\.be/[\w-]+',
        r'(https?://)?(www\.)?youtube\.com/embed/[\w-]+',
    ]
    
    for pattern in youtube_patterns:
        if re.match(pattern, value):
            return
    
    raise ValidationError(
        "L'URL doit être une URL YouTube valide. "
        "Formats acceptés : youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/..."
    )


class Category(models.Model):
    """
    Catégorie pour organiser les vidéos.
    """
    name = models.CharField(
        max_length=100,
        unique=True,
        verbose_name='Nom de la catégorie'
    )
    description = models.TextField(
        blank=True,
        default='',
        verbose_name='Description'
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name='Ordre d\'affichage'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de création'
    )

    class Meta:
        verbose_name = 'Catégorie'
        verbose_name_plural = 'Catégories'
        ordering = ['order', 'name']

    def __str__(self):
        return self.name
    
    def video_count(self):
        """Retourne le nombre de vidéos dans cette catégorie."""
        return self.videos.count()


class Video(models.Model):
    """
    Modèle pour les vidéos éducatives.
    
    Les vidéos sont hébergées sur YouTube (non répertoriées).
    On stocke uniquement :
    - Titre
    - Description
    - URL YouTube
    - Métadonnées (catégorie, ordre, dates)
    """
    title = models.CharField(
        max_length=200,
        verbose_name='Titre'
    )
    description = models.TextField(
        blank=True,
        default='',
        verbose_name='Description'
    )
    youtube_url = models.URLField(
        max_length=500,
        validators=[URLValidator(), validate_youtube_url],
        verbose_name='URL YouTube'
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='videos',
        verbose_name='Catégorie'
    )
    order = models.PositiveIntegerField(
        default=0,
        verbose_name='Ordre d\'affichage'
    )
    is_published = models.BooleanField(
        default=True,
        verbose_name='Publié'
    )
    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Date de création'
    )
    updated_at = models.DateTimeField(
        auto_now=True,
        verbose_name='Dernière modification'
    )

    class Meta:
        verbose_name = 'Vidéo'
        verbose_name_plural = 'Vidéos'
        ordering = ['category__order', 'order', '-created_at']

    def __str__(self):
        return self.title

    def get_youtube_video_id(self):
        """
        Extrait l'ID de la vidéo YouTube à partir de l'URL.
        
        Supporte les formats :
        - https://www.youtube.com/watch?v=VIDEO_ID
        - https://youtu.be/VIDEO_ID
        - https://www.youtube.com/embed/VIDEO_ID
        """
        url = self.youtube_url
        
        # Format: youtube.com/watch?v=VIDEO_ID
        match = re.search(r'youtube\.com/watch\?v=([\w-]+)', url)
        if match:
            return match.group(1)
        
        # Format: youtu.be/VIDEO_ID
        match = re.search(r'youtu\.be/([\w-]+)', url)
        if match:
            return match.group(1)
        
        # Format: youtube.com/embed/VIDEO_ID
        match = re.search(r'youtube\.com/embed/([\w-]+)', url)
        if match:
            return match.group(1)
        
        return None

    def get_embed_url(self):
        """
        Retourne l'URL d'embed pour l'iframe YouTube.
        
        Ajoute des paramètres de sécurité :
        - rel=0 : pas de vidéos suggérées à la fin
        - modestbranding=1 : branding YouTube minimal
        """
        video_id = self.get_youtube_video_id()
        if video_id:
            return f"https://www.youtube.com/embed/{video_id}?rel=0&modestbranding=1"
        return None

    def get_thumbnail_url(self):
        """
        Retourne l'URL de la miniature YouTube.
        """
        video_id = self.get_youtube_video_id()
        if video_id:
            return f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"
        return None
