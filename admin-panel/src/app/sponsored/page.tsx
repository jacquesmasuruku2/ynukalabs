'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { Plus, Trash2, Pencil, Search, ExternalLink, ArrowLeft } from 'lucide-react';

interface ArticleOption {
  id: string;
  title: string;
  slug: string;
}

interface SponsoredArticle {
  id: string;
  title: string;
  imageUrl: string;
  targetUrl: string;
  sponsorName: string;
  categoryBadge: string;
  isActive: boolean;
  sortOrder: number;
  articleId?: string | null;
}

function SponsoredArticlesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedArticleId = searchParams.get('articleId') || '';

  const [items, setItems] = useState<SponsoredArticle[]>([]);
  const [articles, setArticles] = useState<ArticleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedArticleFilter, setSelectedArticleFilter] = useState(preselectedArticleId);
  const [form, setForm] = useState({
    title: '',
    imageUrl: '',
    targetUrl: '',
    sponsorName: '',
    categoryBadge: 'Publicité',
    articleId: preselectedArticleId,
    isActive: true,
    sortOrder: 0,
  });

  const fetchSponsors = async () => {
    try {
      const response = await fetch('/api/sponsored-articles');
      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch sponsored articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      const data = await response.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    }
  };

  useEffect(() => {
    fetchSponsors();
    fetchArticles();
  }, []);

  useEffect(() => {
    setSelectedArticleFilter(preselectedArticleId);
    setForm((current) => ({ ...current, articleId: preselectedArticleId }));
  }, [preselectedArticleId]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.sponsorName.toLowerCase().includes(search.toLowerCase());

      const matchesArticle =
        !selectedArticleFilter || item.articleId === selectedArticleFilter;

      return matchesSearch && matchesArticle;
    });
  }, [items, search, selectedArticleFilter]);

  const activeSponsorCount = useMemo(
    () => items.filter((item) => item.isActive).length,
    [items],
  );

  const articleSponsorCount = useMemo(
    () => items.filter(
      (item) => item.articleId === selectedArticleFilter && item.isActive,
    ).length,
    [items, selectedArticleFilter],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/sponsored-articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('Failed to create sponsor');
      }

      setForm({
        title: '',
        imageUrl: '',
        targetUrl: '',
        sponsorName: '',
        categoryBadge: 'Publicité',
        articleId: selectedArticleFilter,
        isActive: true,
        sortOrder: 0,
      });

      fetchSponsors();
    } catch (error) {
      console.error('Error creating sponsor:', error);
      alert('Erreur lors de la création du sponsor');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce sponsor ?')) return;

    try {
      const response = await fetch(`/api/sponsored-articles/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      fetchSponsors();
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/sponsored/${id}/edit`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-primary">Contenus sponsorisés</h1>
            <p className="text-secondary mt-1">Gérer les placements publicitaires associés aux articles</p>
          </div>
          {preselectedArticleId && (
            <button
              type="button"
              onClick={() => router.push('/sponsored')}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4" />
              Voir tout
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
          <div className="card rounded-lg shadow-sm border p-4">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
                {selectedArticleFilter
                  ? `Publicités actives pour cet article : ${articleSponsorCount}`
                  : `Total publicités actives : ${activeSponsorCount}`}
              </div>
            </div>

            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher un sponsor..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={selectedArticleFilter}
                onChange={(e) => setSelectedArticleFilter(e.target.value)}
                className="w-full md:w-72 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous les articles</option>
                {articles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </div>

            {loading ? (
              <div className="py-10 text-center text-gray-500">Chargement...</div>
            ) : filtered.length === 0 ? (
              <div className="py-10 text-center text-gray-500">Aucun sponsor trouvé</div>
            ) : (
              <div className="space-y-4">
                {filtered.map((item) => (
                  <div key={item.id} className="border rounded-lg p-3 flex gap-4 items-center">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-28 h-20 object-cover rounded-md border"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="inline-flex items-center rounded-full bg-black/70 px-2 py-1 text-[10px] text-white">
                          {item.categoryBadge || 'Publicité'}
                        </span>
                        <span className="text-xs text-gray-500">Ordre {item.sortOrder}</span>
                        {!item.isActive && <span className="text-xs text-red-500">Inactif</span>}
                      </div>
                      <h3 className="mt-2 font-semibold text-gray-900 truncate">{item.title}</h3>
                      <p className="text-xs text-gray-500">Sponsor : {item.sponsorName}</p>
                      <p className="mt-1 text-[11px] text-gray-500">
                        Article : {articles.find((article) => article.id === item.articleId)?.title || 'Non lié'}
                      </p>
                      <a
                        href={item.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                      >
                        Ouvrir le lien <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(item.id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        aria-label="Modifier"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="card rounded-lg shadow-sm border p-5 space-y-4">
            <h2 className="text-xl font-bold text-primary">Ajouter un sponsor</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
              <input
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                required
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lien du sponsor</label>
              <input
                required
                value={form.targetUrl}
                onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du sponsor</label>
              <input
                required
                value={form.sponsorName}
                onChange={(e) => setForm({ ...form, sponsorName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Badge</label>
              <input
                value={form.categoryBadge}
                onChange={(e) => setForm({ ...form, categoryBadge: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Article lié</label>
              <select
                value={form.articleId}
                onChange={(e) => setForm({ ...form, articleId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Aucun article</option>
                {articles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ordre</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  Actif
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Ajouter le sponsor
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}

export default function SponsoredArticlesPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Chargement...</div>}>
      <SponsoredArticlesPageContent />
    </Suspense>
  );
}
