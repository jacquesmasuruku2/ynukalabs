'use client';

import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, GripVertical, Search, X } from 'lucide-react';

export type NewsletterArticleOption = {
  id: string;
  title: string;
  excerpt?: string | null;
  slug?: string | null;
  mainImageUrl?: string | null;
  category?: {
    title?: string | null;
    slug?: string | null;
  } | null;
};

type Props = {
  articles: NewsletterArticleOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export default function NewsletterArticleSelector({ articles, selectedIds, onChange }: Props) {
  const [query, setQuery] = useState('');

  const filteredArticles = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return articles;

    return articles.filter((article) => {
      const haystack = `${article.title} ${article.category?.title ?? ''}`.toLowerCase();
      return haystack.includes(search);
    });
  }, [articles, query]);

  const selectedArticles = useMemo(
    () => selectedIds.map((id) => articles.find((a) => a.id === id)).filter(Boolean) as NewsletterArticleOption[],
    [articles, selectedIds],
  );

  const toggleArticle = (articleId: string) => {
    if (selectedIds.includes(articleId)) {
      onChange(selectedIds.filter((id) => id !== articleId));
      return;
    }

    if (selectedIds.length >= 6) {
      return;
    }

    onChange([...selectedIds, articleId]);
  };

  const moveArticle = (fromIndex: number, direction: -1 | 1) => {
    const next = [...selectedIds];
    const target = fromIndex + direction;

    if (target < 0 || target >= next.length) return;

    const [item] = next.splice(fromIndex, 1);
    next.splice(target, 0, item);
    onChange(next);
  };

  const removeArticle = (articleId: string) => {
    onChange(selectedIds.filter((id) => id !== articleId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Layout newsletter</p>
          <p className="text-xs text-slate-500">Sélectionnez entre 1 et 6 articles</p>
        </div>
        <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
          {selectedIds.length} / 6
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <Search className="h-4 w-4 text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article..."
            className="w-full border-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {filteredArticles.map((article) => {
            const isSelected = selectedIds.includes(article.id);

            return (
              <button
                key={article.id}
                type="button"
                onClick={() => toggleArticle(article.id)}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                  isSelected ? 'border-red-600 bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                  {article.mainImageUrl ? (
                    <img src={article.mainImageUrl} alt={article.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[10px] text-slate-500">IMG</div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-red-600">
                    {article.category?.title || 'Actualités'}
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2">{article.title}</div>
                  <div className="mt-1 text-xs text-slate-500 line-clamp-2">{article.excerpt || 'Aucune description'}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900">Articles sélectionnés</p>
          <div className="text-xs text-slate-500">
            {selectedIds.length >= 1 && selectedIds.length <= 6 ? 'OK' : 'Doit être entre 1 et 6 articles'}
          </div>
        </div>

        {selectedArticles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
            Aucun article sélectionné
          </div>
        ) : (
          <div className="space-y-3">
            {selectedArticles.map((article, index) => (
              <div key={article.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-100 text-slate-500">
                  <GripVertical className="h-4 w-4" />
                </div>

                <div className="h-12 w-12 overflow-hidden rounded-md border border-slate-200 bg-slate-100">
                  {article.mainImageUrl ? (
                    <img src={article.mainImageUrl} alt={article.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[9px] text-slate-500">IMG</div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {index + 1}. {article.title}
                  </div>
                  <div className="text-xs text-slate-500">{article.category?.title || 'Actualités'}</div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveArticle(index, -1)}
                    disabled={index === 0}
                    className="rounded-md border border-slate-200 p-2 text-slate-600 disabled:opacity-30"
                    title="Monter"
                  >
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveArticle(index, 1)}
                    disabled={index === selectedArticles.length - 1}
                    className="rounded-md border border-slate-200 p-2 text-slate-600 disabled:opacity-30"
                    title="Descendre"
                  >
                    <ArrowDown className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeArticle(article.id)}
                    className="rounded-md border border-red-200 bg-red-50 p-2 text-red-600"
                    title="Retirer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
