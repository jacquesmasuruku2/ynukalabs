'use client';

import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Edit, Images, Plus, Trash2 } from 'lucide-react';

type Gallery = { id: string; title: string; subtitle: string | null; date: string | null; images: unknown };

export default function GalleryEventsPage() {
  const [items, setItems] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    const res = await fetch('/api/gallery-events');
    if (res.ok) setItems(await res.json());
    setLoading(false);
  };
  useEffect(() => { load(); }, []);
  const remove = async (id: string) => {
    if (!confirm('Supprimer cette galerie ?')) return;
    await fetch(`/api/gallery-events/${id}`, { method: 'DELETE' });
    load();
  };
  const imageCount = (images: unknown) => (Array.isArray(images) ? images.length : 0);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Galeries</h1>
            <p className="mt-1 text-secondary">Événements photo pour /gallery</p>
          </div>
          <Link href="/gallery-events/new" className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"><Plus className="h-4 w-4" /> Nouvelle</Link>
        </div>
        {loading ? <p className="py-12 text-center text-secondary">Chargement...</p> : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((g) => (
              <article key={g.id} className="card flex items-center justify-between rounded-lg border p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <Images className="h-8 w-8 text-blue-600" />
                  <div>
                    <h2 className="font-semibold text-primary">{g.title}</h2>
                    <p className="text-xs text-secondary">{g.subtitle || '—'} · {imageCount(g.images)} image(s)</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href={`/gallery-events/${g.id}/edit`} className="p-2 text-gray-500 hover:text-blue-600"><Edit className="h-4 w-4" /></Link>
                  <button onClick={() => remove(g.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </div>
              </article>
            ))}
            {!items.length && <p className="col-span-full py-12 text-center text-secondary">Aucune galerie.</p>}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
