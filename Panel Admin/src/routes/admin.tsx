import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { AdminUserMenu } from "@/components/AdminUserMenu";
import { phpAuth } from "@/lib/php-auth";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let mounted = true;
    // Mode développement : permettre l'accès sans authentification
    const isDevMode = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (isDevMode) {
      setChecked(true);
      return;
    }

    phpAuth.getSession().then(({ session }) => {
      if (!mounted) return;
      if (!session) {
        navigate({ to: "/login" });
      } else {
        setChecked(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, [navigate]);

  if (!checked) {
    return <div className="min-h-screen grid place-items-center text-sm text-muted-foreground">Chargement…</div>;
  }

  return (
    <SidebarProvider defaultOpen>
      <div className="min-h-screen flex w-full bg-white !dark:bg-slate-950">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 flex h-[3.75rem] items-center gap-4 border-b border-sidebar-border/30 bg-sidebar text-sidebar-foreground shadow-sm backdrop-blur px-5 md:px-6">
            <SidebarTrigger className="rounded-lg text-sidebar-foreground transition-colors hover:bg-sidebar-primary/20" />
            
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/60 sm:inline">
                Admin
              </span>
              <span className="truncate font-mono text-sm text-sidebar-foreground/85">{path}</span>
            </div>
            
            <div className="flex items-center gap-3 ml-auto">
              <AdminUserMenu />
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-white !dark:bg-slate-950 px-5 py-7 md:px-8 md:py-8 lg:px-10 lg:py-9">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
