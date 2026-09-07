'use client';

import AdminLayout from '@/components/AdminLayout';
import WordEditor from '@/components/WordEditor';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';

const slugify = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function NewTeamMemberPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', role: '', description: '', imageUrl: '', imageAlt: '', xUrl: '', linkedinUrl: '', telegramUrl: '', portfolioUrl: '', isActive: true });
  const update = (key: string, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setSaving(true);
    const response = await fetch('/api/team-members', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setSaving(false);
    if (response.ok) router.push('/team-members'); else alert('Impossible de créer le membre. Vérifiez le slug.');
  };

  return <AdminLayout><div className="mx-auto max-w-4xl space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold text-primary">Nouveau membre</h1><p className="mt-1 text-secondary">Créer le profil public de l’équipe</p></div><button onClick={() => router.push('/team-members')} className="flex items-center gap-2 rounded-md border px-4 py-2"><X className="h-4 w-4" /> Annuler</button></div>
    <form onSubmit={submit} className="card space-y-6 rounded-lg border p-6 shadow-sm">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm font-medium text-secondary">Nom *<input required value={form.name} onChange={(e) => { update('name', e.target.value); if (!form.slug) update('slug', slugify(e.target.value)); }} className="mt-2 w-full rounded-md border px-3 py-2 text-primary" /></label>
        <label className="text-sm font-medium text-secondary">Slug *<input required value={form.slug} onChange={(e) => update('slug', slugify(e.target.value))} className="mt-2 w-full rounded-md border px-3 py-2 text-primary" placeholder="jacques-masuruku" /></label>
        <label className="text-sm font-medium text-secondary">Fonction *<input required value={form.role} onChange={(e) => update('role', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2 text-primary" /></label>
        <label className="text-sm font-medium text-secondary">URL de l’image<input value={form.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2 text-primary" /></label>
        <label className="text-sm font-medium text-secondary">Texte alternatif<input value={form.imageAlt} onChange={(e) => update('imageAlt', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2 text-primary" /></label>
        <label className="text-sm font-medium text-secondary">Lien X<input value={form.xUrl} onChange={(e) => update('xUrl', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2 text-primary" /></label>
        <label className="text-sm font-medium text-secondary">Lien LinkedIn<input value={form.linkedinUrl} onChange={(e) => update('linkedinUrl', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2 text-primary" /></label>
        <label className="text-sm font-medium text-secondary">Lien Telegram<input value={form.telegramUrl} onChange={(e) => update('telegramUrl', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2 text-primary" /></label>
        <label className="text-sm font-medium text-secondary">Portfolio<input value={form.portfolioUrl} onChange={(e) => update('portfolioUrl', e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2 text-primary" placeholder="https://..." /></label>
      </div>
      <div><label className="mb-2 block text-sm font-medium text-secondary">Description du membre</label><WordEditor content={form.description} onChange={(value) => update('description', value)} /></div>
      <div className="flex justify-end border-t pt-5"><button disabled={saving} className="flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Enregistrement...' : 'Publier le membre'}</button></div>
    </form></div></AdminLayout>;
}
