'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  FolderOpen, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  Inbox,
  Briefcase,
  Handshake,
  Mail,
  Send,
  ListVideo,
  Video,
  ExternalLink,
  ClipboardList,
  Radio,
  Music,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
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
    { name: 'Articles', href: '/articles', icon: FileText },
    { name: 'Catégories', href: '/categories', icon: FolderOpen },
    { name: 'Auteurs', href: '/authors', icon: Users },
    { name: 'Équipe', href: '/team-members', icon: Users },
    { name: 'Documentation', href: '/documentation', icon: FolderOpen },
    { name: 'Radio', href: '/radio', icon: Radio },
    { name: 'Émissions radio', href: '/radio/programs', icon: ListVideo },
    { name: 'Lives', href: '/lives', icon: Video },
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
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="rounded-xl p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            style={{ backgroundColor: 'var(--primary-bg)', color: 'var(--primary)' }}
            aria-label={isSidebarOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          >
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            Admin Panel
          </h1>
          <div className="w-10" />
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
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl shadow-sm"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className={isSidebarCollapsed ? 'hidden' : 'flex items-center'}>
                <span className="font-heading text-xl font-bold" style={{ color: 'var(--primary)' }}>
                  Malakin
                </span>
                <span className="font-heading text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                  .info
                </span>
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
                className={`flex w-full items-center rounded-xl py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 ${
                  isSidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'
                }`}
                title={isSidebarCollapsed ? 'Se déconnecter' : undefined}
                style={{ color: 'var(--text-secondary)' }}
              >
                <LogOut className="h-5 w-5" />
                <span className={isSidebarCollapsed ? 'hidden' : ''}>Se déconnecter</span>
              </button>
              <a
                href="https://malakin-info.vercel.app"
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
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
