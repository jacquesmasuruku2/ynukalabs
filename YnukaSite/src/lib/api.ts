/**
 * Ynuka Site → Admin Panel (Prisma / Cockroach) as single content source.
 * Set VITE_ADMIN_API_URL (e.g. http://localhost:3000 or https://admin.ynukalabs.com).
 */

const ADMIN_API_BASE = (
  import.meta.env.VITE_ADMIN_API_URL ||
  import.meta.env.VITE_API_URL ||
  "https://admin.ynukalabs.com"
).replace(/\/$/, "");

const API_ROOT = `${ADMIN_API_BASE}/api`;

function pickOptionalUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const url = value.trim();
  return url ? url : null;
}

function extractYoutubeUrl(text: string): string | null {
  const match = text.match(
    /https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=[\w-]+[^\s"'<>]*|youtu\.be\/[\w-]+)/i
  );
  return match ? match[0] : null;
}

function contentToString(content: unknown): string {
  if (content == null) return "";
  if (typeof content === "string") return content;
  try {
    return JSON.stringify(content);
  } catch {
    return String(content);
  }
}

async function adminGet<T = unknown>(path: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
  const url = new URL(`${API_ROOT}${path.startsWith("/") ? path : `/${path}`}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    url.searchParams.set(key, String(value));
  });
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Admin API ${url.pathname} failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

async function adminPost<T = unknown>(path: string, body: Record<string, unknown>): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_ROOT}${path.startsWith("/") ? path : `/${path}`}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    const error = new Error("Le service d'inscription est momentanément indisponible. Réessayez dans quelques instants.") as Error & { code?: string };
    error.code = "NETWORK_ERROR";
    throw error;
  }
  if (!response.ok) {
    const err = (await response.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
    };
    const message = err.error || `Admin API POST failed: ${response.status}`;
    const error = new Error(message) as Error & { status?: number; code?: string };
    error.status = response.status;
    error.code = err.code;
    throw error;
  }
  return response.json() as Promise<T>;
}

async function adminPatch<T = unknown>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_ROOT}${path.startsWith("/") ? path : `/${path}`}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || `Admin API PATCH failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

/** @deprecated kept for rare PHP-only endpoints; prefer adminGet/adminPost */
export async function fetchFromApi<T = unknown>(
  _action: string,
  _params: Record<string, string | number> = {},
  _body?: Record<string, unknown>
): Promise<T> {
  throw new Error("fetchFromApi (PHP) is deprecated — use Admin Panel API via VITE_ADMIN_API_URL");
}

export async function subscribeToNewsletter(
  name: string,
  email: string,
  interests: string[] = ["actualites"]
): Promise<{ success: boolean; message?: string }> {
  const result = await adminPost<{ message?: string }>("/newsletter", {
    name: name.trim() || undefined,
    email: email.trim(),
    interests,
  });
  return { success: true, message: result.message };
}

export async function submitContactForm(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<{ success: boolean; message?: string }> {
  await adminPost("/contact", data);
  return { success: true };
}

export async function submitPartnershipForm(data: {
  companyName: string;
  companyWebsite?: string;
  industry?: string;
  contactPerson: string;
  email: string;
  phone?: string;
  partnershipType: string;
  description?: string;
}): Promise<{ success: boolean; id?: string; message?: string }> {
  const result = await adminPost<{ success?: boolean; id?: string; message?: string }>(
    "/partnerships",
    {
      companyName: data.companyName,
      companyWebsite: data.companyWebsite || null,
      industry: data.industry || null,
      contactPerson: data.contactPerson,
      email: data.email,
      phone: data.phone || null,
      partnershipType: data.partnershipType,
      description: data.description || null,
    }
  );
  return { success: true, id: result.id, message: result.message };
}

export async function fetchEvents(limit = 100) {
  const rows = await adminGet<any[]>("/events", { limit });
  return (Array.isArray(rows) ? rows : []).map((item) => ({
    id: String(item.id),
    slug: item.slug || String(item.id),
    title: item.title || "",
    title_fr: item.titleFr || item.title_fr || null,
    description: item.description || null,
    description_fr: item.descriptionFr || item.description_fr || null,
    date: item.date || "",
    location: item.location || "",
    type: item.type || "",
    upcoming: !!item.upcoming,
    time: item.time || null,
    imageUrl: item.imageUrl || item.image_url || null,
    capacity: item.capacity || null,
    recapUrl: pickOptionalUrl(item.recapUrl || item.recap_url),
    youtubeUrl: pickOptionalUrl(
      item.youtubeUrl ||
        item.youtube_url ||
        extractYoutubeUrl(`${item.description || ""} ${item.descriptionFr || item.description_fr || ""}`)
    ),
  }));
}

export async function fetchEvent(slugOrId: string) {
  const candidateRequests = [
    async () => {
      const item = await adminGet<any>("/events", { slug: slugOrId });
      return Array.isArray(item) ? item[0] ?? null : item ?? null;
    },
    async () => {
      const item = await adminGet<any>("/events", { id: slugOrId });
      return item ?? null;
    },
  ];

  for (const request of candidateRequests) {
    try {
      const item = await request();
      if (!item || item.error) continue;
      return {
        id: String(item.id),
        slug: item.slug || slugOrId,
        title: item.title || "",
        title_fr: item.titleFr || null,
        description: item.description || null,
        description_fr: item.descriptionFr || null,
        date: item.date || "",
        location: item.location || "",
        type: item.type || "",
        upcoming: !!item.upcoming,
        time: item.time || null,
        imageUrl: item.imageUrl || null,
        capacity: item.capacity || null,
        recapUrl: pickOptionalUrl(item.recapUrl),
        youtubeUrl: pickOptionalUrl(
          item.youtubeUrl || extractYoutubeUrl(`${item.description || ""} ${item.descriptionFr || ""}`)
        ),
      };
    } catch {
      // continue to fallback candidate
    }
  }

  return null;
}

export async function fetchBlogPosts(limit = 100) {
  const rows = await adminGet<any[]>("/articles", { limit });
  return (Array.isArray(rows) ? rows : []).map((item) => ({
    id: String(item.id),
    slug: item.slug || String(item.id),
    title: item.title || "",
    title_fr: item.title || null,
    excerpt: item.excerpt || null,
    excerpt_fr: item.excerpt || null,
    category: item.category?.title || item.category || "Blog",
    content: contentToString(item.content),
    cover_url: item.mainImageUrl || item.cover_url || null,
    created_at: item.publishedAt || item.createdAt || "",
    views: Number(item.views || 0),
    likes: 0,
  }));
}

export async function fetchBlogPost(slugOrId: string) {
  const candidateRequests = [
    async () => {
      const item = await adminGet<any>("/articles", { slug: slugOrId });
      return Array.isArray(item) ? item[0] ?? null : item ?? null;
    },
    async () => {
      const item = await adminGet<any>("/articles", { id: slugOrId });
      return item ?? null;
    },
  ];

  for (const request of candidateRequests) {
    try {
      const item = await request();
      if (!item || item.error) continue;
      return {
        id: String(item.id),
        slug: item.slug || slugOrId,
        title: item.title || "",
        title_fr: item.title || null,
        excerpt: item.excerpt || null,
        excerpt_fr: item.excerpt || null,
        category: item.category?.title || "Blog",
        content: contentToString(item.content),
        cover_url: item.mainImageUrl || null,
        created_at: item.publishedAt || item.createdAt || "",
        views: Number(item.views || 0),
        likes: 0,
      };
    } catch {
      // continue to fallback candidate
    }
  }

  return null;
}

export async function fetchBlogComments(articleId: string) {
  return adminGet<
    Array<{
      id: string;
      author_name: string;
      content: string;
      created_at: string;
      replies?: Array<{ id: string; author_name: string; content: string; created_at: string }>;
    }>
  >('/blog-comments', { articleId });
}

export async function submitBlogComment(data: { articleId: string; authorName: string; authorEmail: string; content: string }) {
  return adminPost<{ id: string; author_name: string; content: string; created_at: string }>('/blog-comments', data);
}

export async function submitBlogCommentReply(data: { commentId: string; authorName: string; authorEmail: string; content: string }) {
  return adminPost<{ id: string; author_name: string; content: string; created_at: string }>('/blog-comments/replies', data);
}

export async function fetchContentReactions(resourceType: string, resourceId: string, userEmail?: string) {
  return adminGet<{ thumb: number; heart: number; user: 'thumb' | 'heart' | null }>('/content-reactions', {
    resourceType,
    resourceId,
    userEmail: userEmail || '',
  });
}

export async function toggleContentReaction(data: {
  resourceType: string;
  resourceId: string;
  userEmail: string;
  reactionType: 'thumb' | 'heart';
}) {
  return adminPost<{ thumb: number; heart: number; user: 'thumb' | 'heart' | null }>('/content-reactions', data);
}

export async function fetchOpportunities(limit = 100) {
  const rows = await adminGet<any[]>("/opportunities", { limit });
  return (Array.isArray(rows) ? rows : []).map((item) => ({
    id: String(item.id),
    title: item.title || "",
    title_fr: item.titleFr || null,
    slug: item.slug || "",
    excerpt: item.excerpt || null,
    excerpt_fr: item.excerptFr || null,
    category: item.category || "General",
    content: item.content || null,
    content_fr: item.contentFr || null,
    cover_url: item.coverUrl || null,
    created_at: item.createdAt || "",
    deadline: null,
    status: null,
    published: !!item.published,
  }));
}

export async function fetchOpportunity(id: string) {
  const item = await adminGet<any>("/opportunities", { id });
  return {
    id: String(item.id),
    title: item.title || "",
    title_fr: item.titleFr || null,
    slug: item.slug || "",
    excerpt: item.excerpt || null,
    excerpt_fr: item.excerptFr || null,
    category: item.category || "General",
    content: item.content || null,
    content_fr: item.contentFr || null,
    cover_url: item.coverUrl || null,
    created_at: item.createdAt || "",
  };
}

export async function fetchProjects(limit = 100) {
  const rows = await adminGet<any[]>("/projects", { limit });
  const list = Array.isArray(rows) ? rows : [];
  return list.map((item) => ({
    id: String(item.id),
    slug: item.slug || String(item.id),
    title: item.title || "",
    category: item.category || "",
    description: item.description || "",
    featured_image: item.featuredImage || null,
    repository_url: item.repositoryUrl || null,
    live_url: item.liveUrl || null,
    created_at: item.createdAt || "",
    show_on_home: !!item.showOnHome,
    tags: [] as string[],
  }));
}

export async function fetchProjectBySlug(slug: string) {
  const trimmed = slug.trim();
  if (!trimmed) return null;
  try {
    const row = await adminGet<any>("/projects", { slug: trimmed });
    if (row && !Array.isArray(row) && row.id) {
      return {
        id: String(row.id),
        slug: row.slug || trimmed,
        title: row.title || "",
        category: row.category || "",
        description: row.description || "",
        featured_image: row.featuredImage || null,
        repository_url: row.repositoryUrl || null,
        live_url: row.liveUrl || null,
        created_at: row.createdAt || "",
        show_on_home: !!row.showOnHome,
        tags: [] as string[],
      };
    }
    if (Array.isArray(row) && row.length === 1) {
      const item = row[0];
      return {
        id: String(item.id),
        slug: item.slug || trimmed,
        title: item.title || "",
        category: item.category || "",
        description: item.description || "",
        featured_image: item.featuredImage || null,
        repository_url: item.repositoryUrl || null,
        live_url: item.liveUrl || null,
        created_at: item.createdAt || "",
        show_on_home: !!item.showOnHome,
        tags: [] as string[],
      };
    }
  } catch {
    // fallback below
  }

  const all = await fetchProjects(200);
  return (
    all.find((p) => p.slug === trimmed) ||
    all.find((p) => p.id === trimmed) ||
    null
  );
}

export async function fetchHomeProjects(limit = 4) {
  const rows = await adminGet<any[]>("/projects", { limit, home: 1 });
  return (Array.isArray(rows) ? rows : [])
    .map((item) => ({
      id: String(item.id),
      slug: item.slug || String(item.id),
      title: item.title || "",
      category: item.category || "",
      description: item.description || "",
      featured_image: item.featuredImage || null,
      repository_url: item.repositoryUrl || null,
      live_url: item.liveUrl || null,
      created_at: item.createdAt || "",
      show_on_home: true,
      tags: [] as string[],
    }))
    .slice(0, limit);
}

export async function applyForOpportunity(data: {
  opportunity_id: string;
  user_email: string;
  user_name?: string;
  user_avatar?: string;
}) {
  return adminPost("/opportunity-applications", {
    opportunityId: data.opportunity_id,
    userEmail: data.user_email,
    userName: data.user_name,
    userAvatar: data.user_avatar,
  });
}

export async function uploadCVFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${API_ROOT}/upload`, { method: "POST", body: formData });
  if (!response.ok) throw new Error(`Upload failed: ${response.status}`);
  const result = (await response.json()) as { url?: string; file_url?: string; error?: string };
  const url = result.url || result.file_url;
  if (!url) throw new Error(result.error || "Upload failed");
  return url;
}

export async function submitMotivationForm(data: {
  opportunity_id: string;
  user_email: string;
  user_name?: string;
  user_avatar?: string;
  linkedin_url?: string;
  twitter_url?: string;
  portfolio_url?: string;
  message?: string;
  cv_file_url?: string;
}) {
  return adminPost("/opportunity-applications", {
    type: "motivation",
    opportunityId: data.opportunity_id,
    userEmail: data.user_email,
    userName: data.user_name,
    userAvatar: data.user_avatar,
    linkedinUrl: data.linkedin_url,
    twitterUrl: data.twitter_url,
    portfolioUrl: data.portfolio_url,
    message: data.message,
    cvFileUrl: data.cv_file_url,
  });
}

export async function fetchDocumentation(limit = 50) {
  const sections = await adminGet<any[]>("/resource-sections", { limit });
  const items = (Array.isArray(sections) ? sections : []).flatMap((s) => s.items || []);
  return items.slice(0, limit).map((item: any) => {
    const id = String(item.id || '');
    const url = String(item.url || item.filePath || '');
    const fileType = String(item.fileType || url.match(/\.([a-z0-9]+)(?:[?#]|$)/i)?.[1] || '').toUpperCase();
    const isCloudinaryRaw = /^https?:\/\/res\.cloudinary\.com\/[^/]+\/raw\/upload\//i.test(url);
    const hasDocument = isCloudinaryRaw || Boolean(item.fileType);
    return {
      id,
      title: item.titleFr || item.title || "",
      description: item.descriptionFr || item.description || "",
      fileType,
      downloadUrl: id && hasDocument
        ? `${API_ROOT}/resource-items/${encodeURIComponent(id)}/download`
        : url,
      iconKey: item.iconKey || "bookOpen",
    };
  });
}

export type GalleryImageItem = {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  date: string;
  featured: boolean;
  displayOrder: number;
};

export async function fetchGalleryEvents(limit = 50): Promise<GalleryImageItem[]> {
  const rows = await adminGet<any[]>("/gallery-events", { limit });
  return (Array.isArray(rows) ? rows : [])
    .flatMap((item, eventIndex) => {
      const images = Array.isArray(item.images) ? item.images : [];
      if (!images.length) return [];
      return images.map((img: unknown, index: number) => {
        const url = typeof img === "string" ? img : String((img as { url?: string })?.url || "").trim();
        if (!url) return null;
        return {
          id: `${item.id}-${index}`,
          title: String(item.title || "").trim(),
          description: String(item.description || "").trim(),
          category: String(item.subtitle || "").trim(),
          imageUrl: url,
          date: String(item.date || "").trim(),
          featured: eventIndex === 0 && index === 0,
          displayOrder: index,
        } satisfies GalleryImageItem;
      });
    })
    .filter((x): x is GalleryImageItem => Boolean(x));
}

export async function fetchTeamMembers(limit = 50) {
  const rows = await adminGet<any[]>("/team-members", { limit });
  return (Array.isArray(rows) ? rows : []).map((item) => ({
    id: String(item.id),
    name: item.name || "",
    role: item.role || "",
    image: item.imageUrl || item.image || "",
    slug: item.slug || "",
    description: item.description || "",
    portfolioUrl: item.portfolioUrl || "",
    social: {
      x: item.xUrl || "",
      linkedin: item.linkedinUrl || "",
      telegram: item.telegramUrl || "",
    },
  }));
}

export async function fetchPartners(limit = 100) {
  const rows = await adminGet<any[]>("/partners", { limit });
  return (Array.isArray(rows) ? rows : []).map((item) => ({
    id: String(item.id),
    name: item.name || "",
    slug: item.slug || "",
    description: item.description || "",
    logo_url: item.logoUrl || null,
    website_url: item.websiteUrl || null,
    display_order: item.displayOrder ?? 0,
  }));
}

export async function registerForEvent(data: {
  event_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  message?: string | null;
  avatarUrl?: string | null;
  googleSub?: string | null;
}) {
  return adminPost<{
    id: string;
    eventId: string;
    status: string;
    alreadyRegistered?: boolean;
    conversation?: { id: string } | null;
    event?: { id: string; title: string; titleFr?: string | null };
  }>("/event-registrations", {
    eventId: data.event_id,
    fullName: data.full_name,
    email: data.email,
    phone: data.phone,
    organization: data.organization,
    message: data.message,
    avatarUrl: data.avatarUrl,
    googleSub: data.googleSub,
  });
}

export type EventConversationMessage = {
  id: string;
  senderType: string;
  senderEmail?: string | null;
  senderName?: string | null;
  body: string;
  createdAt: string;
  readAt?: string | null;
};

export type SiteNotification = {
  id: string;
  userEmail: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  read: boolean;
  createdAt: string;
};

export async function fetchEventRegistrationByEmail(eventId: string, email: string) {
  return adminGet<{
    id: string;
    status: string;
    conversation?: { id: string } | null;
  } | null>("/event-registrations", { eventId, email });
}

export async function fetchEventConversation(registrationId: string, email: string) {
  return adminGet<{
    registration: { id: string; status: string; eventId: string };
    conversation: { id: string };
    messages: EventConversationMessage[];
  }>(`/event-conversations/${registrationId}`, { email });
}

export async function sendEventConversationMessage(
  registrationId: string,
  data: { body: string; email: string; name?: string; senderType?: "user" | "team" }
) {
  return adminPost<EventConversationMessage>(`/event-conversations/${registrationId}`, data);
}

export async function fetchSiteNotifications(email: string) {
  return adminGet<SiteNotification[]>("/site-notifications", { email });
}

export async function markNotificationRead(email: string, id: string) {
  return adminPatch("/site-notifications", { email, id });
}

export async function markAllNotificationsRead(email: string) {
  return adminPatch("/site-notifications", { email, markAllRead: true });
}

export async function fetchEventRegistrationCount(eventId: string) {
  const result = await adminGet<{ count: number }>("/event-registrations", { eventId });
  return result.count ?? 0;
}

export async function fetchResourceSections(limit = 50) {
  const rows = await adminGet<any[]>("/resource-sections", { limit });
  return (Array.isArray(rows) ? rows : []).map((item) => ({
    id: String(item.id),
    iconKey: "bookOpen",
    category: item.title || "",
    items: (item.items || []).map((sub: any) => ({
      id: String(sub.id),
      title: sub.titleFr || sub.title || "",
      description: sub.descriptionFr || sub.description || "",
      url: sub.url || sub.filePath || "",
      downloadUrl: String(sub.id || '') && (sub.fileType || /^https?:\/\/res\.cloudinary\.com\/[^/]+\/raw\/upload\//i.test(String(sub.url || sub.filePath || '')))
        ? `${API_ROOT}/resource-items/${encodeURIComponent(String(sub.id))}/download`
        : sub.url || sub.filePath || "",
      fileType: sub.fileType || "",
      iconKey: sub.iconKey || "bookOpen",
    })),
  }));
}

export { ADMIN_API_BASE, API_ROOT };
