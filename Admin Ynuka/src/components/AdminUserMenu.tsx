import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { api, setToken } from "@/lib/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon } from "lucide-react";

export function AdminUserMenu() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .me()
      .then((r) => {
        if (!cancelled) setUser(r.user);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = () => {
    setToken(null);
    navigate({ to: "/login" });
  };

  const name =
    user?.name || user?.full_name || user?.username || user?.email || "Admin";
  const email = user?.email || "";
  const avatar = user?.avatar_url || user?.photo || user?.avatar || "";
  const initials = String(name)
    .split(/\s+/)
    .map((s: string) => s[0])
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
          {email ? (
            <span className="text-xs text-muted-foreground">{email}</span>
          ) : null}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{name}</span>
            {email ? (
              <span className="text-xs text-muted-foreground font-normal">
                {email}
              </span>
            ) : null}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <LogOut className="h-4 w-4 mr-2" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
