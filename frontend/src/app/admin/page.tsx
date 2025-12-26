'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth, useAuthFetch } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

interface AdminStats {
  total_users: number;
  total_videos: number;
  published_videos: number;
  total_categories: number;
  active_sessions: number;
}

interface RecentUser {
  id: number;
  username: string;
  email: string;
  date_joined: string;
}

interface RecentVideo {
  id: number;
  title: string;
  is_published: boolean;
  created_at: string;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentVideos, setRecentVideos] = useState<RecentVideo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const authFetch = useAuthFetch();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.ADMIN.DASHBOARD);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentUsers(data.recent_users);
        setRecentVideos(data.recent_videos);
      } else if (response.status === 403) {
        setError('Accès réservé aux administrateurs');
      } else {
        setError('Erreur lors du chargement');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isLoading && error === 'Accès réservé aux administrateurs') {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0a0f1a] hero-bg">
          <Navbar />
          <main className="container mx-auto px-6 py-20 text-center">
            <div className="w-24 h-24 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Accès Refusé</h1>
            <p className="text-slate-400 mb-6">Cette section est réservée aux administrateurs.</p>
            <Link href="/dashboard" className="text-[#d4a853] hover:text-[#e5c07b] transition-colors">
              ← Retour au dashboard
            </Link>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0f1a] hero-bg">
        <Navbar />
        
        <main className="container mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 gradient-gold rounded-xl flex items-center justify-center shadow-lg glow-sm">
                <svg className="w-7 h-7 text-[#0a0f1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Administration</h1>
                <p className="text-slate-400">Gérez votre plateforme éducative</p>
              </div>
            </div>
            
            <Link href="/dashboard" className="btn btn-secondary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour au site
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="logo-container animate-pulse">
                <Image src="/logo.png" alt="Loading" width={80} height={80} />
              </div>
            </div>
          ) : error ? (
            <div className="glass-gold rounded-2xl p-8 text-center">
              <p className="text-red-400">{error}</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
                <div className="glass-gold rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#0a0f1a]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats?.total_users}</p>
                  <p className="text-sm text-[#d4a853]">Utilisateurs</p>
                </div>
                
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats?.total_videos}</p>
                  <p className="text-sm text-slate-400">Vidéos</p>
                </div>
                
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats?.published_videos}</p>
                  <p className="text-sm text-slate-400">Publiées</p>
                </div>
                
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats?.total_categories}</p>
                  <p className="text-sm text-slate-400">Catégories</p>
                </div>
                
                <div className="glass rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-3xl font-bold text-white">{stats?.active_sessions}</p>
                  <p className="text-sm text-slate-400">Sessions</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <Link href="/admin/users" className="glass rounded-2xl p-6 hover:border-[#d4a853]/30 border border-transparent transition-all group card-hover">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 gradient-gold rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <svg className="w-7 h-7 text-[#0a0f1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-[#d4a853] transition-colors">Utilisateurs</h3>
                      <p className="text-sm text-slate-400">Gérer les comptes</p>
                    </div>
                  </div>
                </Link>
                
                <Link href="/admin/videos" className="glass rounded-2xl p-6 hover:border-[#d4a853]/30 border border-transparent transition-all group card-hover">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-[#d4a853] transition-colors">Vidéos</h3>
                      <p className="text-sm text-slate-400">Ajouter des cours</p>
                    </div>
                  </div>
                </Link>
                
                <Link href="/admin/categories" className="glass rounded-2xl p-6 hover:border-[#d4a853]/30 border border-transparent transition-all group card-hover">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                      <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white group-hover:text-[#d4a853] transition-colors">Catégories</h3>
                      <p className="text-sm text-slate-400">Organiser le contenu</p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Users */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#d4a853]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                    </svg>
                    Derniers Utilisateurs
                  </h3>
                  <div className="space-y-3">
                    {recentUsers.map((u) => (
                      <div key={u.id} className="flex items-center justify-between glass-light rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 gradient-gold rounded-full flex items-center justify-center">
                            <span className="text-[#0a0f1a] font-bold text-sm">{u.username[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium text-sm">{u.username}</p>
                            <p className="text-xs text-slate-400">{u.email || 'Pas d\'email'}</p>
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(u.date_joined).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Recent Videos */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#d4a853]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    Dernières Vidéos
                  </h3>
                  <div className="space-y-3">
                    {recentVideos.length > 0 ? recentVideos.map((v) => (
                      <div key={v.id} className="flex items-center justify-between glass-light rounded-xl p-3">
                        <div className="flex items-center gap-3">
                          <span className={`w-2.5 h-2.5 rounded-full ${v.is_published ? 'bg-green-400' : 'bg-slate-500'}`}></span>
                          <p className="text-white font-medium text-sm truncate max-w-[220px]">{v.title}</p>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(v.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    )) : (
                      <p className="text-slate-400 text-sm text-center py-4">Aucune vidéo</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
