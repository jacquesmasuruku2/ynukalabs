'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Briefcase, ExternalLink, FileText, UserRound } from 'lucide-react';

type OpportunitySubmission = {
  id: string;
  kind: 'application' | 'motivation';
  userName: string | null;
  userEmail: string;
  status?: string;
  linkedinUrl?: string | null;
  twitterUrl?: string | null;
  portfolioUrl?: string | null;
  message?: string | null;
  cvFileUrl?: string | null;
  createdAt: string;
  opportunity: { title: string; titleFr: string | null };
};

export default function OpportunityApplicationsPage() {
  const [items, setItems] = useState<OpportunitySubmission[]>([]);
  const [selected, setSelected] = useState<OpportunitySubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const applicationId = params.get('application');
    const motivationId = params.get('motivation');

    fetch('/api/opportunity-applications')
      .then(async (response) => {
        if (!response.ok) throw new Error('Impossible de charger les candidatures.');
        return response.json() as Promise<OpportunitySubmission[]>;
      })
      .then((rows) => {
        setItems(rows);
        const target = rows.find((item) => item.id === (applicationId || motivationId));
        if (target) setSelected(target);
      })
      .catch((cause) => setError(cause instanceof Error ? cause.message : 'Erreur de chargement.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-primary">Candidatures aux opportunités</h1>
          <p className="mt-1 text-sm text-secondary">{items.length} dossier{items.length > 1 ? 's' : ''} reçu{items.length > 1 ? 's' : ''}</p>
        </header>

        {error ? <p role="alert" className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,380px)]">
          <div className="overflow-hidden rounded-lg border">
            {loading ? <p className="p-8 text-center text-sm text-secondary">Chargement...</p> : items.length ? (
              <ul className="divide-y">
                {items.map((item) => (
                  <li key={`${item.kind}:${item.id}`}>
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 ${selected?.id === item.id ? 'bg-blue-50' : ''}`}
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                        {item.kind === 'motivation' ? <FileText className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-primary">{item.userName || item.userEmail}</span>
                        <span className="block truncate text-xs text-secondary">{item.opportunity.titleFr || item.opportunity.title}</span>
                      </span>
                      <time className="shrink-0 text-xs text-secondary" dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleDateString('fr-FR')}</time>
                    </button>
                  </li>
                ))}
              </ul>
            ) : <p className="p-8 text-center text-sm text-secondary">Aucune candidature reçue.</p>}
          </div>

          <aside className="min-w-0 rounded-lg border p-5">
            {selected ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserRound className="h-5 w-5 shrink-0 text-blue-700" />
                  <h2 className="min-w-0 break-words text-lg font-semibold text-primary">{selected.userName || selected.userEmail}</h2>
                </div>
                <dl className="space-y-3 text-sm">
                  <div><dt className="text-xs font-medium uppercase text-secondary">Email</dt><dd className="break-all text-primary">{selected.userEmail}</dd></div>
                  <div><dt className="text-xs font-medium uppercase text-secondary">Opportunité</dt><dd className="text-primary">{selected.opportunity.titleFr || selected.opportunity.title}</dd></div>
                  <div><dt className="text-xs font-medium uppercase text-secondary">Type de dossier</dt><dd className="text-primary">{selected.kind === 'motivation' ? 'Dossier de motivation' : 'Candidature'}</dd></div>
                  {selected.status ? <div><dt className="text-xs font-medium uppercase text-secondary">Statut</dt><dd className="text-primary">{selected.status}</dd></div> : null}
                  {selected.message ? <div><dt className="text-xs font-medium uppercase text-secondary">Message</dt><dd className="whitespace-pre-wrap text-primary">{selected.message}</dd></div> : null}
                </dl>
                <div className="flex flex-wrap gap-3 border-t pt-4 text-sm">
                  {selected.cvFileUrl ? <a href={selected.cvFileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-700 hover:underline"><FileText className="h-4 w-4" /> CV</a> : null}
                  {selected.linkedinUrl ? <a href={selected.linkedinUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-700 hover:underline">LinkedIn <ExternalLink className="h-3 w-3" /></a> : null}
                  {selected.twitterUrl ? <a href={selected.twitterUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-700 hover:underline">X <ExternalLink className="h-3 w-3" /></a> : null}
                  {selected.portfolioUrl ? <a href={selected.portfolioUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-blue-700 hover:underline">Portfolio <ExternalLink className="h-3 w-3" /></a> : null}
                </div>
              </div>
            ) : <p className="py-8 text-center text-sm text-secondary">Sélectionnez un dossier pour voir son contenu.</p>}
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}