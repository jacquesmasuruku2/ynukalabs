'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Check, CheckCheck, Download, FileSpreadsheet, MessageSquare, Upload, Users } from 'lucide-react';
import * as XLSX from 'xlsx';

type EventOption = { id: string; title: string };

type RegistrationRow = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  status: string;
  createdAt: string;
  conversation?: { id: string; messages?: { body: string; createdAt: string }[] } | null;
};

type Message = {
  id: string;
  senderType: string;
  senderName: string | null;
  body: string;
  createdAt: string;
  readAt?: string | null;
};

const regStatusLabel: Record<string, string> = {
  registered: 'Inscrit',
  selected: 'Sélectionné',
  rejected: 'Refusé',
  waitlisted: 'Liste d’attente',
};

const regStatusClass: Record<string, string> = {
  registered: 'bg-slate-100 text-slate-700',
  selected: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
  waitlisted: 'bg-amber-100 text-amber-800',
};

export default function EventRegistrationsPanel({ events }: { events: EventOption[] }) {
  const [eventId, setEventId] = useState(events[0]?.id || '');
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState<RegistrationRow | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/event-registrations?admin=1&eventId=${encodeURIComponent(eventId)}`);
      if (res.ok) setRows(await res.json());
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId && events[0]?.id) setEventId(events[0].id);
  }, [events, eventId]);

  useEffect(() => {
    setSelectedIds([]);
    setActive(null);
    void load();
  }, [load]);

  const openChat = async (row: RegistrationRow) => {
    setActive(row);
    const res = await fetch(`/api/event-conversations/${row.id}?admin=1`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
  };

  const toggle = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const selectAllRegistered = () => {
    const ids = rows.filter((r) => r.status === 'registered').map((r) => r.id);
    setSelectedIds(ids);
  };

  const applyStatus = async (status: 'selected' | 'rejected') => {
    if (!selectedIds.length) return;
    setBusy(true);
    try {
      await Promise.all(
        selectedIds.map((id) =>
          fetch(`/api/event-registrations/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status,
              message: notifyMessage.trim() || undefined,
            }),
          })
        )
      );
      setSelectedIds([]);
      setNotifyMessage('');
      await load();
      alert(
        status === 'selected'
          ? 'Participants sélectionnés : message + notification envoyés.'
          : 'Statut mis à jour et message envoyé.'
      );
    } finally {
      setBusy(false);
    }
  };

  const sendReply = async () => {
    if (!active || !reply.trim()) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/event-conversations/${active.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderType: 'team',
          senderName: 'Équipe Ynuka Labs',
          body: reply.trim(),
        }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setReply('');
      }
    } finally {
      setBusy(false);
    }
  };

  const exportRegistrations = () => {
    if (!rows.length) {
      alert('Aucune inscription à exporter pour cet événement.');
      return;
    }
    const eventTitle = events.find((event) => event.id === eventId)?.title || 'evenement';
    const exportRows = rows.map((row) => ({
      Nom: row.fullName,
      Email: row.email,
      Téléphone: row.phone || '',
      Statut: regStatusLabel[row.status] || row.status,
      Inscription: new Date(row.createdAt).toLocaleString('fr-FR'),
    }));
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    worksheet['!cols'] = [{ wch: 28 }, { wch: 34 }, { wch: 18 }, { wch: 18 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');
    XLSX.writeFile(workbook, `inscrits-${eventTitle.toLowerCase().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'evenement'}.xlsx`);
  };

  const normalizeHeader = (value: unknown) => String(value ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const importRegistrations = async (file: File) => {
    if (!eventId) return;
    setBusy(true);
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(firstSheet, { defval: '' });
      let added = 0;
      let duplicates = 0;
      let invalid = 0;
      for (const rawRow of rawRows) {
        const row = Object.fromEntries(Object.entries(rawRow).map(([key, value]) => [normalizeHeader(key), value]));
        const fullName = String(row.nom || row['nom complet'] || row.nomcomplet || row.name || '').trim();
        const email = String(row.email || '').trim().toLowerCase();
        if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          invalid += 1;
          continue;
        }
        const response = await fetch('/api/event-registrations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId,
            fullName,
            email,
            phone: String(row.telephone || row.phone || '').trim() || undefined,
            organization: String(row.organisation || row.organization || '').trim() || undefined,
            message: String(row.message || '').trim() || undefined,
          }),
        });
        if (!response.ok) {
          invalid += 1;
          continue;
        }
        const result = await response.json();
        if (result.alreadyRegistered) duplicates += 1;
        else added += 1;
      }
      await load();
      alert(`Import terminé : ${added} ajouté(s), ${duplicates} déjà inscrit(s), ${invalid} ligne(s) ignorée(s).`);
    } catch (error) {
      alert(error instanceof Error ? `Import impossible : ${error.message}` : 'Import impossible.');
    } finally {
      setBusy(false);
      if (importInputRef.current) importInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-slate-700">Événement</span>
          <select
            value={eventId}
            onChange={(e) => setEventId(e.target.value)}
            className="min-w-[240px] rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={selectAllRegistered}
          className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
        >
          Tout cocher (inscrits)
        </button>
        <button
          type="button"
          disabled={!selectedIds.length || busy}
          onClick={() => applyStatus('selected')}
          className="inline-flex items-center gap-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
        >
          <Check className="h-4 w-4" /> Sélectionner & notifier ({selectedIds.length})
        </button>
        <button
          type="button"
          disabled={!selectedIds.length || busy}
          onClick={() => applyStatus('rejected')}
          className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Refuser
        </button>
        <input
          ref={importInputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void importRegistrations(file);
          }}
        />
        <button
          type="button"
          disabled={busy || !eventId}
          onClick={() => importInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-md border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" /> Importer XLSX
        </button>
        <button
          type="button"
          disabled={busy || !rows.length}
          onClick={exportRegistrations}
          className="inline-flex items-center gap-2 rounded-md border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50"
        >
          <Download className="h-4 w-4" /> Exporter XLSX
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600">
        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
        Importez un fichier avec les colonnes : <strong>Nom, Email, Téléphone, Organisation, Message</strong>.
      </div>

      <textarea
        value={notifyMessage}
        onChange={(e) => setNotifyMessage(e.target.value)}
        placeholder="Message personnalisé (optionnel) envoyé aux sélectionnés…"
        rows={2}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <div className="overflow-hidden rounded-md border">
          <table className="min-w-full divide-y text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left" />
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Participant</th>
                <th className="px-3 py-2 text-left text-xs font-semibold uppercase text-slate-500">Statut</th>
                <th className="px-3 py-2 text-right text-xs font-semibold uppercase text-slate-500">Chat</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                    Chargement…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-slate-500">
                    <Users className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    Aucune inscription pour cet événement.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className={active?.id === row.id ? 'bg-blue-50' : ''}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(row.id)}
                        onChange={() => toggle(row.id)}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {row.avatarUrl ? (
                          <img src={row.avatarUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-bold">
                            {row.fullName.slice(0, 1)}
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-slate-900">{row.fullName}</p>
                          <p className="text-xs text-slate-500">{row.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${regStatusClass[row.status] || 'bg-gray-100'}`}>
                        {regStatusLabel[row.status] || row.status}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => void openChat(row)}
                        className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-slate-50"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Ouvrir
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex min-h-[22rem] flex-col rounded-md border bg-white">
          {active ? (
            <>
              <div className="border-b px-4 py-3">
                <p className="font-semibold text-slate-900">{active.fullName}</p>
                <p className="text-xs text-slate-500">{active.email}</p>
              </div>
              <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
                {messages.map((m) => {
                  const mine = m.senderType === 'team';
                  const read = Boolean(m.readAt);
                  return (
                    <div
                      key={m.id}
                      className={`rounded-md px-3 py-2 text-sm ${
                        mine
                          ? 'bg-amber-50 text-slate-800'
                          : m.senderType === 'system'
                            ? 'border bg-slate-50 text-slate-600'
                            : 'ml-auto max-w-[90%] bg-slate-800 text-white'
                      }`}
                    >
                      <p className="mb-0.5 text-[10px] font-semibold uppercase opacity-70">
                        {m.senderName || m.senderType}
                      </p>
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      <p
                        className={`mt-1 flex items-center justify-end gap-1.5 text-[10px] ${
                          mine ? 'text-slate-500' : m.senderType === 'system' ? 'text-slate-400' : 'text-white/60'
                        }`}
                      >
                        <span>
                          {new Date(m.createdAt).toLocaleString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {mine ? (
                          <span title={read ? 'Lu' : 'Envoyé'} aria-label={read ? 'Message lu' : 'Message envoyé'}>
                            {read ? (
                              <CheckCheck className="h-3.5 w-3.5 text-sky-500" strokeWidth={2.5} />
                            ) : (
                              <Check className="h-3.5 w-3.5 text-slate-400" strokeWidth={2.5} />
                            )}
                          </span>
                        ) : null}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="border-t p-3">
                <textarea
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  rows={2}
                  placeholder="Répondre au participant…"
                  className="mb-2 w-full rounded-md border px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={busy || !reply.trim()}
                  onClick={() => void sendReply()}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  Envoyer + notifier
                </button>
              </div>
            </>
          ) : (
            <p className="m-auto px-6 text-center text-sm text-slate-500">
              Sélectionnez un participant pour voir et répondre dans l’espace d’échange.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
