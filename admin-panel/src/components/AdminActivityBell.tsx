'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Activity, Bell, Building2, CalendarDays, Mail, MessageSquare, Newspaper, Users } from 'lucide-react';

type ActivityType = 'contact' | 'partnership' | 'newsletter' | 'event-registration' | 'event-message' | 'event-proposal' | 'blog-comment';

type SiteActivity = {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  createdAt: string;
  href: string;
};

const iconByType = {
  contact: Mail,
  partnership: Building2,
  newsletter: Newspaper,
  'event-registration': Users,
  'event-message': MessageSquare,
  'event-proposal': CalendarDays,
  'blog-comment': MessageSquare,
} satisfies Record<ActivityType, typeof Mail>;

function formatActivityDate(value: string) {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export default function AdminActivityBell({ onBeforeOpen }: { onBeforeOpen?: () => void }) {
  const [activities, setActivities] = useState<SiteActivity[]>([]);
  const [seenIds, setSeenIds] = useState<Set<string> | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    let storageKey: string | null = null;

    const refresh = async () => {
      try {
        const response = await fetch('/api/admin/activity-feed', { cache: 'no-store' });
        if (!response.ok) return;
        const result = await response.json() as { adminId: string; activities: SiteActivity[] };
        if (!isMounted) return;

        const nextKey = `admin-activity-seen:${result.adminId}`;
        if (nextKey !== storageKey) {
          storageKey = nextKey;
          setAdminId(result.adminId);
          try {
            const stored = localStorage.getItem(nextKey);
            const initialSeen = stored ? new Set<string>(JSON.parse(stored) as string[]) : new Set(result.activities.map((item) => item.id));
            setSeenIds(initialSeen);
            if (!stored) localStorage.setItem(nextKey, JSON.stringify([...initialSeen]));
          } catch {
            setSeenIds(new Set(result.activities.map((item) => item.id)));
          }
        }

        setActivities(result.activities);
      } catch {
        // Keep the admin header usable when the activity API is temporarily unavailable.
      }
    };

    void refresh();
    const timer = window.setInterval(() => void refresh(), 30000);
    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen]);

  const unreadCount = seenIds ? activities.filter((item) => !seenIds.has(item.id)).length : 0;

  const markAllSeen = () => {
    if (!adminId) return;
    const ids = new Set(activities.map((item) => item.id));
    setSeenIds(ids);
    localStorage.setItem(`admin-activity-seen:${adminId}`, JSON.stringify([...ids]));
  };

  const markActivitySeen = (id: string) => {
    if (!adminId || !seenIds) return;
    const ids = new Set(seenIds);
    ids.add(id);
    setSeenIds(ids);
    localStorage.setItem(`admin-activity-seen:${adminId}`, JSON.stringify([...ids]));
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => {
          const nextOpen = !isOpen;
          if (nextOpen) onBeforeOpen?.();
          setIsOpen(nextOpen);
        }}
        aria-label={unreadCount ? `Activités récentes, ${unreadCount} nouvelles` : 'Activités récentes'}
        aria-expanded={isOpen}
        aria-controls="admin-activity-panel"
        title="Activités récentes du site"
        className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--text-secondary)] transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <section
          id="admin-activity-panel"
          aria-label="Activités récentes du site"
          className="absolute right-0 z-[70] mt-2 w-[min(24rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border bg-white shadow-xl"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          <header className="flex items-center justify-between gap-3 border-b px-4 py-3" style={{ borderColor: 'var(--sidebar-border)' }}>
            <div className="flex min-w-0 items-center gap-2.5">
              <Activity className="h-4 w-4 shrink-0 text-[var(--primary)]" />
              <h2 className="truncate text-sm font-semibold text-[var(--text-primary)]">Activité du site</h2>
              {unreadCount > 0 && <span className="shrink-0 rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-700">{unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}</span>}
            </div>
            <button type="button" onClick={markAllSeen} className="shrink-0 text-xs font-medium text-[var(--primary)] hover:underline">
              Tout marquer lu
            </button>
          </header>

          <ul className="max-h-[min(65vh,28rem)] divide-y overflow-y-auto" style={{ borderColor: 'var(--sidebar-border)' }}>
            {activities.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-[var(--text-secondary)]">Aucune activité récente</li>
            ) : activities.map((item) => {
              const Icon = iconByType[item.type];
              const isUnread = Boolean(seenIds && !seenIds.has(item.id));
              return (
                <li key={item.id}>
                  <Link
                    href={item.href}
                    onClick={() => {
                      markActivitySeen(item.id);
                      setIsOpen(false);
                    }}
                    className={`flex min-w-0 gap-3 px-4 py-3 transition-colors hover:bg-slate-50 ${isUnread ? 'bg-blue-50/60' : ''}`}
                  >
                    <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary-bg)] text-[var(--primary)]">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className="text-sm font-semibold leading-5 text-[var(--text-primary)]">{item.title}</span>
                        {isUnread && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" aria-label="Non lu" />}
                      </span>
                      <span className="mt-0.5 block break-words text-xs leading-5 text-[var(--text-secondary)]">{item.description}</span>
                      <time className="mt-1 block text-[11px] text-slate-400" dateTime={item.createdAt}>{formatActivityDate(item.createdAt)}</time>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}