import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Mail, MapPin, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { strapiFetch } from "@/lib/strapi";

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.6 } };

const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await strapiFetch("/api/contact-messages", {
        method: "POST",
        body: JSON.stringify({
          data: {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
          },
        }),
      });

      toast({ title: t("contact.sent") });
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast({ title: t("admin.error"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="py-12 sm:py-16 md:py-20 hero-gradient">
        <div className="container mx-auto px-4 sm:px-6 md:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4"><span className="gradient-text">{t("contact.title")}</span></h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base md:text-lg">{t("contact.subtitle")}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 max-w-5xl mx-auto">
            <motion.div {...fadeUp}>
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t("contact.sendTitle")}</h2>
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                <input type="text" placeholder={t("contact.name")} required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <input type="email" placeholder={t("contact.email")} required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <input type="text" placeholder={t("contact.subject")} required value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
                <textarea placeholder={t("contact.message")} required rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none" />
                <Button variant="glow" size="lg" type="submit" className="w-full text-sm sm:text-base" disabled={submitting}>
                  {submitting ? t("events.submitting") : t("contact.send")} <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </motion.div>

            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.2 }}>
              <h2 className="font-display text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t("contact.infoTitle")}</h2>
              <div className="space-y-4 sm:space-y-6">
                <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-2"><Mail className="h-4 sm:h-5 w-4 sm:w-5 text-primary flex-shrink-0" /><h3 className="font-display font-semibold text-sm sm:text-base">{t("contact.emailLabel")}</h3></div>
                  <p className="text-xs sm:text-sm text-muted-foreground break-all">contact@gomahub.org</p>
                </div>
                <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <div className="flex items-center gap-3 mb-2"><MapPin className="h-4 sm:h-5 w-4 sm:w-5 text-primary flex-shrink-0" /><h3 className="font-display font-semibold text-sm sm:text-base">{t("contact.locationLabel")}</h3></div>
                  <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-line">{t("contact.location")}</p>
                </div>
                <div className="glass rounded-lg sm:rounded-xl p-4 sm:p-6">
                  <h3 className="font-display font-semibold text-sm sm:text-base mb-3">{t("contact.followUs")}</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Twitter", "Discord", "Telegram", "GitHub"].map((s) => (
                      <a key={s} href="#" className="px-2 sm:px-3 py-1.5 rounded-lg bg-secondary text-xs sm:text-sm text-muted-foreground hover:text-primary transition-colors">{s}</a>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
