'use client';

import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';
import { Radio, Save, Volume2, EyeOff, Eye, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/api';

interface RadioStation {
  id: string;
  name: string;
  streamUrl: string;
  logoUrl: string | null;
  description: string | null;
  showLabel: boolean;
  isActive: boolean;
}

const emptyStation: RadioStation = {
  id: '',
  name: 'BBC World Service',
  streamUrl: 'https://as-hls-ww.live.cf.md.bbci.co.uk/pool_07364996/live/ww/bbc_world_service_news_internet/bbc_world_service_news_internet.isml/bbc_world_service_news_internet-audio%3d48000.norewind.m3u8',
  logoUrl: '/images/logo.png',
  description: 'Flux radio BBC par défaut',
  showLabel: true,
  isActive: true,
};

export default function RadioPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [station, setStation] = useState<RadioStation>(emptyStation);

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const response = await fetch(getApiUrl('/api/radio'));
        if (!response.ok) throw new Error('Failed to fetch radio station');
        const data = await response.json();
        setStation({
          ...emptyStation,
          ...data,
          showLabel: data?.showLabel ?? true,
          isActive: data?.isActive ?? true,
        });
      } catch (error) {
        console.error('Failed to fetch radio station:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStation();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...station,
        id: station.id && station.id !== 'default-radio' ? station.id : undefined,
      };
      console.log('[RadioPage] Submitting payload:', payload);

      const response = await fetch(getApiUrl('/api/radio'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      console.log('[RadioPage] Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[RadioPage] Error response:', errorData);
        throw new Error('Unable to save radio station');
      }

      const responseData = await response.json();
      console.log('[RadioPage] Success response:', responseData);
      router.refresh();
    } catch (error) {
      console.error('[RadioPage] Error saving radio station:', error);
      alert('Erreur lors de la sauvegarde de la radio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AdminLayout>
          <div className="flex min-h-[220px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Radio</h1>
              <p className="text-secondary mt-1">Gérer la station de diffusion et son affichage.</p>
            </div>
            <div className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-red-700">
              Live
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card rounded-xl border bg-white p-6 shadow-sm">
            <div className="grid gap-6">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-secondary">Nom de la radio</label>
                <input
                  value={station.name}
                  onChange={(e) => setStation({ ...station, name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-secondary">URL du flux</label>
                <input
                  value={station.streamUrl}
                  onChange={(e) => setStation({ ...station, streamUrl: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-secondary">Description</label>
                <input
                  value={station.description ?? ''}
                  onChange={(e) => setStation({ ...station, description: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-secondary">URL de l’icône / logo</label>
                <input
                  type="text"
                  value={station.logoUrl ?? ''}
                  onChange={(e) => setStation({ ...station, logoUrl: e.target.value || null })}
                  placeholder="https://... ou /images/logo.png"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary focus:outline-none"
                />
                <p className="text-xs text-secondary">Cette image sera affichée dans le player radio et les contrôles de lecture.</p>
                <div className="flex items-center gap-3 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-3">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-white">
                    {station.logoUrl ? (
                      <img src={station.logoUrl} alt="Aperçu de l’icône radio" className="h-full w-full object-cover" />
                    ) : (
                      <Radio className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <span className="text-xs text-secondary">Aperçu de l’icône</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-secondary">
                    <Eye className="h-4 w-4" />
                    Afficher le libellé
                  </span>
                  <input
                    type="checkbox"
                    checked={station.showLabel}
                    onChange={(e) => setStation({ ...station, showLabel: e.target.checked })}
                    className="h-4 w-4 accent-primary"
                  />
                </label>

                <label className="flex items-center justify-between rounded-lg border border-gray-200 p-3">
                  <span className="flex items-center gap-2 text-sm font-medium text-secondary">
                    <Radio className="h-4 w-4" />
                    Radio active
                  </span>
                  <input
                    type="checkbox"
                    checked={station.isActive}
                    onChange={(e) => setStation({ ...station, isActive: e.target.checked })}
                    className="h-4 w-4 accent-primary"
                  />
                </label>
              </div>

              <div className="rounded-lg border border-gray-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Volume2 className="h-4 w-4 text-primary" />
                  Aperçu du player
                </div>

                <div className="flex items-center justify-between rounded-lg bg-slate-900 p-3 text-white">
                  {station.showLabel ? (
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-primary">
                        <Radio className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{station.name || 'Malakinfo Radio'}</div>
                        <div className="text-[11px] text-slate-300">{station.description || 'Le son de Malakinfo en direct'}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                      <EyeOff className="h-4 w-4" />
                      Libellé masqué
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <button type="button" className="rounded-full bg-primary px-3 py-2 text-xs font-semibold text-slate-950">
                      Play
                    </button>
                    <button type="button" className="rounded-full border border-white/20 px-3 py-2 text-xs font-semibold text-white">
                      Volume
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-slate-950 transition hover:opacity-90 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
