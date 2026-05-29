import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type TableRowActionsProps = {
  onEdit: () => void;
  onDelete: () => void;
  editLabel?: string;
  deleteLabel?: string;
};

export function TableRowActions({
  onEdit,
  onDelete,
  editLabel = "Modifier",
  deleteLabel = "Supprimer",
}: TableRowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        onClick={onEdit}
        aria-label={editLabel}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
        onClick={onDelete}
        aria-label={deleteLabel}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
