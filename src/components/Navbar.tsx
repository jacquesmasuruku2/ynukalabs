import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu, X, ChevronDown, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ThemeToggle from "@/components/ThemeToggle";
import logo from "@/assets/logo.png";
import { strapiFetch } from "@/lib/strapi";
import { socialLinks } from "@/data/socialLinks";
import { cn } from "@/lib/utils";

interface NavGroup {
  label: string;
  items: { key: string; path: string }[];
}

type NavEntry = NavGroup | { key: string; path: string };

/** Palette : liens menu en noir (clair) / clair (sombre), jaune charte */
const GOLD = "#ffb800";
const EMAIL = "contact@ujiuzilabs.com";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const location = useLocation();
  const { t } = useTranslation();
  const dropdownTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fallbackNavGroups: NavEntry[] = [
    { key: "home", path: "/" },
    {
      label: "nav.about",
      items: [
        { key: "presentation", path: "/about#presentation" },
        { key: "services", path: "/about#services" },
        { key: "team", path: "/about#team" },
        { key: "partners", path: "/about#partners" },
        { key: "contact", path: "/about#contact" },
      ],
    },
    {
      key: "projects",
      path: "/projects",
    },
    {
      label: "nav.ecosystem",
      items: [
        { key: "blockchains", path: "/blockchains#blockchains" },
        { key: "validators", path: "/blockchains#validators" },
        { key: "events", path: "/blockchains#events" },
        { key: "joinOurCommunity", path: "/blockchains#community" },
      ],
    },
    {
      label: "nav.resources",
      items: [
        { key: "blog", path: "/resources#blog" },
        { key: "documentation", path: "/resources#documentation" },
        { key: "tools", path: "/resources#tools" },
        { key: "gallery", path: "/resources#gallery" },
      ],
    },
  ];

  const applyRequestedNavStructure = (groups: NavEntry[]): NavEntry[] => {
    const cleaned = groups
      .filter((entry) => {
        if (!("items" in entry)) return true;
        const normalizedLabel = entry.label.toLowerCase();
        return !normalizedLabel.includes("onboarding");
      })
      .map((entry) => {
        if (!("items" in entry)) return entry;
        const normalizedLabel = entry.label.toLowerCase();
        if (
          normalizedLabel.includes("ecosystem") ||
          normalizedLabel.includes("ecosysteme") ||
          normalizedLabel.includes("ecosytem")
        ) {
          return {
            ...entry,
            items: [
              { key: "blockchains", path: "/blockchains#blockchains" },
              { key: "validators", path: "/blockchains#validators" },
              { key: "events", path: "/blockchains#events" },
              { key: "joinOurCommunity", path: "/blockchains#community" },
            ],
          };
        }
        if (normalizedLabel.includes("resource") || normalizedLabel.includes("ressource")) {
          return {
            ...entry,
            items: [
              { key: "blog", path: "/resources#blog" },
              { key: "documentation", path: "/resources#documentation" },
              { key: "tools", path: "/resources#tools" },
              { key: "gallery", path: "/resources#gallery" },
            ],
          };
        }
        return entry;
      });

    const withoutProjectsGroup = cleaned.filter(
      (entry) =>
        !(
          "items" in entry &&
          (entry.label.toLowerCase().includes("projects") || entry.label.toLowerCase().includes("projets"))
        )
    );
    const hasProjectsTopLevel = withoutProjectsGroup.some(
      (entry) => !("items" in entry) && entry.path === "/projects"
    );
    if (hasProjectsTopLevel) return withoutProjectsGroup;

    const aboutIndex = withoutProjectsGroup.findIndex(
      (entry) => "items" in entry && entry.label.toLowerCase().includes("about")
    );

    if (aboutIndex === -1) {
      return [...withoutProjectsGroup, { key: "projects", path: "/projects" }];
    }

    return [
      ...withoutProjectsGroup.slice(0, aboutIndex + 1),
      { key: "projects", path: "/projects" },
      ...withoutProjectsGroup.slice(aboutIndex + 1),
    ];
  };

  const [navGroups, setNavGroups] = useState<NavEntry[]>(applyRequestedNavStructure(fallbackNavGroups));

  const stripNavKey = (labelKey: string) => {
    if (!labelKey) return labelKey;
    if (labelKey.startsWith("nav.")) return labelKey.slice("nav.".length);
    return labelKey;
  };

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        type StrapiMenuGroup = {
          id: string | number;
          attributes?: {
            labelKey?: string;
            location?: "header" | "footer";
            order?: number;
            items?: { data?: Array<{ id?: string | number; attributes?: { labelKey?: string; path?: string; order?: number } }> };
          };
        };

        const res = await strapiFetch<{ data?: StrapiMenuGroup[] }>(
          "/api/site-menu-groups?populate=items&pagination[pageSize]=50"
        );
        const groups = (res.data ?? []).filter(Boolean);

        const headerGroups = groups
          .map((g) => {
            const attrs = g.attributes ?? {};
            if (attrs.location !== "header") return null;
            const groupLabelKey = String(attrs.labelKey ?? "");
            if (!groupLabelKey) return null;

            const items = attrs.items?.data ?? [];
            const mappedItems = items
              .map((it) => {
                const iAttrs = it.attributes ?? {};
                const labelKey = String(iAttrs.labelKey ?? "");
                const path = String(iAttrs.path ?? "");
                if (!labelKey || !path) return null;
                return {
                  key: stripNavKey(labelKey),
                  path,
                };
              })
              .filter((x): x is { key: string; path: string } => x !== null);

            return {
              label: groupLabelKey,
              items: mappedItems,
              order: typeof attrs.order === "number" ? attrs.order : 0,
            };
          })
          .filter((x): x is { label: string; items: NavGroup["items"]; order: number } => x !== null)
          .sort((a, b) => a.order - b.order);

        if (headerGroups.length) {
          const incoming: NavEntry[] = [
            { key: "home", path: "/" },
            ...headerGroups.map((g) => ({ label: g.label, items: g.items })),
          ];
          setNavGroups(applyRequestedNavStructure(incoming));
        }
      } catch {
        // Fallback déjà présent
      }
    };

    fetchMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isGroup = (item: unknown): item is NavGroup => {
    if (typeof item !== "object" || item === null) return false;
    return "items" in item;
  };

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
    setOpenDropdown(label);
  };

  const handleMouseLeave = () => {
    dropdownTimeout.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  useEffect(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    if (path.includes("#")) {
      const [pathname, hashPart] = path.split("#");
      const want = hashPart.trim();

      if (pathname === "/resources") {
        if (location.pathname === "/blog" && want === "blog") return true;
        if (location.pathname === "/documentation" && want === "documentation") return true;
        if (location.pathname === "/tools" && want === "tools") return true;
        if (location.pathname !== pathname) return false;
        const current = location.hash.replace("#", "").trim();
        if (!current) return want === "blog";
        return current === want || decodeURIComponent(current) === want;
      }

      if (pathname === "/blockchains") {
        if (location.pathname !== pathname) return false;
        const current = location.hash.replace("#", "").trim();
        if (!current) return want === "blockchains";
        return current === want || decodeURIComponent(current) === want;
      }

      if (pathname === "/about") {
        if (location.pathname !== pathname) return false;
        const current = location.hash.replace("#", "").trim();
        if (!current) return want === "presentation";
        return current === want || decodeURIComponent(current) === want;
      }

      if (location.pathname !== pathname) return false;
      const current = location.hash.replace("#", "").trim();
      if (!current) return false;
      return current === want || decodeURIComponent(current) === want;
    }
    return location.pathname === path;
  };

  const isGroupActive = (group: NavGroup) => group.items.some((item) => isActive(item.path));

  /* Liens menu : inactifs en noir, actifs en or Ynuka */
  const linkBase =
    "px-4 py-2.5 text-base font-bold rounded-xl transition-colors whitespace-nowrap md:px-5 md:py-3 md:text-[1.0625rem]";
  const linkActive = "text-[#ffb800] bg-[#ffb800]/12";
  const linkIdle =
    "text-neutral-950 hover:bg-black/[0.06] hover:text-black dark:text-neutral-100 dark:hover:bg-white/10 dark:hover:text-white";

  const TopBarSocialIcons = () => (
    <div className="flex shrink-0 flex-nowrap items-center justify-end gap-1.5 sm:gap-2 md:gap-2.5">
      {socialLinks.map(({ href, ariaLabel, Icon, iconClassName }) => (
        <a
          key={ariaLabel}
          href={href}
          {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={cn(
            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full shadow-sm ring-1 ring-black/10 transition-transform hover:scale-105 hover:ring-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb800] dark:ring-white/15 dark:hover:ring-white/30 sm:h-8 sm:w-8",
            iconClassName
          )}
          aria-label={ariaLabel}
        >
          <Icon className={ariaLabel === "X" ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </a>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full shrink-0 isolate">
      {/*
        Bandeau : mail à gauche dans la case jaune | icônes à droite, puis extension jaune | fond.
      */}
      <div className="flex w-full flex-col border-b border-border/50">
        <div className="flex w-full min-w-0 flex-row items-stretch">
          <div
            className="flex min-h-[46px] min-w-0 flex-1 items-center justify-start px-4 py-2.5 sm:w-1/2 sm:flex-none md:min-h-[52px] md:py-0 md:pl-5 lg:min-h-[56px] lg:pl-8"
            style={{ backgroundColor: GOLD }}
          >
            <a
              href={`mailto:${EMAIL}`}
              className="inline-flex min-w-0 max-w-full items-center gap-2 text-xs font-bold text-[#111111] underline-offset-2 hover:underline sm:text-sm md:text-[0.95rem]"
            >
              <Mail className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" strokeWidth={2.25} />
              <span className="truncate sm:whitespace-normal sm:break-all">{EMAIL}</span>
            </a>
          </div>
          <div className="flex min-h-[46px] min-w-0 flex-1 items-center justify-end bg-background px-4 py-2.5 sm:w-1/2 sm:flex-none md:min-h-[52px] md:py-0 md:pr-5 lg:min-h-[56px] lg:pr-10">
            <TopBarSocialIcons />
          </div>
        </div>
        <div className="flex w-full flex-row" aria-hidden>
          <div className="h-5 w-1/2 shrink-0 sm:h-7 md:h-9 lg:h-10" style={{ backgroundColor: GOLD }} />
          <div className="h-5 w-1/2 shrink-0 bg-background sm:h-7 md:h-9 lg:h-10" />
        </div>
      </div>

      <div
        className={cn(
          "relative z-20 mx-auto flex w-full max-w-[1200px] justify-center px-4 sm:px-6 md:px-8 lg:px-10",
          /* Remonte encore la barre menus (hauteur totale du bandeau inchangée) */
          "-mt-7 sm:-mt-8 md:-mt-9 lg:-mt-10"
        )}
      >
        <nav
          className={cn(
            "flex w-full min-h-[3.25rem] items-center gap-2 rounded-2xl border border-slate-200/90 bg-white py-2.5 pl-4 pr-3",
            "shadow-[0_4px_6px_-1px_rgba(5,46,70,0.06),0_20px_50px_-12px_rgba(5,46,70,0.18)]",
            "dark:border-slate-600 dark:bg-slate-900 md:min-h-[3.5rem] md:gap-3 md:rounded-[1.125rem] md:py-3 md:pl-6 md:pr-5 lg:gap-4 lg:min-h-[3.75rem] lg:rounded-[1.25rem] lg:py-3.5 lg:pl-8 lg:pr-6"
          )}
        >
          <Link to="/" className="flex shrink-0 items-center gap-3 md:gap-3.5">
            <img src={logo} alt="Ynuka Labs" className="h-11 w-11 md:h-14 md:w-14" />
            <span className="font-display text-xl font-bold tracking-tight text-slate-800 dark:text-white md:text-2xl">
              Ynuka <span style={{ color: GOLD }}>Labs</span>
            </span>
          </Link>

          <div className="hidden flex-1 items-center justify-center gap-1 lg:flex lg:gap-2">
            {navGroups.map((item) =>
              isGroup(item) ? (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  <button
                    type="button"
                    className={cn(linkBase, "flex items-center gap-1.5", isGroupActive(item) ? linkActive : linkIdle)}
                  >
                    {t(item.label)}
                    <ChevronDown
                      className={`h-4 w-4 shrink-0 md:h-[18px] md:w-[18px] ${openDropdown === item.label ? "rotate-180" : ""} transition-transform`}
                    />
                  </button>
                  {openDropdown === item.label && (
                    <div className="absolute left-0 top-full z-50 mt-3 min-w-[260px] rounded-2xl border border-border bg-popover py-2 shadow-2xl">
                      {item.items.map((sub) => {
                        const isFirstSubmenuAnchor = sub.key === "blockchains" || sub.key === "blog";
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            className={cn(
                              "block px-5 py-3.5 text-base font-bold transition-colors whitespace-nowrap",
                              isActive(sub.path)
                                ? "bg-[#ffb800]/12 text-[#ffb800]"
                                : isFirstSubmenuAnchor
                                  ? "bg-[#F9F9F9] text-muted-foreground hover:bg-[#f0f0f0] hover:text-foreground dark:bg-slate-800/95 dark:hover:bg-slate-700"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            {t(`nav.${sub.key}`)}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link key={item.path} to={item.path} className={cn(linkBase, isActive(item.path) ? linkActive : linkIdle)}>
                  {t(`nav.${item.key}`)}
                </Link>
              )
            )}
          </div>

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <div className="flex items-center gap-1 md:gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full text-neutral-950 hover:bg-black/[0.06] hover:text-black dark:text-neutral-100 dark:hover:bg-white/10 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
            </Button>
          </div>
        </nav>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full z-40 max-h-[min(85vh,calc(100dvh-5rem))] overflow-y-auto border-b border-border bg-background/98 px-4 pb-8 pt-4 shadow-xl backdrop-blur-md lg:hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-1">
            {navGroups.map((item) =>
              isGroup(item) ? (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => setMobileExpanded(mobileExpanded === item.label ? null : item.label)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-4 py-4 text-base font-bold",
                      isGroupActive(item) ? "bg-[#ffb800]/12 text-[#ffb800]" : "text-neutral-950 dark:text-neutral-100"
                    )}
                  >
                    {t(item.label)}
                    <ChevronDown className={`h-5 w-5 transition-transform ${mobileExpanded === item.label ? "rotate-180" : ""}`} />
                  </button>
                  {mobileExpanded === item.label && (
                    <div className="ml-3 flex flex-col gap-1 border-l-2 border-neutral-900/20 pl-4 dark:border-white/25">
                      {item.items.map((sub) => {
                        const isFirstSubmenuAnchor = sub.key === "blockchains" || sub.key === "blog";
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "rounded-lg px-3 py-3 text-base font-bold",
                              isActive(sub.path)
                                ? "text-[#ffb800]"
                                : isFirstSubmenuAnchor
                                  ? "bg-[#F9F9F9] text-muted-foreground dark:bg-slate-800/95"
                                  : "text-muted-foreground"
                            )}
                          >
                            {t(`nav.${sub.key}`)}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "rounded-xl px-4 py-4 text-base font-bold",
                    isActive(item.path) ? "bg-[#ffb800]/12 text-[#ffb800]" : "text-neutral-950 dark:text-neutral-100"
                  )}
                >
                  {t(`nav.${item.key}`)}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
