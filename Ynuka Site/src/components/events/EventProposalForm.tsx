import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Calendar, ExternalLink, ImagePlus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { LUMA_PUBLIC_PAGE_URL } from "@/config/luma";
import {
  ApiServiceUnavailableError,
  submitEventProposal,
} from "@/services/events/submissionsApi";
import type {
  EventProposalCategory,
  EventProposalFormat,
  EventPublicationChannel,
  EventRegistrationMode,
} from "@/services/events/submissionsTypes";

const fieldClass =
  "w-full rounded-none border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#0f2847] outline-none ring-[#ffb800] focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white";

const MAX_IMAGE_BYTES = 2.5 * 1024 * 1024;

async function compressImageToDataUrl(file: File, maxSide = 1200, quality = 0.8): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  return canvas.toDataURL("image/jpeg", quality);
}

type EventProposalFormProps = {
  onBackToAgenda: () => void;
};

/**
 * Proposition d’événement alignée sur l’affichage agenda (affiche, infos, canal site ou lien externe).
 */
export default function EventProposalForm({ onBackToAgenda }: EventProposalFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [honeypot, setHoneypot] = useState("");

  const [publicationChannel, setPublicationChannel] =
    useState<EventPublicationChannel>("ynuka_agenda");
  const [registrationMode, setRegistrationMode] = useState<EventRegistrationMode>("ynuka_modal");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [form, setForm] = useState({
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    organization: "",
    title: "",
    description: "",
    category: "Meetup" as EventProposalCategory,
    event_date: "",
    event_time: "",
    timezone: "Africa/Lubumbashi",
    format: "in_person" as EventProposalFormat,
    venue: "",
    online_link: "",
    audience: "",
    capacity: "",
    registration_url: "",
    external_event_url: "",
    partners: "",
    speakers: "",
    consent: false,
  });

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const onPickImage = (file: File | null) => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (!file) {
      setImageFile(null);
      setImagePreview(null);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast({ title: t("events.proposalImageInvalid"), variant: "destructive" });
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast({ title: t("events.proposalImageTooLarge"), variant: "destructive" });
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const locationPreview = useMemo(() => {
    if (form.format === "online") return form.online_link.trim() || t("events.formatOnline");
    if (form.format === "hybrid") {
      const parts = [form.venue.trim(), form.online_link.trim()].filter(Boolean);
      return parts.join(" · ") || t("events.formatHybrid");
    }
    return form.venue.trim() || t("events.formatInPerson");
  }, [form.format, form.venue, form.online_link, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim()) return;
    if (!form.consent) {
      toast({ title: t("events.formConsentRequired"), variant: "destructive" });
      return;
    }

    if (publicationChannel === "ynuka_agenda" && !imageFile) {
      toast({ title: t("events.proposalImageRequired"), variant: "destructive" });
      return;
    }

    if (form.format === "in_person" || form.format === "hybrid") {
      if (!form.venue.trim()) {
        toast({ title: t("events.proposalVenueRequired"), variant: "destructive" });
        return;
      }
    }
    if (form.format === "online" || form.format === "hybrid") {
      if (!form.online_link.trim()) {
        toast({ title: t("events.proposalOnlineRequired"), variant: "destructive" });
        return;
      }
    }

    if (publicationChannel === "external" && !form.external_event_url.trim()) {
      toast({ title: t("events.proposalExternalRequired"), variant: "destructive" });
      return;
    }

    if (
      publicationChannel === "ynuka_agenda" &&
      registrationMode === "external_url" &&
      !form.registration_url.trim()
    ) {
      toast({ title: t("events.proposalRegUrlRequired"), variant: "destructive" });
      return;
    }

    const capacityRaw = form.capacity.trim();
    let capacity: number | null = null;
    if (capacityRaw) {
      const n = Number(capacityRaw);
      if (!Number.isFinite(n) || n < 1) {
        toast({ title: t("events.proposalCapacityInvalid"), variant: "destructive" });
        return;
      }
      capacity = Math.floor(n);
    }

    const location_or_link = [form.venue.trim(), form.online_link.trim()].filter(Boolean).join(" | ");

    setSubmitting(true);
    setUnavailable(false);
    try {
      let image_data: string | null = null;
      let image_filename: string | null = null;
      if (imageFile) {
        image_data = await compressImageToDataUrl(imageFile);
        image_filename = imageFile.name;
      }

      await submitEventProposal({
        contact_name: form.contact_name.trim(),
        contact_email: form.contact_email.trim(),
        contact_phone: form.contact_phone.trim() || null,
        organization: form.organization.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        event_date: form.event_date,
        event_time: form.event_time.trim() || null,
        timezone: form.timezone.trim() || null,
        format: form.format,
        location_or_link,
        venue: form.venue.trim() || null,
        online_link: form.online_link.trim() || null,
        audience: form.audience.trim() || null,
        capacity,
        publication_channel: publicationChannel,
        external_event_url:
          publicationChannel === "external" ? form.external_event_url.trim() : null,
        registration_mode: publicationChannel === "ynuka_agenda" ? registrationMode : null,
        registration_url:
          publicationChannel === "ynuka_agenda" && registrationMode === "external_url"
            ? form.registration_url.trim()
            : publicationChannel === "external"
              ? form.external_event_url.trim()
              : null,
        image_url: null,
        image_data,
        image_filename,
        partners: form.partners.trim() || null,
        speakers: form.speakers.trim() || null,
        consent: true,
        website: honeypot,
      });
      setDone(true);
      toast({ title: t("events.proposalSuccess") });
    } catch (err) {
      if (err instanceof ApiServiceUnavailableError) {
        setUnavailable(true);
        toast({ title: t("events.loadError"), variant: "destructive" });
      } else {
        toast({
          title: t("events.formSubmitError"),
          description: err instanceof Error ? err.message : undefined,
          variant: "destructive",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="mx-auto max-w-xl border border-slate-200 bg-white p-6 text-center dark:border-slate-700 dark:bg-[#0c1a2e] sm:p-8">
        <h2 className="text-xl font-bold text-[#0f2847] dark:text-white">
          {t("events.proposalSuccessTitle")}
        </h2>
        <p className="mt-3 text-sm text-[#315795] dark:text-slate-400">
          {t("events.proposalSuccessDesc")}
        </p>
        <Button type="button" variant="outline-glow" className="mt-6" onClick={onBackToAgenda}>
          {t("events.backToAgenda")}
        </Button>
      </div>
    );
  }

  const showVenue = form.format === "in_person" || form.format === "hybrid";
  const showOnline = form.format === "online" || form.format === "hybrid";

  return (
    <div className="mx-auto max-w-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-[#0c1a2e] sm:p-8">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-[#0f2847] dark:text-white">{t("events.navPropose")}</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[#315795] dark:text-slate-400">
          {t("events.proposalIntro")}
        </p>
        <a
          href={LUMA_PUBLIC_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center gap-2 border border-[#0f2847]/20 bg-[#f7f8fa] px-4 py-2.5 text-sm font-bold text-[#0f2847] transition-colors hover:border-[#ffb800] hover:bg-white dark:border-slate-600 dark:bg-slate-900 dark:text-white dark:hover:border-[#ffb800]"
        >
          {t("events.proposalLumaLink")}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
        <p className="mx-auto mt-2 max-w-md text-xs font-medium text-[#315795]/90 dark:text-slate-500">
          {t("events.proposalLumaHint")}
        </p>
      </div>

      {unavailable ? (
        <div className="mb-5 border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm text-[#0f2847] dark:border-slate-600 dark:bg-slate-900 dark:text-white">
          {t("events.loadError")}
          <span className="mt-1 block text-[#315795] dark:text-slate-400">
            {t("events.formBackendPending")}
          </span>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-5 text-left">
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="absolute -left-[9999px] h-0 w-0 opacity-0"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden
        />

        {/* Canal de publication */}
        <fieldset>
          <legend className="mb-2 text-sm font-extrabold text-[#0f2847] dark:text-white">
            {t("events.proposalChannelTitle")}
          </legend>
          <p className="mb-3 text-xs font-medium text-[#315795] dark:text-slate-400">
            {t("events.proposalChannelHint")}
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {(
              [
                ["ynuka_agenda", "proposalChannelSite"],
                ["external", "proposalChannelExternal"],
              ] as const
            ).map(([id, labelKey]) => (
              <button
                key={id}
                type="button"
                onClick={() => setPublicationChannel(id)}
                className={cn(
                  "border px-3.5 py-3 text-left text-sm font-bold transition-colors",
                  publicationChannel === id
                    ? "border-[#ffb800] bg-[#ffb800] text-[#0f2847]"
                    : "border-slate-200 bg-[#f7f8fa] text-[#0f2847] hover:border-[#ffb800] dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                )}
              >
                {t(`events.${labelKey}`)}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Contact */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-name">
              {t("events.proposalContactName")}
            </label>
            <Input id="ep-name" className={fieldClass} required value={form.contact_name} onChange={set("contact_name")} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-email">
              {t("events.proposalContactEmail")}
            </label>
            <Input id="ep-email" type="email" className={fieldClass} required value={form.contact_email} onChange={set("contact_email")} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-phone">
              {t("events.proposalContactPhone")}
            </label>
            <Input id="ep-phone" className={fieldClass} value={form.contact_phone} onChange={set("contact_phone")} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-org">
              {t("events.proposalOrg")}
            </label>
            <Input id="ep-org" className={fieldClass} required value={form.organization} onChange={set("organization")} />
          </div>
        </div>

        {/* Contenu affiché sur les cartes */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-title">
            {t("events.proposalTitle")}
          </label>
          <Input id="ep-title" className={fieldClass} required value={form.title} onChange={set("title")} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-desc">
            {t("events.proposalDesc")}
          </label>
          <Textarea
            id="ep-desc"
            className={fieldClass}
            required
            rows={4}
            value={form.description}
            onChange={set("description")}
            placeholder={t("events.proposalDescHint")}
          />
        </div>

        {/* Affiche */}
        <div>
          <p className="mb-1.5 text-sm font-semibold text-[#0f2847] dark:text-slate-200">
            {t("events.proposalPoster")}
            {publicationChannel === "ynuka_agenda" ? " *" : ""}
          </p>
          <p className="mb-2 text-xs font-medium text-[#315795] dark:text-slate-400">
            {t("events.proposalPosterHint")}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={(e) => onPickImage(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center gap-3 border border-dashed border-[#ffb800]/70 bg-[#ffb800]/5 p-3 text-left transition-colors hover:bg-[#ffb800]/10"
          >
            <span className="flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden bg-[#0f2847]/10">
              {imagePreview ? (
                <img src={imagePreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <ImagePlus className="h-7 w-7 text-[#0f2847]/70 dark:text-[#ffb800]" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[#0f2847] dark:text-white">
                {imagePreview ? t("events.proposalPosterChange") : t("events.proposalPosterPick")}
              </span>
              <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">
                {t("events.proposalPosterTypes")}
              </span>
            </span>
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-cat">
              {t("events.proposalCategory")}
            </label>
            <select id="ep-cat" className={fieldClass} required value={form.category} onChange={set("category")}>
              <option value="Workshop">{t("events.workshop")}</option>
              <option value="Hackathon">{t("events.hackathon")}</option>
              <option value="Meetup">{t("events.meetup")}</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-format">
              {t("events.proposalFormat")}
            </label>
            <select id="ep-format" className={fieldClass} required value={form.format} onChange={set("format")}>
              <option value="in_person">{t("events.formatInPerson")}</option>
              <option value="online">{t("events.formatOnline")}</option>
              <option value="hybrid">{t("events.formatHybrid")}</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-date">
              {t("events.proposalDate")}
            </label>
            <Input id="ep-date" type="date" className={fieldClass} required value={form.event_date} onChange={set("event_date")} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-time">
              {t("events.proposalTime")}
            </label>
            <Input id="ep-time" type="time" className={fieldClass} value={form.event_time} onChange={set("event_time")} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-tz">
              {t("events.proposalTimezone")}
            </label>
            <Input id="ep-tz" className={fieldClass} value={form.timezone} onChange={set("timezone")} />
          </div>
        </div>

        {showVenue ? (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-venue">
              {t("events.proposalVenue")}
            </label>
            <Input id="ep-venue" className={fieldClass} required value={form.venue} onChange={set("venue")} />
          </div>
        ) : null}
        {showOnline ? (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-online">
              {t("events.proposalOnlineLink")}
            </label>
            <Input
              id="ep-online"
              type="url"
              className={fieldClass}
              required
              value={form.online_link}
              onChange={set("online_link")}
              placeholder="https://"
            />
          </div>
        ) : null}

        {publicationChannel === "external" ? (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-ext">
              {t("events.proposalExternalUrl")}
            </label>
            <Input
              id="ep-ext"
              type="url"
              className={fieldClass}
              required
              value={form.external_event_url}
              onChange={set("external_event_url")}
              placeholder="https://lu.ma/…"
            />
            <p className="mt-1 text-xs text-[#315795] dark:text-slate-400">{t("events.proposalExternalHint")}</p>
          </div>
        ) : (
          <fieldset>
            <legend className="mb-2 text-sm font-extrabold text-[#0f2847] dark:text-white">
              {t("events.proposalRegModeTitle")}
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {(
                [
                  ["ynuka_modal", "proposalRegModeSite"],
                  ["external_url", "proposalRegModeLink"],
                ] as const
              ).map(([id, labelKey]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setRegistrationMode(id)}
                  className={cn(
                    "border px-3 py-2.5 text-left text-sm font-bold transition-colors",
                    registrationMode === id
                      ? "border-[#ffb800] bg-[#ffb800] text-[#0f2847]"
                      : "border-slate-200 bg-[#f7f8fa] text-[#0f2847] dark:border-slate-600 dark:bg-slate-900 dark:text-white"
                  )}
                >
                  {t(`events.${labelKey}`)}
                </button>
              ))}
            </div>
            {registrationMode === "external_url" ? (
              <div className="mt-3">
                <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-reg">
                  {t("events.proposalRegUrl")}
                </label>
                <Input
                  id="ep-reg"
                  type="url"
                  className={fieldClass}
                  required
                  value={form.registration_url}
                  onChange={set("registration_url")}
                />
              </div>
            ) : (
              <p className="mt-2 text-xs font-medium text-[#315795] dark:text-slate-400">
                {t("events.proposalRegModeSiteHint")}
              </p>
            )}
          </fieldset>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-aud">
              {t("events.proposalAudience")}
            </label>
            <Input id="ep-aud" className={fieldClass} value={form.audience} onChange={set("audience")} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-cap">
              {t("events.proposalCapacity")}
            </label>
            <Input id="ep-cap" type="number" min={1} className={fieldClass} value={form.capacity} onChange={set("capacity")} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-partners">
            {t("events.proposalPartners")}
          </label>
          <Input id="ep-partners" className={fieldClass} value={form.partners} onChange={set("partners")} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="ep-speakers">
            {t("events.proposalSpeakers")}
          </label>
          <Input id="ep-speakers" className={fieldClass} value={form.speakers} onChange={set("speakers")} />
        </div>

        {/* Aperçu type carte agenda */}
        {(form.title.trim() || imagePreview) && (
          <div className="rounded-card border border-slate-200 bg-[#f7f8fa] p-3 dark:border-slate-600 dark:bg-slate-900">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#0f2847]/60 dark:text-slate-400">
              {t("events.proposalPreview")}
            </p>
            <div className="overflow-hidden rounded-card border border-slate-200 bg-white dark:border-slate-700 dark:bg-[#0c1a2e]">
              <div className="aspect-[16/10] bg-[#0f2847]/10">
                {imagePreview ? (
                  <img src={imagePreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    {t("events.proposalPosterPick")}
                  </div>
                )}
              </div>
              <div className="space-y-1.5 p-3">
                <p className="text-sm font-extrabold text-[#0f2847] dark:text-white">
                  {form.title.trim() || t("events.proposalTitle")}
                </p>
                <p className="flex items-center gap-1.5 text-xs font-medium text-[#315795] dark:text-slate-400">
                  <Calendar className="h-3.5 w-3.5" aria-hidden />
                  {form.event_date || t("events.proposalDate")}
                  {form.event_time ? ` · ${form.event_time}` : ""}
                </p>
                <p className="flex items-center gap-1.5 text-xs font-medium text-[#315795] dark:text-slate-400">
                  <MapPin className="h-3.5 w-3.5" aria-hidden />
                  {locationPreview}
                </p>
                <p className="text-[0.7rem] font-bold uppercase tracking-wide text-[#ffb800]">
                  {form.category}
                </p>
              </div>
            </div>
          </div>
        )}

        <label className="flex items-start gap-2 text-sm text-[#0f2847] dark:text-slate-200">
          <input type="checkbox" className="mt-1" checked={form.consent} onChange={set("consent")} required />
          <span>{t("events.proposalConsent")}</span>
        </label>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline-glow" onClick={onBackToAgenda}>
            {t("events.backToAgenda")}
          </Button>
          <Button type="submit" variant="glow" disabled={submitting}>
            {submitting ? t("events.submitting") : t("events.proposalSubmit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
