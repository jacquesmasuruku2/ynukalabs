'use client';

import Link from 'next/link';
import { FormEvent, Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    setError('');
    if (password !== confirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('/api/admin/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Une erreur est survenue.');
      setMessage(data.message);
      setPassword('');
      setConfirmation('');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f4f6] p-4">
      <section className="w-full max-w-[520px] rounded-[18px] border border-[#d9dfe6] bg-[#f8f8f8] p-6 shadow-[0_6px_26px_rgba(15,23,42,0.04)] sm:p-8">
        <h1 className="text-3xl font-black tracking-[-0.05em] text-[#111827]">Nouveau mot de passe</h1>
        <p className="mt-3 text-base leading-7 text-[#374151]">Choisissez un mot de passe d’au moins 8 caractères.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label htmlFor="password" className="block text-base font-medium text-[#111827]">Nouveau mot de passe</label>
          <input id="password" type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-[#cfd8e3] bg-white px-4 py-3 text-base text-[#111827] outline-none focus:border-[#0b3b8b] focus:ring-4 focus:ring-[#0b3b8b]/10" />
          <label htmlFor="confirmation" className="block text-base font-medium text-[#111827]">Confirmer le mot de passe</label>
          <input id="confirmation" type="password" required minLength={8} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="w-full rounded-xl border border-[#cfd8e3] bg-white px-4 py-3 text-base text-[#111827] outline-none focus:border-[#0b3b8b] focus:ring-4 focus:ring-[#0b3b8b]/10" />
          {message && <p className="text-sm font-medium text-emerald-700">{message}</p>}
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <button type="submit" disabled={loading || !token || !password || !confirmation} className="w-full rounded-xl bg-[#0b3b8b] px-5 py-3 text-lg font-bold text-white shadow-[0_10px_18px_rgba(11,59,139,0.2)] transition hover:bg-[#082a63] disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? 'Mise à jour...' : 'Définir le mot de passe'}
          </button>
        </form>

        <Link href="/login" className="mt-6 block text-center text-sm font-semibold text-[#0b3b8b] hover:underline">Retour à la connexion</Link>
      </section>
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center bg-[#f3f4f6] p-4" />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
