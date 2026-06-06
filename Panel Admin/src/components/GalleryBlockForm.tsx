import { useEffect, useState, useRef } from "react";
import { Plus, RefreshCcw, Upload, X, Image as ImageIcon, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContentCard, ContentCardFooter } from "@/components/ContentCard";
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
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/PageHeader";
import { PageShell } from "@/components/PageShell";
import { PageSearch, PageToolbar } from "@/components/PageToolbar";
import { TableRowActions } from "@/components/TableRowActions";
import { FormField } from "@/components/ui/form-field";
import { FormSection } from "@/components/FormSection";
import { toast } from "sonner";
import { api } from "@/lib/api";

const MAX_IMAGES_PER_BLOCK = 6;

interface GalleryBlock {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  drive_url: string | null;
  position: number;
  created_at: string;
}

interface GalleryImage {
  id: string;
  block_id: string;
  image_url: string;
  alt: string | null;
  position: number;
}

type ImageSlot = {
  id?: string;
  image_url: string;
  alt: string;
};

const emptySlots = (): ImageSlot[] =>
  Array.from({ length: MAX_IMAGES_PER_BLOCK }, () => ({ image_url: "", alt: "" }));

export function GalleryBlockForm() {
  const [blocks, setBlocks] = useState<GalleryBlock[]>([]);
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<GalleryBlock | null>(null);
  const [creating, setCreating] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const [blocksRes, imagesRes] = await Promise.all([
        api.list("gallery_blocks", page, limit, search),
        api.list("gallery_images", 1, 500),
      ]);
      setBlocks(blocksRes.rows || []);
      setTotal(blocksRes.total || 0);
      setImages(imagesRes.rows || []);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page]);

  const imageCountForBlock = (blockId: string) =>
    images.filter((img) => String(img.block_id) === String(blockId)).length;

  const onDelete = async (block: GalleryBlock) => {
    if (!confirm(`Supprimer le bloc « ${block.title} » et toutes ses images ?`)) return;
    try {
      const blockImages = images.filter((img) => String(img.block_id) === String(block.id));
      for (const img of blockImages) {
        await api.remove("gallery_images", img.id);
      }
      await api.remove("gallery_blocks", block.id);
      toast.success("Bloc supprimé");
      loadData();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <PageShell>
      <PageHeader
        title="Galerie par événements"
        description={`${total} bloc${total > 1 ? "s" : ""} · Jusqu'à ${MAX_IMAGES_PER_BLOCK} images par événement, avec lien Drive optionnel`}
        actions={
          <PageToolbar>
            <PageSearch
              value={search}
              onChange={setSearch}
              onSubmit={() => {
                setPage(1);
                loadData();
              }}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 shrink-0 border-slate-200 bg-white shadow-sm"
              onClick={loadData}
              disabled={loading}
              aria-label="Actualiser"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button onClick={() => setCreating(true)} className="h-10 shadow-sm">
              <Plus className="h-4 w-4" />
              Nouveau bloc
            </Button>
          </PageToolbar>
        }
      />

      <ContentCard>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Événement</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Lien Drive</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && blocks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <RefreshCcw className="h-6 w-6 animate-spin opacity-50 mx-auto mb-2" />
                    Chargement…
                  </TableCell>
                </TableRow>
              )}
              {!loading && blocks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <ImageIcon className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                    <p className="text-muted-foreground font-medium">Aucun bloc galerie</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Créez un bloc pour un événement (max {MAX_IMAGES_PER_BLOCK} images)
                    </p>
                  </TableCell>
                </TableRow>
              )}
              {blocks.map((block) => (
                <TableRow key={block.id}>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{block.title}</div>
                    {block.subtitle && (
                      <div className="text-xs text-muted-foreground mt-0.5">{block.subtitle}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-primary">
                      {imageCountForBlock(block.id)} / {MAX_IMAGES_PER_BLOCK}
                    </span>
                  </TableCell>
                  <TableCell>
                    {block.drive_url ? (
                      <a
                        href={block.drive_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Drive
                      </a>
                    ) : (
                      <span className="text-muted-foreground text-sm">—</span>
                    )}
                  </TableCell>
                  <TableCell className="font-mono font-semibold text-primary">{block.position}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(block.created_at).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <TableRowActions
                      onEdit={() => setEditing(block)}
                      onDelete={() => onDelete(block)}
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
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Précédent
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          </ContentCardFooter>
        )}
      </ContentCard>

      <GalleryBlockDialog
        open={creating || !!editing}
        block={editing}
        blockImages={
          editing
            ? images
                .filter((img) => String(img.block_id) === String(editing.id))
                .sort((a, b) => a.position - b.position)
            : []
        }
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSave={async (blockData, slots) => {
          try {
            let blockId = editing?.id;
            if (editing) {
              await api.update("gallery_blocks", editing.id, blockData);
            } else {
              const res = await api.create("gallery_blocks", blockData);
              blockId = String(res.id);
            }

            if (!blockId) throw new Error("ID du bloc manquant");

            const filledSlots = slots.filter((s) => s.image_url.trim());
            if (filledSlots.length > MAX_IMAGES_PER_BLOCK) {
              toast.error(`Maximum ${MAX_IMAGES_PER_BLOCK} images par bloc`);
              return;
            }

            const existingIds = new Set(
              (editing
                ? images.filter((img) => String(img.block_id) === String(editing.id))
                : []
              ).map((img) => img.id)
            );
            const keptIds = new Set(filledSlots.filter((s) => s.id).map((s) => s.id!));

            for (const id of existingIds) {
              if (!keptIds.has(id)) {
                await api.remove("gallery_images", id);
              }
            }

            for (let i = 0; i < filledSlots.length; i++) {
              const slot = filledSlots[i];
              const payload = {
                block_id: blockId,
                image_url: slot.image_url.trim(),
                alt: slot.alt.trim() || null,
                position: i,
              };
              if (slot.id) {
                await api.update("gallery_images", slot.id, payload);
              } else {
                await api.create("gallery_images", payload);
              }
            }

            toast.success(editing ? "Bloc mis à jour" : "Bloc créé");
            setEditing(null);
            setCreating(false);
            loadData();
          } catch (e: unknown) {
            toast.error(e instanceof Error ? e.message : "Erreur");
          }
        }}
      />
    </PageShell>
  );
}

function GalleryBlockDialog({
  open,
  block,
  blockImages,
  onClose,
  onSave,
}: {
  open: boolean;
  block: GalleryBlock | null;
  blockImages: GalleryImage[];
  onClose: () => void;
  onSave: (blockData: Record<string, unknown>, slots: ImageSlot[]) => void;
}) {
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [slots, setSlots] = useState<ImageSlot[]>(emptySlots());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm({
        title: block?.title ?? "",
        subtitle: block?.subtitle ?? "",
        description: block?.description ?? "",
        drive_url: block?.drive_url ?? "",
        position: block?.position ?? 0,
      });
      const next = emptySlots();
      blockImages.slice(0, MAX_IMAGES_PER_BLOCK).forEach((img, i) => {
        next[i] = { id: img.id, image_url: img.image_url, alt: img.alt ?? "" };
      });
      setSlots(next);
    }
  }, [open, block, blockImages]);

  const filledCount = slots.filter((s) => s.image_url.trim()).length;

  const handleSave = async () => {
    if (!String(form.title ?? "").trim()) {
      toast.error("Le titre de l'événement est obligatoire");
      return;
    }
    setSaving(true);
    try {
      await onSave(form, slots);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{block ? "Modifier le bloc" : "Nouveau bloc galerie"}</DialogTitle>
        </DialogHeader>

        <div className="form-stack space-y-6">
          <FormSection
            title="Événement"
            description="Titre affiché sur le site pour décrire l'événement photographié"
          >
            <FormField label="Titre de l'événement" htmlFor="title">
              <Input
                id="title"
                placeholder="Ex : Hackathon Cardano Goma 2026"
                value={String(form.title ?? "")}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </FormField>
            <FormField label="Sous-titre" htmlFor="subtitle">
              <Input
                id="subtitle"
                placeholder="Ex : Atelier communautaire Web3"
                value={String(form.subtitle ?? "")}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
              />
            </FormField>
            <FormField label="Description" htmlFor="description">
              <Textarea
                id="description"
                placeholder="Courte description de l'événement et du contexte des photos"
                value={String(form.description ?? "")}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
              />
            </FormField>
          </FormSection>

          <FormSection
            title="Lien Google Drive"
            description="Optionnel — permet aux visiteurs de voir plus d'images que les 6 affichées"
          >
            <FormField label="URL du dossier Drive" htmlFor="drive_url">
              <Input
                id="drive_url"
                type="url"
                placeholder="https://drive.google.com/drive/folders/..."
                value={String(form.drive_url ?? "")}
                onChange={(e) => setForm({ ...form, drive_url: e.target.value })}
              />
            </FormField>
          </FormSection>

          <FormSection
            title={`Images (${filledCount} / ${MAX_IMAGES_PER_BLOCK})`}
            description="Ajoutez jusqu'à 6 images pour ce bloc"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {slots.map((slot, index) => (
                <ImageSlotField
                  key={index}
                  index={index}
                  slot={slot}
                  onChange={(updated) => {
                    const next = [...slots];
                    next[index] = updated;
                    setSlots(next);
                  }}
                  onClear={() => {
                    const next = [...slots];
                    next[index] = { image_url: "", alt: "" };
                    setSlots(next);
                  }}
                />
              ))}
            </div>
          </FormSection>

          <FormField label="Position" htmlFor="position" hint="Ordre d'affichage sur le site">
            <Input
              id="position"
              type="number"
              min="0"
              value={Number(form.position ?? 0)}
              onChange={(e) => setForm({ ...form, position: parseInt(e.target.value) || 0 })}
            />
          </FormField>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {block ? "Mettre à jour" : "Créer le bloc"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImageSlotField({
  index,
  slot,
  onChange,
  onClear,
}: {
  index: number;
  slot: ImageSlot;
  onChange: (slot: ImageSlot) => void;
  onClear: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Fichier image requis");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Max 10 Mo");
      return;
    }
    setUploading(true);
    try {
      const result = await api.uploadImage(file);
      onChange({ ...slot, image_url: result.url });
      toast.success(`Image ${index + 1} téléversée`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Erreur upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 p-3 space-y-2 bg-slate-50/50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-600">Image {index + 1}</span>
        {slot.image_url && (
          <Button type="button" variant="ghost" size="sm" className="h-7 px-2" onClick={onClear}>
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {slot.image_url ? (
        <img
          src={slot.image_url}
          alt={slot.alt || `Aperçu ${index + 1}`}
          className="w-full h-28 object-cover rounded-md border border-slate-200"
        />
      ) : (
        <div
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            setDragActive(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleUpload(file);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors ${
            dragActive ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-blue-400"
          }`}
        >
          <Upload className="h-5 w-5 mx-auto mb-1 text-slate-400" />
          <p className="text-xs text-slate-500">{uploading ? "Envoi…" : "Glisser ou cliquer"}</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
            }}
          />
        </div>
      )}

      <Input
        type="url"
        placeholder="Ou URL directe"
        value={slot.image_url}
        onChange={(e) => onChange({ ...slot, image_url: e.target.value })}
        className="text-xs h-8"
      />
    </div>
  );
}
