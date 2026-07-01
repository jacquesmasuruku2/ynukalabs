import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import * as React from "react";
import { Plus, RefreshCcw, Upload, Image as ImageIcon, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatShortDate } from "@/lib/dateUtils";
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
import { phpApi } from "@/lib/php-api";
import RichTextEditor from "@/components/RichTextEditor";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/admin/opportunities")({
  component: OpportunitiesAdmin,
});

type Opportunity = {
  id: string;
  title: string;
  title_fr: string | null;
  slug: string | null;
  excerpt: string | null;
  excerpt_fr: string | null;
  content: string | null;
  content_fr: string | null;
  category: string;
  cover_url: string | null;
  published: boolean;
  created_at: string;
};

type Application = {
  id: string;
  opportunity_id: string;
  user_email: string;
  user_name: string;
  user_avatar: string | null;
  linkedin_url?: string;
  twitter_url?: string;
  portfolio_url?: string;
  message?: string;
  cv_file_url?: string;
  created_at: string;
};

const empty = {
  title: "",
  title_fr: "",
  slug: "",
  excerpt: "",
  excerpt_fr: "",
  content: "",
  content_fr: "",
  category: "General",
  cover_url: "",
  published: false,
};

function OpportunitiesAdmin() {
  const [activeTab, setActiveTab] = useState("opportunities");
  
  // Opportunities state
  const [rows, setRows] = useState<Opportunity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Opportunity | null>(null);
  const [form, setForm] = useState<any>(empty);

  // Applications state
  const [applications, setApplications] = useState<Application[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [applicationsTotal, setApplicationsTotal] = useState(0);
  const [applicationsPage, setApplicationsPage] = useState(1);
  const [applicationsLimit] = useState(50);
  const [applicationsSearch, setApplicationsSearch] = useState("");
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.list("opportunities", page, limit, search);
      setRows((res.rows ?? []) as any);
      setTotal(res.total ?? 0);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    setApplicationsLoading(true);
    try {
      const searchParams = applicationsSearch;
      let finalSearch = searchParams;
      if (selectedOpportunity && selectedOpportunity !== "all") {
        finalSearch = searchParams 
          ? `${searchParams} AND opportunity_id = ${selectedOpportunity}`
          : `opportunity_id = ${selectedOpportunity}`;
      }

      const res = await phpApi.list("opportunity_motivation_forms", {
        page: applicationsPage,
        limit: applicationsLimit,
        search: finalSearch,
      });
      setApplications((res.rows ?? []) as any);
      setApplicationsTotal(res.total ?? 0);
    } catch (e: any) {
      toast.error(e.message || "Failed to load applications");
    } finally {
      setApplicationsLoading(false);
    }
  };

  const loadOpportunitiesForFilter = async () => {
    try {
      const res = await phpApi.list("opportunities", {
        page: 1,
        limit: 1000,
      });
      setOpportunities((res.rows ?? []) as any);
    } catch (e: any) {
      toast.error(e.message || "Failed to load opportunities");
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  useEffect(() => {
    loadApplications();
  }, [applicationsPage, selectedOpportunity]);

  useEffect(() => {
    if (activeTab === "applications") {
      loadOpportunitiesForFilter();
      loadApplications();
    }
  }, [activeTab]);

  const openCreate = () => {
    setEditing(null);
    setForm(empty);
    setOpen(true);
  };

  const openEdit = (p: Opportunity) => {
    setEditing(p);
    setForm({
      title: p.title ?? "",
      title_fr: p.title_fr ?? "",
      slug: p.slug ?? "",
      excerpt: p.excerpt ?? "",
      excerpt_fr: p.excerpt_fr ?? "",
      content: p.content ?? "",
      content_fr: p.content_fr ?? "",
      category: p.category ?? "General",
      cover_url: p.cover_url ?? "",
      published: !!p.published,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title) {
      toast.error("Le titre est obligatoire");
      return;
    }

    try {
      const payload: any = {
        title: form.title,
        title_fr: form.title_fr || null,
        slug: form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        excerpt: form.excerpt || null,
        excerpt_fr: form.excerpt_fr || null,
        content: form.content || null,
        content_fr: form.content_fr || null,
        category: form.category || "General",
        cover_url: form.cover_url || null,
        published: form.published ? 1 : 0,
      };

      if (editing) {
        await api.update("opportunities", editing.id, payload);
        toast.success("Opportunité mise à jour");
      } else {
        await api.create("opportunities", payload);
        toast.success("Opportunité créée");
      }
      setOpen(false);
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer cette opportunité ?")) return;
    try {
      await api.remove("opportunities", id);
      toast.success("Opportunité supprimée");
      load();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const exportToExcel = () => {
    if (!applications.length) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    const data = applications.map((app) => {
      const opp = opportunities.find((o) => o.id === app.opportunity_id);
      return {
        ID: app.id,
        "Opportunité": opp?.title || `Opportunity ${app.opportunity_id}`,
        Email: app.user_email,
        Nom: app.user_name,
        LinkedIn: app.linkedin_url || "",
        X: app.twitter_url || "",
        Portfolio: app.portfolio_url || "",
        Message: app.message || "",
        CV: app.cv_file_url ? "Oui" : "Non",
        "Date de candidature": formatShortDate(app.created_at),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidatures");

    const maxWidth = 50;
    const colWidths = Object.keys(data[0] || {}).map((key) => {
      const max = Math.max(
        key.length,
        Math.max(...data.map((row: any) => (row[key] || "").toString().length))
      );
      return Math.min(max + 2, maxWidth);
    });
    worksheet["!cols"] = colWidths.map((width) => ({ wch: width }));

    const filename = `candidatures-opportunites-${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);

    toast.success("Fichier exporté avec succès");
  };

  const getOpportunityTitle = (id: string) => {
    return opportunities.find((o) => o.id === id)?.title || `Opportunity ${id}`;
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const applicationsTotalPages = Math.max(1, Math.ceil(applicationsTotal / applicationsLimit));

  return (
    <PageShell>
      <PageHeader
        title="Opportunités"
        description="Gérez les opportunités et les candidatures"
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="opportunities">Opportunités</TabsTrigger>
          <TabsTrigger value="applications">Candidatures</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <ContentCard>
            <div className="mb-4 flex items-center justify-between">
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
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titre</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Créé</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="table-empty">
                        Chargement…
                      </TableCell>
                    </TableRow>
                  )}
                  {!loading && rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="table-empty">
                        Aucune opportunité
                      </TableCell>
                    </TableRow>
                  )}
                  {rows.map((opportunity) => (
                    <TableRow key={opportunity.id}>
                      <TableCell className="max-w-[200px] truncate font-semibold">
                        {opportunity.title}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{opportunity.category}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{opportunity.slug}</TableCell>
                      <TableCell>
                        <Badge variant={opportunity.published ? "default" : "secondary"}>
                          {opportunity.published ? "Publié" : "Brouillon"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatShortDate(opportunity.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <TableRowActions
                          onEdit={() => openEdit(opportunity)}
                          onDelete={() => remove(opportunity.id)}
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
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <ContentCard>
            <div className="mb-4 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <PageSearch
                  placeholder="Rechercher par email, nom..."
                  value={applicationsSearch}
                  onChange={(val) => {
                    setApplicationsSearch(val);
                    setApplicationsPage(1);
                  }}
                  className="max-w-xs"
                />

                <div className="flex items-center gap-3">
                  <Select value={selectedOpportunity} onValueChange={setSelectedOpportunity}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Toutes les opportunités" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les opportunités</SelectItem>
                      {opportunities.map((opp) => (
                        <SelectItem key={opp.id} value={opp.id}>
                          {opp.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => loadApplications()}
                    disabled={applicationsLoading}
                  >
                    <RefreshCcw className="h-4 w-4" />
                  </Button>

                  <Button onClick={exportToExcel} disabled={applicationsLoading}>
                    <Download className="h-4 w-4 mr-2" />
                    Exporter en XLSX
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Opportunité</TableHead>
                    <TableHead>LinkedIn</TableHead>
                    <TableHead>X</TableHead>
                    <TableHead>Portfolio</TableHead>
                    <TableHead>CV</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applicationsLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        Chargement...
                      </TableCell>
                    </TableRow>
                  ) : applications.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                        Aucune candidature trouvée
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((app) => (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.user_email}</TableCell>
                        <TableCell>{app.user_name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getOpportunityTitle(app.opportunity_id)}</Badge>
                        </TableCell>
                        <TableCell>
                          {app.linkedin_url ? (
                            <a
                              href={app.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              Voir
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {app.twitter_url ? (
                            <a
                              href={app.twitter_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              Voir
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {app.portfolio_url ? (
                            <a
                              href={app.portfolio_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              Voir
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {app.cv_file_url ? (
                            <a
                              href={app.cv_file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              PDF
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatShortDate(app.created_at)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {applicationsTotalPages > 1 && (
              <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                  Affichage {(applicationsPage - 1) * applicationsLimit + 1} à {Math.min(applicationsPage * applicationsLimit, applicationsTotal)} sur {applicationsTotal}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setApplicationsPage(Math.max(1, applicationsPage - 1))}
                    disabled={applicationsPage === 1 || applicationsLoading}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setApplicationsPage(applicationsPage + 1)}
                    disabled={applicationsPage * applicationsLimit >= applicationsTotal || applicationsLoading}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </ContentCard>
        </TabsContent>
      </Tabs>

      <OpportunityDialog
        open={open}
        opportunity={editing}
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

function OpportunityDialog({
  open,
  opportunity,
  onClose,
  onSave,
  form,
  setForm,
}: {
  open: boolean;
  opportunity: Opportunity | null;
  onClose: () => void;
  onSave: () => void;
  form: any;
  setForm: (f: any) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleUploadImage = async (file: File) => {
    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      setForm({ ...form, cover_url: result.url });
      toast.success("Image uploadée");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleHtmlUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setForm({ ...form, content: content });
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] w-full max-w-full sm:max-w-3xl overflow-y-auto dark:bg-slate-900">
        <DialogHeader className="pb-4 border-b border-slate-200 dark:border-slate-700">
          <DialogTitle className="text-xl font-bold dark:text-white">
            {opportunity ? "Modifier l'opportunité" : "Créer une nouvelle opportunité"}
          </DialogTitle>
        </DialogHeader>
        <div className="form-stack mt-6">
          <FormField label="Titre *" htmlFor="title">
            <Input
              id="title"
              placeholder="Titre de l'opportunité"
              value={form.title || ""}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </FormField>

          <FormField label="Titre (Français)" htmlFor="title_fr">
            <Input
              id="title_fr"
              placeholder="Titre en français"
              value={form.title_fr || ""}
              onChange={(e) => setForm({ ...form, title_fr: e.target.value })}
            />
          </FormField>

          <FormField label="Slug" htmlFor="slug">
            <Input
              id="slug"
              placeholder="url-amical (auto-généré si vide)"
              value={form.slug || ""}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </FormField>

          <FormField label="Catégorie" htmlFor="category">
            <Input
              id="category"
              placeholder="Catégorie (ex: Formation, Mise à jour, Offre)"
              value={form.category || ""}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </FormField>

          <FormField label="Extrait" htmlFor="excerpt">
            <Textarea
              id="excerpt"
              placeholder="Résumé court de l'opportunité"
              value={form.excerpt || ""}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={3}
            />
          </FormField>

          <FormField label="Extrait (Français)" htmlFor="excerpt_fr">
            <Textarea
              id="excerpt_fr"
              placeholder="Résumé en français"
              value={form.excerpt_fr || ""}
              onChange={(e) => setForm({ ...form, excerpt_fr: e.target.value })}
              rows={3}
            />
          </FormField>

          <FormField label="Contenu" htmlFor="content">
            <RichTextEditor
              content={form.content || ""}
              onChange={(content) => setForm({ ...form, content: content })}
              placeholder="Contenu complet de l'opportunité"
            />
            <div className="mt-2">
              <input
                type="file"
                accept=".html,.htm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleHtmlUpload(file);
                }}
                className="text-sm text-muted-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">Ou uploader un fichier HTML</p>
            </div>
          </FormField>

          <FormField label="Contenu (Français)" htmlFor="content_fr">
            <RichTextEditor
              content={form.content_fr || ""}
              onChange={(content) => setForm({ ...form, content_fr: content })}
              placeholder="Contenu en français"
            />
          </FormField>

          <FormField label="Image de couverture" htmlFor="cover_url">
            <div className="space-y-3">
              {form.cover_url && (
                <div className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <img
                    src={form.cover_url}
                    alt="Cover"
                    className="max-h-48 w-full object-cover rounded"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={() => setForm({ ...form, cover_url: "" })}
                  >
                    Supprimer
                  </Button>
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploading ? "Upload en cours…" : "Télécharger une image"}
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
              <p className="text-xs text-muted-foreground">
                Ou entrer une URL directement
              </p>
              <Input
                placeholder="URL de l'image (optionnel)"
                value={form.cover_url || ""}
                onChange={(e) => setForm({ ...form, cover_url: e.target.value })}
              />
            </div>
          </FormField>

          <FormField label="Publié" htmlFor="published">
            <div className="flex items-center gap-3">
              <Switch
                id="published"
                checked={form.published}
                onCheckedChange={(checked) =>
                  setForm({ ...form, published: checked })
                }
              />
              <span className="text-sm">
                {form.published ? "Publié" : "Brouillon"}
              </span>
            </div>
          </FormField>
        </div>

        <DialogFooter className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={onSave} className="min-w-[120px]">
            {opportunity ? "Mettre à jour" : "Créer"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
