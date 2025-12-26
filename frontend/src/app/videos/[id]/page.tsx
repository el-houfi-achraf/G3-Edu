'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthFetch } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/lib/api';
import { Video, VideoListItem } from '@/types';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import VideoCard from '@/components/VideoCard';

export default function VideoDetailPage() {
  const { id } = useParams();
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<VideoListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const authFetch = useAuthFetch();

  useEffect(() => {
    if (id) {
      fetchVideo();
    }
  }, [id]);

  const fetchVideo = async () => {
    try {
      const videoId = parseInt(id as string);
      const response = await authFetch(API_ENDPOINTS.VIDEO_DETAIL(videoId));
      
      if (response.ok) {
        const data = await response.json();
        setVideo(data.video);
        setRelatedVideos(data.related_videos || []);
      } else {
        setError('Vidéo non trouvée');
      }
    } catch (err) {
      setError('Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0f1a]">
        <Navbar />
        
        <main className="container mx-auto px-6 py-10">
          {/* Back button */}
          <Link 
            href="/videos" 
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#d4a853] transition-colors mb-8"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour aux cours
          </Link>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="logo-container animate-pulse">
                <Image src="/logo.png" alt="Loading" width={80} height={80} />
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="glass-gold rounded-2xl p-12 text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-red-400 mb-4">{error}</p>
              <Link href="/videos" className="btn btn-gold">
                Retour aux cours
              </Link>
            </div>
          )}

          {/* Video content */}
          {!isLoading && !error && video && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main content */}
              <div className="lg:col-span-2">
                {/* Video Player */}
                <div className="relative aspect-video rounded-2xl overflow-hidden glass mb-6 shadow-2xl">
                  <iframe
                    src={video.embed_url}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>

                {/* Video Info */}
                <div className="glass rounded-2xl p-6 mb-6">
                  {video.category_name && (
                    <span className="badge badge-gold mb-4">
                      {video.category_name}
                    </span>
                  )}
                  
                  <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
                    {video.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mb-6">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Ajouté le {new Date(video.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    <span className="w-1.5 h-1.5 bg-[#d4a853] rounded-full"></span>
                    <span className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      Disponible
                    </span>
                  </div>
                  
                  {video.description && (
                    <div className="glass-light rounded-xl p-5">
                      <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5 text-[#d4a853]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Description
                      </h3>
                      <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {video.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Related Videos */}
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#d4a853]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                    </svg>
                    Cours similaires
                  </h3>
                  
                  {relatedVideos.length > 0 ? (
                    <div className="space-y-4">
                      {relatedVideos.slice(0, 4).map((related) => (
                        <Link 
                          key={related.id} 
                          href={`/videos/${related.id}`}
                          className="block glass-light rounded-xl overflow-hidden hover:border-[#d4a853]/30 border border-transparent transition-all group"
                        >
                          <div className="flex gap-3 p-3">
                            <div className="relative w-24 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                              <Image
                                src={related.thumbnail_url}
                                alt={related.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                </svg>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white text-sm font-medium line-clamp-2 group-hover:text-[#d4a853] transition-colors">
                                {related.title}
                              </h4>
                              {related.category_name && (
                                <p className="text-xs text-slate-500 mt-1">{related.category_name}</p>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm text-center py-4">
                      Pas de cours similaires
                    </p>
                  )}
                  
                  <Link 
                    href="/videos"
                    className="block text-center mt-6 text-[#d4a853] hover:text-[#e5c07b] text-sm font-medium transition-colors"
                  >
                    Voir tous les cours →
                  </Link>
                </div>
              </div>
            </div>
          )}
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
