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
  CircleHelp,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RESOURCE_LABELS, setToken } from "@/lib/api";

const FALLBACK_ICON: LucideIcon = CircleHelp;

type SidebarItem = { url: string; label: string; icon?: LucideIcon };

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
    <TooltipProvider>
      <Sidebar collapsible="icon" className="border-r-0">
        <SidebarHeader className="px-4 py-5">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-help">
                <img
                  src={logo}
                  alt="Ynuka Labs"
                  className="h-9 w-9 rounded-full object-cover flex-shrink-0"
                />
                <div className="font-semibold text-sidebar-foreground tracking-tight truncate">
                  Ynuka Labs
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Ynuka Labs — Panel Admin
            </TooltipContent>
          </Tooltip>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Administration</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((it) => {
                  const IconComponent =
                    typeof it.icon === "function" ? it.icon : FALLBACK_ICON;
                  return (
                  <SidebarMenuItem key={it.url}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton asChild isActive={isActive(it.url)}>
                          <Link to={it.url} className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{it.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="font-medium">
                        {it.label}
                      </TooltipContent>
                    </Tooltip>
                  </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild>
                    <Link to="/admin/diagnostic" className="flex items-center gap-2">
                      <Activity className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Diagnostic</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  Diagnostic
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton asChild>
                    <Link to="/admin/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Paramètres</span>
                    </Link>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  Paramètres
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarMenuButton onClick={logout}>
                    <LogOut className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Déconnexion</span>
                  </SidebarMenuButton>
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  Déconnexion
                </TooltipContent>
              </Tooltip>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    </TooltipProvider>
  );
}
