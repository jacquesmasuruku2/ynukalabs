'use client';

import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { FileText, FolderOpen, Plus, ArrowUpRight, Trash2 } from 'lucide-react';

type ResourceItem = {
  id: string;
  title: string;
  titleFr?: string | null;
  description?: string | null;
  descriptionFr?: string | null;
  category?: string | null;
  iconKey?: string | null;
  url?: string | null;
  filePath?: string | null;
  fileType?: string | null;
  canDelete?: boolean;
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
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const loadSections = async () => {
      try {
        const response = await fetch('/api/resource-sections?admin=1');
        if (!response.ok) throw new Error('Failed to fetch sections');
        const data = await response.json();
        const normalized = Array.isArray(data) ? data : [];
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

  const deleteItem = async (item: ResourceItem) => {
    if (!window.confirm(`Supprimer la ressource « ${item.title} » ?`)) return;
    setDeletingItemId(item.id);
    setDeleteError(null);
    try {
      const response = await fetch(`/api/resource-items/${encodeURIComponent(item.id)}`, { method: 'DELETE' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Impossible de supprimer la ressource.');
      setSections((current) => current.map((section) => ({
        ...section,
        items: section.items.filter((sectionItem) => sectionItem.id !== item.id),
      })));
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Impossible de supprimer la ressource.');
    } finally {
      setDeletingItemId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-primary">Documentation</h1>
            <p className="mt-1 text-secondary">Gérer les contenus visibles sur /documentation et /resources</p>
          </div>
          <div>
            <Link href="/documentation/sections/new" className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              <Plus className="h-4 w-4" /> Nouvelle section / ressources
            </Link>
          </div>
        </div>

        {deleteError && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{deleteError}</p>}

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
                    {item.canDelete && <button type="button" onClick={() => void deleteItem(item)} disabled={deletingItemId === item.id} title="Supprimer la ressource" aria-label={`Supprimer ${item.title}`} className="rounded-md p-2 text-secondary transition hover:bg-red-50 hover:text-red-700 disabled:opacity-50 dark:hover:bg-red-950/40"><Trash2 className="h-4 w-4" /></button>}
                  </div>

                  <h2 className="text-lg font-semibold text-primary">{item.title}</h2>
                  <p className="mt-2 text-sm text-secondary">{item.description || 'Aucune description'}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {item.category && <p className="text-xs font-medium text-blue-600">{item.category}</p>}
                    {item.fileType && <span className="rounded border px-2 py-0.5 text-[11px] font-semibold text-secondary">{item.fileType.toUpperCase()}</span>}
                  </div>

                  {(item.url || item.filePath) && (
                    <a href={item.fileType ? `/api/resource-items/${encodeURIComponent(item.id)}/download` : item.url || item.filePath || undefined} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-blue-600">
                      {item.fileType ? 'Télécharger le fichier' : 'Ouvrir le lien'} <ArrowUpRight className="h-4 w-4" />
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
