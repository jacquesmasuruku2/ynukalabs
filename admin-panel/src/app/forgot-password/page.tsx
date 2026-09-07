'use client';

import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Une erreur est survenue.');
      setMessage(data.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f3f4f6] p-4">
      <section className="w-full max-w-[520px] rounded-[18px] border border-[#d9dfe6] bg-[#f8f8f8] p-6 shadow-[0_6px_26px_rgba(15,23,42,0.04)] sm:p-8">
        <h1 className="text-3xl font-black tracking-[-0.05em] text-[#111827]">Réinitialiser le mot de passe</h1>
        <p className="mt-3 text-base leading-7 text-[#374151]">Saisissez l’adresse e-mail de votre compte admin. Nous vous enverrons un lien sécurisé.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <label htmlFor="email" className="block text-base font-medium text-[#111827]">Adresse e-mail</label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6b7280]" />
            <input id="email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-xl border border-[#cfd8e3] bg-white py-3 pl-12 pr-4 text-base text-[#111827] outline-none focus:border-[#0b3b8b] focus:ring-4 focus:ring-[#0b3b8b]/10" />
          </div>
          {message && <p className="text-sm font-medium text-emerald-700">{message}</p>}
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
          <button type="submit" disabled={loading || !email} className="w-full rounded-xl bg-[#0b3b8b] px-5 py-3 text-lg font-bold text-white shadow-[0_10px_18px_rgba(11,59,139,0.2)] transition hover:bg-[#082a63] disabled:cursor-not-allowed disabled:opacity-50">
            {loading ? 'Envoi...' : 'Envoyer le lien'}
          </button>
        </form>

        <Link href="/login" className="mt-6 block text-center text-sm font-semibold text-[#0b3b8b] hover:underline">Retour à la connexion</Link>
      </section>
    </main>
  );
}
