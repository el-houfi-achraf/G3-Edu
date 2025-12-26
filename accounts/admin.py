"""
Configuration de l'admin pour l'application accounts.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserSession


class UserSessionInline(admin.TabularInline):
    """
    Affiche les sessions actives dans la page de détail d'un utilisateur.
    """
    model = UserSession
    extra = 0
    readonly_fields = ('session', 'created_at', 'ip_address', 'user_agent')
    can_delete = True
    
    def has_add_permission(self, request, obj=None):
        return False


class CustomUserAdmin(BaseUserAdmin):
    """
    Administration personnalisée des utilisateurs.
    
    Ajoute :
    - Affichage des sessions actives
    - Actions pour invalider les sessions
    """
    inlines = [UserSessionInline]
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_active', 'is_staff', 'active_sessions_count')
    list_filter = ('is_active', 'is_staff', 'is_superuser', 'date_joined')
    search_fields = ('username', 'email', 'first_name', 'last_name')
    ordering = ('-date_joined',)
    
    def active_sessions_count(self, obj):
        """Nombre de sessions actives pour cet utilisateur."""
        return obj.sessions.count()
    active_sessions_count.short_description = 'Sessions actives'
    
    actions = ['invalidate_all_sessions']
    
    def invalidate_all_sessions(self, request, queryset):
        """Action admin pour invalider toutes les sessions des utilisateurs sélectionnés."""
        total_invalidated = 0
        for user in queryset:
            count = UserSession.invalidate_user_sessions(user)
            total_invalidated += count
        
        self.message_user(
            request,
            f"{total_invalidated} session(s) invalidée(s) pour {queryset.count()} utilisateur(s)."
        )
    invalidate_all_sessions.short_description = "Invalider toutes les sessions"


# Ré-enregistrer UserAdmin avec notre version personnalisée
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    """
    Administration des sessions utilisateurs.
    """
    list_display = ('user', 'created_at', 'ip_address', 'short_user_agent')
    list_filter = ('created_at', 'user')
    search_fields = ('user__username', 'ip_address')
    readonly_fields = ('user', 'session', 'created_at', 'ip_address', 'user_agent')
    ordering = ('-created_at',)
    
    def short_user_agent(self, obj):
        """Affiche une version courte du User-Agent."""
        if obj.user_agent:
            return obj.user_agent[:50] + '...' if len(obj.user_agent) > 50 else obj.user_agent
        return '-'
    short_user_agent.short_description = 'Navigateur'
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False
    
    actions = ['delete_selected_sessions']
    
    def delete_selected_sessions(self, request, queryset):
        """Supprime les sessions sélectionnées."""
        for user_session in queryset:
            try:
                user_session.session.delete()
            except:
                pass
        queryset.delete()
        self.message_user(request, f"{queryset.count()} session(s) supprimée(s).")
    delete_selected_sessions.short_description = "Supprimer les sessions sélectionnées"
