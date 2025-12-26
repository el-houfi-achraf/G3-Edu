'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth, useAuthFetch } from '@/contexts/AuthContext';
import { API_ENDPOINTS } from '@/lib/api';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined: string;
  active_sessions: number;
}

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
    is_staff: false,
    is_active: true,
  });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);
  const authFetch = useAuthFetch();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await authFetch(API_ENDPOINTS.ADMIN.USERS);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({ username: '', email: '', first_name: '', last_name: '', password: '', is_staff: false, is_active: true });
    setShowModal(true);
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email || '',
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      password: '',
      is_staff: user.is_staff,
      is_active: user.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = editingUser
        ? API_ENDPOINTS.ADMIN.USER_DETAIL(editingUser.id)
        : API_ENDPOINTS.ADMIN.USERS;
      
      const body: Record<string, unknown> = { ...formData };
      if (!body.password) delete body.password;

      const response = await authFetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setShowModal(false);
        fetchUsers();
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
      const response = await authFetch(API_ENDPOINTS.ADMIN.USER_DETAIL(deleteTarget.id), { method: 'DELETE' });
      if (response.ok) {
        fetchUsers();
        setDeleteTarget(null);
      } else {
        const data = await response.json();
        alert(data.error || 'Erreur');
      }
    } catch (err) {
      alert('Erreur');
    } finally {
      setDeleting(false);
    }
  };

  const handleInvalidateSessions = async (user: AdminUser) => {
    try {
      const response = await authFetch(API_ENDPOINTS.ADMIN.USER_INVALIDATE_SESSIONS(user.id), { method: 'POST' });
      if (response.ok) {
        fetchUsers();
        alert('Sessions invalidées avec succès');
      }
    } catch (err) {
      alert('Erreur');
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
                <span className="text-white">Utilisateurs</span>
              </div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                <span className="w-10 h-10 gradient-gold rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-[#0a0f1a]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </span>
                Gestion des Utilisateurs
              </h1>
            </div>
            <button onClick={openAddModal} className="btn btn-gold">
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
            <div className="glass rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-black/20">
                    <th className="text-left text-sm font-medium text-slate-400 px-6 py-4">Utilisateur</th>
                    <th className="text-left text-sm font-medium text-slate-400 px-6 py-4">Email</th>
                    <th className="text-left text-sm font-medium text-slate-400 px-6 py-4">Rôle</th>
                    <th className="text-left text-sm font-medium text-slate-400 px-6 py-4">Sessions</th>
                    <th className="text-left text-sm font-medium text-slate-400 px-6 py-4">Statut</th>
                    <th className="text-right text-sm font-medium text-slate-400 px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 gradient-gold rounded-full flex items-center justify-center">
                            <span className="text-[#0a0f1a] font-bold">{user.username[0].toUpperCase()}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium flex items-center gap-2">
                              {user.username}
                              {user.id === currentUser?.id && (
                                <span className="text-xs bg-[#d4a853]/20 text-[#d4a853] px-2 py-0.5 rounded">vous</span>
                              )}
                            </p>
                            <p className="text-xs text-slate-400">
                              {user.first_name} {user.last_name}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">{user.email || '-'}</td>
                      <td className="px-6 py-4">
                        <span className={`badge ${
                          user.is_superuser 
                            ? 'badge-gold' 
                            : user.is_staff 
                              ? 'badge-primary'
                              : 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                        }`}>
                          {user.is_superuser ? '👑 Super Admin' : user.is_staff ? 'Admin' : 'Utilisateur'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-300">{user.active_sessions}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${user.is_active ? 'badge-success' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                          {user.is_active ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleInvalidateSessions(user)}
                            className="p-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/20 rounded-lg transition-colors"
                            title="Déconnecter les sessions"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </button>
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => setDeleteTarget(user)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {/* Modal Ajout/Modification */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-6 w-full max-w-md animate-fadeIn">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingUser ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Nom d&apos;utilisateur *</label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="input"
                    required
                    disabled={!!editingUser}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Prénom</label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Nom</label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-slate-300 mb-1">
                    Mot de passe {editingUser ? '(laisser vide pour ne pas changer)' : '*'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input"
                    required={!editingUser}
                    minLength={8}
                  />
                </div>
                
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.is_staff}
                      onChange={(e) => setFormData({ ...formData, is_staff: e.target.checked })}
                      className="w-4 h-4 accent-[#d4a853]"
                    />
                    Administrateur
                  </label>
                  <label className="flex items-center gap-2 text-slate-300">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 accent-[#d4a853]"
                    />
                    Actif
                  </label>
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
                <h3 className="text-xl font-bold text-white mb-2">Supprimer l&apos;utilisateur ?</h3>
                <p className="text-slate-400 mb-6">
                  Êtes-vous sûr de vouloir supprimer <span className="text-white font-medium">&quot;{deleteTarget.username}&quot;</span> ?
                  <span className="block mt-2 text-red-400 text-sm">
                    ⚠️ Cette action est irréversible.
                  </span>
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
