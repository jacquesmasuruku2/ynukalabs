'use client';

import { useCallback, useEffect, useState } from 'react';
import { Activity, Eye, RefreshCw, User, UserRound } from 'lucide-react';

type Visitor = {
  id: string;
  path: string;
  pageTitle: string | null;
  userEmail: string | null;
  userName: string | null;
  language: string | null;
  device: string;
  isAnonymous?: boolean;
  secondsAgo: number;
  createdAt?: string | null;
  lastSeenAt?: string | null;
};

type PresencePayload = {
  activeCount: number;
  anonymousActive: number;
  connectedActive: number;
  todayViews: number;
  recentViewsCount: number;
  topPages: { path: string; count: number }[];
  visitors: Visitor[];
  pageViews: Visitor[];
};

function formatAgo(seconds: number) {
  if (seconds < 10) return 'à l’instant';
  if (seconds < 60) return `il y a ${seconds}s`;
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
  return `il y a ${Math.floor(seconds / 3600)} h`;
}

function VisitorLabel({ v }: { v: Visitor }) {
  if (v.userEmail) {
    return (
      <div className="min-w-0">
        <p className="truncate font-medium text-slate-900">{v.userName || 'Connecté'}</p>
        <p className="truncate text-xs text-slate-500">{v.userEmail}</p>
      </div>
    );
  }
  return (
    <div className="min-w-0">
      <p className="font-medium text-slate-800">Visiteur anonyme</p>
      <p className="text-xs text-slate-500">Sans connexion</p>
    </div>
  );
}

export function LiveVisitorsWidget() {
  const [data, setData] = useState<PresencePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'active' | 'views'>('active');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/presence?admin=1');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const t = window.setInterval(() => void load(), 12_000);
    return () => window.clearInterval(t);
  }, [load]);

  const rows = tab === 'active' ? data?.visitors || [] : data?.pageViews || [];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-md border bg-emerald-50 px-4 py-3">
          <p className="text-xs font-medium text-emerald-800">Actifs maintenant</p>
          <p className="text-2xl font-bold text-emerald-900">{loading ? '…' : data?.activeCount ?? 0}</p>
        </div>
        <div className="rounded-md border bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium text-slate-600">Anonymes actifs</p>
          <p className="text-2xl font-bold text-slate-900">{loading ? '…' : data?.anonymousActive ?? 0}</p>
        </div>
        <div className="rounded-md border bg-blue-50 px-4 py-3">
          <p className="text-xs font-medium text-blue-800">Connectés actifs</p>
          <p className="text-2xl font-bold text-blue-900">{loading ? '…' : data?.connectedActive ?? 0}</p>
        </div>
        <div className="rounded-md border bg-amber-50 px-4 py-3">
          <p className="text-xs font-medium text-amber-800">Vues aujourd’hui</p>
          <p className="text-2xl font-bold text-amber-900">{loading ? '…' : data?.todayViews ?? 0}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setTab('active')}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
              tab === 'active' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            En ligne ({data?.activeCount ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setTab('views')}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold ${
              tab === 'views' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
            }`}
          >
            Toutes les visites 24h ({data?.recentViewsCount ?? 0})
          </button>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void load();
          }}
          className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Actualiser
        </button>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      {data?.topPages?.length ? (
        <div className="rounded-md border bg-slate-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pages les plus visitées (24 h)
          </p>
          <ul className="space-y-1.5">
            {data.topPages.map((p) => (
              <li key={p.path} className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium text-slate-800">{p.path}</span>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                  {p.count}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-md border">
        <table className="min-w-full divide-y text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Visiteur</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Page</th>
              <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Appareil</th>
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">
                {tab === 'active' ? 'Activité' : 'Visite'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && !data ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  Chargement…
                </td>
              </tr>
            ) : !rows.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  <Eye className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  {tab === 'active'
                    ? 'Aucun visiteur en ligne pour le moment.'
                    : 'Aucune visite enregistrée sur 24 h.'}
                </td>
              </tr>
            ) : (
              rows.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${
                          v.isAnonymous || !v.userEmail ? 'bg-slate-200' : 'bg-blue-100'
                        }`}
                      >
                        {v.isAnonymous || !v.userEmail ? (
                          <UserRound className="h-4 w-4 text-slate-600" />
                        ) : (
                          <User className="h-4 w-4 text-blue-700" />
                        )}
                      </div>
                      <VisitorLabel v={v} />
                    </div>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="font-medium text-slate-800">{v.path}</p>
                    {v.pageTitle ? <p className="line-clamp-1 text-xs text-slate-500">{v.pageTitle}</p> : null}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">
                    {v.device}
                    {v.language ? <span className="text-slate-400"> · {v.language}</span> : null}
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs text-emerald-700">
                    {formatAgo(v.secondsAgo)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="flex items-center gap-2 text-xs text-slate-500">
        <Activity className="h-3.5 w-3.5 text-emerald-600" />
        Toutes les navigations sont comptées, avec ou sans connexion Google.
      </p>
    </div>
  );
}
