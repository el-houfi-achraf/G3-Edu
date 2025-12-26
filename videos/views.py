"""
Vues pour l'application videos.

Toutes les vues sont protégées par @login_required.
"""

from django.shortcuts import render, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Video, Category


@login_required
def dashboard(request):
    """
    Dashboard principal de l'utilisateur.
    
    Affiche toutes les vidéos organisées par catégorie.
    """
    # Récupérer les catégories avec leurs vidéos publiées
    categories = Category.objects.prefetch_related(
        'videos'
    ).filter(
        videos__is_published=True
    ).distinct()
    
    # Vidéos sans catégorie
    uncategorized_videos = Video.objects.filter(
        is_published=True,
        category__isnull=True
    )
    
    # Toutes les vidéos publiées pour statistiques
    total_videos = Video.objects.filter(is_published=True).count()
    
    context = {
        'categories': categories,
        'uncategorized_videos': uncategorized_videos,
        'total_videos': total_videos,
    }
    
    return render(request, 'videos/dashboard.html', context)


@login_required
def video_list(request):
    """
    Liste de toutes les vidéos.
    """
    # Filtrer par catégorie si spécifié
    category_id = request.GET.get('category')
    
    videos = Video.objects.filter(is_published=True)
    current_category = None
    
    if category_id:
        current_category = get_object_or_404(Category, id=category_id)
        videos = videos.filter(category=current_category)
    
    categories = Category.objects.all()
    
    context = {
        'videos': videos,
        'categories': categories,
        'current_category': current_category,
    }
    
    return render(request, 'videos/video_list.html', context)


@login_required
def video_detail(request, video_id):
    """
    Page de lecture d'une vidéo.
    
    Affiche la vidéo en iframe YouTube avec sa description.
    """
    video = get_object_or_404(Video, id=video_id, is_published=True)
    
    # Vidéos suggérées (même catégorie ou récentes)
    if video.category:
        related_videos = Video.objects.filter(
            is_published=True,
            category=video.category
        ).exclude(id=video.id)[:5]
    else:
        related_videos = Video.objects.filter(
            is_published=True
        ).exclude(id=video.id)[:5]
    
    context = {
        'video': video,
        'related_videos': related_videos,
    }
    
    return render(request, 'videos/video_detail.html', context)


@login_required
def category_detail(request, category_id):
    """
    Affiche toutes les vidéos d'une catégorie.
    """
    category = get_object_or_404(Category, id=category_id)
    videos = category.videos.filter(is_published=True)
    
    context = {
        'category': category,
        'videos': videos,
    }
    
    return render(request, 'videos/category_detail.html', context)
