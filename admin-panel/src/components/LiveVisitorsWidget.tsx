'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Activity, Eye, RefreshCw, User } from 'lucide-react';

type Visitor = {
  id: string;
  path: string;
  pageTitle: string | null;
  userEmail: string | null;
  userName: string | null;
  language: string | null;
  device: string;
  lastSeenAt: string;
  secondsAgo: number;
};

type PresencePayload = {
  activeCount: number;
  windowSeconds: number;
  topPages: { path: string; count: number }[];
  visitors: Visitor[];
};

function formatAgo(seconds: number) {
  if (seconds < 10) return 'à l’instant';
  if (seconds < 60) return `il y a ${seconds}s`;
  return `il y a ${Math.floor(seconds / 60)} min`;
}

export function LiveVisitorsWidget({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<PresencePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  if (compact) {
    return (
      <Link
        href="/live-visitors"
        className="card block rounded-lg border p-6 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-secondary">Visiteurs actifs</p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {loading ? '…' : data?.activeCount ?? 0}
            </p>
            <p className="mt-1 text-xs text-secondary">Sur le site · 2 dernières min</p>
          </div>
          <div className="rounded-lg bg-emerald-500/10 p-3">
            <Activity className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
            <Activity className="h-6 w-6 text-emerald-700" />
            {(data?.activeCount ?? 0) > 0 ? (
              <span className="absolute right-0 top-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-white" />
            ) : null}
          </div>
          <div>
            <p className="text-3xl font-bold text-primary">{loading ? '…' : data?.activeCount ?? 0}</p>
            <p className="text-sm text-secondary">visiteur{(data?.activeCount ?? 0) > 1 ? 's' : ''} actif{(data?.activeCount ?? 0) > 1 ? 's' : ''} maintenant</p>
          </div>
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
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Pages les plus vues (actives)</p>
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
              <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Activité</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && !data ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  Chargement…
                </td>
              </tr>
            ) : !data?.visitors?.length ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                  <Eye className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  Aucun visiteur actif pour le moment.
                </td>
              </tr>
            ) : (
              data.visitors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/80">
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                        <User className="h-4 w-4 text-slate-600" />
                      </div>
                      <div className="min-w-0">
                        {v.userName || v.userEmail ? (
                          <>
                            <p className="truncate font-medium text-slate-900">{v.userName || 'Connecté'}</p>
                            <p className="truncate text-xs text-slate-500">{v.userEmail}</p>
                          </>
                        ) : (
                          <p className="font-medium text-slate-700">Anonyme</p>
                        )}
                      </div>
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
    </div>
  );
}
