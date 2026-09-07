'use client';

import AdminLayout from '@/components/AdminLayout';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User,
  Mail,
  FileText,
  Calendar
} from 'lucide-react';

interface Author {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  role: string | null;
  email: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  _count?: {
    articles: number;
  };
  createdAt: string;
}

export default function AuthorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      console.log('Fetching authors from API...');
      const response = await fetch('/api/authors');
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Authors data received:', data);
      setAuthors(data);
    } catch (error) {
      console.error('Failed to fetch authors:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteAuthor = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet auteur ?')) return;
    
    try {
      await fetch(`/api/authors/${id}`, { method: 'DELETE' });
      fetchAuthors();
    } catch (error) {
      console.error('Failed to delete author:', error);
    }
  };

  const filteredAuthors = authors.filter(author =>
    author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (author.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (author.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Auteurs</h1>
            <p className="text-secondary mt-1">Gérer les auteurs et rédacteurs</p>
          </div>
          <Link 
            href="/authors/new"
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvel auteur</span>
          </Link>
        </div>

        {/* Search */}
        <div className="card rounded-lg shadow-sm border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un auteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {/* Authors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAuthors.map((author) => (
            <div key={author.id} className="card rounded-lg shadow-sm border overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-600/10 flex items-center justify-center ring-1 ring-gray-200">
                      {author.imageUrl ? (
                        <img
                          src={author.imageUrl}
                          alt={author.name}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.style.display = 'none';
                            const fallback = target.nextElementSibling as HTMLElement | null;
                            if (fallback) fallback.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div
                        className={`h-full w-full items-center justify-center ${author.imageUrl ? 'hidden' : 'flex'}`}
                      >
                        <User className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{author.name}</h3>
                      <p className="text-xs text-gray-500">/{author.slug}</p>
                      <p className="text-sm text-blue-600 mt-1">{author.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Link 
                      href={`/authors/${author.id}/edit`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors" 
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                    <button 
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors" 
                      title="Supprimer"
                      onClick={() => deleteAuthor(author.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{author.bio}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="w-4 h-4 mr-2" />
                    <span className="truncate">{author.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FileText className="w-4 h-4 mr-2" />
                    <span>{author._count?.articles || 0} articles</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Membre depuis {new Date(author.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12 card rounded-lg shadow-sm border">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" />
            <p className="text-gray-500">Chargement...</p>
          </div>
        )}

        {!loading && filteredAuthors.length === 0 && (
          <div className="text-center py-12 card rounded-lg shadow-sm border">
            <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucun auteur trouvé</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
