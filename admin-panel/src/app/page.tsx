'use client';

import AdminLayout from '@/components/AdminLayout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  FileText, 
  Users, 
  BarChart3,
  LayoutDashboard,
  FolderTree,
  Radio
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';

interface Stats {
  articles: number;
  authors: number;
  categories: number;
  totalViews: number;
  featuredArticles: number;
  publishedThisMonth: number;
  lives: number;
  activeLives: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(getApiUrl('/api/stats'));
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const statsConfig = [
    {
      name: 'Total Articles',
      value: stats?.articles || 0,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      name: 'Auteurs',
      value: stats?.authors || 0,
      icon: Users,
      color: 'bg-green-500',
    },
    {
      name: 'Catégories',
      value: stats?.categories || 0,
      icon: FolderTree,
      color: 'bg-purple-500',
    },
    {
      name: 'Lives',
      value: stats?.lives || 0,
      icon: Radio,
      color: 'bg-red-500',
    },
  ];

  return (
    <ProtectedRoute>
      <AdminLayout>
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Tableau de bord</h1>
            <p className="text-secondary mt-1">Vue d'ensemble de votre site</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="card rounded-lg shadow-sm border p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              ))
            ) : (
              statsConfig.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.name} className="card rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-secondary">{stat.name}</p>
                        <p className="text-2xl font-bold text-primary mt-1">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg ${stat.color} bg-opacity-10`}>
                        <Icon className="w-6 h-6" style={{ color: `var(--icon-${stat.color.replace('bg-', '')})` }} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Additional Stats */}
          {!loading && stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Articles à la une</h3>
                <p className="text-3xl font-bold text-yellow-600">{stats.featuredArticles}</p>
              </div>
              <div className="card rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Publiés ce mois</h3>
                <p className="text-3xl font-bold text-green-600">{stats.publishedThisMonth}</p>
              </div>
              <div className="card rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Lives actifs</h3>
                <p className="text-3xl font-bold text-red-600">{stats.activeLives}</p>
              </div>
              <div className="card rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-primary mb-4">Vues totales</h3>
                <p className="text-3xl font-bold text-orange-600">{stats.totalViews ? stats.totalViews.toLocaleString() : '0'}</p>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="card rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">Actions rapides</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/articles/new" className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                <FileText className="w-4 h-4 mr-2" />
                Nouvel article
              </Link>
              <Link href="/authors/new" className="flex items-center justify-center px-4 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-900 transition-colors">
                <Users className="w-4 h-4 mr-2" />
                Ajouter un auteur
              </Link>
              <Link href="/lives/new" className="flex items-center justify-center px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                <Radio className="w-4 h-4 mr-2" />
                Nouveau live
              </Link>
              <Link href="/categories/new" className="flex items-center justify-center px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Nouvelle catégorie
              </Link>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
