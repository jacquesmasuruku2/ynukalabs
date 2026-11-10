import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { socialLinks } from "@/data/socialLinks";
import { strapiFetch } from "@/lib/strapi";
import { subscribeToNewsletter } from "@/lib/api";

const Footer = () => {
  const { t } = useTranslation();
  const [newsletterName, setNewsletterName] = useState("");
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  type FooterMenuItem = { labelKey: string; path: string };
  type FooterMenuGroup = { labelKey: string; items: FooterMenuItem[]; order: number };

  const fallbackFooterGroups: FooterMenuGroup[] = [
    {
      labelKey: "footer.quickLinks",
      order: 0,
      items: [
        { labelKey: "nav.about", path: "/about" },
        { labelKey: "nav.events", path: "/blockchains#events" },
        { labelKey: "nav.projects", path: "/projects" },
        { labelKey: "nav.gallery", path: "/resources#gallery" },
        { labelKey: "nav.community", path: "/blockchains#community" },
        { labelKey: "nav.support", path: "/soutenir" },
      ],
    },
    {
      labelKey: "footer.resources",
      order: 1,
      items: [
        { labelKey: "nav.educationalContent", path: "/resources#education" },
        { labelKey: "nav.blog", path: "/resources#blog" },
        { labelKey: "nav.gallery", path: "/resources#gallery" },
        { labelKey: "nav.contact", path: "/contact" },
      ],
    },
  ];

  const [footerMenuGroups, setFooterMenuGroups] = useState<FooterMenuGroup[]>(fallbackFooterGroups);

  const resolveLabel = (labelKey: string) => {
    if (!labelKey) return "";
    if (labelKey.includes(".")) return t(labelKey);
    return t(`nav.${labelKey}`);
  };

  useEffect(() => {
    const fetchFooterMenus = async () => {
      try {
        type StrapiMenuGroup = {
          attributes?: {
            labelKey?: string;
            location?: "header" | "footer";
            order?: number;
            items?: { data?: Array<{ attributes?: { labelKey?: string; path?: string; order?: number } }> };
          };
        };

        const res = await strapiFetch<{ data?: StrapiMenuGroup[] }>(
          "/api/site-menu-groups?populate=items&pagination[pageSize]=50"
        );
        const groups = (res.data ?? []).filter(Boolean);

        const mapped: FooterMenuGroup[] = groups
          .map((g) => {
            const attrs = g.attributes ?? {};
            if (attrs.location !== "footer") return null;
            const labelKey = String(attrs.labelKey ?? "");
            if (!labelKey) return null;

            const items = attrs.items?.data ?? [];
            const mappedItems: FooterMenuItem[] = items
              .map((it) => {
                const iAttrs = it.attributes ?? {};
                const itemLabelKey = String(iAttrs.labelKey ?? "");
                const path = String(iAttrs.path ?? "");
                if (!itemLabelKey || !path) return null;
                return { labelKey: itemLabelKey, path };
              })
              .filter((x): x is FooterMenuItem => x !== null);

            const order = typeof attrs.order === "number" ? attrs.order : 0;
            if (!mappedItems.length) return null;
            return { labelKey, items: mappedItems, order };
          })
          .filter((x): x is FooterMenuGroup => x !== null)
          .sort((a, b) => a.order - b.order);

        if (mapped.length >= 1) setFooterMenuGroups(mapped);
      } catch {
        // fallback déjà présent
      }
    };

    fetchFooterMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const devEmail = "ujuzilabs1@gmail.com";
  const devMailto = `mailto:${devEmail}?subject=${encodeURIComponent(
    "Demande de site web moderne pour mon entreprise"
  )}&body=${encodeURIComponent(
    "Bonjour Ynuka Labs Team,\nBonjour Jacques\n\nJ'ai visité votre site et je l'apprécie tellement. Pouvez-vous me concevoir aussi un site web moderne pour mon entreprise ?\n\nMerci."
  )}`;

  return (
    <footer className="border-t border-white/10 bg-[#0f2847] text-white overflow-hidden relative">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#ffb800]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="max-w-[1300px] mx-auto px-4 md:px-6 py-4 md:py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1.5fr] gap-12 lg:gap-16">
          {/* Brand */}
          <div className="space-y-6">
            <h3 className="font-display text-3xl font-extrabold uppercase tracking-tight text-white">
              Ynuka <span className="text-[#ffb800]">Labs</span>
            </h3>
            <p className="text-white/60 font-medium text-[0.95rem] leading-relaxed max-w-xs">
              Building Africa's next future through decentralized technologies, AI, and ecological resilience.
            </p>
            <div className="flex items-center gap-2 text-white/60 text-[0.95rem] font-medium">
              <MapPin className="h-4 w-4" />
              <span>{t("footer.location")}</span>
            </div>
            <div className="flex flex-col gap-4 pt-1">
              <div className="flex flex-wrap gap-3">
                {socialLinks.map(({ href, ariaLabel, Icon, iconClassName }) => (
                  <a
                    key={ariaLabel}
                    href={href}
                    {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffb800] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f2847] ${iconClassName}`}
                    aria-label={ariaLabel}
                  >
                    <Icon className={ariaLabel === "X" ? "h-[18px] w-[18px]" : "h-[22px] w-[22px]"} />
                  </a>
                ))}
              </div>
              <div className="space-y-2">
                <a href="mailto:contact@ynukalabs.com" className="flex items-center gap-2 text-sm text-white/75 hover:text-[#ffb800] transition-colors">
                  <Mail className="h-4 w-4" />
                  contact@ynukalabs.com
                </a>
                <a href="tel:+243974973061" className="flex items-center gap-2 text-sm text-white/75 hover:text-[#ffb800] transition-colors">
                  <Phone className="h-4 w-4" />
                  +243974973061
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-widest text-white/40 mb-6">
              {(() => {
                const gQuick = footerMenuGroups.find((g) => g.labelKey === "footer.quickLinks") ?? footerMenuGroups[0];
                return resolveLabel(gQuick?.labelKey ?? "footer.quickLinks");
              })()}
            </h4>
            <div className="flex flex-col gap-3">
              {(() => {
                const gQuick = footerMenuGroups.find((g) => g.labelKey === "footer.quickLinks") ?? footerMenuGroups[0];
                const quickItems = [...(gQuick?.items ?? [])];
                const hasGallery = quickItems.some((item) => item.path === "/resources#gallery");
                if (!hasGallery) {
                  quickItems.push({ labelKey: "nav.gallery", path: "/resources#gallery" });
                }
                const hasSupport = quickItems.some((item) => item.path === "/soutenir");
                if (!hasSupport) {
                  quickItems.push({ labelKey: "nav.support", path: "/soutenir" });
                }
                return quickItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-sm text-white/75 hover:text-[#ffb800] transition-colors"
                  >
                    {resolveLabel(item.labelKey)}
                  </Link>
                ));
              })()}
            </div>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-widest text-white/40 mb-6">
              {(() => {
                const gRes =
                  footerMenuGroups.find((g) => g.labelKey === "footer.resources") ?? footerMenuGroups[1] ?? footerMenuGroups[0];
                return resolveLabel(gRes?.labelKey ?? "footer.resources");
              })()}
            </h4>
            <div className="flex flex-col gap-3">
              {(() => {
                const gRes =
                  footerMenuGroups.find((g) => g.labelKey === "footer.resources") ?? footerMenuGroups[1] ?? footerMenuGroups[0];
                return (gRes?.items ?? []).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-sm text-white/75 hover:text-[#ffb800] transition-colors"
                  >
                    {resolveLabel(item.labelKey)}
                  </Link>
                ));
              })()}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-display text-sm font-bold uppercase tracking-widest text-white/40 mb-6">
              {t("footer.newsletter")}
            </h4>
            <p className="text-sm text-white/75 mb-3">
              {t("footer.newsletterCta")}
            </p>
            <form
              className="flex flex-col gap-2.5"
              onSubmit={async (e) => {
                e.preventDefault();

                if (submitting) return;
                if (!newsletterEmail) return;

                setSubmitting(true);
                try {
                  await subscribeToNewsletter(newsletterName, newsletterEmail);
                  toast({ title: t("home.subscribeSuccess") });
                  setNewsletterName("");
                  setNewsletterEmail("");
                } catch (err: unknown) {
                  console.error("Newsletter subscription error:", err);
                  const error = err as Error & { code?: string; status?: number };
                  const errorMessage = error instanceof Error ? error.message : "Unknown error";
                  if (
                    error.code === "ALREADY_SUBSCRIBED" ||
                    error.status === 409 ||
                    errorMessage.toLowerCase().includes("déjà inscrite") ||
                    errorMessage.toLowerCase().includes("already subscribed")
                  ) {
                    toast({ title: t("home.alreadySubscribed"), variant: "destructive" });
                  } else if (error.code === "NETWORK_ERROR" || errorMessage.toLowerCase().includes("failed to fetch")) {
                    toast({ title: "Impossible de joindre le service newsletter. Vérifiez votre connexion et réessayez.", variant: "destructive" });
                  } else {
                    toast({ title: errorMessage || "Impossible de vous inscrire à la newsletter.", variant: "destructive" });
                  }
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <input
                type="text"
                value={newsletterName}
                onChange={(e) => setNewsletterName(e.target.value)}
                placeholder={t("footer.newsletterNamePlaceholder")}
                className="w-full rounded-lg border border-white/20 bg-white/[0.06] px-3.5 py-2 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#ffb800]"
              />
              <input
                type="email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder={t("footer.newsletterEmailPlaceholder")}
                className="w-full rounded-lg border border-white/20 bg-white/[0.06] px-3.5 py-2 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-[#ffb800]"
              />
              <button
                type="submit"
                className="rounded-lg bg-[#ffb800] px-4 py-2 text-sm font-medium text-[#111111] hover:bg-[#e6a600] transition-colors"
                disabled={submitting}
              >
                {submitting ? "..." : t("home.subscribe")}
              </button>
            </form>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-white/50 font-medium">
              © {new Date().getFullYear()} Ynuka Labs. {t("footer.rights")}
            </p>
            <div className="flex items-center gap-2 text-sm text-white/50 font-medium">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                System Operational
              </span>
            </div>
            <p className="text-sm text-white/50 font-medium text-center md:text-right">
              {t("footer.developedBy")}{" "}
              <a
                href={devMailto}
                className="text-white hover:text-[#ffb800] transition-colors hover:underline underline-offset-4"
                title={t("footer.developersTeam")}
              >
                {t("footer.developersTeam")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
