import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { X } from "lucide-react";

interface NewsletterFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingNewsletter?: any;
}

export function NewsletterForm({ isOpen, onClose, onSuccess, editingNewsletter }: NewsletterFormProps) {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [tinyMCELoaded, setTinyMCELoaded] = useState(false);

  useEffect(() => {
    if (editingNewsletter) {
      setSubject(editingNewsletter.subject || "");
      setContent(editingNewsletter.content || "");
    } else {
      setSubject("");
      setContent("");
    }
  }, [editingNewsletter, isOpen]);

  useEffect(() => {
    // Charger TinyMCE de manière dynamique
    if (isOpen && !tinyMCELoaded) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/tinymce/6.8.2/tinymce.min.js";
      script.referrerPolicy = "origin";
      script.onload = () => {
        setTinyMCELoaded(true);
        initTinyMCE();
      };
      document.head.appendChild(script);
    } else if (isOpen && tinyMCELoaded) {
      // Réinitialiser TinyMCE si déjà chargé
      setTimeout(() => initTinyMCE(), 100);
    }
  }, [isOpen, tinyMCELoaded]);

  const initTinyMCE = () => {
    if (typeof window !== "undefined" && (window as any).tinymce) {
      const tinymce = (window as any).tinymce;
      
      // Supprimer l'instance existante si elle existe
      if (tinymce.get("newsletter-content")) {
        tinymce.get("newsletter-content")?.remove();
      }

      tinymce.init({
        selector: "#newsletter-content",
        height: 500,
        menubar: true,
        plugins: [
          "advlist", "autolink", "lists", "link", "image", "charmap", "preview",
          "anchor", "searchreplace", "visualblocks", "code", "fullscreen",
          "insertdatetime", "media", "table", "help", "wordcount"
        ],
        toolbar: "undo redo | blocks | bold italic forecolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | removeformat | help",
        content_style: "body { font-family:Helvetica,Arial,sans-serif; font-size:16px }",
        setup: function (editor: any) {
          // Charger le contenu initial si on édite
          if (content) {
            editor.setContent(content);
          }
          
          editor.on("change", function () {
            editor.save(); // Synchronise instantanément avec le textarea
          });
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent, action: "draft" | "send") => {
    e.preventDefault();
    
    // Synchroniser le contenu TinyMCE avant la validation
    let tinyMCEContent = content;
    if (typeof window !== "undefined" && (window as any).tinymce) {
      const editor = (window as any).tinymce.get("newsletter-content");
      if (editor) {
        editor.save();
        tinyMCEContent = editor.getContent();
        console.log("Contenu TinyMCE récupéré:", tinyMCEContent);
      }
    }
    
    if (!subject.trim() || !tinyMCEContent.trim()) {
      toast.error("Veuillez remplir le sujet et le contenu");
      return;
    }

    setLoading(true);
    try {
      const newsletterData = {
        subject: subject.trim(),
        content: tinyMCEContent.trim(),
        status: action === "send" ? "sending" : "draft"
      };

      console.log("Données newsletter à envoyer:", newsletterData);

      let newsletterId: string | number;

      if (editingNewsletter) {
        await api.update("newsletters", editingNewsletter.id, newsletterData);
        newsletterId = editingNewsletter.id;
        toast.success("Newsletter mise à jour avec succès");
      } else {
        const result = await api.create("newsletters", newsletterData);
        // L'API retourne { id: string } ou directement l'ID
        newsletterId = (result as any).id || (result as any).id?.id;
        toast.success("Newsletter créée avec succès");
      }

      // Si l'action est d'envoyer, appeler l'endpoint d'envoi
      if (action === "send" && newsletterId) {
        console.log("Envoi de la newsletter ID:", newsletterId);
        const token = localStorage.getItem('token');
        const response = await fetch('/api/api.php?action=send_newsletter', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            id: newsletterId,
            token: token // Envoyer le token aussi dans le corps pour compatibilité
          })
        });
        
        console.log("Status HTTP:", response.status);
        const data = await response.json();
        console.log("Réponse envoi newsletter:", data);
        
        if (data.success) {
          toast.success(`Newsletter envoyée à ${data.count} abonnés !`);
        } else {
          toast.error("Erreur lors de l'envoi: " + (data.message || data.error || "Erreur inconnue"));
        }
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Erreur lors de la sauvegarde de la newsletter");
    } finally {
      setLoading(false);
    }
  };

  const handleCleanup = () => {
    // Nettoyer TinyMCE à la fermeture
    if (typeof window !== "undefined" && (window as any).tinymce) {
      const editor = (window as any).tinymce.get("newsletter-content");
      if (editor) {
        editor.remove();
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">
            {editingNewsletter ? "Modifier la newsletter" : "Rédiger une nouvelle newsletter"}
          </h2>
          <Button variant="ghost" size="sm" onClick={handleCleanup}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={(e) => handleSubmit(e, "draft")} className="p-6 space-y-6">
          <div>
            <Label htmlFor="subject">Sujet de l'email *</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: Nouveautés de Ynuka Labs - Juin 2026"
              required
            />
          </div>

          <div>
            <Label htmlFor="newsletter-content">Contenu de l'email *</Label>
            <textarea
              id="newsletter-content"
              defaultValue={content}
              className="w-full min-h-[500px] p-4 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
              required
            />
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCleanup}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="outline"
              disabled={loading}
            >
              {loading ? "Sauvegarde..." : "Enregistrer le brouillon"}
            </Button>
            <Button
              type="button"
              onClick={(e) => handleSubmit(e as any, "send")}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 text-white"
            >
              {loading ? "Envoi..." : "Enregistrer et Diffuser"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
