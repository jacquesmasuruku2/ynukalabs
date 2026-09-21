'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Users,
  Settings,
  Power,
  Menu,
  X,
  Inbox,
  Briefcase,
  Handshake,
  Mail,
  Send,
  ExternalLink,
  ClipboardList,
  Music,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FolderKanban,
  Images,
  Activity,
  ChevronDown,
  Shield,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function providerLabel(provider?: string) {
  if (!provider) return 'Email';
  if (provider === 'google') return 'Google';
  if (provider === 'email') return 'Email / mot de passe';
  return provider;
}

function roleLabel(role?: string) {
  if (!role) return 'Administrateur';
  if (role === 'admin') return 'Administrateur';
  if (role === 'editor') return 'Éditeur';
  return role;
}

function PowerLogoutButton({
  onClick,
}: {
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Se déconnecter"
      title="Se déconnecter"
      className="group inline-flex h-10 w-10 items-center justify-center rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 active:bg-red-100 active:text-red-700"
    >
      <Power className="h-5 w-5 transition-colors group-hover:text-red-600 group-active:text-red-700" strokeWidth={2.25} />
    </button>
  );
}

function AdminUserMenu({
  user,
  session,
  onLogout,
}: {
  user: ReturnType<typeof useAuth>['user'];
  session: ReturnType<typeof useAuth>['session'];
  onLogout: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const initials = (user?.name || user?.email || 'A')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'A';

  return (
    <div className="relative" ref={menuRef}>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          className="flex max-w-[14rem] items-center gap-2.5 rounded-xl px-2 py-1.5 text-left transition-colors hover:bg-black/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 sm:max-w-xs"
          aria-expanded={isOpen}
          aria-haspopup="menu"
        >
          {user?.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="h-9 w-9 shrink-0 rounded-full object-cover ring-1 ring-black/10"
            />
          ) : (
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: 'linear-gradient(135deg, #0f2847, #2563eb)' }}
            >
              {initials}
            </span>
          )}
          <span className="hidden min-w-0 sm:block">
            <span className="block truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {user?.name || 'Administrateur'}
            </span>
            <span className="block truncate text-xs" style={{ color: 'var(--text-secondary)' }}>
              {user?.email || 'Session active'}
            </span>
          </span>
          <ChevronDown
            className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            style={{ color: 'var(--text-secondary)' }}
          />
        </button>
        <PowerLogoutButton onClick={onLogout} />
      </div>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-[min(92vw,20rem)] overflow-hidden rounded-xl border bg-white shadow-lg"
          style={{ borderColor: 'var(--sidebar-border)' }}
        >
          <div className="border-b px-4 py-3" style={{ borderColor: 'var(--sidebar-border)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
              {user?.name || 'Administrateur'}
            </p>
            <p className="mt-0.5 break-all text-xs" style={{ color: 'var(--text-secondary)' }}>
              {user?.email}
            </p>
          </div>
          <div className="space-y-2.5 px-4 py-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <p className="flex items-start gap-2">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
              <span>
                <span className="block font-medium text-[var(--text-primary)]">Rôle</span>
                {roleLabel(user?.role)}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
              <span>
                <span className="block font-medium text-[var(--text-primary)]">Connexion</span>
                {providerLabel(user?.provider)}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
              <span>
                <span className="block font-medium text-[var(--text-primary)]">Dernière connexion</span>
                {formatDateTime(user?.lastLoginAt)}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
              <span>
                <span className="block font-medium text-[var(--text-primary)]">Session ouverte</span>
                {formatDateTime(session?.createdAt)}
              </span>
            </p>
            <p className="flex items-start gap-2">
              <Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600" />
              <span>
                <span className="block font-medium text-[var(--text-primary)]">Expire le</span>
                {formatDateTime(session?.expiresAt)}
              </span>
            </p>
          </div>
          <div className="border-t p-2" style={{ borderColor: 'var(--sidebar-border)' }}>
            <Link
              href="/settings"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-black/[0.04]"
              style={{ color: 'var(--text-primary)' }}
            >
              <Settings className="h-4 w-4" />
              Paramètres du compte
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="group mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-red-50 hover:text-red-600"
              style={{ color: 'var(--text-secondary)' }}
            >
              <Power className="h-4 w-4 group-hover:text-red-600" strokeWidth={2.25} />
              Se déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user, session } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEditorToolbarActive, setIsEditorToolbarActive] = useState(false);

  useEffect(() => {
    const handleEditorToolbarVisibility = (event: Event) => {
      setIsEditorToolbarActive((event as CustomEvent<boolean>).detail);
    };

    window.addEventListener('editor-toolbar-visibility', handleEditorToolbarVisibility);
    return () => window.removeEventListener('editor-toolbar-visibility', handleEditorToolbarVisibility);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  const sidebarItems = [
    { name: 'Tableau de bord', href: '/', icon: LayoutDashboard },
    { name: 'Visiteurs du site', href: '/live-visitors', icon: Activity },
    { name: 'Articles', href: '/articles', icon: FileText },
    { name: 'Événements', href: '/events', icon: Calendar },
    { name: 'Projets', href: '/projects', icon: FolderKanban },
    { name: 'Opportunités', href: '/opportunities', icon: Briefcase },
    { name: 'Partenaires', href: '/partners', icon: Handshake },
    { name: 'Galeries', href: '/gallery-events', icon: Images },
    { name: 'Catégories', href: '/categories', icon: FolderOpen },
    { name: 'Auteurs', href: '/authors', icon: Users },
    { name: 'Équipe', href: '/team-members', icon: Users },
    { name: 'Documentation', href: '/documentation', icon: FolderOpen },
    { name: 'Médias', href: '/media', icon: Music },
    { name: 'Sponsors', href: '/sponsored', icon: Handshake },
    { name: 'Abonnement', href: '/newsletter', icon: Mail },
    { name: 'Envoyer une newsletter', href: '/newsletter/send', icon: Send },
    { name: 'Soumissions', href: '/form-submissions', icon: Inbox },
    { name: 'Offres d\'emploi', href: '/job-offers', icon: Briefcase },
    { name: 'Candidatures', href: '/job-applications', icon: ClipboardList },
    { name: 'Paramètres', href: '/settings', icon: Settings },
  ];

  return (
    <div className="admin-shell min-h-screen" style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Mobile header */}
      <div
        className={`sticky top-0 z-40 border-b px-4 py-3 shadow-sm backdrop-blur-sm transition-transform duration-200 lg:hidden ${
          isEditorToolbarActive ? '-translate-y-full' : 'translate-y-0'
        }`}
        style={{
          backgroundColor: 'var(--sidebar-bg)',
          borderColor: 'var(--sidebar-border)',
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-xl p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary)' }}
            aria-label={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="truncate text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Ynuka Labs
          </h1>
          <AdminUserMenu user={user} session={session} onLogout={handleLogout} />
        </div>
      </div>

      <div className="flex min-w-0">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[min(82vw,16rem)] transform border-r shadow-2xl transition-all duration-300 ease-in-out lg:translate-x-0 ${
            isSidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
          } ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{
            backgroundColor: 'var(--sidebar-bg)',
            borderColor: 'var(--sidebar-border)',
          }}
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div
              className={`flex items-center border-b p-4 ${isSidebarCollapsed ? 'justify-center' : 'space-x-2'} lg:p-6`}
              style={{ borderColor: 'var(--sidebar-border)' }}
            >
              <img
                src="/logo.png"
                alt="Ynuka Labs"
                className="h-10 w-10 rounded-full object-cover shadow-sm ring-1 ring-black/5"
              />
              <div className={isSidebarCollapsed ? 'hidden' : 'min-w-0'}>
                <p className="font-heading text-lg font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                  Ynuka <span style={{ color: '#ffb800' }}>Labs</span>
                </p>
                <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: 'var(--text-secondary)' }}>
                  Admin Panel
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSidebarCollapsed((collapsed) => !collapsed)}
                className={`hidden items-center justify-center rounded-lg p-2 transition-colors lg:inline-flex ${
                  isSidebarCollapsed ? '' : 'ml-auto'
                }`}
                style={{
                  backgroundColor: 'var(--primary-bg)',
                  color: 'var(--primary)',
                }}
                aria-label={isSidebarCollapsed ? 'Afficher les libellés du menu' : 'Masquer les libellés du menu'}
                title={isSidebarCollapsed ? 'Afficher les libellés' : 'Masquer les libellés'}
              >
                {isSidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-3 lg:p-4">
              <ul className="space-y-1.5">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center rounded-xl py-3 text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                          isSidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'
                        }`}
                        title={isSidebarCollapsed ? item.name : undefined}
                        style={{
                          backgroundColor: isActive ? 'var(--primary-bg)' : 'transparent',
                          color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                          boxShadow: isActive ? 'inset 0 0 0 1px rgba(37, 99, 235, 0.08)' : 'none',
                          transform: 'translateY(0)',
                        }}
                        onClick={() => setIsSidebarOpen(false)}
                      >
                        <Icon className="h-5 w-5 shrink-0" />
                        <span className={isSidebarCollapsed ? 'hidden' : 'truncate'}>{item.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Footer */}
            <div className={`border-t p-3 lg:p-4 ${isSidebarCollapsed ? 'lg:px-2' : ''}`} style={{ borderColor: 'var(--sidebar-border)' }}>
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Se déconnecter"
                title="Se déconnecter"
                className={`group flex w-full items-center rounded-xl py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                  isSidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'
                } text-[var(--text-secondary)] hover:bg-red-50 hover:text-red-600 active:bg-red-100 active:text-red-700`}
              >
                <Power className="h-5 w-5 shrink-0 transition-colors group-hover:text-red-600 group-active:text-red-700" strokeWidth={2.25} />
                <span className={isSidebarCollapsed ? 'hidden' : ''}>Se déconnecter</span>
              </button>
              <a
                href="https://ynukalabs.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-2 flex items-center rounded-xl py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  isSidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'
                }`}
                title={isSidebarCollapsed ? 'Retour au site' : undefined}
                style={{ color: 'var(--text-secondary)' }}
              >
                <ExternalLink className="h-5 w-5" />
                <span className={isSidebarCollapsed ? 'hidden' : ''}>Retour au site</span>
              </a>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className={`min-h-screen min-w-0 flex-1 transition-[margin] duration-300 ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
          <div
            className="sticky top-0 z-30 hidden items-center justify-end border-b px-4 py-2.5 backdrop-blur-sm sm:px-6 lg:flex lg:px-8"
            style={{
              backgroundColor: 'color-mix(in srgb, var(--sidebar-bg) 92%, transparent)',
              borderColor: 'var(--sidebar-border)',
            }}
          >
            <AdminUserMenu user={user} session={session} onLogout={handleLogout} />
          </div>
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
