'use client';

import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { BookOpen, FileText, FolderOpen, Plus, Trash2, Pencil, ArrowUpRight } from 'lucide-react';

type ResourceItem = {
  id: string;
  title: string;
  titleFr?: string | null;
  description?: string | null;
  descriptionFr?: string | null;
  category?: string | null;
  iconKey?: string | null;
  url?: string | null;
};

type ResourceSection = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  items: ResourceItem[];
};

const fallbackSections: ResourceSection[] = [
  {
    id: 'starter',
    title: 'Démarrage rapide',
    slug: 'demarrage-rapide',
    description: 'Premiers outils et guides utiles pour intégrer le Web3 et les communautés.',
    items: [
      { id: '1', title: 'Onboarding', description: 'Guide de prise en main pour les nouveaux membres.', category: 'Start', iconKey: 'bookOpen' },
      { id: '2', title: 'FAQ', description: 'Réponses aux questions fréquentes et bonnes pratiques.', category: 'Support', iconKey: 'fileText' },
    ],
  },
  {
    id: 'tools',
    title: 'Outils et ressources',
    slug: 'outils-et-ressources',
    description: 'Documents, liens externes et ressources pratiques pour les projets et la communauté.',
    items: [
      { id: '3', title: 'Boîte à outils', description: 'Checklist pour lancer un projet ou un atelier communautaire.', category: 'Tools', iconKey: 'folderOpen' },
      { id: '4', title: 'Tutoriels', description: 'Guides thématiques autour du développement et du marketing.', category: 'Learning', iconKey: 'bookOpen' },
    ],
  },
];

export default function DocumentationPage() {
  const [sections, setSections] = useState<ResourceSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSections = async () => {
      try {
        const response = await fetch('/api/resource-sections');
        if (!response.ok) throw new Error('Failed to fetch sections');
        const data = await response.json();
        const normalized = Array.isArray(data) && data.length > 0 ? data : fallbackSections;
        setSections(normalized);
      } catch (error) {
        console.error('Failed to fetch documentation admin data', error);
        setSections(fallbackSections);
      } finally {
        setLoading(false);
      }
    };

    loadSections();
  }, []);

  const flatItems = useMemo(
    () => sections.flatMap((section) => section.items.map((item) => ({ ...item, sectionTitle: section.title }))),
    [sections]
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Documentation</h1>
            <p className="mt-1 text-secondary">Gérer les contenus visibles sur /documentation et /resources</p>
          </div>
          <div className="flex gap-3">
            <Link href="/documentation/sections/new" className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Nouvelle section
            </Link>
            <Link href="/documentation/items/new" className="flex items-center gap-2 rounded-md border px-4 py-2 hover:bg-gray-50">
              <BookOpen className="h-4 w-4" /> Nouvel item
            </Link>
          </div>
        </div>

        {loading ? (
          <p className="py-12 text-center text-secondary">Chargement...</p>
        ) : (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {flatItems.map((item) => (
                <article key={item.id} className="card rounded-lg border p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-md bg-blue-50 p-2 text-blue-600">
                        {item.iconKey === 'fileText' ? <FileText className="h-4 w-4" /> : <FolderOpen className="h-4 w-4" />}
                      </div>
                      <span className="text-xs font-medium uppercase tracking-wide text-secondary">{item.sectionTitle}</span>
                    </div>
                    <div className="flex gap-2 text-gray-500">
                      <Link href={`/documentation/items/${item.id}/edit`} className="hover:text-blue-600" title="Modifier"><Pencil className="h-4 w-4" /></Link>
                      <button type="button" className="hover:text-red-600" title="Supprimer"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>

                  <h2 className="text-lg font-semibold text-primary">{item.title}</h2>
                  <p className="mt-2 text-sm text-secondary">{item.description || 'Aucune description'}</p>
                  {item.category && <p className="mt-3 text-xs font-medium text-blue-600">{item.category}</p>}

                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-blue-600">
                      Ouvrir le lien <ArrowUpRight className="h-4 w-4" />
                    </a>
                  )}
                </article>
              ))}
            </div>

            {sections.length === 0 && (
              <p className="rounded border border-dashed p-8 text-center text-secondary">Aucune section de documentation n’a encore été créée.</p>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
