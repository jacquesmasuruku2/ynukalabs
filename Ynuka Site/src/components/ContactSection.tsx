import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Mail, MapPin, RefreshCw, Send, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { submitContactForm } from "@/lib/api";
import { socialLinks } from "@/data/socialLinks";
import ModernSectionWrapper from "@/components/ui/ModernSectionWrapper";

function makeCaptchaChallenge() {
  const a = Math.floor(Math.random() * 8) + 2;
  const b = Math.floor(Math.random() * 8) + 1;
  return { a, b, answer: a + b };
}

type ContactSectionProps = {
  /** Sujet initial (sinon lu depuis ?subject=) */
  initialSubject?: string;
};

const ContactSection = ({ initialSubject = "" }: ContactSectionProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const subjectFromUrl = (searchParams.get("subject") ?? "").trim();
  const resolvedInitialSubject = (initialSubject || subjectFromUrl).trim();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: resolvedInitialSubject,
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [notRobot, setNotRobot] = useState(false);
  const [challenge, setChallenge] = useState(makeCaptchaChallenge);
  const [captchaInput, setCaptchaInput] = useState("");

  useEffect(() => {
    if (!resolvedInitialSubject) return;
    setFormData((prev) =>
      prev.subject === resolvedInitialSubject ? prev : { ...prev, subject: resolvedInitialSubject }
    );
  }, [resolvedInitialSubject]);

  const refreshCaptcha = () => {
    setChallenge(makeCaptchaChallenge());
    setCaptchaInput("");
    setNotRobot(false);
  };

  const captchaOk = useMemo(() => {
    if (!notRobot) return false;
    const value = Number(captchaInput.trim());
    return Number.isFinite(value) && value === challenge.answer;
  }, [notRobot, captchaInput, challenge.answer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!notRobot) {
      toast({
        title: t("contact.captchaRequired"),
        variant: "destructive",
      });
      return;
    }

    if (!captchaOk) {
      toast({
        title: t("contact.captchaInvalid"),
        variant: "destructive",
      });
      refreshCaptcha();
      return;
    }

    setSubmitting(true);
    try {
      await submitContactForm({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject || t("contact.defaultSubject"),
        message: formData.message,
      });
      toast({ title: t("contact.sent") });
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: resolvedInitialSubject,
        message: "",
      });
      refreshCaptcha();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      toast({
        title: t("admin.error"),
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const underlineField =
    "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-3 text-base text-[#0f2847] placeholder:text-slate-400 focus:border-[#ffb800] focus:outline-none focus:ring-0 dark:border-white/20 dark:text-white dark:placeholder:text-slate-500 dark:focus:border-[#ffb800]";

  return (
    <ModernSectionWrapper className="py-16 md:py-20">
      <div id="contact" className="scroll-mt-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
          className="rounded-md border border-slate-200 bg-white p-5 shadow-none sm:p-7 md:p-8 dark:border-slate-700 dark:bg-[#0c1a2e]"
        >
          <div className="mb-8 rounded-md bg-[#0f2847] px-5 py-6 text-white md:px-6 md:py-7 dark:bg-[#152a48]">
            <h2 className="text-2xl font-bold tracking-tight text-[#ffb800] md:text-3xl">
              {t("contact.bannerKicker")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-white/85 md:text-base">
              {t("contact.bannerDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
            <form onSubmit={handleSubmit} className="flex h-full flex-col space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <input
                  type="text"
                  placeholder={t("contact.name")}
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={underlineField}
                />
                <input
                  type="email"
                  placeholder={t("contact.email")}
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={underlineField}
                />
              </div>
              <input
                type="tel"
                placeholder={t("contact.phone")}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={underlineField}
              />
              <input
                type="text"
                placeholder={t("contact.subject")}
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className={underlineField}
              />
              <textarea
                placeholder={t("contact.projectMessage")}
                required
                rows={3}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className={`${underlineField} min-h-[3.25rem] resize-none`}
              />

              <div className="mt-auto flex flex-col gap-3 pt-2 sm:flex-row sm:items-end sm:justify-between">
                <div className="w-full max-w-[280px] rounded-md border border-slate-300 bg-[#f9fafb] p-3 dark:border-slate-600 dark:bg-slate-800/60">
                  <label className="flex cursor-pointer items-center gap-3">
                    <input
                      type="checkbox"
                      checked={notRobot}
                      onChange={(e) => setNotRobot(e.target.checked)}
                      className="h-5 w-5 rounded border-slate-400 text-[#0f2847] accent-[#ffb800] dark:border-slate-500"
                    />
                    <span className="flex-1 text-sm font-medium text-[#0f2847] dark:text-white">
                      {t("contact.captchaLabel")}
                    </span>
                    <ShieldCheck className="h-5 w-5 text-[#0f2847]/70 dark:text-white/70" aria-hidden />
                  </label>

                  {notRobot ? (
                    <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3 dark:border-slate-600">
                      <span className="whitespace-nowrap text-xs text-slate-500 dark:text-slate-400">
                        {t("contact.captchaPrompt")} {challenge.a} + {challenge.b} ?
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value.replace(/[^\d]/g, ""))}
                        className="w-14 rounded-md border border-slate-300 bg-white px-2 py-1 text-center text-sm text-[#0f2847] focus:border-[#ffb800] focus:outline-none dark:border-slate-500 dark:bg-slate-900 dark:text-white"
                        aria-label={t("contact.captchaLabel")}
                        required={notRobot}
                      />
                      <button
                        type="button"
                        onClick={refreshCaptcha}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#0f2847] hover:bg-slate-200 dark:text-white dark:hover:bg-slate-700"
                        aria-label="Refresh captcha"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={submitting || !captchaOk}
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-[#ffb800] px-7 py-3 text-sm font-bold text-[#0f2847] transition-colors hover:bg-[#e6a600] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? t("events.submitting") : t("contact.send")}
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>

            <div className="flex h-full flex-col space-y-4">
              <div className="rounded-md border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/40">
                <div className="mb-2 flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-[#ffb800]" />
                  <h4 className="font-semibold text-[#0f2847] dark:text-white">{t("contact.emailLabel")}</h4>
                </div>
                <a
                  href="mailto:contact@ynukalabs.com"
                  className="break-all text-sm text-[#315795] hover:text-[#ffb800] dark:text-slate-300 dark:hover:text-[#ffb800]"
                >
                  contact@ynukalabs.com
                </a>
              </div>

              <div className="rounded-md border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/40">
                <div className="mb-2 flex items-center gap-3">
                  <MapPin className="h-5 w-5 shrink-0 text-[#ffb800]" />
                  <h4 className="font-semibold text-[#0f2847] dark:text-white">{t("contact.locationLabel")}</h4>
                </div>
                <p className="whitespace-pre-line text-sm text-[#315795] dark:text-slate-300">{t("contact.location")}</p>
              </div>

              <div className="mt-auto rounded-md border border-slate-200 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/40">
                <h4 className="mb-3 font-semibold text-[#0f2847] dark:text-white">{t("contact.followUs")}</h4>
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map(({ href, ariaLabel }) => (
                    <a
                      key={ariaLabel}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-[#315795] transition-colors hover:border-[#ffb800]/50 hover:text-[#0f2847] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-[#ffb800]/50 dark:hover:text-white"
                    >
                      {ariaLabel}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </ModernSectionWrapper>
  );
};

export default ContactSection;
