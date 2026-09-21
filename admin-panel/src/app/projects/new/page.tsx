'use client';

import AdminLayout from '@/components/AdminLayout';
import WordEditor from '@/components/WordEditor';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Save, X } from 'lucide-react';

const slugify = (v: string) =>
  v
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

type CategoryOption = { id: string; title: string };

const FALLBACK_PROJECT_CATEGORIES: CategoryOption[] = [
  { id: 'fallback-education', title: 'Education' },
  { id: 'fallback-environnement', title: 'Environnement' },
  { id: 'fallback-blockchain', title: 'Blockchain' },
];

function mergeCategoryOptions(fromApi: CategoryOption[]): CategoryOption[] {
  const byTitle = new Map<string, CategoryOption>();
  for (const c of [...FALLBACK_PROJECT_CATEGORIES, ...fromApi]) {
    const key = c.title.trim().toLowerCase();
    if (!key) continue;
    if (!byTitle.has(key)) byTitle.set(key, c);
  }
  return Array.from(byTitle.values());
}

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [form, setForm] = useState({
    title: '',
    slug: '',
    category: '',
    description: '',
    status: 'active',
    featuredImage: '',
    repositoryUrl: '',
    liveUrl: '',
    showOnHome: false,
  });
  const update = (k: string, v: string | boolean) => setForm((c) => ({ ...c, [k]: v }));

  useEffect(() => {
    fetch('/api/categories')
      .then(async (res) => {
        const data = res.ok ? await res.json() : [];
        const list = mergeCategoryOptions(
          Array.isArray(data)
            ? data.map((c: CategoryOption) => ({ id: c.id, title: c.title }))
            : []
        );
        setCategories(list);
        setForm((c) => (c.category ? c : { ...c, category: list[0]?.title || 'Education' }));
      })
      .catch(() => {
        const list = mergeCategoryOptions([]);
        setCategories(list);
        setForm((c) => (c.category ? c : { ...c, category: list[0]?.title || 'Education' }));
      });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category.trim()) {
      alert('Choisissez une catégorie.');
      return;
    }
    setSaving(true);
    const payload = { ...form, status: form.status === 'draft' ? 'draft' : 'active' };
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setSaving(false);
    if (res.ok) router.push('/projects');
    else {
      const err = await res.json().catch(() => ({}));
      alert((err as { error?: string }).error || 'Création impossible (slug unique ?).');
    }
  };

  return (
    <AdminLayout>
      <div className="w-full max-w-none">
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-primary">Nouveau projet</h1>
              <p className="mt-1 text-secondary">Créer et publier un projet visible sur le site</p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/projects')}
              className="rounded-lg px-4 py-2 text-sm text-gray-600 transition-all hover:bg-gray-100 hover:text-gray-900"
            >
              Annuler
            </button>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-8">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] xl:gap-8">
            {/* Contenu principal */}
            <div className="card rounded-xl border shadow-sm">
              <div className="space-y-6 p-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Titre *</label>
                  <input
                    required
                    value={form.title}
                    onChange={(e) => {
                      update('title', e.target.value);
                      if (!form.slug) update('slug', slugify(e.target.value));
                    }}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 text-lg transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Titre du projet"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Slug *</label>
                  <input
                    required
                    value={form.slug}
                    onChange={(e) => update('slug', slugify(e.target.value))}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="url-du-projet"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Description</label>
                  <WordEditor content={form.description} onChange={(value) => update('description', value)} />
                </div>
              </div>
            </div>

            {/* Panneau latéral */}
            <div className="card overflow-hidden rounded-xl border shadow-sm lg:sticky lg:top-4">
              <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                <h2 className="text-lg font-semibold text-primary">Paramètres du projet</h2>
              </div>
              <div className="space-y-5 p-6">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Catégorie *</label>
                  <select
                    required
                    value={form.category}
                    onChange={(e) => update('category', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Choisir une catégorie
                    </option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.title}>
                        {category.title}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-secondary">
                    Visible sur le site public (/projects) dès que le statut est « Publié ».{' '}
                    <Link href="/categories" className="text-blue-600 hover:underline">
                      Gérer les catégories
                    </Link>
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Statut</label>
                  <select
                    value={form.status}
                    onChange={(e) => update('status', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Publié (visible sur le site)</option>
                    <option value="draft">Brouillon (masqué)</option>
                    <option value="archived">Archivé</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Image</label>
                  <input
                    value={form.featuredImage}
                    onChange={(e) => update('featuredImage', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Repo URL</label>
                  <input
                    value={form.repositoryUrl}
                    onChange={(e) => update('repositoryUrl', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://github.com/..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">Live URL</label>
                  <input
                    value={form.liveUrl}
                    onChange={(e) => update('liveUrl', e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                  />
                </div>

                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.showOnHome}
                    onChange={(e) => update('showOnHome', e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Afficher sur l’accueil
                </label>

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
                    onClick={() => router.push('/projects')}
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
