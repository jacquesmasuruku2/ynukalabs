'use client';

import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Edit, Trash2, Play, CalendarClock, Radio } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface RadioProgram {
  id: string;
  title: string;
  slug: string;
  host: string | null;
  description: string | null;
  streamUrl: string | null;
  imageUrl: string | null;
  startTime: string;
  endTime: string | null;
  isLive: boolean;
  isFeatured: boolean;
}

export default function RadioProgramsPage() {
  const [programs, setPrograms] = useState<RadioProgram[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPrograms = async () => {
    try {
      const response = await fetch(getApiUrl('/api/radio/programs?all=true'));
      const data = await response.json();
      if (!response.ok || !Array.isArray(data)) throw new Error(data?.error || 'Impossible de charger les émissions');
      setPrograms(data);
    } catch (error) {
      console.error('Failed to fetch radio programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteProgram = async (program: RadioProgram) => {
    if (!window.confirm(`Supprimer l'émission « ${program.title} » ?`)) return;
    setDeletingId(program.id);
    try {
      const response = await fetch(getApiUrl(`/api/radio/programs/${program.id}`), { method: 'DELETE' });
      if (!response.ok) throw new Error('Impossible de supprimer l’émission');
      setPrograms((current) => current.filter((item) => item.id !== program.id));
    } catch (error) {
      console.error('Failed to delete radio program:', error);
      window.alert('Impossible de supprimer l’émission.');
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const filteredPrograms = programs.filter((program) =>
    program.title.toLowerCase().includes(search.toLowerCase()) ||
    (program.host ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  const formatDate = (value: string) =>
    new Date(value).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Émissions radio</h1>
              <p className="text-secondary mt-1">Programmer les émissions en direct et les animations radio.</p>
            </div>
            <Link
              href="/radio/programs/new"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-slate-950 hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              Nouvelle émission
            </Link>
          </div>

          <div className="card rounded-lg border bg-white p-4 shadow-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Rechercher une émission"
                className="w-full rounded-md border border-gray-300 pl-10 pr-4 py-2 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="card overflow-hidden rounded-lg border bg-white shadow-sm">
            {loading ? (
              <div className="p-8 text-center text-secondary">Chargement...</div>
            ) : filteredPrograms.length === 0 ? (
              <div className="p-8 text-center text-secondary">Aucune émission enregistrée.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Émission</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Animateur</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Début</th>
                      <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Statut</th>
                      <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredPrograms.map((program) => (
                      <tr key={program.id}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-700">
                              <Radio className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900">{program.title}</div>
                              <div className="text-xs text-slate-500">{program.slug}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-700">{program.host || '—'}</td>
                        <td className="px-6 py-4 text-sm text-slate-700">{formatDate(program.startTime)}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${program.isLive ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {program.isLive ? 'En direct' : 'Programmée'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            <Link href={`/radio/programs/${program.id}/edit`} className="rounded-md border border-gray-200 p-2 text-slate-600 hover:bg-gray-50">
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button type="button" onClick={() => deleteProgram(program)} disabled={deletingId === program.id} aria-label={`Supprimer ${program.title}`} className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50 disabled:opacity-50">
                              <Trash2 className="h-4 w-4" />
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
      </AdminLayout>
    </ProtectedRoute>
  );
}
