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
  Eye,
  Calendar,
  MapPin,
  Briefcase,
  DollarSign,
  ChevronDown,
  Star
} from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';
import { getApiUrl } from '@/lib/api';

interface JobOffer {
  id: string;
  title: string;
  slug: string;
  description: string;
  requirements: string | null;
  location: string | null;
  type: string;
  salary: string | null;
  publishedAt: string;
  deadline: string | null;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    applications: number;
  };
}

export default function JobOffersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    jobOfferId: string | null;
    jobOfferTitle: string;
  }>({
    isOpen: false,
    jobOfferId: null,
    jobOfferTitle: ''
  });

  useEffect(() => {
    fetchJobOffers();
  }, [filterStatus, filterType]);

  const fetchJobOffers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterType !== 'all') params.append('type', filterType);
      
      const response = await fetch(getApiUrl(`/api/job-offers?${params.toString()}`));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setJobOffers(data);
      } else {
        console.error('API returned non-array data:', data);
        setJobOffers([]);
      }
    } catch (error) {
      console.error('Failed to fetch job offers:', error);
      setJobOffers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(getApiUrl(`/api/job-offers/${id}`), {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete job offer');
      
      setJobOffers(jobOffers.filter(offer => offer.id !== id));
      setDeleteDialog({ isOpen: false, jobOfferId: null, jobOfferTitle: '' });
    } catch (error) {
      console.error('Failed to delete job offer:', error);
    }
  };

  const filteredJobOffers = jobOffers.filter(offer =>
    offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offer.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (offer.location && offer.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isExpired = (deadline: string | null) => {
    if (!deadline) return false;
    return new Date(deadline) < new Date();
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Offres d'emploi</h1>
            <Link
              href="/job-offers/edit/new"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouvelle offre
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher une offre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actives</option>
                  <option value="expired">Expirées</option>
                </select>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tous les types</option>
                  <option value="Temps plein">Temps plein</option>
                  <option value="Temps partiel">Temps partiel</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Stage">Stage</option>
                  <option value="Bénévolat">Bénévolat</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Chargement...
              </div>
            ) : filteredJobOffers.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                Aucune offre d'emploi trouvée
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Offre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lieu
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date limite
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Candidatures
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredJobOffers.map((offer) => (
                      <tr key={offer.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{offer.title}</span>
                                {offer.featured && (
                                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                )}
                              </div>
                              <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                                {offer.description}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            <Briefcase className="w-3 h-3" />
                            {offer.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            {offer.location || 'Non spécifié'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            {offer.deadline 
                              ? new Date(offer.deadline).toLocaleDateString('fr-FR')
                              : 'Non spécifié'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            {offer._count.applications}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isExpired(offer.deadline) ? (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                              Expirée
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/job-offers/edit/${offer.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Modifier"
                            >
                              <Edit className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => setDeleteDialog({
                                isOpen: true,
                                jobOfferId: offer.id,
                                jobOfferTitle: offer.title
                              })}
                              className="text-red-600 hover:text-red-900"
                              title="Supprimer"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          title="Supprimer l'offre d'emploi"
          message={`Êtes-vous sûr de vouloir supprimer l'offre "${deleteDialog.jobOfferTitle}" ? Cette action est irréversible.`}
          onConfirm={() => deleteDialog.jobOfferId && handleDelete(deleteDialog.jobOfferId)}
          onClose={() => setDeleteDialog({ isOpen: false, jobOfferId: null, jobOfferTitle: '' })}
        />
      </AdminLayout>
    </ProtectedRoute>
  );
}
