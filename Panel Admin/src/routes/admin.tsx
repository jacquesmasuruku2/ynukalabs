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
    <SidebarProvider defaultOpen={false}>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-16 flex items-center gap-4 border-b border-navbar/20 bg-navbar text-navbar-foreground px-6 sticky top-0 z-10 shadow-md">
            <SidebarTrigger className="text-navbar-foreground hover:bg-navbar-foreground/10 rounded-lg transition-colors" />
            
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-60">Dashboard</span>
              <span className="text-sm opacity-70 truncate text-navbar-foreground/80">{path}</span>
            </div>
            
            <div className="flex items-center gap-3 ml-auto">
              <AdminUserMenu />
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
