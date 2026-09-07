'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password, 'email');

    if (success) {
      const redirectUrl = localStorage.getItem('redirect-after-login');
      if (redirectUrl && redirectUrl !== '/login' && redirectUrl !== '/') {
        localStorage.removeItem('redirect-after-login');
        router.push(redirectUrl);
      } else {
        router.push('/');
      }
    } else {
      setError('Email ou mot de passe incorrect');
      setPassword('');
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // Google OAuth implementation would go here
      setError('Connexion Google non disponible');
      setGoogleLoading(false);
    } catch (error) {
      setError('Erreur lors de la connexion avec Google');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4">
      <div className="mx-auto max-w-md rounded-sm bg-white p-6 shadow-sm md:p-8">
        <h1 className="mb-6 border-b border-gray-300 pb-2 font-serif text-3xl font-extrabold text-gray-900">
          Connexion
        </h1>

        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="mb-8 flex items-center justify-center gap-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="flex items-center justify-center gap-2 rounded-sm border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {googleLoading ? 'Connexion...' : 'Google'}
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-sm border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
        </div>

        <div className="mb-6 flex items-center justify-center">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="px-4 text-sm font-medium text-gray-500">ou</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <div className="mx-auto max-w-sm">
          <div className="mb-4 text-left">
            <h2 className="text-lg font-bold text-gray-900">Se connecter avec un mot de passe</h2>
          </div>

          <div className="mb-4 space-y-2 text-left text-sm text-gray-700">
            <p>
              Vous n&apos;avez pas de compte ? <span className="font-medium text-[#0b3b8b] underline hover:text-[#0b3b8b]/80">Créez-en un.</span>
            </p>
            <span className="block font-bold text-[#0b3b8b] hover:text-[#0b3b8b]/80">
              Connectez-vous sans mot de passe.
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative text-left">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=" "
                className="peer w-full rounded-sm border border-gray-300 bg-white px-3 pt-5 pb-1.5 font-sans text-sm text-gray-700 placeholder:text-transparent focus:border-[#0b3b8b] focus:outline-none"
                required
                autoFocus
              />
              <label
                htmlFor="email"
                className="pointer-events-none absolute left-3 top-2.5 text-xs font-medium text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-[#0b3b8b]"
              >
                Adresse e-mail
              </label>
            </div>

            <div className="relative text-left">
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder=" "
                  className="peer w-full rounded-sm border border-gray-300 bg-white px-3 pt-5 pb-1.5 pr-11 font-sans text-sm text-gray-700 placeholder:text-transparent focus:border-[#0b3b8b] focus:outline-none"
                  required
                />
                <label
                  htmlFor="password"
                  className="pointer-events-none absolute left-3 top-2.5 text-xs font-medium text-gray-500 transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-[11px] peer-focus:text-[#0b3b8b]"
                >
                  Mot de passe
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <div className="text-right">
                <Link href="/forgot-password" className="text-xs text-[#0b3b8b] hover:text-[#0b3b8b]/80">
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            <div className="pt-1 text-left">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-md bg-[#1d4ed8] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#1e40af] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{loading ? 'Connexion...' : 'Confirmer'}</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
