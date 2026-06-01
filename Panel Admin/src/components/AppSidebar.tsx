import logo from "@/assets/logo.jpg";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  MessageSquare,
  Mail,
  HeartHandshake,
  Calendar,
  ClipboardList,
  Image as ImageIcon,
  Send,
  FolderKanban,
  BookOpen,
  UsersRound,
  LogOut,
  Settings,
  Activity,
  Bell,
  type LucideIcon,
} from "lucide-react";
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

type SidebarItem = { url: string; label: string; icon: LucideIcon };

const items: SidebarItem[] = [
  { url: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { url: "/admin/users", label: RESOURCE_LABELS.users, icon: Users },
  { url: "/admin/roles", label: "Gestion des rôles", icon: Shield },
  { url: "/admin/blog_posts", label: RESOURCE_LABELS.blog_posts, icon: FileText },
  { url: "/admin/blog_comments", label: RESOURCE_LABELS.blog_comments, icon: MessageSquare },
  { url: "/admin/contact_messages", label: RESOURCE_LABELS.contact_messages, icon: Mail },
  { url: "/admin/donations", label: RESOURCE_LABELS.donations, icon: HeartHandshake },
  { url: "/admin/events", label: RESOURCE_LABELS.events, icon: Calendar },
  { url: "/admin/event_registrations", label: RESOURCE_LABELS.event_registrations, icon: ClipboardList },
  { url: "/admin/gallery_images", label: RESOURCE_LABELS.gallery_images, icon: ImageIcon },
  { url: "/admin/newsletter_subscribers", label: RESOURCE_LABELS.newsletter_subscribers, icon: Send },
  { url: "/admin/projects", label: RESOURCE_LABELS.projects, icon: FolderKanban },
  { url: "/admin/resource_items", label: RESOURCE_LABELS.resource_items, icon: BookOpen },
  { url: "/admin/team_members", label: RESOURCE_LABELS.team_members, icon: UsersRound },
];

const footerItems: SidebarItem[] = [
  { url: "/admin/diagnostic", label: "Diagnostic", icon: Activity },
  { url: "/admin/settings", label: "Paramètres", icon: Settings },
];

interface AppSidebarProps {
  onNotificationsToggle?: (show: boolean) => void;
  showNotifications?: boolean;
}

export function AppSidebar({ onNotificationsToggle, showNotifications }: AppSidebarProps) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const isActive = (url: string) =>
    url === "/admin" ? path === "/admin" || path === "/admin/" : path.startsWith(url);

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
          <SidebarGroupLabel className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70">Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => {
                const Icon = it.icon;
                return (
                  <SidebarMenuItem key={it.url}>
                    <SidebarMenuButton asChild isActive={isActive(it.url)} tooltip={it.label}>
                      <Link to={it.url}>
                        {Icon ? <Icon className="size-4 shrink-0" strokeWidth={2} /> : null}
                        <span className="truncate pl-3">{it.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/60 p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleNotifications}
              tooltip="Notifications"
              className={showNotifications ? "bg-sidebar-accent" : ""}
            >
              <Bell className="size-4 shrink-0" strokeWidth={2} />
              <span>Notifications</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {footerItems.map((it) => {
            const Icon = it.icon;
            return (
              <SidebarMenuItem key={it.url}>
                <SidebarMenuButton asChild isActive={isActive(it.url)} tooltip={it.label}>
                  <Link to={it.url}>
                    {Icon ? <Icon className="size-4 shrink-0" strokeWidth={2} /> : null}
                    <span>{it.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} tooltip="Déconnexion">
              <LogOut className="size-4 shrink-0" strokeWidth={2} />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
