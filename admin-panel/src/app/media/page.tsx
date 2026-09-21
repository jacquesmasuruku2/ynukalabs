'use client';

import Link from 'next/link';
import { Plus, Music } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useEffect, useState } from 'react';

export default function MediaAdminPage() {
  const [media, setMedia] = useState<any[]>([]);
  useEffect(() => { fetch('/api/media').then((response) => response.json()).then((data) => setMedia(Array.isArray(data) ? data : [])); }, []);
  return <ProtectedRoute><AdminLayout><div className="space-y-6"><div className="flex items-center justify-between"><div><h1 className="text-3xl font-bold text-primary">Médias</h1><p className="mt-1 text-secondary">Publier et gérer les chansons et contenus audio.</p></div><Link href="/media/new" className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-slate-950"><Plus className="h-4 w-4" />Publier un média</Link></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{media.map((item) => <article key={item.id} className="rounded-lg border bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-full bg-blue-100 p-3 text-primary"><Music className="h-5 w-5" /></div><div><h2 className="font-semibold text-slate-900">{item.title}</h2><p className="text-xs text-slate-500">{item.type} · {new Date(item.publishedAt).toLocaleDateString('fr-FR')}</p></div></div><p className="mt-3 line-clamp-2 text-sm text-slate-600">{item.description || 'Aucune description'}</p><audio controls preload="none" src={item.url} className="mt-4 w-full" /></article>)}{media.length === 0 && <div className="col-span-full rounded-lg border border-dashed p-10 text-center text-secondary">Aucun média publié.</div>}</div></div></AdminLayout></ProtectedRoute>;
}
