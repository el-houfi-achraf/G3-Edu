'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthFetch } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

interface Category {
  id: number;
  name: string;
  description: string;
  order: number;
  video_count: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', order: 0 });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const authFetch = useAuthFetch();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.ADMIN.CATEGORIES);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', order: categories.length + 1 });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '', order: category.order });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingCategory
        ? API_ENDPOINTS.ADMIN.CATEGORY_DETAIL(editingCategory.id)
        : API_ENDPOINTS.ADMIN.CATEGORIES;
      
      const response = await authFetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        fetchCategories();
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur');
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
      const response = await authFetch(API_ENDPOINTS.ADMIN.CATEGORY_DETAIL(deleteTarget.id), { 
        method: 'DELETE' 
      });
      
      if (response.ok) {
        fetchCategories();
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-400 mb-2">
                <Link href="/admin" className="hover:text-[#d4a853]">Admin</Link>
                <span>/</span>
                <span className="text-white">Catégories</span>
              </div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#0a0f1a]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                  </svg>
                </span>
                Gestion des Catégories
              </h1>
            </div>
            <button
              onClick={openAddModal}
              className="btn btn-gold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Ajouter
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-[#d4a853] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="glass rounded-2xl p-6 card-hover">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 gradient-gold rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-[#0a0f1a]" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                      </svg>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(category)}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteTarget(category)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{category.name}</h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{category.description || 'Pas de description'}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="badge badge-gold">{category.video_count} vidéo{category.video_count > 1 ? 's' : ''}</span>
                    <span className="text-slate-500">Ordre: {category.order}</span>
                  </div>
                </div>
              ))}
              
              {categories.length === 0 && (
                <div className="col-span-full glass-gold rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 gradient-gold rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-[#0a0f1a]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                    </svg>
                  </div>
                  <p className="text-white font-medium mb-2">Aucune catégorie</p>
                  <p className="text-slate-400 text-sm">Créez-en une pour organiser vos cours.</p>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Modal Ajout/Modification */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-6 w-full max-w-md animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Nom *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                  <label className="block text-sm text-slate-300 mb-1">Ordre</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="input"
                  />
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

        {/* Modal de Confirmation Suppression */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-6 w-full max-w-sm animate-fadeIn">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Supprimer la catégorie ?</h3>
                <p className="text-slate-400 mb-6">
                  Êtes-vous sûr de vouloir supprimer <span className="text-white font-medium">&quot;{deleteTarget.name}&quot;</span> ?
                  {deleteTarget.video_count > 0 && (
                    <span className="block mt-2 text-amber-400 text-sm">
                      ⚠️ Cette catégorie contient {deleteTarget.video_count} vidéo(s).
                    </span>
                  )}
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
