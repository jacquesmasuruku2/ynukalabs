'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { Save, X } from 'lucide-react';

interface SponsoredArticleForm {
  title: string;
  imageUrl: string;
  targetUrl: string;
  sponsorName: string;
  categoryBadge: string;
  articleId: string;
  isActive: boolean;
  sortOrder: number;
}

export default function EditSponsoredArticlePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [articles, setArticles] = useState<{ id: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<SponsoredArticleForm>({
    title: '',
    imageUrl: '',
    targetUrl: '',
    sponsorName: '',
    categoryBadge: 'Publicité',
    articleId: '',
    isActive: true,
    sortOrder: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sponsorRes, articlesRes] = await Promise.all([
          fetch(`/api/sponsored-articles/${params.id}`),
          fetch('/api/articles'),
        ]);

        if (!sponsorRes.ok) throw new Error('Sponsor not found');
        const sponsor = await sponsorRes.json();
        const articleData = await articlesRes.json();

        setArticles(Array.isArray(articleData) ? articleData : []);
        setForm({
          title: sponsor.title || '',
          imageUrl: sponsor.imageUrl || '',
          targetUrl: sponsor.targetUrl || '',
          sponsorName: sponsor.sponsorName || '',
          categoryBadge: sponsor.categoryBadge || 'Publicité',
          articleId: sponsor.articleId || '',
          isActive: sponsor.isActive ?? true,
          sortOrder: sponsor.sortOrder ?? 0,
        });
      } catch (error) {
        console.error('Failed to load sponsor:', error);
        alert('Impossible de charger ce sponsor');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/sponsored-articles/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('Update failed');
      }

      router.push('/sponsored');
    } catch (error) {
      console.error('Error updating sponsor:', error);
      alert('Erreur lors de la mise à jour du sponsor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="py-10 text-center text-gray-500">Chargement...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Modifier un sponsor</h1>
            <p className="text-secondary mt-1">Mettez à jour le contenu sponsorisé</p>
          </div>
          <button
            type="button"
            onClick={() => router.push('/sponsored')}
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
            Annuler
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card rounded-lg shadow-sm border p-6 space-y-5">
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
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </form>
      </div>
    </AdminLayout>
  );
}
