'use client';

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';
import GalleryImageUploader from '@/components/GalleryImageUploader';

export default function EditGalleryEventPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', subtitle: '', date: '', description: '', images: [] as string[] });
  const update = (k: string, v: string) => setForm((c) => ({ ...c, [k]: v }));

  useEffect(() => {
    fetch(`/api/gallery-events/${id}`).then(async (res) => {
      if (!res.ok) return;
      const d = await res.json();
      const images = Array.isArray(d.images) ? d.images.map((img: unknown) => (typeof img === 'string' ? img : (img as { url?: string })?.url || '')).filter(Boolean) : [];
      setForm({
        title: d.title || '',
        subtitle: d.subtitle || '',
        date: d.date ? String(d.date).slice(0, 10) : '',
        description: d.description || '',
        images,
      });
      setLoading(false);
    });
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch(`/api/gallery-events/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        subtitle: form.subtitle || null,
        date: form.date || null,
        description: form.description || null,
        images: form.images,
      }),
    });
    setSaving(false);
    if (res.ok) router.push('/gallery-events'); else alert('Mise à jour impossible.');
  };

  if (loading) return <AdminLayout><p className="p-8 text-secondary">Chargement...</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Modifier la galerie</h1>
          <button onClick={() => router.push('/gallery-events')} className="flex items-center gap-2 rounded-md border px-4 py-2"><X className="h-4 w-4" /> Annuler</button>
        </div>
        <form onSubmit={submit} className="card space-y-4 rounded-lg border p-6">
          <label className="block text-sm font-medium text-secondary">Titre *<input required value={form.title} onChange={(e) => update('title', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
          <label className="block text-sm font-medium text-secondary">Sous-titre<input value={form.subtitle} onChange={(e) => update('subtitle', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
          <label className="block text-sm font-medium text-secondary">Date<input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
          <label className="block text-sm font-medium text-secondary">Description<textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
          <div className="space-y-2"><p className="text-sm font-medium text-secondary">Images de la galerie</p><GalleryImageUploader images={form.images} onChange={(images) => setForm((current) => ({ ...current, images }))} /></div>
          <div className="flex justify-end border-t pt-4"><button disabled={saving} className="flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? '...' : 'Enregistrer'}</button></div>
        </form>
      </div>
    </AdminLayout>
  );
}
