'use client';

import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useState } from 'react';
import { ArrowLeft, ExternalLink, RefreshCw, Save } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ExternalArticlePage() {
  const router = useRouter();
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Article metadata for saving
  const [articleData, setArticleData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    categoryId: '',
    authorId: '',
  });
  
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);

  const fetchArticle = async () => {
    if (!url.trim()) {
      setError('Veuillez entrer une URL');
      return;
    }

    setLoading(true);
    setError('');
    setContent('');

    try {
      const response = await fetch('/api/proxy-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la récupération de l\'article');
      }

      setContent(data.content);
      
      // Extract title from URL as default
      const urlParts = url.split('/').filter(Boolean);
      const defaultTitle = urlParts[urlParts.length - 1]?.replace(/-/g, ' ') || '';
      setArticleData(prev => ({
        ...prev,
        title: defaultTitle,
        slug: urlParts[urlParts.length - 1] || '',
      }));
      
      // Fetch categories and authors for the save form
      fetchCategories();
      fetchAuthors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/authors');
      const data = await response.json();
      setAuthors(data);
    } catch (err) {
      console.error('Failed to fetch authors:', err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArticle();
  };

  const handleSave = async () => {
    if (!articleData.title || !articleData.slug || !articleData.categoryId) {
      setError('Veuillez remplir le titre, le slug et la catégorie');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...articleData,
          content: JSON.stringify(content),
          publishedAt: new Date().toISOString(),
          mainImageUrl: null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Erreur lors de l\'enregistrement');
      }

      const savedArticle = await response.json();
      router.push(`/articles/${savedArticle.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/articles"
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-primary">Article Externe</h1>
                <p className="text-secondary mt-1">Afficher le contenu d'un article depuis une URL externe</p>
              </div>
            </div>
          </div>

          {/* URL Input */}
          <div className="card rounded-lg shadow-sm border p-6">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://articles.rfi.fr/fr/..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Chargement...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-4 h-4" />
                    Charger
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Article Content */}
          {content && (
            <>
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setShowSaveForm(!showSaveForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {showSaveForm ? 'Masquer le formulaire' : 'Enregistrer comme article'}
                </button>
              </div>

              {/* Save Form */}
              {showSaveForm && (
                <div className="card rounded-lg shadow-sm border p-6 mb-4">
                  <h3 className="text-lg font-semibold text-primary mb-4">Enregistrer comme article</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Titre *
                      </label>
                      <input
                        type="text"
                        value={articleData.title}
                        onChange={(e) => setArticleData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="Titre de l'article"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug *
                      </label>
                      <input
                        type="text"
                        value={articleData.slug}
                        onChange={(e) => setArticleData(prev => ({ ...prev, slug: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        placeholder="url-de-l-article"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Extrait
                      </label>
                      <textarea
                        value={articleData.excerpt}
                        onChange={(e) => setArticleData(prev => ({ ...prev, excerpt: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                        rows={3}
                        placeholder="Brève description de l'article"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catégorie *
                      </label>
                      <select
                        value={articleData.categoryId}
                        onChange={(e) => setArticleData(prev => ({ ...prev, categoryId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.title}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Auteur
                      </label>
                      <select
                        value={articleData.authorId}
                        onChange={(e) => setArticleData(prev => ({ ...prev, authorId: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="">Sélectionner un auteur</option>
                        {authors.map((author) => (
                          <option key={author.id} value={author.id}>{author.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Enregistrer
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowSaveForm(false)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="card rounded-lg shadow-sm border p-6">
                <div 
                  className="prose prose-sm sm:prose-base max-w-none"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              </div>
            </>
          )}

          {/* Loading State */}
          {loading && (
            <div className="card rounded-lg shadow-sm border p-12 text-center">
              <RefreshCw className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">Chargement de l'article...</p>
            </div>
          )}
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
