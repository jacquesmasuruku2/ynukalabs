'use client';

import { useState, useEffect } from 'react';
import { X, Search, ExternalLink } from 'lucide-react';

interface Article {
  id: string;
  title: string;
  slug: string;
}

interface ReadAlsoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsert: (title: string, url: string, accentColor?: string) => void;
}

export default function ReadAlsoModal({ isOpen, onClose, onInsert }: ReadAlsoModalProps) {
  const [mode, setMode] = useState<'select' | 'custom'>('select');
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [accentColor, setAccentColor] = useState('#2563eb');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && mode === 'select') {
      fetchArticles();
    }
  }, [isOpen, mode]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/articles');
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error('Failed to fetch articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInsert = () => {
    if (mode === 'select' && selectedArticle) {
      const url = `/${selectedArticle.slug}`;
      onInsert(selectedArticle.title, url, accentColor);
    } else if (mode === 'custom' && customTitle && customUrl) {
      onInsert(customTitle, customUrl, accentColor);
    }
    handleClose();
  };

  const handleClose = () => {
    setMode('select');
    setSearchQuery('');
    setSelectedArticle(null);
    setCustomTitle('');
    setCustomUrl('');
    setAccentColor('#2563eb');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Insérer un article recommandé
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex border-b border-gray-200">
          <button
            type="button"
            onClick={() => setMode('select')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              mode === 'select'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Sélectionner un article
          </button>
          <button
            type="button"
            onClick={() => setMode('custom')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              mode === 'custom'
                ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            Article personnalisé
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {mode === 'select' ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un article..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* Article List */}
              {loading ? (
                <div className="text-center py-8 text-gray-500">
                  Chargement...
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredArticles.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      Aucun article trouvé
                    </p>
                  ) : (
                    filteredArticles.map((article) => (
                      <button
                        key={article.id}
                        type="button"
                        onClick={() => setSelectedArticle(article)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedArticle?.id === article.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <p className="font-medium text-gray-900 line-clamp-2">
                          {article.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          /{article.slug}
                        </p>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Titre de l'article
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Entrez le titre..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL de l'article
                </label>
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="https://..."
                />
              </div>
            </div>
          )}

          {/* Color Selection */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Couleur d'accentuation
            </label>
            <div className="flex gap-3">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                placeholder="#2563eb"
              />
              <div className="flex gap-2">
                {['#2563eb', '#dc2626', '#16a34a', '#ca8a04', '#9333ea'].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAccentColor(color)}
                    className={`w-8 h-8 rounded border-2 ${
                      accentColor === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleInsert}
            disabled={
              (mode === 'select' && !selectedArticle) ||
              (mode === 'custom' && (!customTitle || !customUrl))
            }
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ExternalLink className="w-4 h-4" />
            Insérer
          </button>
        </div>
      </div>
    </div>
  );
}
