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
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-10 flex h-[3.75rem] items-center gap-4 border-b border-white/10 bg-navbar px-5 text-navbar-foreground shadow-sm md:px-6">
            <SidebarTrigger className="rounded-lg text-navbar-foreground transition-colors hover:bg-white/10" />
            
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-navbar-foreground/50 sm:inline">
                Admin
              </span>
              <span className="truncate font-mono text-sm text-navbar-foreground/85">{path}</span>
            </div>
            
            <div className="flex items-center gap-3 ml-auto">
              <AdminUserMenu />
            </div>
          </header>
          <main className="flex-1 overflow-auto bg-slate-50/90 px-5 py-7 md:px-8 md:py-8 lg:px-10 lg:py-9">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
