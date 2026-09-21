import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

type MessageReadReceiptProps = {
  readAt?: string | null;
  /** Style clair sur bulle sombre (messages utilisateur) */
  onDark?: boolean;
  className?: string;
};

/** 1 coche = envoyé, 2 coches = lu par le destinataire (style WhatsApp/Telegram). */
export function MessageReadReceipt({ readAt, onDark = false, className }: MessageReadReceiptProps) {
  const read = Boolean(readAt);
  const Icon = read ? CheckCheck : Check;

  return (
    <span
      className={cn("inline-flex items-center", className)}
      title={read ? "Lu" : "Envoyé"}
      aria-label={read ? "Message lu" : "Message envoyé"}
    >
      <Icon
        className={cn(
          "h-3.5 w-3.5",
          read
            ? onDark
              ? "text-sky-300"
              : "text-sky-500"
            : onDark
              ? "text-white/55"
              : "text-slate-400"
        )}
        strokeWidth={2.5}
      />
    </span>
  );
}
