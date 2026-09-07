'use client';

import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import AdminLayout from '@/components/AdminLayout';
import { Mail, Search, Trash2, Plus, UserCircle2, Download, Upload } from 'lucide-react';

const interestOptions = [
  { value: 'actualites', label: 'Actualités' },
  { value: 'economie', label: 'Économie' },
  { value: 'culture', label: 'Culture' },
  { value: 'sport', label: 'Sport' },
  { value: 'tech', label: 'Science & Tech' },
];

export default function NewsletterSubscribersPage() {
  const [subs, setSubs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [submitting, setSubmitting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState({
    email: '',
    name: '',
    interests: ['actualites'],
  });

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/newsletter');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setSubs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setSubs([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() =>
    subs.filter((s) => {
      const haystack = [s.email, s.name, (s.interests || []).join(' ')].join(' ').toLowerCase();
      return haystack.includes(query.toLowerCase());
    }),
    [subs, query]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedSubs = filtered.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [query]);

  const normalizeImportedInterests = (input: unknown): string[] => {
    if (Array.isArray(input)) {
      return input
        .map((item) => typeof item === 'string' ? item : '')
        .map((item) => item.trim())
        .filter(Boolean)
        .flatMap((item) => item.split(/[;,|]/))
        .map((item) => item.trim().toLowerCase())
        .map((item) => {
          const match = interestOptions.find((option) => option.label.toLowerCase() === item || option.value === item);
          return match ? match.value : item;
        })
        .filter((item) => interestOptions.some((option) => option.value === item));
    }

    if (typeof input !== 'string') return [];

    return input
      .split(/[;,|]/)
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
      .map((item) => {
        const match = interestOptions.find((option) => option.label.toLowerCase() === item || option.value === item);
        return match ? match.value : item;
      })
      .filter((item) => interestOptions.some((option) => option.value === item));
  };

  const parseImportedRow = (row: Record<string, unknown>) => {
    const normalized: Record<string, string> = {};

    Object.entries(row).forEach(([key, value]) => {
      normalized[String(key).trim().toLowerCase()] = typeof value === 'string' ? value.trim() : String(value ?? '').trim();
    });

    const email =
      normalized.email ||
      normalized['adresse email'] ||
      normalized['email address'] ||
      normalized.mail ||
      normalized['e-mail'];

    const name = normalized.name || normalized.nom || normalized['full name'] || normalized['nom complet'] || '';
    const interests =
      normalizeImportedInterests(
        normalized.interests ||
        normalized['interests'] ||
        normalized['centres d’intérêt'] ||
        normalized['centres d\'interet'] ||
        normalized['preferences'] ||
        normalized['préférences'] ||
        normalized['preferences']
      );

    if (!email || !email.includes('@')) return null;

    return {
      email: email.toLowerCase(),
      name,
      interests,
    };
  };

  const handleExportExcel = () => {
    try {
      setExporting(true);

      const rows = (filtered.length > 0 ? filtered : subs).map((subscriber) => ({
        Email: subscriber.email,
        Nom: subscriber.name || '',
        Preferences: Array.isArray(subscriber.interests) ? subscriber.interests.join('; ') : '',
        Actif: subscriber.isActive ? 'Oui' : 'Non',
        'Abonné le': subscriber.subscribedAt ? new Date(subscriber.subscribedAt).toLocaleString('fr-FR') : '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Abonnes');
      XLSX.writeFile(workbook, 'abonnes-newsletter.xlsx');
      setMessage({ type: 'success', text: 'Fichier Excel exporté avec succès.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Impossible d’exporter le fichier Excel.',
      });
    } finally {
      setExporting(false);
    }
  };

  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setMessage(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) throw new Error('Le fichier Excel est vide.');

      const worksheet = workbook.Sheets[firstSheetName];
      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });
      if (!rows.length) throw new Error('Le fichier Excel ne contient aucune donnée.');

      const parsedRows = rows
        .map((row) => parseImportedRow(row))
        .filter((row): row is { email: string; name: string; interests: string[] } => row !== null);

      if (!parsedRows.length) throw new Error('Aucune adresse email valide trouvée dans le fichier Excel.');

      for (const subscriber of parsedRows) {
        const response = await fetch('/api/newsletter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: subscriber.email,
            name: subscriber.name,
            interests: subscriber.interests,
            consent: true,
          }),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors de l’import Excel.');
        }
      }

      setMessage({ type: 'success', text: `${parsedRows.length} abonné(s) importé(s) avec succès.` });
      await fetchSubscribers();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors de l’import Excel.',
      });
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const handleInterestToggle = (value: string) => {
    setForm((prev) => {
      const exists = prev.interests.includes(value);
      return {
        ...prev,
        interests: exists ? prev.interests.filter((item) => item !== value) : [...prev.interests, value],
      };
    });
  };

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          interests: form.interests,
          consent: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l’ajout de l’abonné.');
      }

      setForm({ email: '', name: '', interests: ['actualites'] });
      setMessage({ type: 'success', text: data.message || 'Abonné ajouté avec succès.' });
      await fetchSubscribers();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Erreur lors de l’ajout de l’abonné.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet abonné ?')) return;

    try {
      const response = await fetch('/api/newsletter', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Impossible de supprimer l’abonné.');
      }

      setMessage({ type: 'success', text: data.message || 'Abonné supprimé.' });
      await fetchSubscribers();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Impossible de supprimer l’abonné.',
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Abonnés newsletter</h1>
          <p className="text-secondary mt-1">Gérer les abonnés, leurs centres d’intérêt et les suppressions.</p>
        </div>

        <div className="card rounded-lg shadow-sm border p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2 text-lg font-semibold text-primary">
              <Mail className="w-5 h-5" />
              Gestion des abonnés
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-100">
                <Upload className="w-4 h-4" />
                {importing ? 'Import...' : 'Importer Excel'}
                <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportExcel} />
              </label>

              <button
                type="button"
                onClick={handleExportExcel}
                disabled={exporting}
                className="inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {exporting ? 'Export...' : 'Exporter Excel'}
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleAddSubscriber} className="card rounded-lg shadow-sm border p-5 space-y-5">
          <div className="flex items-center gap-2 text-lg font-semibold text-primary">
            <Plus className="w-5 h-5" />
            Ajouter un abonné
          </div>

          {message && (
            <div className={`rounded-md border px-3 py-2 text-sm ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="exemple@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                placeholder="Nom de l’abonné"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Centres d’intérêt</label>
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {interestOptions.map((option) => {
                const checked = form.interests.includes(option.value);
                return (
                  <label
                    key={option.value}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer transition ${checked ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleInterestToggle(option.value)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !form.email.trim()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              {submitting ? 'Ajout...' : 'Ajouter l’abonné'}
            </button>
          </div>
        </form>

        <div className="card rounded-lg shadow-sm border p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par email, nom ou centre d’intérêt..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="card rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abonné</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Préférences</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actif</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Abonné le</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {paginatedSubs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Aucun abonné trouvé</td>
                    </tr>
                  ) : (
                    paginatedSubs.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 align-top">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                              <UserCircle2 className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{s.name || '—'}</div>
                              <div className="text-sm text-gray-600">{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(s.interests) && s.interests.length > 0 ? s.interests : ['actualites']).map((interest: string) => {
                              const label = interestOptions.find((option) => option.value === interest)?.label || interest;
                              return (
                                <span key={`${s.id}-${interest}`} className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
                                  {label}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{s.isActive ? 'Oui' : 'Non'}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {s.subscribedAt ? new Date(s.subscribedAt).toLocaleString('fr-FR') : '—'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleDeleteSubscriber(s.id)}
                            className="inline-flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-sm text-red-600 hover:bg-red-100 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filtered.length > 0 && (
              <div className="flex flex-col gap-3 border-t border-gray-200 bg-gray-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{(safeCurrentPage - 1) * pageSize + 1}</span> à <span className="font-medium">{Math.min(safeCurrentPage * pageSize, filtered.length)}</span> sur <span className="font-medium">{filtered.length}</span> abonnés
                </p>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={safeCurrentPage <= 1}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Précédent
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={safeCurrentPage >= totalPages}
                    className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Suivant
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
