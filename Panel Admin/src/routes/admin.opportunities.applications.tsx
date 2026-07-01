import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import * as React from "react";
import { Download, RefreshCcw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatShortDate } from "@/lib/dateUtils";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { PageSearch, PageToolbar } from "@/components/PageToolbar";
import { toast } from "sonner";
import { phpApi } from "@/lib/php-api";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/admin/opportunities/applications")({
  component: OpportunityApplicationsAdmin,
});

type Opportunity = {
  id: string;
  title: string;
  title_fr: string | null;
  category: string;
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

function OpportunityApplicationsAdmin() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [search, setSearch] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      // Fetch applications with optional opportunity filter
      const searchParams = search;
      let finalSearch = searchParams;
      if (selectedOpportunity) {
        finalSearch = searchParams 
          ? `${searchParams} AND opportunity_id = ${selectedOpportunity}`
          : `opportunity_id = ${selectedOpportunity}`;
      }

      const res = await phpApi.list("opportunity_motivation_forms", {
        page,
        limit,
        search: finalSearch,
      });
      setApplications((res.rows ?? []) as any);
      setTotal(res.total ?? 0);
    } catch (e: any) {
      toast.error(e.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const loadOpportunities = async () => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, selectedOpportunity]);

  useEffect(() => {
    loadOpportunities();
  }, []);

  const exportToExcel = () => {
    if (!applications.length) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    // Prepare data for export
    const data = applications.map((app) => {
      const opp = opportunities.find((o) => o.id === app.opportunity_id);
      return {
        ID: app.id,
        Opportunité: opp?.title || `Opportunity ${app.opportunity_id}`,
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

    // Create workbook and add data
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidatures");

    // Auto-fit columns
    const maxWidth = 50;
    const colWidths = Object.keys(data[0] || {}).map((key) => {
      const max = Math.max(
        key.length,
        Math.max(...data.map((row: any) => (row[key] || "").toString().length))
      );
      return Math.min(max + 2, maxWidth);
    });
    worksheet["!cols"] = colWidths.map((width) => ({ wch: width }));

    // Download file
    const filename = `candidatures-opportunites-${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);

    toast.success("Fichier exporté avec succès");
  };

  const getOpportunityTitle = (id: string) => {
    return opportunities.find((o) => o.id === id)?.title || `Opportunity ${id}`;
  };

  return (
    <PageShell>
      <PageHeader
        title="Candidatures aux opportunités"
        description="Gérez les candidatures soumises par les candidats"
      />

      <PageToolbar>
        <PageSearch
          placeholder="Rechercher par email, nom..."
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
        />

        <Select value={selectedOpportunity} onValueChange={setSelectedOpportunity}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Toutes les opportunités" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Toutes les opportunités</SelectItem>
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
          onClick={() => load()}
          disabled={loading}
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>

        <Button onClick={exportToExcel} disabled={loading}>
          <Download className="h-4 w-4 mr-2" />
          Exporter en XLSX
        </Button>
      </PageToolbar>

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
            {loading ? (
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

      {total > limit && (
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Affichage {(page - 1) * limit + 1} à {Math.min(page * limit, total)} sur {total}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1 || loading}
            >
              Précédent
            </Button>
            <Button
              variant="outline"
              onClick={() => setPage(page + 1)}
              disabled={page * limit >= total || loading}
            >
              Suivant
            </Button>
          </div>
        </div>
      )}
    </PageShell>
  );
}
