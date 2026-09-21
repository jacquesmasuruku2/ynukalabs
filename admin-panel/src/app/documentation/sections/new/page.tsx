'use client';

import AdminLayout from '@/components/AdminLayout';
import WordEditor from '@/components/WordEditor';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  FileText,
  FolderOpen,
  GraduationCap,
  Lightbulb,
  Save,
  Sparkles,
  Wrench,
  X,
} from 'lucide-react';

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const fieldClass =
  'w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500';

const templates = [
  {
    id: 'start',
    title: 'Démarrage rapide',
    slug: 'demarrage-rapide',
    description: '<p>Premiers outils et guides pour intégrer le Web3 et la communauté Ynuka Labs.</p>',
    icon: 'bookOpen',
  },
  {
    id: 'tools',
    title: 'Outils et ressources',
    slug: 'outils-et-ressources',
    description: '<p>Documents, liens et ressources pratiques pour les projets et les ateliers.</p>',
    icon: 'wrench',
  },
  {
    id: 'learn',
    title: 'Apprentissage',
    slug: 'apprentissage',
    description: '<p>Tutoriels, parcours et contenus éducatifs pour monter en compétences.</p>',
    icon: 'graduationCap',
  },
  {
    id: 'ideas',
    title: 'Idées & inspiration',
    slug: 'idees-inspiration',
    description: '<p>Cas d’usage, retours d’expérience et pistes pour inventer des solutions locales.</p>',
    icon: 'lightbulb',
  },
] as const;

const iconOptions = [
  { value: 'bookOpen', label: 'Livre', Icon: BookOpen },
  { value: 'fileText', label: 'Document', Icon: FileText },
  { value: 'folderOpen', label: 'Dossier', Icon: FolderOpen },
  { value: 'wrench', label: 'Outils', Icon: Wrench },
  { value: 'graduationCap', label: 'Formation', Icon: GraduationCap },
  { value: 'lightbulb', label: 'Idée', Icon: Lightbulb },
] as const;

function PreviewIcon({ iconKey }: { iconKey: string }) {
  const found = iconOptions.find((o) => o.value === iconKey) || iconOptions[0];
  const Icon = found.Icon;
  return <Icon className="h-6 w-6" />;
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function NewDocumentationSectionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    description: '',
    displayOrder: '0',
    isActive: true,
    iconKey: 'bookOpen',
  });

  const update = (key: string, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));

  const applyTemplate = (template: (typeof templates)[number]) => {
    setForm({
      title: template.title,
      slug: template.slug,
      description: template.description,
      displayOrder: form.displayOrder,
      isActive: true,
      iconKey: template.icon,
    });
  };

  const previewText = useMemo(
    () => stripHtml(form.description) || 'La description de la section apparaîtra ici.',
    [form.description]
  );

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const res = await fetch('/api/resource-sections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        slug: form.slug || slugify(form.title),
        description: form.description || null,
        displayOrder: Number(form.displayOrder || 0),
        isActive: form.isActive,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.details || data.error || 'Impossible de créer la section.');
      return;
    }

    router.push('/documentation');
  };

  return (
    <AdminLayout>
      <div className="w-full max-w-none">
        <div className="mb-8 overflow-hidden rounded-2xl border border-[#0b3b8b]/15 bg-gradient-to-br from-[#0b3b8b] via-[#123f7a] to-[#0a254f] p-6 text-white shadow-sm md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#ffb800]">
                <Sparkles className="h-3.5 w-3.5" />
                Documentation Ynuka Labs
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                Nouvelle section
              </h1>
              <p className="mt-2 text-sm text-white/80 md:text-base">
                Structurez une rubrique claire pour le site : titre fort, slug propre, description riche.
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/documentation')}
              className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
            >
              Retour
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-8">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
            <p className="mb-3 text-sm font-semibold text-slate-800">Modèles rapides</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-[#0b3b8b]/40 hover:bg-[#0b3b8b]/5"
                >
                  <p className="font-semibold text-slate-900">{template.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{stripHtml(template.description)}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,380px)] xl:gap-8">
            <div className="card space-y-6 rounded-xl border p-6 shadow-sm">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Titre *</label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => {
                    update('title', e.target.value);
                    if (!form.slug || form.slug === slugify(form.title)) {
                      update('slug', slugify(e.target.value));
                    }
                  }}
                  className={`${fieldClass} text-lg`}
                  placeholder="Ex. Démarrage rapide"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Slug *</label>
                <input
                  required
                  value={form.slug}
                  onChange={(e) => update('slug', slugify(e.target.value))}
                  className={fieldClass}
                  placeholder="demarrage-rapide"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Visible sur le site : /documentation#{form.slug || '…'}
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                <WordEditor
                  content={form.description}
                  onChange={(value) => update('description', value)}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:sticky lg:top-4">
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                  <h2 className="text-lg font-semibold text-primary">Aperçu & paramètres</h2>
                </div>

                <div className="space-y-5 p-5">
                  <div className="rounded-2xl border border-[#0b3b8b]/10 bg-gradient-to-br from-slate-50 to-[#ffb800]/10 p-5">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0b3b8b] text-[#ffb800] shadow-sm">
                      <PreviewIcon iconKey={form.iconKey} />
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#0b3b8b]/70">
                      Section documentation
                    </p>
                    <h3 className="mt-1 text-xl font-bold text-[#0f2847]">
                      {form.title || 'Titre de la section'}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{previewText}</p>
                    <p className="mt-4 text-xs font-medium text-slate-400">/{form.slug || 'slug'}</p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Icône (aperçu)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {iconOptions.map(({ value, label, Icon }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => update('iconKey', value)}
                          className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-[11px] font-medium transition ${
                            form.iconKey === value
                              ? 'border-[#0b3b8b] bg-[#0b3b8b]/5 text-[#0b3b8b]'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">Ordre d’affichage</label>
                    <input
                      type="number"
                      value={form.displayOrder}
                      onChange={(e) => update('displayOrder', e.target.value)}
                      className={fieldClass}
                      min={0}
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => update('isActive', e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Section active (visible sur le site)
                  </label>

                  {error ? (
                    <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {error}
                    </p>
                  ) : null}

                  <div className="flex flex-col gap-2 border-t border-gray-200 pt-5">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0b3b8b] px-5 py-3 font-medium text-white transition-colors hover:bg-[#0a326f] disabled:opacity-50"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? 'Enregistrement...' : 'Créer la section'}
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/documentation')}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-5 py-3 text-gray-700 transition-colors hover:bg-gray-50"
                    >
                      <X className="h-4 w-4" />
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
