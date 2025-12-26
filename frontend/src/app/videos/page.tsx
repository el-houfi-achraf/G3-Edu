'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthFetch } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/lib/api';
import { VideoListItem, Category } from '@/types';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import VideoCard from '@/components/VideoCard';

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoListItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const authFetch = useAuthFetch();
  const searchParams = useSearchParams();

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(parseInt(categoryParam));
    }
    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      const [videosRes, categoriesRes] = await Promise.all([
        authFetch(API_ENDPOINTS.VIDEOS),
        authFetch(API_ENDPOINTS.CATEGORIES)
      ]);

      if (videosRes.ok) {
        const data = await videosRes.json();
        setVideos(data.videos || []);
      }
      if (categoriesRes.ok) {
        const data = await categoriesRes.json();
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVideos = selectedCategory
    ? videos.filter(v => v.category === selectedCategory)
    : videos;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0f1a] hero-bg">
        <Navbar />
        
        <main className="container mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 animate-fadeIn">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 gradient-gold rounded-xl flex items-center justify-center shadow-lg glow-sm">
                <svg className="w-7 h-7 text-[#0a0f1a]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Tous les Cours</h1>
                <p className="text-slate-400">{filteredVideos.length} cours disponible{filteredVideos.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            
            <Link href="/dashboard" className="btn btn-secondary">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Retour
            </Link>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mb-10 animate-fadeIn-delay-1">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                selectedCategory === null
                  ? 'gradient-gold text-[#0a0f1a] shadow-lg'
                  : 'glass text-slate-300 hover:text-white hover:border-[#d4a853]/30'
              }`}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-5 py-2.5 rounded-xl font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'gradient-gold text-[#0a0f1a] shadow-lg'
                    : 'glass text-slate-300 hover:text-white hover:border-[#d4a853]/30'
                }`}
              >
                {cat.name}
                <span className="ml-2 text-xs opacity-70">({cat.video_count})</span>
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="logo-container animate-pulse">
                <Image src="/logo.png" alt="Loading" width={80} height={80} />
              </div>
            </div>
          )}

          {/* Videos Grid */}
          {!isLoading && filteredVideos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video, index) => (
                <VideoCard key={video.id} video={video} index={index} />
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredVideos.length === 0 && (
            <div className="glass-gold rounded-3xl p-12 text-center max-w-lg mx-auto">
              <div className="logo-container mb-6">
                <Image src="/logo.png" alt="G3 Edu" width={80} height={80} className="mx-auto opacity-50" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                {selectedCategory ? 'Aucun cours dans cette catégorie' : 'Aucun cours disponible'}
              </h3>
              <p className="text-slate-400 mb-6">
                {selectedCategory 
                  ? 'Essayez une autre catégorie ou revenez plus tard.'
                  : 'Les cours seront bientôt disponibles.'}
              </p>
              {selectedCategory && (
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="btn btn-gold"
                >
                  Voir tous les cours
                </button>
              )}
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
