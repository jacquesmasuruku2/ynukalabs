'use client';

import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Play,
  Square,
  Calendar,
  Eye,
  Radio,
  ChevronDown
} from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import { getApiUrl } from '@/lib/api';

interface LiveEvent {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  streamUrl: string | null;
  youtubeUrl: string | null;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED';
  startTime: string;
  endTime: string | null;
  viewerCount: number;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function LivesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [lives, setLives] = useState<LiveEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    liveId: string | null;
    liveTitle: string;
  }>({
    isOpen: false,
    liveId: null,
    liveTitle: ''
  });

  useEffect(() => {
    fetchLives();
  }, []);

  async function fetchLives() {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(getApiUrl('/api/live'), { credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !Array.isArray(data)) {
        throw new Error(data?.error || `Erreur de chargement (${response.status})`);
      }
      setLives(data);
    } catch (error) {
      console.error('Failed to fetch lives:', error);
      setLives([]);
      setErrorMessage(error instanceof Error ? error.message : 'Impossible de charger les lives.');
    } finally {
      setLoading(false);
    }
  }

  const deleteLive = async (id: string) => {
    try {
      await fetch(getApiUrl(`/api/live/${id}`), { method: 'DELETE' });
      fetchLives();
      setDeleteDialog({ isOpen: false, liveId: null, liveTitle: '' });
    } catch (error) {
      console.error('Failed to delete live:', error);
    }
  };

  const startLive = async (id: string) => {
    try {
      await fetch(getApiUrl(`/api/live/${id}/start`), { method: 'PATCH' });
      fetchLives();
    } catch (error) {
      console.error('Failed to start live:', error);
    }
  };

  const endLive = async (id: string) => {
    try {
      await fetch(getApiUrl(`/api/live/${id}/end`), { method: 'PATCH' });
      fetchLives();
    } catch (error) {
      console.error('Failed to end live:', error);
    }
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteDialog({
      isOpen: true,
      liveId: id,
      liveTitle: title
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.liveId) {
      deleteLive(deleteDialog.liveId);
    }
  };

  const statuses = ['all', 'SCHEDULED', 'LIVE', 'ENDED'];

  const filteredLives = lives.filter(live => {
    const matchesSearch = live.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (live.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || live.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatStatus = (status: string) => {
    switch (status) {
      case 'LIVE': return 'En direct';
      case 'SCHEDULED': return 'Programmé';
      case 'ENDED': return 'Terminé';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVE': return 'bg-red-100 text-red-800';
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800';
      case 'ENDED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Lives</h1>
              <p className="text-secondary mt-1">Gérer les diffusions en direct</p>
            </div>
            <Link 
              href="/lives/new"
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau live</span>
            </Link>
          </div>

          {/* Filters */}
          <div className="card rounded-lg shadow-sm border p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un live..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white w-full sm:w-auto"
                >
                  <option value="all">Tous les statuts</option>
                  {statuses.filter(s => s !== 'all').map(status => (
                    <option key={status} value={status}>{formatStatus(status)}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Lives Table */}
          {errorMessage && !loading && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <div className="flex items-center justify-between gap-4">
                <span>{errorMessage}</span>
                <button type="button" onClick={fetchLives} className="rounded-md bg-red-100 px-3 py-1.5 font-medium hover:bg-red-200">Réessayer</button>
              </div>
            </div>
          )}

          <div className="card rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Live
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Statut
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Début
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Spectateurs
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <tr key={i}>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                          <div className="animate-pulse h-6 bg-gray-200 rounded w-20"></div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                          <div className="animate-pulse h-4 bg-gray-200 rounded w-24"></div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                          <div className="animate-pulse h-4 bg-gray-200 rounded w-16"></div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="animate-pulse h-8 bg-gray-200 rounded w-20"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredLives.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 sm:px-6 py-12 text-center text-gray-500">
                        <Radio className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Aucun live trouvé</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLives.map((live) => (
                      <tr key={live.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-start space-x-3">
                            {live.thumbnail ? (
                              <img 
                                src={live.thumbnail} 
                                alt={live.title}
                                className="w-16 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-12 bg-gradient-to-r from-blue-100 to-purple-100 rounded flex items-center justify-center">
                                <Radio className="w-6 h-6 text-blue-600" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 truncate">{live.title}</p>
                                {live.isFeatured && (
                                  <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                    À la une
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 truncate">{live.description}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(live.status)}`}>
                            {formatStatus(live.status)}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 hidden md:table-cell">
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="w-4 h-4 mr-2" />
                            {formatDate(live.startTime)}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 hidden sm:table-cell">
                          <div className="flex items-center text-sm text-gray-500">
                            <Eye className="w-4 h-4 mr-2" />
                            {live.viewerCount.toLocaleString()}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            {live.status === 'SCHEDULED' && (
                              <button
                                onClick={() => startLive(live.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                                title="Démarrer le live"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                            )}
                            {live.status === 'LIVE' && (
                              <button
                                onClick={() => endLive(live.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                                title="Arrêter le live"
                              >
                                <Square className="w-4 h-4" />
                              </button>
                            )}
                            <Link
                              href={`/lives/${live.id}/edit`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Modifier"
                            >
                              <Edit className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteClick(live.id, live.title)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Supprimer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          title="Supprimer ce live"
          message={`Êtes-vous sûr de vouloir supprimer "${deleteDialog.liveTitle}" ? Cette action est irréversible.`}
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeleteDialog({ isOpen: false, liveId: null, liveTitle: '' })}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
