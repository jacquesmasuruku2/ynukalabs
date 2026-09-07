'use client';

import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import WordEditor from '@/components/WordEditor';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, Upload, X, Loader2 } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  authorId: string | null;
  defaultLocale: string;
  publishedAt: string;
  featured: boolean;
  isPremium: boolean;
  premiumPrice: number | null;
  readTime: string | null;
  mainImageUrl: string | null;
  mainImageAlt: string | null;
  externalLink: string | null;
  additionalImages: string[] | null;
  additionalImageDescriptions: string[] | null;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;

  const [categories, setCategories] = useState<{ id: string; title: string }[]>([]);
  const [authors, setAuthors] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [translationLoading, setTranslationLoading] = useState(false);
  const [translationTargetLocale, setTranslationTargetLocale] = useState('en');
  const [uploadingImage, setUploadingImage] = useState(false);
  const localeOptions = ['fr', 'en', 'es', 'sw', 'ln', 'rw'];
  const [formData, setFormData] = useState<{
    title: string;
    slug: string;
    excerpt: string;
    content: string | Record<string, unknown>;
    categoryId: string;
    authorId: string;
    defaultLocale: string;
    publishedAt: string;
    featured: boolean;
    isPremium: boolean;
    premiumPrice: string;
    readTime: string;
    mainImageUrl: string;
    mainImageAlt: string;
    externalLink: string;
    additionalImages: string[];
    additionalImageDescriptions: string[];
  }>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    categoryId: '',
    authorId: '',
    defaultLocale: 'fr',
    publishedAt: '',
    featured: false,
    isPremium: false,
    premiumPrice: '',
    readTime: '',
    mainImageUrl: '',
    mainImageAlt: '',
    externalLink: '',
    additionalImages: [],
    additionalImageDescriptions: [],
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(`article-draft-${articleId}`, JSON.stringify(formData));
      setAutoSaving(true);
      setTimeout(() => setAutoSaving(false), 1000);
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData, articleId]);

  useEffect(() => {
    fetchArticle();
    fetchCategories();
    fetchAuthors();
  }, [articleId]);

  const normalizeArticleContent = (content: unknown) => {
    if (typeof content === 'string') {
      return content || '<p></p>';
    }

    if (content && typeof content === 'object') {
      return content as Record<string, unknown>;
    }

    return '<p></p>';
  };

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}`);
      const data: Article = await response.json();
      const normalizedContent = normalizeArticleContent(data.content);

      setFormData({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        content: normalizedContent,
        categoryId: data.categoryId,
        authorId: data.authorId || '',
        defaultLocale: data.defaultLocale || 'fr',
        publishedAt: data.publishedAt ? new Date(data.publishedAt).toISOString().split('T')[0] : '',
        featured: data.featured,
        isPremium: data.isPremium || false,
        premiumPrice: data.premiumPrice ? String(data.premiumPrice) : '',
        readTime: data.readTime || '',
        mainImageUrl: data.mainImageUrl || '',
        mainImageAlt: data.mainImageAlt || '',
        externalLink: data.externalLink || '',
        additionalImages: data.additionalImages || [],
        additionalImageDescriptions: data.additionalImageDescriptions || [],
      });
    } catch (error) {
      console.error('Failed to fetch article:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchAuthors = async () => {
    try {
      const response = await fetch('/api/authors');
      const data = await response.json();
      setAuthors(data);
    } catch (error) {
      console.error('Failed to fetch authors:', error);
    }
  };

  const handleImageUpload = async (file: File, isMainImage: boolean = true, index?: number) => {
    setUploadingImage(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'Images_blogs');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      if (data.success && data.url) {
        if (isMainImage) {
          setFormData({ ...formData, mainImageUrl: data.url });
        } else if (typeof index === 'number') {
          const newImages = [...formData.additionalImages];
          newImages[index] = data.url;
          setFormData({ ...formData, additionalImages: newImages });
        }
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors de l\'upload de l\'image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...formData,
        content: typeof formData.content === 'string'
          ? formData.content
          : JSON.stringify(formData.content ?? ''),
      };

      const response = await fetch(`/api/articles/${articleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        localStorage.removeItem(`article-draft-${articleId}`);
        router.push('/articles');
      } else {
        alert('Erreur lors de la modification de l\'article');
      }
    } catch (error) {
      console.error('Failed to update article:', error);
      alert('Erreur lors de la modification de l\'article');
    } finally {
      setSaving(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleGenerateTranslation = async () => {
    if (!translationTargetLocale || translationTargetLocale === formData.defaultLocale) {
      alert('Sélectionnez une langue cible différente de la langue de base.');
      return;
    }

    setTranslationLoading(true);

    try {
      const response = await fetch(getApiUrl(`/api/translate/article/${articleId}`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLocale: translationTargetLocale }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'La traduction a échoué.');
      }

      alert(data?.message || 'Traduction créée avec succès.');
    } catch (error) {
      console.error('Failed to generate translation:', error);
      alert(error instanceof Error ? error.message : 'La traduction a échoué.');
    } finally {
      setTranslationLoading(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({ ...formData, title, slug: generateSlug(title) });
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">En cours de chargement...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-primary tracking-tight">Modifier l'article</h1>
                <p className="text-secondary mt-1">Modifier et publier l'article existant</p>
              </div>
              <div className="flex items-center gap-3">
                {autoSaving && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Auto-sauvegarde</span>
                  </div>
                )}
                <button
                  onClick={() => router.push('/articles')}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.8fr)]">
            <div className="card rounded-xl shadow-sm border">
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Titre *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                    placeholder="Titre de l'article"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="url-de-l-article"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Extrait *</label>
                  <textarea
                    required
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                    placeholder="Brève description de l'article"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Contenu *</label>
                  <WordEditor
                    content={formData.content}
                    onChange={(content) => setFormData({ ...formData, content })}
                  />
                </div>
              </div>
            </div>

            <div className="card rounded-xl shadow-sm border overflow-hidden lg:sticky lg:top-4">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-semibold text-primary">Paramètres de l'article</h2>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Catégorie *</label>
                    <select
                      required
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionner une catégorie</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Langue de base</label>
                    <select
                      value={formData.defaultLocale}
                      onChange={(e) => setFormData({ ...formData, defaultLocale: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {localeOptions.map((locale) => (
                        <option key={locale} value={locale}>
                          {locale.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Auteur</label>
                    <select
                      value={formData.authorId}
                      onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionner un auteur</option>
                      {authors.map((author) => (
                        <option key={author.id} value={author.id}>
                          {author.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Créer une traduction</label>
                    <div className="flex gap-2">
                      <select
                        value={translationTargetLocale}
                        onChange={(e) => setTranslationTargetLocale(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        {localeOptions
                          .filter((locale) => locale !== formData.defaultLocale)
                          .map((locale) => (
                            <option key={locale} value={locale}>
                              {locale.toUpperCase()}
                            </option>
                          ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleGenerateTranslation}
                        disabled={translationLoading}
                        className="px-4 py-3 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        {translationLoading ? '...' : 'Traduire'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Date de publication</label>
                    <input
                      type="date"
                      value={formData.publishedAt}
                      onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Temps de lecture (minutes)</label>
                    <input
                      type="number"
                      value={formData.readTime}
                      onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Image principale</label>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <input
                        type="url"
                        value={formData.mainImageUrl}
                        onChange={(e) => setFormData({ ...formData, mainImageUrl: e.target.value })}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="https://media.malakinfo.com/Images_blogs/..."
                      />
                      <label className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                        {uploadingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        <span className="text-sm">{uploadingImage ? 'Upload...' : 'Uploader'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, true);
                          }}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>
                    {formData.mainImageUrl && (
                      <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={formData.mainImageUrl}
                          alt="Aperçu"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, mainImageUrl: '' })}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {formData.mainImageUrl && (
                      <input
                        type="text"
                        value={formData.mainImageAlt}
                        onChange={(e) => setFormData({ ...formData, mainImageAlt: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg italic text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Description de l'image"
                      />
                    )}
                    <p className="text-sm text-gray-500">
                      Collez l'URL de votre image ou uploadez-la directement vers Cloudflare R2.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Images supplémentaires (jusqu'à 4)
                  </label>
                  <p className="text-sm text-gray-500 mb-3">
                    Ajoutez jusqu'à 4 images supplémentaires pour illustrer votre article (captures d'écran, etc.).
                  </p>
                  <div className="space-y-3">
                    {formData.additionalImages.map((url, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={url}
                            onChange={(e) => {
                              const newImages = [...formData.additionalImages];
                              newImages[index] = e.target.value;
                              setFormData({ ...formData, additionalImages: newImages });
                            }}
                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder={`URL de l'image ${index + 1}`}
                          />
                          <label className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                            {uploadingImage ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Upload className="w-4 h-4" />
                            )}
                            <span className="text-sm">Upload</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const newImages = [...formData.additionalImages];
                                  newImages[index] = ''; // Clear current URL
                                  setFormData({ ...formData, additionalImages: newImages });
                                  handleImageUpload(file, false, index);
                                }
                              }}
                              className="hidden"
                              disabled={uploadingImage}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const newImages = formData.additionalImages.filter((_, i) => i !== index);
                              const descriptions = formData.additionalImageDescriptions.filter((_, i) => i !== index);
                              setFormData({ ...formData, additionalImages: newImages, additionalImageDescriptions: descriptions });
                            }}
                            className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Supprimer
                          </button>
                        </div>
                        {url && (
                          <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                            <img
                              src={url}
                              alt={`Aperçu ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <input
                          type="text"
                          value={formData.additionalImageDescriptions[index] || ''}
                          onChange={(e) => {
                            const descriptions = [...formData.additionalImageDescriptions];
                            descriptions[index] = e.target.value;
                            setFormData({ ...formData, additionalImageDescriptions: descriptions });
                          }}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg italic text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Description de l'image"
                        />
                      </div>
                    ))}
                    {formData.additionalImages.length < 4 && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, additionalImages: [...formData.additionalImages, ''] })}
                        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-colors"
                      >
                        + Ajouter une image
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Lien externe de destination</label>
                  <input
                    type="url"
                    value={formData.externalLink}
                    onChange={(e) => setFormData({ ...formData, externalLink: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="https://www.example.com"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Si ce champ est rempli, les visiteurs seront redirigés vers cette URL au clic sur l'article.
                  </p>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                    Article à la une
                  </label>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isPremium"
                    checked={formData.isPremium}
                    onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                  />
                  <label htmlFor="isPremium" className="text-sm font-medium text-gray-700">
                    Article premium (réservé aux abonnés)
                  </label>
                </div>

                {formData.isPremium && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Prix de l'article ($)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.premiumPrice}
                      onChange={(e) => setFormData({ ...formData, premiumPrice: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="1.90"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Laissez vide pour utiliser le prix par défaut (1.90$)
                    </p>
                  </div>
                )}
              </div>
            </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-6">
              <button
                type="button"
                onClick={() => router.push('/articles')}
                className="px-6 py-3 text-sm font-medium text-gray-700 card border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Enregistrement...' : 'Mettre à jour'}</span>
              </button>
            </div>
          </form>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
