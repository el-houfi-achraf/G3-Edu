'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthFetch, useAuth } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/lib/api';
import { DashboardData, CategoryWithVideos } from '@/types';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import VideoCard from '@/components/VideoCard';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const authFetch = useAuthFetch();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.DASHBOARD);
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      } else {
        setError('Erreur lors du chargement des données');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setIsLoading(false);
    }
  };

  const firstName = data?.user?.first_name || user?.first_name || user?.username || 'Apprenant';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0f1a] hero-bg">
        <Navbar />
        
        <main>
          {/* Hero Section */}
          <section className="relative py-16 lg:py-24 px-6 overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#1e3a5f]/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#d4a853]/10 rounded-full blur-3xl" />
            
            <div className="container mx-auto relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left content */}
                <div className="max-w-xl">
                  <div className="animate-fadeIn">
                    <span className="badge badge-gold mb-6 text-sm">
                      ✨ Votre espace d&apos;apprentissage premium
                    </span>
                  </div>
                  
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fadeIn-delay-1 leading-tight">
                    Bienvenue,<br />
                    <span className="gradient-text">{firstName}</span>
                  </h1>
                  
                  <p className="text-lg text-slate-400 mb-8 animate-fadeIn-delay-2 leading-relaxed">
                    Accédez à des cours exclusifs de haute qualité. 
                    Développez vos compétences avec du contenu pédagogique soigneusement sélectionné.
                  </p>
                  
                  {/* Quick actions */}
                  <div className="flex flex-wrap gap-4 animate-fadeIn-delay-3">
                    <Link href="/videos" className="btn btn-gold">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Explorer les cours
                    </Link>
                    {user?.is_staff && (
                      <Link href="/admin" className="btn btn-secondary">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Gérer le contenu
                      </Link>
                    )}
                  </div>
                </div>
                
                {/* Right - Stats cards */}
                <div className="grid sm:grid-cols-2 gap-4 animate-fadeIn-delay-2">
                  <div className="glass-gold rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 gradient-gold rounded-xl flex items-center justify-center">
                        <svg className="w-7 h-7 text-[#0a0f1a]" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-white mb-1">{data?.total_videos || 0}</p>
                    <p className="text-[#d4a853]">Vidéos disponibles</p>
                  </div>
                  
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 gradient-primary rounded-xl flex items-center justify-center">
                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-white mb-1">{data?.categories?.length || 0}</p>
                    <p className="text-slate-400">Catégories de cours</p>
                  </div>
                  
                  <div className="glass rounded-2xl p-6 sm:col-span-2">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-medium">Accès illimité</p>
                        <p className="text-sm text-slate-400">À tous les contenus de la plateforme</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Decorative line */}
          <div className="gold-line mx-6" />

          {/* Content Section */}
          <section className="px-6 py-16">
            <div className="container mx-auto">
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <div className="logo-container">
                      <Image src="/logo.png" alt="Loading" width={80} height={80} style={{ width: 'auto', height: 'auto' }} className="animate-pulse" />
                    </div>
                    <p className="text-slate-400">Chargement de vos cours...</p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="glass-gold rounded-2xl p-8 text-center max-w-md mx-auto">
                  <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              {/* Content */}
              {!isLoading && !error && data && (
                <>
                  {/* Section title */}
                  {(data.categories.length > 0 || data.uncategorized_videos.length > 0) && (
                    <div className="text-center mb-12 animate-fadeIn">
                      <h2 className="text-3xl font-bold text-white mb-3">Nos Cours</h2>
                      <p className="text-slate-400 max-w-2xl mx-auto">Découvrez notre catalogue de formations et développez vos compétences</p>
                    </div>
                  )}

                  {/* Categories with Videos */}
                  {data.categories.map((category, catIndex) => (
                    <CategorySection key={category.id} category={category} index={catIndex} />
                  ))}

                  {/* Uncategorized Videos */}
                  {data.uncategorized_videos.length > 0 && (
                    <section className="mb-16">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 glass-light rounded-xl flex items-center justify-center">
                          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                          </svg>
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-white">Autres Cours</h2>
                          <p className="text-slate-400 text-sm">{data.uncategorized_videos.length} cours disponible{data.uncategorized_videos.length > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {data.uncategorized_videos.map((video, index) => (
                          <VideoCard key={video.id} video={video} index={index} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Empty State */}
                  {data.categories.length === 0 && data.uncategorized_videos.length === 0 && (
                    <div className="glass-gold rounded-3xl p-12 text-center max-w-lg mx-auto">
                      <div className="logo-container mb-6">
                        <Image src="/logo.png" alt="G3 Edu" width={100} height={100} className="mx-auto animate-float" />
                      </div>
                      <h3 className="text-2xl font-bold text-white mb-3">Bientôt disponible</h3>
                      <p className="text-slate-400 mb-6">
                        Les cours seront disponibles très prochainement. Restez connecté !
                      </p>
                      {user?.is_staff && (
                        <Link href="/admin/videos" className="btn btn-gold">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          Ajouter des cours
                        </Link>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="glass py-8 mt-12">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Image src="/logo.png" alt="G3 Edu" width={40} height={40} />
                <span className="text-slate-400 text-sm">© {new Date().getFullYear()} G3 Edu - Excellence Éducative</span>
              </div>
              <div className="flex items-center gap-6 text-sm text-slate-400">
                <Link href="/profile" className="hover:text-white transition-colors">Mon Profil</Link>
                <Link href="/videos" className="hover:text-white transition-colors">Cours</Link>
                {user?.is_staff && <Link href="/admin" className="hover:text-[#d4a853] transition-colors">Administration</Link>}
              </div>
            </div>
          </div>
        </footer>
      </div>
    </ProtectedRoute>
  );
}

// Category Section Component
function CategorySection({ category, index }: { category: CategoryWithVideos; index: number }) {
  return (
    <section className="mb-16 animate-fadeIn" style={{ animationDelay: `${index * 0.15}s` }}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 gradient-gold rounded-xl flex items-center justify-center shadow-lg glow-sm">
            <svg className="w-7 h-7 text-[#0a0f1a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{category.name}</h2>
            {category.description && (
              <p className="text-slate-400 text-sm mt-1 max-w-xl">{category.description}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="badge badge-gold">
            {category.videos.length} cours
          </span>
          <Link 
            href={`/videos?category=${category.id}`}
            className="text-[#d4a853] hover:text-[#e5c07b] text-sm font-medium flex items-center gap-1 transition-colors"
          >
            Voir tout
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {category.videos.map((video, videoIndex) => (
          <VideoCard key={video.id} video={video} index={videoIndex} />
        ))}
      </div>
    </section>
  );
}
