'use client';

import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Calendar, Check, Edit, Inbox, Plus, Trash2, X } from 'lucide-react';

type EventRow = {
  id: string;
  title: string;
  slug: string | null;
  date: string | null;
  location: string | null;
  published: boolean;
  upcoming: boolean;
  imageUrl: string | null;
};

type ProposalRow = {
  id: string;
  title: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string | null;
  organization: string;
  description: string;
  category: string;
  eventDate: string | null;
  eventTime: string | null;
  format: string;
  venue: string | null;
  onlineLink: string | null;
  locationOrLink: string | null;
  publicationChannel: string;
  status: string;
  createdAt: string;
};

type Tab = 'published' | 'proposals';

const statusLabel: Record<string, string> = {
  pending: 'En attente',
  reviewed: 'Vu',
  accepted: 'Acceptée',
  rejected: 'Refusée',
};

const statusClass: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  reviewed: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
};

export default function EventsPage() {
  const [tab, setTab] = useState<Tab>('published');
  const [items, setItems] = useState<EventRow[]>([]);
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ProposalRow | null>(null);

  const loadEvents = useCallback(async () => {
    const res = await fetch('/api/events?admin=1');
    if (res.ok) setItems(await res.json());
  }, []);

  const loadProposals = useCallback(async () => {
    const res = await fetch('/api/event-proposals');
    if (res.ok) setProposals(await res.json());
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadEvents(), loadProposals()]);
      setLoading(false);
    })();
  }, [loadEvents, loadProposals]);

  const remove = async (id: string) => {
    if (!confirm('Supprimer cet événement ?')) return;
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    loadEvents();
  };

  const updateProposalStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/event-proposals/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await loadProposals();
      setSelected(null);
    }
  };

  const removeProposal = async (id: string) => {
    if (!confirm('Supprimer cette demande ?')) return;
    await fetch(`/api/event-proposals/${id}`, { method: 'DELETE' });
    setSelected(null);
    loadProposals();
  };

  const pendingCount = proposals.filter((p) => p.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold text-primary">Événements</h1>
            <p className="mt-1 text-secondary">Publier sur le site ou traiter les demandes reçues</p>
          </div>
          <Link href="/events/new" className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> Nouvel événement
          </Link>
        </div>

        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab('published')}
            className={`rounded-md px-4 py-2 text-sm font-semibold ${tab === 'published' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
          >
            Événements publiés ({items.length})
          </button>
          <button
            type="button"
            onClick={() => setTab('proposals')}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold ${tab === 'proposals' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
          >
            <Inbox className="h-4 w-4" />
            Demandes d’événement ({proposals.length})
            {pendingCount > 0 ? (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white">{pendingCount}</span>
            ) : null}
          </button>
        </div>

        {loading ? (
          <p className="py-12 text-center text-secondary">Chargement...</p>
        ) : tab === 'published' ? (
          <div className="overflow-hidden rounded-lg border">
            <table className="min-w-full divide-y">
              <thead className="bg-gray-50 dark:bg-slate-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-secondary">Titre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-secondary">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-secondary">Statut</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-amber-50 text-amber-600">
                          {item.imageUrl ? <img src={item.imageUrl} alt="" className="h-10 w-10 rounded object-cover" /> : <Calendar className="h-5 w-5" />}
                        </div>
                        <div>
                          <p className="font-medium text-primary">{item.title}</p>
                          <p className="text-xs text-secondary">{item.location || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-secondary">{item.date ? new Date(item.date).toLocaleDateString('fr-FR') : '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                        {item.published ? 'Publié' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/events/${item.id}/edit`} className="mr-2 inline-block p-2 text-gray-500 hover:text-blue-600"><Edit className="h-4 w-4" /></Link>
                      <button onClick={() => remove(item.id)} className="p-2 text-gray-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))}
                {!items.length && (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-secondary">Aucun événement.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
            <div className="overflow-hidden rounded-lg border">
              <table className="min-w-full divide-y">
                <thead className="bg-gray-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-secondary">Demande</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-secondary">Contact</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-secondary">Statut</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-secondary">Reçue</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {proposals.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className={`cursor-pointer hover:bg-slate-50 ${selected?.id === p.id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-primary">{p.title}</p>
                        <p className="text-xs text-secondary">{p.category} · {p.format}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-secondary">
                        <p>{p.contactName}</p>
                        <p className="text-xs">{p.organization}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs ${statusClass[p.status] || 'bg-gray-100 text-gray-600'}`}>
                          {statusLabel[p.status] || p.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-secondary">
                        {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  ))}
                  {!proposals.length && (
                    <tr><td colSpan={4} className="px-4 py-12 text-center text-secondary">Aucune demande pour le moment.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="card rounded-xl border p-5 shadow-sm lg:sticky lg:top-4">
              {selected ? (
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-lg font-semibold text-primary">{selected.title}</h2>
                    <button type="button" onClick={() => setSelected(null)} className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div><dt className="text-xs uppercase text-secondary">Contact</dt><dd className="font-medium text-primary">{selected.contactName} · {selected.contactEmail}</dd></div>
                    {selected.contactPhone ? <div><dt className="text-xs uppercase text-secondary">Téléphone</dt><dd>{selected.contactPhone}</dd></div> : null}
                    <div><dt className="text-xs uppercase text-secondary">Organisation</dt><dd>{selected.organization}</dd></div>
                    <div><dt className="text-xs uppercase text-secondary">Catégorie / format</dt><dd>{selected.category} · {selected.format}</dd></div>
                    <div><dt className="text-xs uppercase text-secondary">Date</dt><dd>{selected.eventDate ? new Date(selected.eventDate).toLocaleDateString('fr-FR') : '—'}{selected.eventTime ? ` · ${selected.eventTime}` : ''}</dd></div>
                    <div><dt className="text-xs uppercase text-secondary">Lieu / lien</dt><dd>{selected.venue || selected.onlineLink || selected.locationOrLink || '—'}</dd></div>
                    <div><dt className="text-xs uppercase text-secondary">Canal</dt><dd>{selected.publicationChannel}</dd></div>
                    <div><dt className="text-xs uppercase text-secondary">Description</dt><dd className="whitespace-pre-wrap text-secondary">{selected.description}</dd></div>
                  </dl>
                  <div className="flex flex-col gap-2 border-t pt-4">
                    <button type="button" onClick={() => updateProposalStatus(selected.id, 'accepted')} className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700">
                      <Check className="h-4 w-4" /> Accepter
                    </button>
                    <button type="button" onClick={() => updateProposalStatus(selected.id, 'reviewed')} className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                      Marquer comme vu
                    </button>
                    <button type="button" onClick={() => updateProposalStatus(selected.id, 'rejected')} className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50">
                      Refuser
                    </button>
                    <Link href={`/events/new?fromProposal=${selected.id}`} className="rounded-lg bg-blue-600 px-4 py-2 text-center text-sm font-medium text-white hover:bg-blue-700">
                      Créer un événement à partir de cette demande
                    </Link>
                    <button type="button" onClick={() => removeProposal(selected.id)} className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" /> Supprimer
                    </button>
                  </div>
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-secondary">Sélectionnez une demande pour voir le détail.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
