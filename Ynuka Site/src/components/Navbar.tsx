import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  List,
  X,
  CaretDown,
  EnvelopeSimple,
} from "@phosphor-icons/react";
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

const GOLD = "#ffb800";
const EMAIL = "contact@ynukalabs.com";
const DROPDOWN_VIEWPORT_PAD = 16;

const keepDropdownInViewport = (el: HTMLElement, preferAlignEnd: boolean) => {
  const parent = el.offsetParent as HTMLElement | null;
  if (!parent) return;

  const vw = document.documentElement.clientWidth;
  const parentRect = parent.getBoundingClientRect();
  const maxWidth = Math.max(180, vw - DROPDOWN_VIEWPORT_PAD * 2);
  el.style.maxWidth = `${maxWidth}px`;

  const width = Math.min(el.offsetWidth, maxWidth);
  let left = preferAlignEnd ? parentRect.width - width : 0;
  const minLeft = DROPDOWN_VIEWPORT_PAD - parentRect.left;
  const maxLeft = vw - DROPDOWN_VIEWPORT_PAD - width - parentRect.left;
  if (maxLeft >= minLeft) {
    left = Math.min(Math.max(left, minLeft), maxLeft);
  } else {
    left = minLeft;
  }

  el.style.left = `${Math.round(left)}px`;
  el.style.right = "auto";
};

const NavDropdownPanel = ({
  items,
  preferAlignEnd,
  isActive,
  t,
}: {
  items: NavGroup["items"];
  preferAlignEnd: boolean;
  isActive: (path: string) => boolean;
  t: (key: string) => string;
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const useGrid = items.length > 3;

  useLayoutEffect(() => {
    const el = panelRef.current;
    if (!el) return;

    const place = () => keepDropdownInViewport(el, preferAlignEnd);
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [items, preferAlignEnd]);

  const itemClass = (path: string) =>
    cn(
      "flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors text-left leading-snug whitespace-nowrap",
      isActive(path)
        ? "bg-[#ffb800]/12 text-[#ffb800]"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  if (!useGrid) {
    return (
      <div
        ref={panelRef}
        className={cn(
          "absolute top-full z-50 mt-3 w-max min-w-[13.5rem] rounded-2xl border border-border bg-popover py-1.5",
          preferAlignEnd ? "right-0 left-auto origin-top-right" : "left-0 origin-top-left"
        )}
      >
        {items.map((sub) => (
          <Link key={sub.path} to={sub.path} className={cn(itemClass(sub.path), "mx-1")}>
            {t(`nav.${sub.key}`)}
          </Link>
        ))}
      </div>
    );
  }

  const columnsCount = 2;
  const perCol = Math.ceil(items.length / columnsCount);
  const cols = Array.from({ length: columnsCount }, (_, i) =>
    items.slice(i * perCol, (i + 1) * perCol)
  ).filter((c) => c.length > 0);

  return (
    <div
      ref={panelRef}
      className={cn(
        "absolute top-full z-50 mt-3 w-max max-w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-border bg-popover p-1.5",
        preferAlignEnd ? "right-0 left-auto origin-top-right" : "left-0 origin-top-left"
      )}
    >
      <div className="grid grid-cols-2 gap-x-1">
        {cols.map((col, colIdx) => (
          <div
            key={colIdx}
            className={cn(
              "min-w-[8.75rem]",
              colIdx === 0 && cols.length > 1 ? "border-r border-border/30 pr-1" : "pl-1"
            )}
          >
            <div className="flex flex-col gap-0.5">
              {col.map((sub) => (
                <Link key={sub.path} to={sub.path} className={itemClass(sub.path)}>
                  {t(`nav.${sub.key}`)}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
        { key: "presentation", path: "/presentation" },
        { key: "services", path: "/services" },
        { key: "team", path: "/team" },
        { key: "partners", path: "/partners" },
        { key: "contact", path: "/contact" },
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
        { key: "community", path: "/community" },
        { key: "opportunity", path: "/opportunities" },
      ],
    },
    {
      label: "nav.resources",
      items: [
        { key: "blog", path: "/blog" },
        { key: "documentation", path: "/documentation" },
        { key: "tools", path: "/tools" },
        { key: "gallery", path: "/gallery" },
      ],
    },
  ];

  const applyRequestedNavStructure = (groups: NavEntry[]): NavEntry[] => {
    const cleaned = groups
      .filter((entry) => {
        if (!("items" in entry)) {
          return entry.path !== "/contact" && entry.key !== "contact" && entry.key !== "opportunities" && entry.key !== "opportunity";
        }
        const normalizedLabel = entry.label.toLowerCase();
        return !normalizedLabel.includes("onboarding");
      })
      .map((entry) => {
        if (!("items" in entry)) return entry;

        const normalizedLabel = entry.label.toLowerCase();
        let items = entry.items.filter((item) => item.key !== "contact" && item.key !== "opportunities" && item.key !== "opportunity");

        if (
          normalizedLabel.includes("ecosystem") ||
          normalizedLabel.includes("ecosysteme") ||
          normalizedLabel.includes("ecosytem")
        ) {
          items = [
            { key: "blockchains", path: "/blockchains#blockchains" },
            { key: "validators", path: "/blockchains#validators" },
            { key: "events", path: "/blockchains#events" },
            { key: "community", path: "/community" },
            { key: "opportunity", path: "/opportunities" },
          ];
        }

        if (normalizedLabel.includes("resource") || normalizedLabel.includes("ressource")) {
          items = [
            { key: "blog", path: "/blog" },
            { key: "documentation", path: "/documentation" },
            { key: "tools", path: "/tools" },
            { key: "gallery", path: "/gallery" },
          ];
        }

        if (
          (normalizedLabel.includes("about") || normalizedLabel.includes("à propos") || normalizedLabel.includes("apropos")) &&
          !items.some((item) => item.key === "contact")
        ) {
          items = [...items, { key: "contact", path: "/contact" }];
        }

        return { ...entry, items };
      });

    const withoutProjectsGroup = cleaned.filter(
      (entry) =>
        !("items" in entry && (
          entry.label.toLowerCase().includes("projects") || entry.label.toLowerCase().includes("projets")
        ))
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
      } catch (error) {
        console.error("Failed to fetch menus, using fallback:", error);
        // Fallback statique pour éviter que l'application ne plante
        const fallbackNav: NavEntry[] = [
          { key: "home", path: "/" },
          {
            label: "nav.about",
            items: [
              { key: "about", path: "/about" },
              { key: "team", path: "/community#team" },
              { key: "partners", path: "/partners" },
              { key: "contact", path: "/contact" },
            ],
          },
          {
            label: "nav.ecosystem",
            items: [
              { key: "blockchains", path: "/blockchains" },
              { key: "validators", path: "/validators" },
              { key: "events", path: "/events" },
              { key: "community", path: "/community" },
              { key: "opportunity", path: "/opportunities" },
            ],
          },
          {
            label: "nav.resources",
            items: [
              { key: "blog", path: "/resources#blog" },
              { key: "documentation", path: "/resources#documentation" },
              { key: "tools", path: "/resources#tools" },
            ],
          },
        ];
        setNavGroups(applyRequestedNavStructure(fallbackNav));
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
    "px-4 py-2.5 text-base font-bold rounded-xl transition-colors whitespace-nowrap lg:px-5 lg:py-3 lg:text-[1.0625rem]";
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
            "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-1 ring-black/10 transition-transform hover:scale-105 hover:ring-black/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#ffb800] dark:ring-white/15 dark:hover:ring-white/30 sm:h-8 sm:w-8",
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
      {/* Bandeau or — même jaune que le CTA home « Découvrir Ynuka Labs » */}
      <div className="flex w-full flex-col">
        <div className="flex w-full min-h-[46px] min-w-0 flex-row items-center justify-between gap-3 bg-[#ffb800] px-4 py-2.5 text-[#111111] md:min-h-[52px] md:py-0 md:pl-5 md:pr-5 lg:min-h-[56px] lg:pl-8 lg:pr-10">
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex min-w-0 max-w-full items-center gap-2 text-xs font-bold text-[#111111] underline-offset-2 hover:underline sm:text-sm md:text-[0.95rem]"
          >
            <EnvelopeSimple className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" weight="duotone" />
            <span className="truncate sm:whitespace-normal sm:break-all">{EMAIL}</span>
          </a>
          <TopBarSocialIcons />
        </div>
        <div className="h-5 w-full shrink-0 bg-[#ffb800] sm:h-7 md:h-9 lg:h-10" aria-hidden />
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
            "dark:border-slate-600 dark:bg-slate-900 md:min-h-[3.5rem] md:gap-3 md:rounded-[1.125rem] md:py-3 md:pl-6 md:pr-5 lg:gap-4 lg:min-h-[3.75rem] lg:rounded-[1.25rem] lg:py-3.5 lg:pl-8 lg:pr-6"
          )}
        >
          <Link to="/" className="flex shrink-0 items-center gap-3 md:gap-3.5">
            <img src={logo} alt="Ynuka Labs" className="h-11 w-11 md:h-14 md:w-14" />
            <span className="font-display text-xl font-bold tracking-tight text-slate-800 dark:text-white md:text-2xl">
              Ynuka <span style={{ color: GOLD }}>Labs</span>
            </span>
          </Link>

          <div className="hidden min-w-0 flex-1 items-center justify-center gap-1 overflow-visible lg:flex lg:gap-2">
            {navGroups.map((item, index) =>
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
                    <CaretDown
                      weight="duotone"
                      size={18}
                      className={`h-4 w-4 shrink-0 md:h-[18px] md:w-[18px] ${openDropdown === item.label ? "rotate-180" : ""} transition-transform`}
                    />
                  </button>
                  {openDropdown === item.label && (
                    <NavDropdownPanel
                      items={item.items}
                      preferAlignEnd={
                        navGroups.slice(index + 1).every((entry) => !isGroup(entry)) ||
                        item.label.toLowerCase().includes("resource") ||
                        item.label.toLowerCase().includes("ressource")
                      }
                      isActive={isActive}
                      t={t}
                    />
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
              aria-label={t("common.menu")}
            >
              {mobileOpen ? <X weight="duotone" size={28} /> : <List weight="duotone" size={28} />}
            </Button>
          </div>
        </nav>
      </div>

      {/* Menu mobile */}
      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full z-40 max-h-[min(85vh,calc(100dvh-5rem))] overflow-y-auto border-b border-border bg-background/98 px-4 pb-8 pt-4 lg:hidden">
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
                    <CaretDown weight="duotone" size={20} className={`h-5 w-5 transition-transform ${mobileExpanded === item.label ? "rotate-180" : ""}`} />
                  </button>
                  {mobileExpanded === item.label && (
                    <div className="ml-3 flex flex-col gap-1 border-l-2 border-neutral-900/20 pl-4 dark:border-white/25">
                      {item.items.map((sub) => {
                        return (
                          <Link
                            key={sub.path}
                            to={sub.path}
                            onClick={() => setMobileOpen(false)}
                            className={cn(
                              "rounded-lg px-3 py-3 text-base font-bold",
                              isActive(sub.path)
                                ? "text-[#ffb800]"
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

