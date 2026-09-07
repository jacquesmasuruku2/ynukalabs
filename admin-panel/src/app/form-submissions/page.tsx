'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { 
  Mail, 
  Building, 
  MessageSquare, 
  CheckCircle, 
  Clock, 
  XCircle,
  Filter,
  Search,
  Eye,
  Trash2,
  ImagePlus,
  Link as LinkIcon,
  Save,
  Upload
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';

type TabType = 'contact' | 'partnerships';

export default function FormSubmissionsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('contact');
  const [contactMessages, setContactMessages] = useState<any[]>([]);
  const [partnerships, setPartnerships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [partnerImageUrl, setPartnerImageUrl] = useState('');
  const [partnerWebsiteUrl, setPartnerWebsiteUrl] = useState('');
  const [isPartnerSaving, setIsPartnerSaving] = useState(false);
  const [isPartnerUploading, setIsPartnerUploading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'contact') {
        const response = await fetch(getApiUrl('/api/contact'));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setContactMessages(Array.isArray(data) ? data : []);
      } else {
        const response = await fetch(getApiUrl('/api/partnerships'));
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setPartnerships(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      if (activeTab === 'contact') {
        setContactMessages([]);
      } else {
        setPartnerships([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const endpoint = activeTab === 'contact' ? 'contact' : 'partnerships';
      const response = await fetch(getApiUrl(`/api/${endpoint}/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handlePartnerUpload = async (file: File) => {
    setIsPartnerUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'Images_partners');
      const response = await fetch(getApiUrl('/api/upload'), { method: 'POST', body: formData });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.error || 'Upload failed');
      setPartnerImageUrl(data.url);
    } catch (error) {
      console.error('Error uploading partner image:', error);
      alert('Erreur lors du téléversement de l’image');
    } finally {
      setIsPartnerUploading(false);
    }
  };

  const handlePartnerSave = async () => {
    if (!selectedItem) return;
    setIsPartnerSaving(true);
    try {
      const response = await fetch(getApiUrl(`/api/partnerships/${selectedItem.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: partnerImageUrl, websiteUrl: partnerWebsiteUrl }),
      });
      if (!response.ok) throw new Error('Failed to save partner details');
      const updatedPartner = await response.json();
      setSelectedItem(updatedPartner);
      setPartnerships((current) => current.map((item) => item.id === updatedPartner.id ? updatedPartner : item));
      alert('Informations du partenaire enregistrées');
    } catch (error) {
      console.error('Error saving partner details:', error);
      alert('Erreur lors de l’enregistrement');
    } finally {
      setIsPartnerSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;
    
    try {
      const endpoint = activeTab === 'contact' ? 'contact' : 'partnerships';
      const response = await fetch(getApiUrl(`/api/${endpoint}/${id}`), {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchData();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const filteredData = (activeTab === 'contact' ? contactMessages : partnerships || []).filter((item) => {
    const matchesSearch = 
      (item.name || item.contactName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.subject || item.companyName || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'read':
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'replied':
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
      case 'closed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'new':
        return 'Nouveau';
      case 'pending':
        return 'En attente';
      case 'read':
        return 'Lu';
      case 'in-progress':
        return 'En cours';
      case 'replied':
        return 'Répondu';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      case 'closed':
        return 'Fermé';
      default:
        return status;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Soumissions de formulaires</h1>
          <p className="text-secondary mt-1">Gérez les messages de contact et demandes de partenariat</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'contact'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Mail className="w-4 h-4" />
              Messages de contact
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {contactMessages.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('partnerships')}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'partnerships'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Building className="w-4 h-4" />
              Partenariats
              <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                {partnerships.length}
              </span>
            </button>
          </nav>
        </div>

        {/* Filters */}
        <div className="card rounded-lg shadow-sm border p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="new">Nouveau</option>
                  <option value="pending">En attente</option>
                  <option value="read">Lu</option>
                  <option value="in-progress">En cours</option>
                  <option value="replied">Répondu</option>
                  <option value="approved">Approuvé</option>
                  <option value="rejected">Rejeté</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="card rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {activeTab === 'contact' ? 'Nom' : 'Entreprise'}
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Email
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      {activeTab === 'contact' ? 'Sujet' : 'Type'}
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Date
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 sm:px-6 py-12 text-center text-gray-500">
                        Aucune soumission trouvée
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {activeTab === 'contact' ? item.name : item.contactName}
                          </div>
                          {activeTab === 'partnerships' && (
                            <div className="text-sm text-gray-500">{item.companyName}</div>
                          )}
                          <div className="sm:hidden mt-1">
                            <p className="text-xs text-gray-600">{item.email}</p>
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <div className="text-sm text-gray-900">{item.email}</div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <div className="text-sm text-gray-900">
                            {activeTab === 'contact' ? item.subject || '-' : item.type}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full border ${getStatusColor(item.status)}`}>
                            {getStatusLabel(item.status)}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                          {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-1 sm:gap-2">
                            <button
                              onClick={() => {
                                setSelectedItem(item);
                                setPartnerImageUrl(item.imageUrl || '');
                                setPartnerWebsiteUrl(item.websiteUrl || '');
                                setShowDetailModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1.5 sm:p-1"
                              title="Voir détails"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="text-red-600 hover:text-red-900 p-1.5 sm:p-1"
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
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="card rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-primary">
                {activeTab === 'contact' ? 'Détails du message' : 'Détails de la demande'}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {activeTab === 'contact' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <p className="mt-1 text-sm text-primary">{selectedItem.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-primary">{selectedItem.email}</p>
                  </div>
                  {selectedItem.subject && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sujet</label>
                      <p className="mt-1 text-sm text-primary">{selectedItem.subject}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <p className="mt-1 text-sm text-primary whitespace-pre-wrap">{selectedItem.message}</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom du contact</label>
                    <p className="mt-1 text-sm text-primary">{selectedItem.contactName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Entreprise</label>
                    <p className="mt-1 text-sm text-primary">{selectedItem.companyName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="mt-1 text-sm text-primary">{selectedItem.email}</p>
                  </div>
                  {selectedItem.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                      <p className="mt-1 text-sm text-primary">{selectedItem.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type de partenariat</label>
                    <p className="mt-1 text-sm text-primary">{selectedItem.type}</p>
                  </div>
                  {selectedItem.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <p className="mt-1 text-sm text-primary whitespace-pre-wrap">{selectedItem.description}</p>
                    </div>
                  )}
                  <div className="space-y-4 border-t border-gray-200 pt-4">
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <LinkIcon className="h-4 w-4" /> Site web du partenaire
                      </label>
                      <input
                        type="url"
                        value={partnerWebsiteUrl}
                        onChange={(event) => setPartnerWebsiteUrl(event.target.value)}
                        placeholder="https://exemple.com"
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                        <ImagePlus className="h-4 w-4" /> Logo ou image publique
                      </label>
                      {partnerImageUrl && <img src={partnerImageUrl} alt="Aperçu du partenaire" className="mb-3 h-20 w-20 rounded-lg border border-gray-200 object-cover" />}
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                        <Upload className="h-4 w-4" />
                        {isPartnerUploading ? 'Téléversement...' : 'Choisir une image'}
                        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="sr-only" disabled={isPartnerUploading} onChange={(event) => { const file = event.target.files?.[0]; if (file) void handlePartnerUpload(file); }} />
                      </label>
                    </div>
                    <button type="button" onClick={() => void handlePartnerSave()} disabled={isPartnerSaving || isPartnerUploading} className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">
                      <Save className="h-4 w-4" /> {isPartnerSaving ? 'Enregistrement...' : 'Enregistrer les informations publiques'}
                    </button>
                  </div>
                </>
              )}
              <div className="pt-4 border-t border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusUpdate(selectedItem.id, 'new')}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Nouveau
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedItem.id, 'read')}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Lu
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedItem.id, activeTab === 'contact' ? 'replied' : 'approved')}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {activeTab === 'contact' ? 'Répondu' : 'Approuvé'}
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(selectedItem.id, 'rejected')}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Rejeté
                  </button>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleDelete(selectedItem.id)}
                  className="flex items-center gap-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
