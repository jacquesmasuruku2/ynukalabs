import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { phpAuth } from "@/lib/php-auth";
import { useDarkMode } from "@/hooks/useDarkMode";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Moon, Sun } from "lucide-react";

type AdminUser = { name: string; email: string; avatar: string };

export function AdminUserMenu() {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [user, setUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const { session } = await phpAuth.getSession();
        if (!session || !session.user) {
          if (!cancelled) setUser(null);
          return;
        }
        if (cancelled) return;
        setUser({
          name: session.user.name || session.user.email || "Admin",
          email: session.user.email || "",
          avatar: session.user.avatar_url || "",
        });
      } catch (e) {
        if (!cancelled) setUser(null);
      }
    };

    load();
  }, []);

  const logout = async () => {
    await phpAuth.signOut();
    navigate({ to: "/login" });
  };

  const name = user?.name || "Admin";
  const email = user?.email || "";
  const avatar = user?.avatar || "";
  const initials = name
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full hover:bg-accent/40 transition-colors py-1 pl-1 pr-3 outline-none">
        <Avatar className="h-8 w-8">
          {avatar ? <AvatarImage src={avatar} alt={name} /> : null}
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {initials || <UserIcon className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
        <div className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-sm font-medium">{name}</span>
          {email ? <span className="text-xs text-muted-foreground">{email}</span> : null}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{name}</span>
            {email ? <span className="text-xs text-muted-foreground font-normal">{email}</span> : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => toggleDarkMode()}>
          {isDark ? (
            <>
              <Sun className="h-4 w-4 mr-2" />
              Mode clair
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 mr-2" />
              Mode sombre
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
