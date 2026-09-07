'use client';

import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, Image as ImageIcon, Radio, Save, UserCircle } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

export default function EditRadioProgramPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    host: '',
    description: '',
    streamUrl: '',
    imageUrl: '',
    startTime: '',
    endTime: '',
    isLive: false,
  });

  useEffect(() => {
    const fetchProgram = async () => {
      if (!id) return;

      try {
        const response = await fetch(getApiUrl(`/api/radio/programs/${id}`));
        if (!response.ok) throw new Error('Failed to fetch program');
        const data = await response.json();
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          host: data.host || '',
          description: data.description || '',
          streamUrl: data.streamUrl || '',
          imageUrl: data.imageUrl || '',
          startTime: data.startTime ? new Date(data.startTime).toISOString().slice(0, 16) : '',
          endTime: data.endTime ? new Date(data.endTime).toISOString().slice(0, 16) : '',
          isLive: Boolean(data.isLive),
        });
      } catch (err) {
        console.error(err);
        setError('Impossible de charger l\'émission');
      } finally {
        setFetching(false);
      }
    };

    fetchProgram();
  }, [id]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(getApiUrl(`/api/radio/programs/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          startTime: new Date(formData.startTime).toISOString(),
          endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      router.push('/radio/programs');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="p-8 text-center text-secondary">Chargement...</div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/radio/programs" className="rounded-md border border-gray-200 p-2 hover:bg-gray-50">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-primary">Modifier l’émission</h1>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="card space-y-6 rounded-lg border bg-white p-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-secondary">Titre *</label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-secondary">Slug *</label>
                <input
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-secondary">Animateur</label>
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-gray-400" />
                  <input
                    name="host"
                    value={formData.host}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-secondary">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-secondary">URL du flux audio</label>
                <div className="flex items-center gap-2">
                  <Radio className="h-5 w-5 text-gray-400" />
                  <input
                    name="streamUrl"
                    type="url"
                    value={formData.streamUrl}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-secondary">Image</label>
                <div className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                  <input
                    name="imageUrl"
                    type="url"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-secondary">Début *</label>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-gray-400" />
                  <input
                    name="startTime"
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={handleChange}
                    required
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-secondary">Fin</label>
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-gray-400" />
                  <input
                    name="endTime"
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-slate-50 p-4">
              <div>
                <p className="font-medium text-slate-800">Marquer en direct</p>
                <p className="text-sm text-slate-500">Cette émission est actuellement en ligne.</p>
              </div>
              <input
                type="checkbox"
                checked={formData.isLive}
                onChange={(event) => setFormData((prev) => ({ ...prev, isLive: event.target.checked }))}
                className="h-4 w-4 accent-primary"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Link href="/radio/programs" className="rounded-md border border-gray-300 px-4 py-2 text-slate-700 hover:bg-gray-50">
                Annuler
              </Link>
              <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-slate-950 hover:opacity-90 disabled:opacity-60">
                <Save className="h-4 w-4" />
                {loading ? 'Enregistrement...' : 'Mettre à jour'}
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
