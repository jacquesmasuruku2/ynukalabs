import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Shield, ShieldOff, User as UserIcon } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { toast } from "sonner";
import { phpApi } from "@/lib/php-api";

export const Route = createFileRoute("/admin/roles")({
  component: RolesPage,
});

const ROLES = ["admin", "moderator", "user"] as const;
type Role = (typeof ROLES)[number];

type UserRow = {
  id: string;
  email: string | null;
  name: string | null;
  avatar_url: string | null;
  roles: Role[];
};

function RolesPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const uRes = await phpApi.list('users', { limit: 500 });
      const rRes = await phpApi.list('user_roles', { limit: 500 });
      
      const map = new Map<string, Role[]>();
      (rRes.rows ?? []).forEach((row: any) => {
        const arr = map.get(row.user_id) ?? [];
        arr.push(row.role);
        map.set(row.user_id, arr);
      });
      setUsers(
        (uRes.rows ?? []).map((x: any) => ({ ...x, roles: map.get(x.id) ?? [] })),
      );
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggle = async (userId: string, role: Role, has: boolean) => {
    setBusy(`${userId}:${role}`);
    try {
      if (has) {
        // Find the user_role record to delete (we need to search since we don't have direct ID)
        const rolesRes = await phpApi.list('user_roles');
        const roleRecord = rolesRes.rows.find(r => r.user_id === userId && r.role === role);
        if (roleRecord) {
          await phpApi.delete('user_roles', roleRecord.id);
        }
        toast.success(`Rôle "${role}" retiré`);
      } else {
        await phpApi.create('user_roles', { user_id: userId, role });
        toast.success(`Rôle "${role}" attribué`);
      }
      await load();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setBusy(null);
    }
  };

  const filtered = users.filter((u) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (u.email ?? "").toLowerCase().includes(q) ||
      (u.name ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <PageShell>
      <PageHeader
        title="Gestion des rôles"
        description="Attribuez ou retirez les rôles des utilisateurs"
        actions={
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par email ou nom…"
              className="w-72 pl-10"
            />
          </div>
        }
      />

      <Card className="panel-surface">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôles actuels</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                    Chargement…
                  </TableCell>
                </TableRow>
              )}
              {!loading && filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                    Aucun utilisateur
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        {u.avatar_url ? <AvatarImage src={u.avatar_url} /> : null}
                        <AvatarFallback>
                          {u.name?.[0]?.toUpperCase() ?? <UserIcon className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                      <div className="leading-tight">
                        <div className="text-sm font-medium">{u.name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{u.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {u.roles.length === 0 ? (
                        <span className="text-xs text-muted-foreground">Aucun</span>
                      ) : (
                        u.roles.map((r) => (
                          <Badge key={r} variant={r === "admin" ? "default" : "secondary"}>
                            {r}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex gap-1">
                      {ROLES.map((r) => {
                        const has = u.roles.includes(r);
                        return (
                          <Button
                            key={r}
                            size="sm"
                            variant={has ? "default" : "outline"}
                            disabled={busy === `${u.id}:${r}`}
                            onClick={() => toggle(u.id, r, has)}
                          >
                            {has ? (
                              <ShieldOff className="h-3.5 w-3.5 mr-1" />
                            ) : (
                              <Shield className="h-3.5 w-3.5 mr-1" />
                            )}
                            {r}
                          </Button>
                        );
                      })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </PageShell>
  );
}
