'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useAuth, useAuthFetch } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/lib/api';
import { Session } from '@/types';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProfilePage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const authFetch = useAuthFetch();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.SESSIONS);
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0f1a] hero-bg">
        <Navbar />
        
        <main className="container mx-auto px-6 py-10">
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="glass rounded-3xl p-8 mb-8 animate-fadeIn">
              <div className="flex flex-col md:flex-row items-center gap-8">
                {/* Avatar */}
                <div className="relative">
                  <div className="w-32 h-32 gradient-gold rounded-full flex items-center justify-center ring-4 ring-[#d4a853]/30 shadow-2xl">
                    <span className="text-[#0a0f1a] font-bold text-5xl">
                      {user?.first_name?.[0] || user?.username?.[0] || 'U'}
                    </span>
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 gradient-primary rounded-full flex items-center justify-center border-4 border-[#0a0f1a]">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                
                {/* Info */}
                <div className="text-center md:text-left flex-1">
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {user?.first_name} {user?.last_name}
                  </h1>
                  <p className="text-[#d4a853] text-lg mb-4">@{user?.username}</p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {user?.email || 'Pas d\'email'}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Membre depuis {new Date(user?.date_joined || '').toLocaleDateString('fr-FR', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Role badge */}
                <div className="text-right">
                  <span className={`badge ${user?.is_staff ? 'badge-gold' : 'badge-primary'} text-sm`}>
                    {user?.is_staff ? '👑 Administrateur' : '👤 Membre'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sessions Section */}
            <div className="glass rounded-3xl p-8 animate-fadeIn-delay-1">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 gradient-gold rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#0a0f1a]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Sessions Actives</h2>
                  <p className="text-sm text-slate-400">Gérez vos connexions</p>
                </div>
              </div>

              {/* Security notice */}
              <div className="glass-gold rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-[#d4a853] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-[#d4a853] font-medium text-sm">Politique de session unique</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Vous ne pouvez avoir qu&apos;une seule session active. Se connecter depuis un autre appareil déconnectera automatiquement celui-ci.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sessions list */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-10 h-10 border-3 border-[#d4a853] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : sessions.length > 0 ? (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="glass-light rounded-xl p-5">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                              <p className="text-white font-medium">Session active</p>
                            </div>
                            <p className="text-sm text-slate-400 line-clamp-1 max-w-md">{session.user_agent}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-slate-400">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {new Date(session.created_at).toLocaleString('fr-FR')}
                          </div>
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            {session.ip_address}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  Aucune session active trouvée
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="glass py-6 mt-12">
          <div className="container mx-auto px-6 text-center">
            <p className="text-slate-400 text-sm">© {new Date().getFullYear()} G3 Edu - Excellence Éducative</p>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}
