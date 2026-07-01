import logo from "@/assets/logo.jpg";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  ChartLineUp,
  Users,
  Shield,
  Article,
  ChatCircle,
  Envelope,
  HandHeart,
  Calendar,
  ClipboardText,
  Image,
  PaperPlaneTilt,
  Folder,
  BookOpen,
  UsersThree,
  SignOut,
  Gear,
  Activity,
  Bell,
  Briefcase,
  Handshake,
  Newspaper,
  CaretRight,
  CaretDown,
} from "@phosphor-icons/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { RESOURCE_LABELS, setToken } from "@/lib/api";
import { useState } from "react";

type SidebarItem = { url: string; label: string; icon: any };
type SidebarGroup = {
  label: string;
  items: SidebarItem[];
  icon?: any;
};

const sidebarGroups: SidebarGroup[] = [
  {
    label: "Administration",
    items: [
      { url: "/admin/users", label: "Utilisateurs", icon: Users },
      { url: "/admin/roles", label: "Gestion des rôles", icon: Shield },
    ],
  },
  {
    label: "Contenu",
    items: [
      { url: "/admin/blog_posts", label: "Articles", icon: Article },
      { url: "/admin/blog_comments", label: "Commentaires", icon: ChatCircle },
      { url: "/admin/contact_messages", label: "Messages contact", icon: Envelope },
    ],
  },
  {
    label: "Activités",
    items: [
      { url: "/admin/donations", label: "Dons", icon: HandHeart },
      { url: "/admin/events", label: "Événements", icon: Calendar },
      { url: "/admin/events/registrations", label: "Inscriptions", icon: ClipboardText },
    ],
  },
  {
    label: "Projets & Ressources",
    items: [
      { url: "/admin/projects", label: "Projets", icon: Folder },
      { url: "/admin/resource_items", label: "Ressources", icon: BookOpen },
      { url: "/admin/team_members", label: "Équipe", icon: UsersThree },
    ],
  },
  {
    label: "Opportunités",
    items: [
      { url: "/admin/opportunities", label: "Opportunités", icon: Briefcase },
      { url: "/admin/opportunities/applications", label: "Candidatures", icon: ClipboardText },
    ],
  },
  {
    label: "Partenariats",
    items: [
      { url: "/admin/partner_applications", label: "Demandes de partenariat", icon: Handshake },
    ],
  },
  {
    label: "Newsletter",
    items: [
      { url: "/admin/newsletter_subscribers", label: "Abonnés", icon: PaperPlaneTilt },
      { url: "/admin/newsletters", label: "Gestion des newsletters", icon: Newspaper },
    ],
  },
];

const systemItems: SidebarItem[] = [
  { url: "/admin/diagnostic", label: "Diagnostic", icon: Activity },
  { url: "/admin/settings", label: "Paramètres", icon: Gear },
];

interface AppSidebarProps {
  onNotificationsToggle?: (show: boolean) => void;
  showNotifications?: boolean;
}

export function AppSidebar({ onNotificationsToggle, showNotifications }: AppSidebarProps) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["Activités"]));

  const isActive = (url: string) =>
    url === "/admin" ? path === "/admin" || path === "/admin/" : path.startsWith(url);

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupLabel)) {
        next.delete(groupLabel);
      } else {
        next.add(groupLabel);
      }
      return next;
    });
  };

  const logout = () => {
    setToken(null);
    navigate({ to: "/login" });
  };

  const toggleNotifications = () => {
    const newState = !showNotifications;
    onNotificationsToggle?.(newState);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border/60 px-6 py-6">
        <div className="flex items-center gap-3 overflow-hidden">
          <img
            src={logo}
            alt="Ynuka Labs"
            className="h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-sidebar-primary/30"
          />
          <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold text-sidebar-foreground pl-3">Ynuka Labs</p>
            <p className="truncate text-xs text-sidebar-foreground/60 pl-3">Panel Admin</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-6 py-6">
        <SidebarGroup className="p-4">
          <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70">Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/admin")} tooltip="Dashboard">
                  <Link to="/admin">
                    <ChartLineUp className="size-4 shrink-0" />
                    <span className="truncate pl-3">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {sidebarGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.label);
          return (
            <SidebarGroup key={group.label} className="p-4">
              <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70 flex items-center justify-between cursor-pointer hover:text-sidebar-foreground" onClick={() => toggleGroup(group.label)}>
                <span className="text-sidebar-primary font-bold">{group.label}</span>
                {isExpanded ? <CaretDown className="size-3 text-sidebar-primary" /> : <CaretRight className="size-3 text-sidebar-primary" />}
              </SidebarGroupLabel>
              {isExpanded && (
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      return (
                        <SidebarMenuItem key={item.url}>
                          <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.label}>
                            <Link to={item.url}>
                              <Icon className="size-4 shrink-0" />
                              <span className="truncate pl-3 text-sidebar-foreground/80">{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              )}
            </SidebarGroup>
          );
        })}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleNotifications}
              tooltip="Notifications"
              className={showNotifications ? "bg-sidebar-accent" : ""}
            >
              <Bell className="size-4 shrink-0" />
              <span>Notifications</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {systemItems.map((it) => {
            const Icon = it.icon;
            return (
              <SidebarMenuItem key={it.url}>
                <SidebarMenuButton asChild isActive={isActive(it.url)} tooltip={it.label}>
                  <Link to={it.url}>
                    <Icon className="size-4 shrink-0" />
                    <span>{it.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Déconnexion">
              <SignOut className="size-4 shrink-0" />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
