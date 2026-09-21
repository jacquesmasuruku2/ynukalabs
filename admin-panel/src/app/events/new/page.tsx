'use client';

import AdminLayout from '@/components/AdminLayout';
import WordEditor from '@/components/WordEditor';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Save, X } from 'lucide-react';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const fieldClass =
  'w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500';

function toLocalInput(iso: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function NewEventPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromProposal = searchParams.get('fromProposal');
  const [saving, setSaving] = useState(false);
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [form, setForm] = useState({
    title: '',
    titleFr: '',
    slug: '',
    description: '',
    descriptionFr: '',
    date: '',
    time: '',
    location: '',
    type: '',
    capacity: '',
    imageUrl: '',
    recapUrl: '',
    youtubeUrl: '',
    upcoming: true,
    published: true,
  });
  const update = (key: string, value: string | boolean) => setForm((c) => ({ ...c, [key]: value }));

  useEffect(() => {
    if (!fromProposal) return;
    fetch(`/api/event-proposals/${fromProposal}`)
      .then(async (res) => {
        if (!res.ok) return;
        const p = await res.json();
        setForm((c) => ({
          ...c,
          title: p.title || '',
          titleFr: p.title || '',
          slug: slugify(p.title || ''),
          description: p.description || '',
          descriptionFr: p.description || '',
          date: toLocalInput(p.eventDate),
          time: p.eventTime || '',
          location: p.venue || p.locationOrLink || '',
          type: p.category || p.format || '',
          capacity: p.capacity != null ? String(p.capacity) : '',
          imageUrl: p.imageUrl || '',
          upcoming: true,
          published: false,
        }));
        setLang('fr');
      })
      .catch(() => undefined);
  }, [fromProposal]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        capacity: form.capacity ? Number(form.capacity) : null,
        date: form.date || null,
      }),
    });
    setSaving(false);
    if (res.ok) {
      if (fromProposal) {
        await fetch(`/api/event-proposals/${fromProposal}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'accepted' }),
        });
      }
      router.push('/events');
    } else alert('Impossible de créer l’événement.');
  };

  const titleValue = lang === 'fr' ? form.titleFr || form.title : form.title;
  const descriptionKey = lang === 'fr' ? 'descriptionFr' : 'description';

  return (
    <AdminLayout>
      <div className="w-full max-w-none">
        <div className="mb-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">Édition d’événement</h1>
              <p className="mt-1 text-secondary">Une seule page pour rédiger et publier</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setLang('fr')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${lang === 'fr' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
                >
                  FR
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`rounded-md px-3 py-1.5 text-xs font-semibold ${lang === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'}`}
                >
                  EN
                </button>
              </div>
              <button
                type="button"
                onClick={() => router.push('/events')}
                className="rounded-lg px-4 py-2 text-sm text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-8">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] xl:gap-8">
            <div className="card rounded-xl border shadow-sm">
              <div className="space-y-6 p-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Titre * {lang === 'fr' ? '(FR)' : '(EN)'}
                  </label>
                  <input
                    required={lang === 'en' || !form.title}
                    value={lang === 'fr' ? form.titleFr : form.title}
                    onChange={(e) => {
                      if (lang === 'fr') {
                        update('titleFr', e.target.value);
                        if (!form.title) update('title', e.target.value);
                        if (!form.slug) update('slug', slugify(e.target.value));
                      } else {
                        update('title', e.target.value);
                        if (!form.slug) update('slug', slugify(e.target.value));
                      }
                    }}
                    className={`${fieldClass} text-lg`}
                    placeholder={lang === 'fr' ? 'Titre de l’événement' : 'Event title'}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => update('slug', slugify(e.target.value))}
                    className={fieldClass}
                    placeholder="url-de-l-evenement"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Description {lang === 'fr' ? '(FR)' : '(EN)'}
                  </label>
                  <WordEditor
                    key={lang}
                    content={form[descriptionKey]}
                    onChange={(value) => update(descriptionKey, value)}
                  />
                </div>
              </div>
            </div>

            <div className="card overflow-hidden rounded-xl border shadow-sm lg:sticky lg:top-4">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-lg font-semibold text-primary">Paramètres</h2>
              </div>
              <div className="space-y-5 p-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Date</label>
                  <input type="datetime-local" value={form.date} onChange={(e) => update('date', e.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Heure</label>
                  <input value={form.time} onChange={(e) => update('time', e.target.value)} className={fieldClass} placeholder="14:00" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Lieu</label>
                  <input value={form.location} onChange={(e) => update('location', e.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Type</label>
                  <input value={form.type} onChange={(e) => update('type', e.target.value)} className={fieldClass} placeholder="Présentiel, en ligne…" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Capacité</label>
                  <input type="number" value={form.capacity} onChange={(e) => update('capacity', e.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">URL image</label>
                  <input value={form.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} className={fieldClass} placeholder="https://..." />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">YouTube URL</label>
                  <input value={form.youtubeUrl} onChange={(e) => update('youtubeUrl', e.target.value)} className={fieldClass} placeholder="https://youtube.com/..." />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Recap URL</label>
                  <input value={form.recapUrl} onChange={(e) => update('recapUrl', e.target.value)} className={fieldClass} placeholder="https://..." />
                </div>

                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input type="checkbox" checked={form.published} onChange={(e) => update('published', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    Publié
                  </label>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input type="checkbox" checked={form.upcoming} onChange={(e) => update('upcoming', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                    À venir
                  </label>
                </div>

                {(titleValue || form.slug) && (
                  <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    Aperçu : /events/{form.slug || '…'}
                  </p>
                )}

                <div className="flex flex-col gap-2 border-t border-gray-200 pt-5">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? 'Enregistrement...' : 'Publier'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/events')}
                    className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    <X className="h-4 w-4" />
                    Annuler
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}

export default function NewEventPage() {
  return (
    <Suspense fallback={<AdminLayout><p className="p-8 text-secondary">Chargement...</p></AdminLayout>}>
      <NewEventPageInner />
    </Suspense>
  );
}
