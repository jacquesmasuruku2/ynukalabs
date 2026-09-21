'use client';

import AdminLayout from '@/components/AdminLayout';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';

const slugify = (v: string) => v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function EditPartnerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', slug: '', description: '', logoUrl: '', websiteUrl: '', displayOrder: '0', isActive: true });
  const update = (k: string, v: string | boolean) => setForm((c) => ({ ...c, [k]: v }));

  useEffect(() => {
    fetch(`/api/partners/${id}`).then(async (res) => {
      if (!res.ok) return;
      const d = await res.json();
      setForm({
        name: d.name || '', slug: d.slug || '', description: d.description || '',
        logoUrl: d.logoUrl || '', websiteUrl: d.websiteUrl || '',
        displayOrder: String(d.displayOrder ?? 0), isActive: d.isActive !== false,
      });
      setLoading(false);
    });
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    const res = await fetch(`/api/partners/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, displayOrder: Number(form.displayOrder) || 0 }),
    });
    setSaving(false);
    if (res.ok) router.push('/partners'); else alert('Mise à jour impossible.');
  };

  if (loading) return <AdminLayout><p className="p-8 text-secondary">Chargement...</p></AdminLayout>;

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">Modifier le partenaire</h1>
          <button onClick={() => router.push('/partners')} className="flex items-center gap-2 rounded-md border px-4 py-2"><X className="h-4 w-4" /> Annuler</button>
        </div>
        <form onSubmit={submit} className="card space-y-4 rounded-lg border p-6">
          <label className="block text-sm font-medium text-secondary">Nom *<input required value={form.name} onChange={(e) => update('name', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
          <label className="block text-sm font-medium text-secondary">Slug<input value={form.slug} onChange={(e) => update('slug', slugify(e.target.value))} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
          <label className="block text-sm font-medium text-secondary">Logo URL<input value={form.logoUrl} onChange={(e) => update('logoUrl', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
          <label className="block text-sm font-medium text-secondary">Site web<input value={form.websiteUrl} onChange={(e) => update('websiteUrl', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
          <label className="block text-sm font-medium text-secondary">Ordre<input type="number" value={form.displayOrder} onChange={(e) => update('displayOrder', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
          <label className="block text-sm font-medium text-secondary">Description<textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} className="mt-2 w-full rounded-md border px-3 py-2" /></label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => update('isActive', e.target.checked)} /> Actif</label>
          <div className="flex justify-end border-t pt-4"><button disabled={saving} className="flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? '...' : 'Enregistrer'}</button></div>
        </form>
      </div>
    </AdminLayout>
  );
}
