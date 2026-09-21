'use client';

import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Edit, Handshake, Plus, Trash2 } from 'lucide-react';

type Partner = { id: string; name: string; logoUrl: string | null; websiteUrl: string | null; isActive: boolean; displayOrder: number };

export default function PartnersPage() {
  const [items, setItems] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    const res = await fetch('/api/partners?admin=1');
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const remove = async (id: string) => {
    if (!confirm('Supprimer ce partenaire ?')) return;
    await fetch(`/api/partners/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Partenaires</h1>
            <p className="mt-1 text-secondary">Logos vitrine sur /partners</p>
          </div>
          <Link href="/partners/new" className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Nouveau</Link>
        </div>
        {loading ? <p className="py-12 text-center text-secondary">Chargement...</p> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((p) => (
              <article key={p.id} className="card rounded-lg border p-4 shadow-sm">
                <div className="mb-3 flex h-16 items-center justify-center">
                  {p.logoUrl ? <img src={p.logoUrl} alt={p.name} className="max-h-16 object-contain" /> : <Handshake className="h-8 w-8 text-slate-400" />}
                </div>
                <h2 className="text-center font-medium text-primary">{p.name}</h2>
                <p className="mt-1 text-center text-xs text-secondary">{p.isActive ? 'Actif' : 'Inactif'} · ordre {p.displayOrder}</p>
                <div className="mt-3 flex justify-center gap-2">
                  <Link href={`/partners/${p.id}/edit`} className="p-2 text-gray-500 hover:text-blue-600"><Edit className="h-4 w-4" /></Link>
                  <button onClick={() => remove(p.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </article>
            ))}
            {!items.length && <p className="col-span-full py-12 text-center text-secondary">Aucun partenaire.</p>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
