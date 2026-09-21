'use client';

import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Briefcase, Edit, Plus, Trash2 } from 'lucide-react';

type Opp = { id: string; title: string; slug: string; category: string; published: boolean; coverUrl: string | null };

export default function OpportunitiesPage() {
  const [items, setItems] = useState<Opp[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    const res = await fetch('/api/opportunities?admin=1');
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const remove = async (id: string) => {
    if (!confirm('Supprimer cette opportunité ?')) return;
    await fetch(`/api/opportunities/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Opportunités</h1>
            <p className="mt-1 text-secondary">Publiées sur /opportunities</p>
          </div>
          <Link href="/opportunities/new" className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Nouvelle</Link>
        </div>
        {loading ? <p className="py-12 text-center text-secondary">Chargement...</p> : (
          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50 dark:bg-slate-800"><tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-secondary">Titre</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-secondary">Catégorie</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-secondary">Statut</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-secondary">Actions</th>
              </tr></thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {item.coverUrl ? <img src={item.coverUrl} alt="" className="h-10 w-10 rounded object-cover" /> : <Briefcase className="h-5 w-5 text-blue-600" />}
                        <span className="font-medium text-primary">{item.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary">{item.category}</td>
                    <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{item.published ? 'Publié' : 'Brouillon'}</span></td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/opportunities/${item.id}/edit`} className="mr-2 inline-block p-2 text-gray-500 hover:text-blue-600"><Edit className="h-4 w-4" /></Link>
                      <button onClick={() => remove(item.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
                {!items.length && <tr><td colSpan={4} className="px-4 py-12 text-center text-secondary">Aucune opportunité.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
