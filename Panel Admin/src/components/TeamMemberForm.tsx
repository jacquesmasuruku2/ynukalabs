import { useEffect, useState, useRef } from "react";
import { Plus, RefreshCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ContentCard, ContentCardFooter } from "@/components/ContentCard";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { PageSearch, PageToolbar } from "@/components/PageToolbar";
import { TableRowActions } from "@/components/TableRowActions";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface TeamMember {
  id: string;
  name: string;
  role?: string;
  email?: string;
  bio?: string;
  avatar_url?: string;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

const empty: any = {
  name: "",
  role: "",
  email: "",
  bio: "",
  avatar_url: "",
  sort_order: 0,
};

export function TeamMemberForm() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<any>(empty);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.list("team_members", page, limit, search);
      setMembers((res.rows ?? []) as any);
      setTotal(res.total ?? 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditing(m);
    setForm({
      name: m.name ?? "",
      role: m.role ?? "",
      email: m.email ?? "",
      bio: m.bio ?? "",
      avatar_url: m.avatar_url ?? "",
      sort_order: m.sort_order ?? 0,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name) {
      toast.error("Le nom est obligatoire");
      return;
    }

    try {
      const payload: any = {
        name: form.name,
        role: form.role || null,
        email: form.email || null,
        bio: form.bio || null,
        avatar_url: form.avatar_url || null,
        sort_order: parseInt(form.sort_order) || 0,
      };

      if (editing) {
        await api.update("team_members", editing.id, payload);
        toast.success("Membre mis à jour");
      } else {
        await api.create("team_members", payload);
        toast.success("Membre créé");
      }
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce membre ?")) return;
    try {
      await api.remove("team_members", id);
      toast.success("Membre supprimé");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <PageShell>
      <PageHeader
        title="Équipe"
        description={`${total} membre${total > 1 ? "s" : ""}`}
        actions={
          <PageToolbar>
            <PageSearch
              value={search}
              onChange={setSearch}
              onSubmit={() => {
                setPage(1);
                load();
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 border-slate-200 bg-white shadow-sm"
              onClick={load}
              disabled={loading}
              aria-label="Actualiser"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={openCreate} className="h-10 shadow-sm">
              <Plus className="h-4 w-4" />
              Ajouter
            </Button>
          </PageToolbar>
        }
      />

      <ContentCard>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Ordre</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="table-empty">
                    Chargement…
                  </TableCell>
                </TableRow>
              )}
              {!loading && members.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="table-empty">
                    Aucun membre
                  </TableCell>
                </TableRow>
              )}
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="max-w-[200px] truncate font-semibold">
                    {member.name}
                  </TableCell>
                  <TableCell className="text-sm">
                    {member.role || "—"}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {member.email || "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {member.sort_order || "0"}
                  </TableCell>
                  <TableCell className="text-right">
                    <TableRowActions
                      onEdit={() => openEdit(member)}
                      onDelete={() => remove(member.id)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <ContentCardFooter>
            <span className="text-sm font-medium text-slate-500">
              Page {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-slate-200 bg-white"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Précédent
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="border-slate-200 bg-white"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          </ContentCardFooter>
        )}
      </ContentCard>

      <TeamMemberDialog
        open={open}
        member={editing}
        onClose={() => {
          setEditing(null);
          setOpen(false);
        }}
        onSave={save}
        form={form}
        setForm={setForm}
      />
    </PageShell>
  );
}

function TeamMemberDialog({
  open,
  member,
  onClose,
  onSave,
  form,
  setForm,
}: {
  open: boolean;
  member: TeamMember | null;
  onClose: () => void;
  onSave: () => void;
  form: any;
  setForm: (f: any) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadImage = async (file: File) => {
    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      setForm({ ...form, avatar_url: result.url });
      toast.success("Avatar uploadé");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {member ? "Modifier le membre" : "Ajouter un membre"}
          </DialogTitle>
        </DialogHeader>
        <div className="form-stack">
          <FormField label="Nom *" htmlFor="name">
            <Input
              id="name"
              placeholder="Nom du membre"
              value={form.name || ""}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </FormField>

          <FormField label="Rôle" htmlFor="role">
            <Input
              id="role"
              placeholder="ex: Directeur, Designer, Développeur"
              value={form.role || ""}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            />
          </FormField>

          <FormField label="Email" htmlFor="email">
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={form.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </FormField>

          <FormField label="Bio" htmlFor="bio">
            <Textarea
              id="bio"
              placeholder="Bio du membre (optionnel)"
              value={form.bio || ""}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
            />
          </FormField>

          <FormField label="Avatar" htmlFor="avatar_url">
            <div className="space-y-2">
              {form.avatar_url && (
                <div className="relative group">
                  <img
                    src={form.avatar_url}
                    alt="Avatar"
                    className="h-32 w-32 rounded-lg object-cover border border-slate-200"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setForm({ ...form, avatar_url: "" })}
                  >
                    Supprimer
                  </Button>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Upload en cours…" : "Télécharger un avatar"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.currentTarget.files?.[0]) {
                    handleUploadImage(e.currentTarget.files[0]);
                  }
                }}
              />
              <Input
                placeholder="Ou URL directe"
                value={form.avatar_url || ""}
                onChange={(e) => setForm({ ...form, avatar_url: e.target.value })}
              />
            </div>
          </FormField>

          <FormField label="Ordre de tri" htmlFor="sort_order">
            <Input
              id="sort_order"
              type="number"
              placeholder="0"
              value={form.sort_order ?? ""}
              onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
            />
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onSave}>
            {member ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
