'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function NewMediaPage() {
  const router = useRouter();
  const [form, setForm] = useState({ type: 'SONG', title: '', slug: '', description: '', url: '', thumbnailUrl: '', duration: '', publishedAt: '', featured: false });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const update = (name: string, value: string | boolean) => setForm((current) => ({ ...current, [name]: value }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true); setError('');
    try {
      const response = await fetch('/api/media', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const responseText = await response.text();
      let data: { error?: string } = {};
      try { data = responseText ? JSON.parse(responseText) : {}; } catch { throw new Error(`Le serveur a répondu avec une page non valide (${response.status}).`); }
      if (!response.ok) throw new Error(data.error || 'Publication impossible.');
      router.push('/media');
    } catch (submitError) { setError(submitError instanceof Error ? submitError.message : 'Publication impossible.'); } finally { setSaving(false); }
  };
  const isVideo = form.type === 'VIDEO';
  return <ProtectedRoute><AdminLayout><div className="mx-auto max-w-3xl space-y-6"><div><h1 className="text-3xl font-bold text-primary">Publier un média</h1><p className="mt-1 text-secondary">Publiez une chanson, une vidéo ou un contenu audio visible sur le site.</p></div>{error && <div className="rounded-md bg-red-50 p-3 text-red-700">{error}</div>}<form onSubmit={submit} className="space-y-5 rounded-lg border bg-white p-6 shadow-sm"><div><label className="mb-2 block text-sm font-medium">Type de média *</label><select value={form.type} onChange={(e) => update('type', e.target.value)} className="w-full rounded-md border px-3 py-2"><option value="SONG">Chanson</option><option value="VIDEO">Vidéo</option><option value="PODCAST">Podcast</option><option value="AUDIO">Audio</option></select></div><div><label className="mb-2 block text-sm font-medium">Titre *</label><input required value={form.title} onChange={(e) => { update('title', e.target.value); if (!form.slug) update('slug', e.target.value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')); }} className="w-full rounded-md border px-3 py-2" /></div><div><label className="mb-2 block text-sm font-medium">Slug *</label><input required value={form.slug} onChange={(e) => update('slug', e.target.value)} className="w-full rounded-md border px-3 py-2" /></div><div><label className="mb-2 block text-sm font-medium">Description</label><textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} className="w-full rounded-md border px-3 py-2" /></div><div><label className="mb-2 block text-sm font-medium">URL {isVideo ? 'vidéo' : 'audio'} *</label><input required type="url" placeholder={isVideo ? 'https://.../video.mp4' : 'https://.../fichier.mp3'} value={form.url} onChange={(e) => update('url', e.target.value)} className="w-full rounded-md border px-3 py-2" /></div><div><label className="mb-2 block text-sm font-medium">URL de couverture</label><input type="url" value={form.thumbnailUrl} onChange={(e) => update('thumbnailUrl', e.target.value)} className="w-full rounded-md border px-3 py-2" /></div><div className="grid gap-4 md:grid-cols-2"><div><label className="mb-2 block text-sm font-medium">Durée en secondes</label><input type="number" min="0" value={form.duration} onChange={(e) => update('duration', e.target.value)} className="w-full rounded-md border px-3 py-2" /></div><div><label className="mb-2 block text-sm font-medium">Date de publication</label><input type="datetime-local" value={form.publishedAt} onChange={(e) => update('publishedAt', e.target.value)} className="w-full rounded-md border px-3 py-2" /></div></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={(e) => update('featured', e.target.checked)} /> Mettre en avant</label><div className="flex justify-end gap-3"><Link href="/media" className="rounded-md border px-4 py-2">Annuler</Link><button disabled={saving} className="rounded-md bg-primary px-5 py-2 font-semibold text-white disabled:opacity-60">{saving ? 'Publication...' : 'Publier le média'}</button></div></form></div></AdminLayout></ProtectedRoute>;
}
