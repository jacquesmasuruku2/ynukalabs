'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  FolderOpen,
  Hash
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface Category {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  color: string | null;
  icon: string | null;
  _count?: {
    articles: number;
  };
  createdAt: string;
}

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(getApiUrl('/api/categories'));
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return;
    
    try {
      await fetch(getApiUrl(`/api/categories/${id}`), { method: 'DELETE' });
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const filteredCategories = categories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Catégories</h1>
            <p className="text-secondary mt-1">Gérer les catégories d'articles</p>
          </div>
          <Link 
            href="/categories/new"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle catégorie</span>
          </Link>
        </div>

        {/* Search */}
        <div className="card rounded-lg shadow-sm border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="card rounded-lg shadow-sm border overflow-hidden">
              <div 
                className="h-2"
                style={{ backgroundColor: category.color || '#3B82F6' }}
              />
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color || '#3B82F6'}20` }}
                    >
                      <FolderOpen className="w-5 h-5" style={{ color: category.color || '#3B82F6' }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{category.title}</h3>
                      <p className="text-xs text-gray-500">/{category.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Link 
                      href={`/categories/${category.id}/edit`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors" 
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors" 
                      title="Supprimer"
                      onClick={() => deleteCategory(category.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{category.description}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <Hash className="w-4 h-4 mr-1" />
                    <span>{category._count?.articles || 0} articles</span>
                  </div>
                  <span className="text-gray-400">Créé le {new Date(category.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12 card rounded-lg shadow-sm border">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Chargement...</p>
          </div>
        )}

        {!loading && filteredCategories.length === 0 && (
          <div className="text-center py-12 card rounded-lg shadow-sm border">
            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune catégorie trouvée</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
