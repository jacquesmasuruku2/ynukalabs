'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, Loader2 } from 'lucide-react';

async function readResponse(response: Response) {
  const text = await response.text();
  if (!text.trim()) {
    throw new Error(`Le serveur a renvoyé une réponse vide (${response.status}). Vérifiez la migration AdminInvite et DATABASE_URL.`);
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    throw new Error(`Réponse serveur invalide (${response.status}).`);
  }
}

function Form() {
  const params = useSearchParams();
  const token = params.get('token') || '';
  const router = useRouter();
  const [invite, setInvite] = useState<{ email: string; name: string | null; invitedBy: string } | null>(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setError('Lien d’invitation invalide.'); setLoading(false); return; }
    fetch(`/api/admin/accept-invite?token=${encodeURIComponent(token)}`).then(async (res) => { const data = await readResponse(res); if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Invitation invalide'); setInvite({ email: String(data.email), name: data.name ? String(data.name) : null, invitedBy: String(data.invitedBy) }); setName(data.name ? String(data.name) : ''); }).catch((err: Error) => setError(err.message)).finally(() => setLoading(false));
  }, [token]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError('');
    if (password.length < 8 || password !== confirmPassword) { setError(password.length < 8 ? 'Le mot de passe doit contenir au moins 8 caractères.' : 'La confirmation ne correspond pas.'); return; }
    setSubmitting(true);
    try { const res = await fetch('/api/admin/accept-invite', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, name, password, confirmPassword }) }); const data = await readResponse(res); if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : 'Impossible de finaliser l’invitation.'); router.push('/'); router.refresh(); } catch (err) { setError(err instanceof Error ? err.message : 'Impossible de créer le mot de passe.'); } finally { setSubmitting(false); }
  };

  if (loading) return <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />;
  if (!invite) return <div className="space-y-4"><p className="text-red-700">{error}</p><a className="text-blue-700 underline" href="/login">Retour à la connexion</a></div>;
  return <><p className="mb-6 text-sm text-gray-600">{invite.invitedBy} vous a invité(e) en tant qu’administrateur.<br />Compte : <strong>{invite.email}</strong></p>{error && <p className="mb-4 flex gap-2 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-5 w-5" />{error}</p>}<form onSubmit={submit} className="space-y-4"><label className="block text-sm">Nom<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label><label className="block text-sm">Mot de passe (8 caractères min.)<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label><label className="block text-sm">Confirmer<input required minLength={8} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 w-full rounded border px-3 py-2" /></label><button disabled={submitting} className="rounded bg-blue-700 px-5 py-2.5 font-bold text-white disabled:opacity-50">{submitting ? 'Enregistrement...' : 'Créer mon accès'}</button></form></>;
}

export default function AcceptInvitePage() {
  return <main className="min-h-screen bg-slate-100 px-4 py-12"><section className="mx-auto max-w-md rounded bg-white p-6 shadow-sm"><h1 className="mb-2 text-2xl font-bold text-gray-900">Créer votre mot de passe</h1><Suspense fallback={<Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600" />}><Form /></Suspense></section></main>;
}