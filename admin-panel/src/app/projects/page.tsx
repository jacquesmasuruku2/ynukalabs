'use client';

import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Edit, FolderKanban, Plus, Trash2 } from 'lucide-react';

type Project = { id: string; title: string; slug: string; category: string; status: string; showOnHome: boolean; featuredImage: string | null };

export default function ProjectsPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    const res = await fetch('/api/projects?admin=1');
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const remove = async (id: string) => {
    if (!confirm('Supprimer ce projet ?')) return;
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Projets</h1>
            <p className="mt-1 text-secondary">Affichés sur /projects et l’accueil si « Accueil »</p>
          </div>
          <Link href="/projects/new" className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Nouveau projet</Link>
        </div>
        {loading ? <p className="py-12 text-center text-secondary">Chargement...</p> : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <article key={p.id} className="card overflow-hidden rounded-lg border shadow-sm">
                <div className="flex h-36 items-center justify-center bg-slate-100">
                  {p.featuredImage ? <img src={p.featuredImage} alt="" className="h-full w-full object-cover" /> : <FolderKanban className="h-10 w-10 text-slate-400" />}
                </div>
                <div className="space-y-2 p-4">
                  <h2 className="font-semibold text-primary">{p.title}</h2>
                  <p className="text-xs text-secondary">{p.category} · {p.status}{p.showOnHome ? ' · Accueil' : ''}</p>
                  <div className="flex justify-end gap-2">
                    <Link href={`/projects/${p.id}/edit`} className="p-2 text-gray-500 hover:text-blue-600"><Edit className="h-4 w-4" /></Link>
                    <button onClick={() => remove(p.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </article>
            ))}
            {!items.length && <p className="col-span-full py-12 text-center text-secondary">Aucun projet.</p>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
