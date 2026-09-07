'use client';

import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  Calendar,
  User,
  FileText,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  publishedAt: string;
  featured: boolean;
  isPremium: boolean;
  premiumPrice: number | null;
  views: number;
  mainImageUrl: string | null;
  category: {
    id: string;
    title: string;
  };
  author: {
    id: string;
    name: string;
  } | null;
  status?: string;
}

export default function ArticlesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<{id: string, title: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    articleId: string | null;
    articleTitle: string;
  }>({
    isOpen: false,
    articleId: null,
    articleTitle: ''
  });

  useEffect(() => {
    fetchArticles();
    fetchCategories();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setArticles(data);
      } else {
        console.error('API returned non-array data:', data);
        setArticles([]);
      }
    } catch (error) {
      console.error('Failed to fetch articles:', error);
      setArticles([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Ensure data is an array before setting state
      if (Array.isArray(data)) {
        setCategories(data);
      } else {
        console.error('API returned non-array data:', data);
        setCategories([]);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]); // Set empty array on error
    }
  };

  const deleteArticle = async (id: string) => {
    try {
      await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      fetchArticles();
      setDeleteDialog({ isOpen: false, articleId: null, articleTitle: '' });
    } catch (error) {
      console.error('Failed to delete article:', error);
    }
  };

  const handleDeleteClick = (id: string, title: string) => {
    setDeleteDialog({
      isOpen: true,
      articleId: id,
      articleTitle: title
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.articleId) {
      deleteArticle(deleteDialog.articleId);
    }
  };

  const statuses = ['all', 'Publié', 'En révision', 'Brouillon'];

  const filteredArticles = (articles || []).filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (article.author?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || article.category.title === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const currentPageArticles = filteredArticles.slice(
    (safeCurrentPage - 1) * pageSize,
    safeCurrentPage * pageSize
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterCategory, filterStatus]);

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">Articles</h1>
              <p className="text-secondary mt-1">Gérer tous vos articles</p>
            </div>
              <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
              <Link 
                href="/articles/external"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Article externe</span>
              </Link>
              <Link 
                href="/articles/new"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvel article</span>
              </Link>
            </div>
          </div>

        {/* Filters */}
        <div className="card rounded-lg shadow-sm border p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white w-full sm:w-auto"
                >
                  <option value="all">Tous les statuts</option>
                  {statuses.filter(s => s !== 'all').map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative flex-1 sm:flex-none">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="appearance-none pl-4 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white w-full sm:w-auto"
                >
                  <option value="all">Toutes les catégories</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.title}>{category.title}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Articles Table */}
        <div className="card rounded-lg shadow-sm border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Catégorie
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Auteur
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Date
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Vues
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentPageArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4">
                      <div className="flex items-start space-x-3 sm:space-x-4">
                        <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-lg overflow-hidden">
                          {article.mainImageUrl ? (
                            <img 
                              src={article.mainImageUrl} 
                              alt={article.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`w-full h-full flex items-center justify-center ${article.mainImageUrl ? 'hidden' : ''}`}>
                            <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-primary truncate max-w-[150px] sm:max-w-xs">
                            {article.title}
                          </p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-xs">
                            /{article.slug}
                          </p>
                          {article.featured && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full mt-1">
                              À la une
                            </span>
                          )}
                          {article.isPremium && (
                            <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded-full mt-1">
                              Premium
                            </span>
                          )}
                          <div className="sm:hidden mt-1">
                            <p className="text-xs text-gray-600">{article.category.title}</p>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <span className="text-sm text-gray-600">{article.category.title}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2" />
                        {article.author?.name}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      {article.publishedAt ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(article.publishedAt).toLocaleDateString('fr-FR')}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                      <div className="flex items-center text-sm text-gray-600">
                        <Eye className="w-4 h-4 mr-2" />
                        {article.views.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <a 
                          href={`https://malakinfo.com/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-blue-600 transition-colors" 
                          title="Voir sur le site"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <Link 
                          href={`/articles/${article.id}/edit`}
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-green-600 transition-colors"
                          title="Éditer l'article"
                          aria-label={`Éditer l'article ${article.title}`}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button 
                          className="p-1.5 sm:p-2 text-gray-400 hover:text-red-600 transition-colors" 
                          title="Supprimer"
                          onClick={() => handleDeleteClick(article.id, article.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {loading && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">Chargement...</p>
            </div>
          )}

          {!loading && filteredArticles.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun article trouvé</p>
            </div>
          )}

          {!loading && filteredArticles.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 gap-4">
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{(safeCurrentPage - 1) * pageSize + 1}</span> à <span className="font-medium">{Math.min(safeCurrentPage * pageSize, filteredArticles.length)}</span> sur <span className="font-medium">{filteredArticles.length}</span> résultats
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={safeCurrentPage <= 1}
                  className="px-3 py-1 text-sm text-gray-700 card border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédent
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={safeCurrentPage >= totalPages}
                  className="px-3 py-1 text-sm text-gray-700 card border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onClose={() => setDeleteDialog({ isOpen: false, articleId: null, articleTitle: '' })}
          onConfirm={handleDeleteConfirm}
          title="Supprimer l'article"
          message={`Êtes-vous sûr de vouloir supprimer l'article "${deleteDialog.articleTitle}" ? Cette action est irréversible.`}
          confirmText="Supprimer"
          cancelText="Annuler"
          type="danger"
        />
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
