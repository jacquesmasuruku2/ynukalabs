'use client';

import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Image as ImageIcon, Eye, Edit } from 'lucide-react';
import WordEditor from '@/components/WordEditor';

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
  details?: any;
  imageUrl?: string | null;
}

export default function JobOfferEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === 'new';
  
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    requirements: '',
    missions: '',
    profile: '',
    qualities: '',
    editorialLine: '',
    collaborationConditions: '',
    applicationDocuments: '',
    selectionProcess: '',
    location: '',
    type: 'Temps plein',
    salary: '',
    imageUrl: '',
    publishedAt: new Date().toISOString().split('T')[0],
    deadline: '',
    featured: false,
  });

  useEffect(() => {
    if (!isNew) {
      fetchJobOffer();
    }
  }, [id, isNew]);

  const fetchJobOffer = async () => {
    try {
      const response = await fetch(`/api/job-offers/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch job offer');
      }
      const data = await response.json() as JobOffer;
      
      // Extraire les rubriques détaillées depuis l'objet details
      const details = data.details as any || {};
      const combinedDescription = [
        data.description,
        details.missions && `<h2>Missions principales</h2>${details.missions}`,
        details.profile && `<h2>Profil recherché</h2>${details.profile}`,
        details.qualities && `<h2>Qualités recherchées</h2>${details.qualities}`,
        details.editorialLine && `<h2>Ligne éditoriale</h2>${details.editorialLine}`,
        details.collaborationConditions && `<h2>Conditions de collaboration</h2>${details.collaborationConditions}`,
        details.applicationDocuments && `<h2>Dossier de candidature</h2>${details.applicationDocuments}`,
        details.selectionProcess && `<h2>Processus de sélection</h2>${details.selectionProcess}`,
        data.requirements && `<h2>Exigences</h2>${data.requirements}`,
      ].filter(Boolean).join('');
      
      setFormData({
        title: data.title,
        slug: data.slug,
        description: combinedDescription,
        requirements: '',
        missions: '',
        profile: '',
        qualities: '',
        editorialLine: '',
        collaborationConditions: '',
        applicationDocuments: '',
        selectionProcess: '',
        location: data.location || '',
        type: data.type,
        salary: data.salary || '',
        imageUrl: data.imageUrl || '',
        publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString().split('T')[0] : '',
        deadline: data.deadline ? new Date(data.deadline).toISOString().split('T')[0] : '',
        featured: data.featured,
      });
    } catch (error) {
      console.error('Failed to fetch job offer:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Combiner les rubriques détaillées dans un objet JSON
    const details = {
      missions: formData.missions,
      profile: formData.profile,
      qualities: formData.qualities,
      editorialLine: formData.editorialLine,
      collaborationConditions: formData.collaborationConditions,
      applicationDocuments: formData.applicationDocuments,
      selectionProcess: formData.selectionProcess,
    };

    const submissionData = {
      ...formData,
      details,
      // Retirer les champs individuels car ils sont dans details
      missions: undefined,
      profile: undefined,
      qualities: undefined,
      editorialLine: undefined,
      collaborationConditions: undefined,
      applicationDocuments: undefined,
      selectionProcess: undefined,
    };

    try {
      const url = isNew ? '/api/job-offers' : `/api/job-offers/${id}`;
      const method = isNew ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.details || (isNew ? 'Failed to create job offer' : 'Failed to update job offer'));
      }

      router.push('/job-offers');
    } catch (error) {
      console.error(isNew ? 'Failed to create job offer:' : 'Failed to update job offer:', error);
      alert(isNew ? 'Erreur lors de la création de l\'offre' : 'Erreur lors de la mise à jour de l\'offre');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="p-6">
            <div className="text-center text-gray-500">Chargement...</div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/job-offers')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
              >
                <ArrowLeft className="w-5 h-5" />
                Retour aux offres
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {isNew ? 'Nouvelle offre d\'emploi' : 'Modifier l\'offre d\'emploi'}
              </h1>
            </div>
            <button
              type="button"
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {previewMode ? <Edit className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              {previewMode ? 'Modifier' : 'Prévisualiser'}
            </button>
          </div>

          {previewMode ? (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="max-w-4xl mx-auto">
                {/* Bannière */}
                {formData.imageUrl && (
                  <div className="mb-8">
                    <img
                      src={formData.imageUrl}
                      alt="Bannière"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* En-tête */}
                <div className="mb-8 pb-6 border-b-2 border-gray-200">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">{formData.title || 'Titre de l\'offre'}</h1>
                  <div className="flex flex-wrap gap-4 text-gray-600">
                    {formData.type && (
                      <span className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                        <span className="font-medium">Type:</span> {formData.type}
                      </span>
                    )}
                    {formData.location && (
                      <span className="flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                        <span className="font-medium">Lieu:</span> {formData.location}
                      </span>
                    )}
                    {formData.salary && (
                      <span className="flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm font-medium">
                        <span className="font-medium">Salaire:</span> {formData.salary}
                      </span>
                    )}
                  </div>
                </div>

                {/* Sections avec titres stylisés */}
                {formData.description && (
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-500 inline-block">
                      Description du poste
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 pl-4" dangerouslySetInnerHTML={{ __html: formData.description }} />
                  </div>
                )}

                {formData.missions && (
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-green-500 inline-block">
                      Missions principales
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 pl-4" dangerouslySetInnerHTML={{ __html: formData.missions }} />
                  </div>
                )}

                {formData.profile && (
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-purple-500 inline-block">
                      Profil recherché
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 pl-4" dangerouslySetInnerHTML={{ __html: formData.profile }} />
                  </div>
                )}

                {formData.qualities && (
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-orange-500 inline-block">
                      Qualités recherchées
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 pl-4" dangerouslySetInnerHTML={{ __html: formData.qualities }} />
                  </div>
                )}

                {formData.editorialLine && (
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-teal-500 inline-block">
                      Ligne éditoriale
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 pl-4" dangerouslySetInnerHTML={{ __html: formData.editorialLine }} />
                  </div>
                )}

                {formData.collaborationConditions && (
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-indigo-500 inline-block">
                      Conditions de collaboration
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 pl-4" dangerouslySetInnerHTML={{ __html: formData.collaborationConditions }} />
                  </div>
                )}

                {formData.applicationDocuments && (
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-pink-500 inline-block">
                      Dossier de candidature
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 pl-4" dangerouslySetInnerHTML={{ __html: formData.applicationDocuments }} />
                  </div>
                )}

                {formData.selectionProcess && (
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-red-500 inline-block">
                      Processus de sélection
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 pl-4" dangerouslySetInnerHTML={{ __html: formData.selectionProcess }} />
                  </div>
                )}

                {formData.requirements && (
                  <div className="mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-gray-500 inline-block">
                      Exigences
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 pl-4" dangerouslySetInnerHTML={{ __html: formData.requirements }} />
                  </div>
                )}

                {/* Dates */}
                <div className="mt-12 pt-8 border-t-2 border-gray-300 bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Informations importantes</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    {formData.publishedAt && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">Date de publication:</span>{' '}
                        {new Date(formData.publishedAt).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                    {formData.deadline && (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">Date limite:</span>{' '}
                        {new Date(formData.deadline).toLocaleDateString('fr-FR')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
              <div className="grid items-start gap-8 lg:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.6fr)]">
                <div className="space-y-6 lg:sticky lg:top-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre de l'offre *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Développeur Full Stack"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image de bannière (URL)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      name="imageUrl"
                      value={formData.imageUrl}
                      onChange={handleChange}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://..."
                    />
                    {formData.imageUrl && (
                      <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-300">
                        <img
                          src={formData.imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug (URL)
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ex: developpeur-full-stack"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de contrat *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Temps plein">Temps plein</option>
                    <option value="Temps partiel">Temps partiel</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Stage">Stage</option>
                    <option value="Bénévolat">Bénévolat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lieu
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Kinshasa, RDC"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Salaire
                  </label>
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: 2000-3000 USD/mois"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de publication *
                  </label>
                  <input
                    type="date"
                    name="publishedAt"
                    value={formData.publishedAt}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date limite
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Mettre en vedette (Featured)
                  </span>
                </label>

                </div>
                <div className="min-w-0 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description du poste *
                  </label>
                  <WordEditor
                    content={formData.description}
                    onChange={(content) => setFormData({ ...formData, description: content })}
                  />
                </div>

                </div>
              </div>

              <div className="mt-6 flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.push('/job-offers')}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Enregistrement...' : (isNew ? 'Publier l\'offre' : 'Mettre à jour')}
                </button>
              </div>
            </form>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
