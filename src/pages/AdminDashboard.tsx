import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Plus, Trash2, Users, Calendar, LogOut, Eye, FileText, Mail, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStrapiAuth } from "@/hooks/useStrapiAuth";
import { getJwtFromStorage, strapiFetch } from "@/lib/strapi";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

interface Event {
  id: string;
  title: string;
  title_fr: string | null;
  description: string | null;
  description_fr: string | null;
  date: string;
  location: string;
  type: string;
  upcoming: boolean;
}

interface Registration {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  event_id: string;
}

interface BlogPost {
  id: string;
  title: string;
  title_fr: string | null;
  content: string | null;
  content_fr: string | null;
  excerpt: string | null;
  excerpt_fr: string | null;
  category: string;
  published: boolean;
  createdAt: string;
}

interface Subscriber {
  id: string;
  email: string;
  subscribed_at: string;
  active: boolean;
}

type TabKey = "events" | "registrations" | "blog" | "newsletter";

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user, isAdmin, signOut, loading: authLoading } = useStrapiAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("events");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showBlogDialog, setShowBlogDialog] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const [newEvent, setNewEvent] = useState({
    title: "", title_fr: "", description: "", description_fr: "",
    date: "", location: "", type: "Workshop", upcoming: true,
  });

  const [newPost, setNewPost] = useState({
    title: "", title_fr: "", content: "", content_fr: "",
    excerpt: "", excerpt_fr: "", category: "Announcement", published: false,
  });

  const getAuthToken = () => getJwtFromStorage();

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) navigate("/admin/login");
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) { fetchEvents(); fetchRegistrations(); fetchBlogPosts(); fetchSubscribers(); }
  }, [isAdmin]);

  const fetchEvents = async () => {
    const token = getAuthToken();
    if (!token) return;
    type StrapiEventItem = {
      id: string | number;
      attributes?: Partial<Event>;
    };

    const res = await strapiFetch<{ data: unknown[] }>(
      "/api/events?sort=createdAt:desc&pagination[pageSize]=100",
      { token }
    );
    const items = res.data || [];
    setEvents(
      items
        .map((item) => {
          const it = item as StrapiEventItem;
          const attrs = it.attributes ?? {};
          return {
            id: String(it.id),
            title: (attrs as Event).title ?? "",
            title_fr: (attrs as Event).title_fr ?? null,
            description: (attrs as Event).description ?? null,
            description_fr: (attrs as Event).description_fr ?? null,
            date: (attrs as Event).date ?? "",
            location: (attrs as Event).location ?? "",
            type: (attrs as Event).type ?? "",
            upcoming: Boolean((attrs as Event).upcoming),
          } satisfies Event;
        })
        .filter((e) => e.title && e.date && e.location && e.type)
    );
  };
  const fetchRegistrations = async () => {
    const token = getAuthToken();
    if (!token) return;
    type StrapiRegistrationItem = {
      id: string | number;
      attributes?: {
        full_name?: string;
        email?: string;
        phone?: string | null;
        createdAt?: string;
        created_at?: string;
        event?: { data?: { id?: string | number } };
      };
    };

    const res = await strapiFetch<{ data: unknown[] }>(
      "/api/event-registrations?sort=createdAt:desc&populate=event&pagination[pageSize]=100",
      { token }
    );
    const items = res.data || [];
    setRegistrations(
      items.map((item) => {
        const it = item as StrapiRegistrationItem;
        const attrs = it.attributes ?? {};
        return {
          id: String(it.id),
          full_name: attrs.full_name ?? "",
          email: attrs.email ?? "",
          phone: attrs.phone ?? null,
          createdAt: attrs.createdAt ?? attrs.created_at ?? "",
          event_id: String(attrs.event?.data?.id ?? ""),
        } satisfies Registration;
      })
    );
  };
  const fetchBlogPosts = async () => {
    const token = getAuthToken();
    if (!token) return;
    type StrapiBlogPostItem = {
      id: string | number;
      attributes?: Partial<BlogPost>;
    };

    const res = await strapiFetch<{ data: unknown[] }>(
      "/api/blog-posts?sort=createdAt:desc&pagination[pageSize]=100",
      { token }
    );
    const items = res.data || [];
    setBlogPosts(
      items.map((item) => {
        const it = item as StrapiBlogPostItem;
        const attrs = it.attributes ?? {};
        return {
          id: String(it.id),
          title: (attrs as BlogPost).title ?? "",
          title_fr: (attrs as BlogPost).title_fr ?? null,
          content: (attrs as BlogPost).content ?? null,
          content_fr: (attrs as BlogPost).content_fr ?? null,
          excerpt: (attrs as BlogPost).excerpt ?? null,
          excerpt_fr: (attrs as BlogPost).excerpt_fr ?? null,
          category: (attrs as BlogPost).category ?? "",
          published: Boolean((attrs as BlogPost).published),
          createdAt: (attrs as BlogPost).createdAt ?? "",
        } satisfies BlogPost;
      })
    );
  };
  const fetchSubscribers = async () => {
    const token = getAuthToken();
    if (!token) return;
    type StrapiSubscriberItem = {
      id: string | number;
      attributes?: {
        email?: string;
        subscribed_at?: string;
        active?: boolean;
      };
    };

    const res = await strapiFetch<{ data: unknown[] }>(
      "/api/newsletter-subscribers?sort=subscribed_at:desc&pagination[pageSize]=100",
      { token }
    );
    const items = res.data || [];
    setSubscribers(
      items.map((item) => {
        const it = item as StrapiSubscriberItem;
        const attrs = it.attributes ?? {};
        return {
          id: String(it.id),
          email: attrs.email ?? "",
          subscribed_at: attrs.subscribed_at ?? "",
          active: Boolean(attrs.active),
        } satisfies Subscriber;
      })
    );
  };

  const handleCreateEvent = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      await strapiFetch("/api/events", {
        token,
        method: "POST",
        body: JSON.stringify({
          data: {
            title: newEvent.title,
            title_fr: newEvent.title_fr || null,
            description: newEvent.description || null,
            description_fr: newEvent.description_fr || null,
            date: newEvent.date,
            location: newEvent.location,
            type: newEvent.type,
            upcoming: newEvent.upcoming,
          },
        }),
      });

      toast({ title: t("admin.eventCreated") });
      setShowCreateDialog(false);
      setNewEvent({ title: "", title_fr: "", description: "", description_fr: "", date: "", location: "", type: "Workshop", upcoming: true });
      await fetchEvents();
    } catch {
      toast({ title: t("admin.error"), variant: "destructive" });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      await strapiFetch(`/api/events/${id}`, { token, method: "DELETE" });
      toast({ title: t("admin.eventDeleted") });
      await fetchEvents();
      await fetchRegistrations();
    } catch {
      toast({ title: t("admin.error"), variant: "destructive" });
    }
  };

  const handleDeleteRegistration = async (id: string) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      await strapiFetch(`/api/event-registrations/${id}`, { token, method: "DELETE" });
      toast({ title: t("admin.registrationDeleted") });
      await fetchRegistrations();
    } catch {
      toast({ title: t("admin.error"), variant: "destructive" });
    }
  };

  const handleCreateOrUpdatePost = async () => {
    const token = getAuthToken();
    if (!token) return;

    const payload = {
      title: newPost.title,
      title_fr: newPost.title_fr || null,
      content: newPost.content || null,
      content_fr: newPost.content_fr || null,
      excerpt: newPost.excerpt || null,
      excerpt_fr: newPost.excerpt_fr || null,
      category: newPost.category,
      published: newPost.published,
    };

    try {
      if (editingPost) {
        await strapiFetch(`/api/blog-posts/${editingPost.id}`, {
          token,
          method: "PUT",
          body: JSON.stringify({ data: payload }),
        });
        toast({ title: t("admin.postUpdated") });
      } else {
        await strapiFetch("/api/blog-posts", {
          token,
          method: "POST",
          body: JSON.stringify({ data: payload }),
        });
        toast({ title: t("admin.postCreated") });
      }
    } catch {
      toast({ title: t("admin.error"), variant: "destructive" });
    }
    setShowBlogDialog(false);
    setEditingPost(null);
    setNewPost({ title: "", title_fr: "", content: "", content_fr: "", excerpt: "", excerpt_fr: "", category: "Announcement", published: false });
    await fetchBlogPosts();
  };

  const handleEditPost = (post: BlogPost) => {
    setEditingPost(post);
    setNewPost({
      title: post.title, title_fr: post.title_fr || "", content: post.content || "",
      content_fr: post.content_fr || "", excerpt: post.excerpt || "", excerpt_fr: post.excerpt_fr || "",
      category: post.category, published: post.published,
    });
    setShowBlogDialog(true);
  };

  const handleDeletePost = async (id: string) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      await strapiFetch(`/api/blog-posts/${id}`, { token, method: "DELETE" });
      toast({ title: t("admin.postDeleted") });
      await fetchBlogPosts();
    } catch {
      toast({ title: t("admin.error"), variant: "destructive" });
    }
  };

  const handleDeleteSubscriber = async (id: string) => {
    const token = getAuthToken();
    if (!token) return;
    try {
      await strapiFetch(`/api/newsletter-subscribers/${id}`, { token, method: "DELETE" });
      toast({ title: t("admin.subscriberDeleted") });
      await fetchSubscribers();
    } catch {
      toast({ title: t("admin.error"), variant: "destructive" });
    }
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const filteredRegistrations = selectedEventId
    ? registrations.filter((r) => r.event_id === selectedEventId) : registrations;

  if (authLoading) return <div className="min-h-[70vh] flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;

  const tabs: { key: TabKey; icon: React.ElementType; label: string }[] = [
    { key: "events", icon: Calendar, label: t("admin.events") },
    { key: "registrations", icon: Users, label: t("admin.registrations") },
    { key: "blog", icon: FileText, label: t("admin.blog") },
    { key: "newsletter", icon: Mail, label: t("admin.newsletter") },
  ];

  return (
    <div className="py-10">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold"><span className="gradient-text">{t("admin.dashboard")}</span></h1>
              <p className="text-muted-foreground text-sm mt-1">{user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleSignOut}><LogOut className="h-4 w-4 mr-2" /> {t("admin.logout")}</Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="glass rounded-xl p-4 text-center">
              <Calendar className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{events.length}</p>
              <p className="text-xs text-muted-foreground">{t("admin.totalEvents")}</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <Users className="h-6 w-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold">{registrations.length}</p>
              <p className="text-xs text-muted-foreground">{t("admin.totalRegistrations")}</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold">{blogPosts.length}</p>
              <p className="text-xs text-muted-foreground">{t("admin.totalPosts")}</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <Mail className="h-6 w-6 text-accent mx-auto mb-2" />
              <p className="text-2xl font-bold">{subscribers.length}</p>
              <p className="text-xs text-muted-foreground">{t("admin.totalSubscribers")}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                <tab.icon className="h-4 w-4 inline mr-1" /> {tab.label}
              </button>
            ))}
          </div>

          {/* Events Tab */}
          {activeTab === "events" && (
            <div>
              <div className="flex justify-end mb-4">
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild><Button variant="glow"><Plus className="h-4 w-4 mr-1" /> {t("admin.addEvent")}</Button></DialogTrigger>
                  <DialogContent className="max-w-lg bg-card">
                    <DialogHeader><DialogTitle>{t("admin.addEvent")}</DialogTitle></DialogHeader>
                    <div className="space-y-3 mt-4">
                      <Input placeholder={t("admin.titleEn")} value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} />
                      <Input placeholder={t("admin.titleFr")} value={newEvent.title_fr} onChange={(e) => setNewEvent({ ...newEvent, title_fr: e.target.value })} />
                      <Textarea placeholder={t("admin.descEn")} value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} />
                      <Textarea placeholder={t("admin.descFr")} value={newEvent.description_fr} onChange={(e) => setNewEvent({ ...newEvent, description_fr: e.target.value })} />
                      <Input placeholder={t("admin.date")} value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} />
                      <Input placeholder={t("admin.location")} value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} />
                      <Select value={newEvent.type} onValueChange={(v) => setNewEvent({ ...newEvent, type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Workshop">Workshop</SelectItem>
                          <SelectItem value="Hackathon">Hackathon</SelectItem>
                          <SelectItem value="Meetup">Meetup</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={newEvent.upcoming} onChange={(e) => setNewEvent({ ...newEvent, upcoming: e.target.checked })} id="upcoming" />
                        <label htmlFor="upcoming" className="text-sm">{t("admin.upcoming")}</label>
                      </div>
                      <Button variant="glow" className="w-full" onClick={handleCreateEvent}>{t("admin.create")}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="glass rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.titleEn")}</TableHead>
                      <TableHead>{t("admin.date")}</TableHead>
                      <TableHead>{t("admin.type")}</TableHead>
                      <TableHead>{t("admin.status")}</TableHead>
                      <TableHead className="text-right">{t("admin.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{event.date}</TableCell>
                        <TableCell><span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{event.type}</span></TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${event.upcoming ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {event.upcoming ? t("events.upcoming") : t("events.past")}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteEvent(event.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {events.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t("admin.noEvents")}</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Registrations Tab */}
          {activeTab === "registrations" && (
            <div>
              <div className="mb-4">
                <Select value={selectedEventId || "all"} onValueChange={(v) => setSelectedEventId(v === "all" ? null : v)}>
                  <SelectTrigger className="w-64"><SelectValue placeholder={t("admin.filterByEvent")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("admin.allEvents")}</SelectItem>
                    {events.map((e) => <SelectItem key={e.id} value={e.id}>{e.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="glass rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.name")}</TableHead>
                      <TableHead>{t("admin.email")}</TableHead>
                      <TableHead>{t("admin.phone")}</TableHead>
                      <TableHead>{t("admin.registeredAt")}</TableHead>
                      <TableHead className="text-right">{t("admin.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRegistrations.map((reg) => (
                      <TableRow key={reg.id}>
                        <TableCell className="font-medium">{reg.full_name}</TableCell>
                        <TableCell>{reg.email}</TableCell>
                        <TableCell>{reg.phone || "—"}</TableCell>
                        <TableCell>{new Date(reg.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteRegistration(reg.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredRegistrations.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t("admin.noRegistrations")}</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Blog Tab */}
          {activeTab === "blog" && (
            <div>
              <div className="flex justify-end mb-4">
                <Dialog open={showBlogDialog} onOpenChange={(open) => { setShowBlogDialog(open); if (!open) { setEditingPost(null); setNewPost({ title: "", title_fr: "", content: "", content_fr: "", excerpt: "", excerpt_fr: "", category: "Announcement", published: false }); } }}>
                  <DialogTrigger asChild><Button variant="glow"><Plus className="h-4 w-4 mr-1" /> {t("admin.addPost")}</Button></DialogTrigger>
                  <DialogContent className="max-w-lg bg-card max-h-[85vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editingPost ? t("admin.editPost") : t("admin.addPost")}</DialogTitle></DialogHeader>
                    <div className="space-y-3 mt-4">
                      <Input placeholder={t("admin.titleEn")} value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
                      <Input placeholder={t("admin.titleFr")} value={newPost.title_fr} onChange={(e) => setNewPost({ ...newPost, title_fr: e.target.value })} />
                      <Textarea placeholder={t("admin.excerptEn")} value={newPost.excerpt} onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })} />
                      <Textarea placeholder={t("admin.excerptFr")} value={newPost.excerpt_fr} onChange={(e) => setNewPost({ ...newPost, excerpt_fr: e.target.value })} />
                      <Textarea placeholder={t("admin.contentEn")} value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })} className="min-h-[120px]" />
                      <Textarea placeholder={t("admin.contentFr")} value={newPost.content_fr} onChange={(e) => setNewPost({ ...newPost, content_fr: e.target.value })} className="min-h-[120px]" />
                      <Select value={newPost.category} onValueChange={(v) => setNewPost({ ...newPost, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Announcement">Announcement</SelectItem>
                          <SelectItem value="Event Recap">Event Recap</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Innovation">Innovation</SelectItem>
                          <SelectItem value="Community">Community</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex items-center gap-2">
                        <input type="checkbox" checked={newPost.published} onChange={(e) => setNewPost({ ...newPost, published: e.target.checked })} id="published" />
                        <label htmlFor="published" className="text-sm">{t("admin.published")}</label>
                      </div>
                      <Button variant="glow" className="w-full" onClick={handleCreateOrUpdatePost}>
                        {editingPost ? t("admin.updatePost") : t("admin.createPost")}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="glass rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.titleEn")}</TableHead>
                      <TableHead>{t("admin.category")}</TableHead>
                      <TableHead>{t("admin.status")}</TableHead>
                      <TableHead>{t("admin.date")}</TableHead>
                      <TableHead className="text-right">{t("admin.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="font-medium">{post.title}</TableCell>
                        <TableCell><span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">{post.category}</span></TableCell>
                        <TableCell>
                          <span className={`text-xs px-2 py-1 rounded-full ${post.published ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {post.published ? t("admin.publishedStatus") : t("admin.draft")}
                          </span>
                        </TableCell>
                        <TableCell>{new Date(post.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right flex justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditPost(post)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePost(post.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {blogPosts.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">{t("admin.noPosts")}</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Newsletter Tab */}
          {activeTab === "newsletter" && (
            <div>
              <div className="glass rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("admin.email")}</TableHead>
                      <TableHead>{t("admin.subscribedAt")}</TableHead>
                      <TableHead className="text-right">{t("admin.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.email}</TableCell>
                        <TableCell>{new Date(sub.subscribed_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteSubscriber(sub.id)} className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {subscribers.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground py-8">{t("admin.noSubscribers")}</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
