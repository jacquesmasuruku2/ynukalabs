'use client';

import AdminLayout from '@/components/AdminLayout';
import WordEditor from '@/components/WordEditor';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';

const slugify = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
type Form = { name: string; slug: string; role: string; description: string; imageUrl: string; imageAlt: string; xUrl: string; linkedinUrl: string; telegramUrl: string; isActive: boolean };
const empty: Form = { name: '', slug: '', role: '', description: '', imageUrl: '', imageAlt: '', xUrl: '', linkedinUrl: '', telegramUrl: '', isActive: true };

export default function EditTeamMemberPage() {
  const router = useRouter(); const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form>(empty); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const update = (key: keyof Form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  useEffect(() => { fetch(`/api/team-members/${id}`).then((response) => response.json()).then((data) => setForm({ ...empty, ...data })).finally(() => setLoading(false)); }, [id]);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setSaving(true); const response = await fetch(`/api/team-members/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) }); setSaving(false); if (response.ok) router.push('/team-members'); else alert('Impossible de modifier le membre.'); };
  if (loading) return <AdminLayout><p className="py-12 text-center text-secondary">Chargement...</p></AdminLayout>;
  return <AdminLayout><div className="mx-auto max-w-4xl space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold text-primary">Modifier le membre</h1><p className="mt-1 text-secondary">Le profil public sera disponible sur /team/{form.slug}</p></div><button onClick={() => router.push('/team-members')} className="flex items-center gap-2 rounded-md border px-4 py-2"><X className="h-4 w-4" /> Annuler</button></div><form onSubmit={submit} className="card space-y-6 rounded-lg border p-6 shadow-sm"><div className="grid gap-5 md:grid-cols-2">{([['name','Nom *'],['slug','Slug *'],['role','Fonction *'],['imageUrl','URL de l’image'],['imageAlt','Texte alternatif'],['xUrl','Lien X'],['linkedinUrl','Lien LinkedIn'],['telegramUrl','Lien Telegram']] as const).map(([key, label]) => <label key={key} className="text-sm font-medium text-secondary">{label}<input required={key === 'name' || key === 'slug' || key === 'role'} value={form[key]} onChange={(e) => update(key, key === 'slug' ? slugify(e.target.value) : e.target.value)} className="mt-2 w-full rounded-md border px-3 py-2 text-primary" /></label>)}</div><div><label className="mb-2 block text-sm font-medium text-secondary">Description du membre</label><WordEditor content={form.description} onChange={(value) => update('description', value)} /></div><div className="flex justify-end border-t pt-5"><button disabled={saving} className="flex items-center gap-2 rounded-md bg-blue-600 px-5 py-2 text-white disabled:opacity-50"><Save className="h-4 w-4" />{saving ? 'Enregistrement...' : 'Enregistrer'}</button></div></form></div></AdminLayout>;
}
