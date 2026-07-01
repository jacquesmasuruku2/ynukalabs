import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { PageShell } from "@/components/PageShell";
import { PageHeader } from "@/components/PageHeader";
import { ContentCard, ContentCardFooter } from "@/components/ContentCard";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Send, Eye, Trash2, Edit } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { NewsletterForm } from "@/components/NewsletterForm";

export const Route = createFileRoute("/admin/newsletters")({
  component: Newsletters,
});

function Newsletters() {
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<any>(null);

  useEffect(() => {
    loadNewsletters();
  }, []);

  const loadNewsletters = async () => {
    try {
      setLoading(true);
      const data = await api.list("newsletters");
      setNewsletters(data.rows || []);
    } catch (error) {
      console.error("Erreur lors du chargement des newsletters:", error);
      toast.error("Erreur lors du chargement des newsletters");
    } finally {
      setLoading(false);
    }
  };

  const filteredNewsletters = newsletters.filter((nl) =>
    nl.subject?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendNewsletter = async (id: number) => {
    try {
      toast.loading("Envoi de la newsletter en cours...");
      const response = await fetch('/api/api.php?action=send_newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ id })
      });
      const data = await response.json();
      
      if (data.success) {
        toast.success(`Newsletter envoyée avec succès à ${data.count} abonnés !`);
        loadNewsletters();
      } else {
        toast.error("Erreur lors de l'envoi de la newsletter");
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
      toast.error("Erreur lors de l'envoi de la newsletter");
    }
  };

  const handleDeleteNewsletter = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette newsletter ?")) return;
    
    try {
      await api.remove("newsletters", id);
      toast.success("Newsletter supprimée avec succès");
      loadNewsletters();
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast.error("Erreur lors de la suppression de la newsletter");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500 text-white">Envoyée</span>;
      case 'sending':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-amber-500 text-white">Envoi en cours</span>;
      case 'draft':
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-500 text-white">Brouillon</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-500 text-white">{status}</span>;
    }
  };

  return (
    <PageShell>
      <PageHeader
        title="Gestion des Newsletters"
        description="Créez, gérez et envoyez vos newsletters aux abonnés"
      />

      <ContentCard>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="flex-1 w-full sm:max-w-md">
            <Input
              placeholder="Rechercher par sujet..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Rédiger une newsletter
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sujet</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Créée le</TableHead>
                <TableHead>Envoyée le</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredNewsletters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    Aucune newsletter trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredNewsletters.map((nl) => (
                  <TableRow key={nl.id}>
                    <TableCell>
                      <div className="font-semibold">{nl.subject}</div>
                      <div className="text-sm text-slate-500 truncate max-w-md">
                        {nl.content?.substring(0, 100)}...
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(nl.status)}</TableCell>
                    <TableCell>
                      {nl.created_at ? new Date(nl.created_at).toLocaleDateString('fr-FR') + ' ' + new Date(nl.created_at).toLocaleTimeString('fr-FR') : '—'}
                    </TableCell>
                    <TableCell>
                      {nl.sent_at ? new Date(nl.sent_at).toLocaleDateString('fr-FR') + ' ' + new Date(nl.sent_at).toLocaleTimeString('fr-FR') : '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {nl.status === 'draft' ? (
                          <>
                            <Button variant="ghost" size="sm" onClick={() => setEditingNewsletter(nl)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleSendNewsletter(nl.id)}>
                              <Send className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteNewsletter(nl.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <ContentCardFooter>
          <span className="text-sm font-medium text-slate-500">
            {filteredNewsletters.length} newsletter{filteredNewsletters.length !== 1 ? "s" : ""}
          </span>
        </ContentCardFooter>
      </ContentCard>

      {/* Formulaire de création/édition avec TinyMCE */}
      <NewsletterForm
        isOpen={showCreateModal || !!editingNewsletter}
        onClose={() => {
          setShowCreateModal(false);
          setEditingNewsletter(null);
        }}
        onSuccess={loadNewsletters}
        editingNewsletter={editingNewsletter}
      />
    </PageShell>
  );
}
