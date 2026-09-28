import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  ApiServiceUnavailableError,
  submitSpeakerApplication,
} from "@/services/events/submissionsApi";
import type { SpeakerPreferredFormat } from "@/services/events/submissionsTypes";

const fieldClass =
  "w-full rounded-none border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#0f2847] outline-none ring-[#ffb800] focus:ring-2 dark:border-slate-600 dark:bg-slate-900 dark:text-white";

type SpeakerApplicationFormProps = {
  onBackToAgenda: () => void;
};

export default function SpeakerApplicationForm({ onBackToAgenda }: SpeakerApplicationFormProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    organization: "",
    topic_title: "",
    topic_description: "",
    expertise: "",
    preferred_format: "both" as SpeakerPreferredFormat,
    language: "",
    biography: "",
    professional_links: "",
    consent: false,
  });

  const set =
    (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value =
        e.target.type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot.trim()) return;
    if (!form.consent) {
      toast({ title: t("events.formConsentRequired"), variant: "destructive" });
      return;
    }
    setSubmitting(true);
    setUnavailable(false);
    try {
      await submitSpeakerApplication({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        organization: form.organization.trim() || null,
        topic_title: form.topic_title.trim(),
        topic_description: form.topic_description.trim(),
        expertise: form.expertise.trim(),
        preferred_format: form.preferred_format,
        language: form.language.trim(),
        biography: form.biography.trim(),
        professional_links: form.professional_links.trim() || null,
        consent: true,
        website: honeypot,
      });
      setDone(true);
      toast({ title: t("events.speakerSuccess") });
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
          {t("events.speakerSuccessTitle")}
        </h2>
        <p className="mt-3 text-sm text-[#315795] dark:text-slate-400">
          {t("events.speakerSuccessDesc")}
        </p>
        <Button type="button" variant="outline-glow" className="mt-6" onClick={onBackToAgenda}>
          {t("events.backToAgenda")}
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-[#0c1a2e] sm:p-8">
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-[#0f2847] dark:text-white">
          {t("events.navSpeaker")}
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[#315795] dark:text-slate-400">
          {t("events.speakerIntro")}
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

      <form onSubmit={handleSubmit} className="space-y-4 text-left" noValidate>
        {/* honeypot */}
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

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="sp-name">
            {t("events.speakerFullName")}
          </label>
          <Input id="sp-name" className={fieldClass} required value={form.full_name} onChange={set("full_name")} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="sp-email">
            {t("events.speakerEmail")}
          </label>
          <Input id="sp-email" type="email" className={fieldClass} required value={form.email} onChange={set("email")} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="sp-phone">
            {t("events.speakerPhone")}
          </label>
          <Input id="sp-phone" className={fieldClass} value={form.phone} onChange={set("phone")} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="sp-org">
            {t("events.speakerOrg")}
          </label>
          <Input id="sp-org" className={fieldClass} value={form.organization} onChange={set("organization")} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="sp-topic">
            {t("events.speakerTopicTitle")}
          </label>
          <Input id="sp-topic" className={fieldClass} required value={form.topic_title} onChange={set("topic_title")} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="sp-desc">
            {t("events.speakerTopicDesc")}
          </label>
          <Textarea
            id="sp-desc"
            className={fieldClass}
            required
            rows={4}
            value={form.topic_description}
            onChange={set("topic_description")}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="sp-exp">
            {t("events.speakerExpertise")}
          </label>
          <Input id="sp-exp" className={fieldClass} required value={form.expertise} onChange={set("expertise")} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="sp-format">
            {t("events.speakerFormat")}
          </label>
          <select
            id="sp-format"
            className={fieldClass}
            required
            value={form.preferred_format}
            onChange={set("preferred_format")}
          >
            <option value="in_person">{t("events.formatInPerson")}</option>
            <option value="online">{t("events.formatOnline")}</option>
            <option value="both">{t("events.formatBoth")}</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="sp-lang">
            {t("events.speakerLanguage")}
          </label>
          <Input id="sp-lang" className={fieldClass} required value={form.language} onChange={set("language")} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="sp-bio">
            {t("events.speakerBio")}
          </label>
          <Textarea id="sp-bio" className={fieldClass} required rows={3} value={form.biography} onChange={set("biography")} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0f2847] dark:text-slate-200" htmlFor="sp-links">
            {t("events.speakerLinks")}
          </label>
          <Input id="sp-links" className={fieldClass} value={form.professional_links} onChange={set("professional_links")} />
        </div>

        <label className="flex items-start gap-2 text-sm text-[#0f2847] dark:text-slate-200">
          <input
            type="checkbox"
            className="mt-1"
            checked={form.consent}
            onChange={set("consent")}
            required
          />
          <span>{t("events.speakerConsent")}</span>
        </label>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:justify-between">
          <Button type="button" variant="outline-glow" onClick={onBackToAgenda}>
            {t("events.backToAgenda")}
          </Button>
          <Button type="submit" variant="glow" disabled={submitting}>
            {submitting ? t("events.submitting") : t("events.speakerSubmit")}
          </Button>
        </div>
      </form>
    </div>
  );
}
