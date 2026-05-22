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

const items: { url: string; label: string; icon: any }[] = [
  { url: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { url: "/admin/users", label: RESOURCE_LABELS.users, icon: Users },
  { url: "/admin/user_roles", label: RESOURCE_LABELS.user_roles, icon: Shield },
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

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();

  const isActive = (url: string) =>
    url === "/admin" ? path === "/admin" : path.startsWith(url);

  const logout = () => {
    setToken(null);
    navigate({ to: "/login" });
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="px-4 py-5">
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Ynuka Labs"
            className="h-9 w-9 rounded-full object-cover"
          />

          <div className="font-semibold text-sidebar-foreground tracking-tight">
            Ynuka Labs
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => (
                <SidebarMenuItem key={it.url}>
                  <SidebarMenuButton asChild isActive={isActive(it.url)}>
                    <Link to={it.url} className="flex items-center gap-2">
                      <it.icon className="h-4 w-4" />
                      <span>{it.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin/diagnostic" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span>Diagnostic</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link to="/admin/settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Paramètres</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span>Déconnexion</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
