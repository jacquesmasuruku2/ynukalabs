'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';

const slugify = (v: string) => v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function NewOpportunityPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '', titleFr: '', slug: '', excerpt: '', excerptFr: '', content: '', contentFr: '',
    category: 'General', coverUrl: '', published: true,
  });
  const update = (k: string, v: string | boolean) => setForm((c) => ({ ...c, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch('/api/opportunities', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    if (res.ok) router.push('/opportunities'); else alert('Création impossible.');
  };

  return (
    <AdminLayout>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Nouvelle opportunité</h1>
          <button onClick={() => router.push('/opportunities')} className="flex items-center gap-2 rounded-md border px-4 py-2"><X className="h-4 w-4" /> Annuler</button>
        </div>
        <form onSubmit={submit} className="card space-y-4 rounded-lg border p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-secondary">Titre *<input required value={form.title} onChange={(e) => { update('title', e.target.value); if (!form.slug) update('slug', slugify(e.target.value)); }} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
            <label className="text-sm font-medium text-secondary">Titre FR<input value={form.titleFr} onChange={(e) => update('titleFr', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
            <label className="text-sm font-medium text-secondary">Slug *<input required value={form.slug} onChange={(e) => update('slug', slugify(e.target.value))} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
            <label className="text-sm font-medium text-secondary">Catégorie<input value={form.category} onChange={(e) => update('category', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
            <label className="text-sm font-medium text-secondary md:col-span-2">Cover URL<input value={form.coverUrl} onChange={(e) => update('coverUrl', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
          </div>
          <label className="block text-sm font-medium text-secondary">Excerpt<textarea value={form.excerpt} onChange={(e) => update('excerpt', e.target.value)} rows={2} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
          <label className="block text-sm font-medium text-secondary">Excerpt FR<textarea value={form.excerptFr} onChange={(e) => update('excerptFr', e.target.value)} rows={2} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
          <label className="block text-sm font-medium text-secondary">Contenu<textarea value={form.content} onChange={(e) => update('content', e.target.value)} rows={6} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
          <label className="block text-sm font-medium text-secondary">Contenu FR<textarea value={form.contentFr} onChange={(e) => update('contentFr', e.target.value)} rows={6} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={(e) => update('published', e.target.checked)} /> Publié</label>
          <div className="flex justify-end border-t pt-4"><button disabled={saving} className="flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? '...' : 'Publier'}</button></div>
        </form>
      </div>
    </AdminLayout>
  );
}
