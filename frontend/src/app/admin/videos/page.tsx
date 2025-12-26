'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthFetch } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

interface AdminVideo {
  id: number;
  title: string;
  description: string;
  youtube_url: string;
  category: number | null;
  category_name: string | null;
  is_published: boolean;
  thumbnail_url: string;
  created_at: string;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminVideosPage() {
  const [videos, setVideos] = useState<AdminVideo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVideo, setEditingVideo] = useState<AdminVideo | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtube_url: '',
    category: '',
    is_published: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminVideo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const authFetch = useAuthFetch();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [videosRes, catsRes] = await Promise.all([
        authFetch(API_ENDPOINTS.ADMIN.VIDEOS),
        authFetch(API_ENDPOINTS.ADMIN.CATEGORIES)
      ]);
      
      if (videosRes.ok) {
        const data = await videosRes.json();
        setVideos(data.videos);
      }
      if (catsRes.ok) {
        const data = await catsRes.json();
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingVideo(null);
    setFormData({ title: '', description: '', youtube_url: '', category: '', is_published: true });
    setShowModal(true);
  };

  const openEditModal = (video: AdminVideo) => {
    setEditingVideo(video);
    setFormData({
      title: video.title,
      description: video.description || '',
      youtube_url: video.youtube_url,
      category: video.category?.toString() || '',
      is_published: video.is_published,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingVideo 
        ? API_ENDPOINTS.ADMIN.VIDEO_DETAIL(editingVideo.id)
        : API_ENDPOINTS.ADMIN.VIDEOS;
      
      const response = await authFetch(url, {
        method: editingVideo ? 'PUT' : 'POST',
        body: JSON.stringify({
          ...formData,
          category: formData.category ? parseInt(formData.category) : null,
        }),
      });

      if (response.ok) {
        setShowModal(false);
        fetchData();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err) {
      alert('Erreur de connexion');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    
    setDeleting(true);
    try {
      const response = await authFetch(API_ENDPOINTS.ADMIN.VIDEO_DETAIL(deleteTarget.id), {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchData();
        setDeleteTarget(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur lors de la suppression');
      }
    } catch (err) {
      alert('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0a0f1a] hero-bg">
        <Navbar />
        
        <main className="container mx-auto px-6 py-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <Link href="/admin" className="hover:text-[#d4a853]">Admin</Link>
                <span>/</span>
                <span className="text-white">Vidéos</span>
              </div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                </span>
                Gestion des Vidéos
              </h1>
            </div>
            <button onClick={openAddModal} className="btn btn-gold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter une vidéo
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#d4a853] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/20">
                    <th className="text-left text-sm font-medium text-slate-400 px-6 py-4">Vidéo</th>
                    <th className="text-left text-sm font-medium text-slate-400 px-6 py-4">Catégorie</th>
                    <th className="text-left text-sm font-medium text-slate-400 px-6 py-4">Statut</th>
                    <th className="text-left text-sm font-medium text-slate-400 px-6 py-4">Date</th>
                    <th className="text-right text-sm font-medium text-slate-400 px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {videos.length > 0 ? videos.map((video) => (
                    <tr key={video.id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={video.thumbnail_url} 
                            alt={video.title}
                            className="w-20 h-12 object-cover rounded-lg"
                          />
                          <div>
                            <p className="text-white font-medium">{video.title}</p>
                            <p className="text-xs text-slate-400 truncate max-w-[250px]">{video.youtube_url}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {video.category_name ? (
                          <span className="badge badge-gold">{video.category_name}</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${video.is_published ? 'badge-success' : 'bg-slate-500/20 text-slate-400 border-slate-500/30'}`}>
                          {video.is_published ? 'Publié' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400">
                        {new Date(video.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(video)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteTarget(video)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        Aucune vidéo. Cliquez sur &quot;Ajouter une vidéo&quot; pour commencer.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Modal Ajout/Modification */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-6 w-full max-w-lg animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingVideo ? 'Modifier la vidéo' : 'Ajouter une vidéo'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Titre *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-1">URL YouTube *</label>
                  <input
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="input"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="input resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                  >
                    <option value="">Sans catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_published"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                    className="w-4 h-4 accent-[#d4a853]"
                  />
                  <label htmlFor="is_published" className="text-slate-300">Publier immédiatement</label>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                    Annuler
                  </button>
                  <button type="submit" disabled={saving} className="btn btn-gold disabled:opacity-50">
                    {saving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Confirmation Suppression */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-6 w-full max-w-sm animate-fadeIn">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Supprimer la vidéo ?</h3>
                <p className="text-slate-400 mb-6">
                  Êtes-vous sûr de vouloir supprimer <span className="text-white font-medium">&quot;{deleteTarget.title}&quot;</span> ?
                </p>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setDeleteTarget(null)} 
                    className="flex-1 btn btn-secondary"
                    disabled={deleting}
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={confirmDelete} 
                    disabled={deleting}
                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl disabled:opacity-50 transition-colors"
                  >
                    {deleting ? 'Suppression...' : 'Supprimer'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
