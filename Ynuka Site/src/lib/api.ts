// Direct API calls to PHP backend without Strapi abstraction
import { getJwtFromStorage } from "./strapi";

const API_BASE_URL = "https://admin.ynukalabs.com/api/api.php";

// Liste des ressources publiques qui ne nécessitent pas d'authentification
const PUBLIC_RESOURCES = [
  "site_menu_groups",
  "events",
  "blog_posts",
  "opportunities",
  "resource_items",
  "gallery_events",
  "team_members",
  "resource_sections",
  "partners",
  "projects",
  "goma_drep_actions",
];

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

export async function fetchFromApi<T = unknown>(
  action: string,
  params: Record<string, string | number> = {},
  body?: Record<string, any>
): Promise<T> {
  const url = new URL(API_BASE_URL);
  url.searchParams.set("action", action);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const options: RequestInit = {
    method: body ? "POST" : "GET",
    headers: {
      "Content-Type": "application/json",
    },
  };

  // N'ajouter l'en-tête Authorization que pour les ressources non publiques
  const resource = params.resource as string;
  const isPublicResource = resource && PUBLIC_RESOURCES.includes(resource);
  
  if (!isPublicResource) {
    const token = getJwtFromStorage();
    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url.toString(), options);
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// Newsletter subscription with automatic email
export async function subscribeToNewsletter(name: string, email: string): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await fetchFromApi<{ success: boolean; message?: string }>(
      "subscribe_newsletter",
      {},
      { name, email }
    );
    return result;
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    throw error;
  }
}

// Contact form submission with automatic confirmation email
export async function submitContactForm(data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await fetchFromApi<{ success: boolean; message?: string }>(
      "submit_contact_form",
      {},
      data
    );
    return result;
  } catch (error) {
    console.error("Contact form submission error:", error);
    throw error;
  }
}

// Events API
export async function fetchEvents(limit = 100) {
  const result = await fetchFromApi<{ rows: unknown[]; total: number }>("list", {
    resource: "events",
    limit,
  });

  return result.rows.map((item: any) => ({
    id: String(item.id),
    title: item.title || "",
    title_fr: item.title_fr || null,
    description: item.description || null,
    description_fr: item.description_fr || null,
    date: item.date || "",
    location: item.location || "",
    type: item.type || "",
    upcoming: !!item.upcoming,
    time: item.time || null,
    imageUrl: item.image_url || null,
    capacity: item.capacity || null,
    recapUrl: pickOptionalUrl(item.recap_url || item.recapUrl || item.summary_url || item.summaryUrl),
    youtubeUrl: pickOptionalUrl(
      item.youtube_url || item.youtubeUrl || item.video_url || item.videoUrl || extractYoutubeUrl(`${item.description || ""} ${item.description_fr || ""}`)
    ),
  }));
}

// Fetch single event
export async function fetchEvent(id: string) {
  const result = await fetchFromApi<{ row: unknown }>("get", {
    resource: "events",
    id,
  });

  const item = result.row as any;
  return {
    id: String(item.id),
    title: item.title || "",
    title_fr: item.title_fr || null,
    description: item.description || null,
    description_fr: item.description_fr || null,
    date: item.date || "",
    location: item.location || "",
    type: item.type || "",
    upcoming: !!item.upcoming,
    time: item.time || null,
    imageUrl: item.image_url || null,
    capacity: item.capacity || null,
    recapUrl: pickOptionalUrl(item.recap_url || item.recapUrl || item.summary_url || item.summaryUrl),
    youtubeUrl: pickOptionalUrl(
      item.youtube_url || item.youtubeUrl || item.video_url || item.videoUrl || extractYoutubeUrl(`${item.description || ""} ${item.description_fr || ""}`)
    ),
  };
}

// Blog posts API
export async function fetchBlogPosts(limit = 100) {
  const result = await fetchFromApi<{ rows: unknown[]; total: number }>("list", {
    resource: "blog_posts",
    limit,
    filter: "published=1",
  });

  return result.rows.map((item: any) => ({
    id: String(item.id),
    title: item.title || "",
    title_fr: item.title_fr || null,
    excerpt: item.excerpt || null,
    excerpt_fr: item.excerpt_fr || null,
    category: item.category || "Blog",
    content: item.content || null,
    cover_url: item.cover_url || null,
    created_at: item.created_at || "",
    views: item.views || 0,
    likes: item.likes || 0,
  }));
}

// Fetch single blog post
export async function fetchBlogPost(id: string) {
  const result = await fetchFromApi<{ row: unknown }>("get", {
    resource: "blog_posts",
    id,
  });

  const item = result.row as any;
  
  // Return null if the blog post doesn't exist
  if (!item) {
    return null;
  }
  
  return {
    id: String(item.id),
    title: item.title || "",
    title_fr: item.title_fr || null,
    excerpt: item.excerpt || null,
    excerpt_fr: item.excerpt_fr || null,
    category: item.category || "Blog",
    content: item.content || null,
    cover_url: item.cover_url || null,
    created_at: item.created_at || "",
    views: item.views || 0,
    likes: item.likes || 0,
  };
}

// Opportunities API
export async function fetchOpportunities(limit = 100) {
  const result = await fetchFromApi<{ rows: unknown[]; total: number }>("list", {
    resource: "opportunities",
    limit,
    filter: "published=1",
  });

  return result.rows.map((item: any) => ({
    id: String(item.id),
    title: item.title || "",
    title_fr: item.title_fr || null,
    slug: item.slug || "",
    excerpt: item.excerpt || null,
    excerpt_fr: item.excerpt_fr || null,
    category: item.category || "General",
    content: item.content || null,
    content_fr: item.content_fr || null,
    cover_url: item.cover_url || null,
    created_at: item.created_at || "",
    deadline: item.deadline || item.end_date || item.closes_at || item.expiry_date || null,
    status: item.status || null,
    published: item.published == null ? true : Boolean(Number(item.published)),
  }));
}

// Fetch single opportunity
export async function fetchOpportunity(id: string) {
  const result = await fetchFromApi<{ row: unknown }>("get", {
    resource: "opportunities",
    id,
  });

  const item = result.row as any;
  return {
    id: String(item.id),
    title: item.title || "",
    title_fr: item.title_fr || null,
    slug: item.slug || "",
    excerpt: item.excerpt || null,
    excerpt_fr: item.excerpt_fr || null,
    category: item.category || "General",
    content: item.content || null,
    content_fr: item.content_fr || null,
    cover_url: item.cover_url || null,
    created_at: item.created_at || "",
  };
}

// Projects API — status=active = publiés (page Projets)
// show_on_home = choisis par l'admin pour l'accueil (sous-ensemble)
export async function fetchProjects(limit = 100) {
  const result = await fetchFromApi<{ rows?: unknown[]; data?: unknown[] }>("list", {
    resource: "projects",
    limit,
    filter: "status=active",
  });

  const rows = result.rows ?? result.data ?? [];
  return rows.map((item: any) => {
    const showOnHomeRaw =
      item.show_on_home ??
      item.show_on_homepage ??
      item.featured_home ??
      item.on_home ??
      0;

    return {
      id: String(item.id),
      slug: item.slug || String(item.id),
      title: item.title || "",
      category: item.category || item.type || "",
      description: item.description || item.excerpt || "",
      featured_image: item.featured_image || item.image_url || item.logo_url || null,
      repository_url: item.repository_url || null,
      live_url: item.live_url || null,
      created_at: item.created_at || "",
      show_on_home:
        showOnHomeRaw === true ||
        showOnHomeRaw === 1 ||
        showOnHomeRaw === "1" ||
        String(showOnHomeRaw).toLowerCase() === "true",
      tags: Array.isArray(item.tags)
        ? item.tags.map(String).filter(Boolean)
        : String(item.tags || item.keywords || "")
            .split(/[,|;]/)
            .map((tag: string) => tag.trim())
            .filter(Boolean),
    };
  });
}

/** Projets mis en avant sur l'accueil (uniquement ceux flagués par l'admin). */
export async function fetchHomeProjects(limit = 4) {
  const projects = await fetchProjects(100);
  return projects
    .filter((project) => project.show_on_home && project.title)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit);
}

// Apply for opportunity
export async function applyForOpportunity(data: {
  opportunity_id: string;
  user_email: string;
  user_name?: string;
  user_avatar?: string;
}) {
  const result = await fetchFromApi<{ row: unknown }>("insert", {
    resource: "opportunity_applications",
    ...data,
  });
  return result.row;
}

// Upload CV file
export async function uploadCVFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('cv_file', file);

  const response = await fetch('https://admin.ynukalabs.com/php/upload-cv.php', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json() as { success: boolean; file_url?: string; error?: string };
  
  if (!result.success || !result.file_url) {
    throw new Error(result.error || 'Upload failed');
  }

  return result.file_url;
}

// Submit motivation form for opportunity
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
  const result = await fetchFromApi<{ row: unknown }>("insert", {
    resource: "opportunity_motivation_forms",
    ...data,
  });
  return result.row;
}


// Documentation API
export async function fetchDocumentation(limit = 50) {
  const result = await fetchFromApi<{ rows: unknown[]; total: number }>("list", {
    resource: "resource_items",
    limit,
  });
  
  return result.rows.map((item: any) => ({
    id: String(item.id),
    title: item.title_fr || item.title || "",
    description: item.description_fr || item.description || "",
    iconKey: item.iconKey || "bookOpen",
  }));
}

// Gallery events API
export async function fetchGalleryEvents(limit = 20) {
  const result = await fetchFromApi<{ rows: unknown[]; total: number }>("list", {
    resource: "gallery_events",
    limit,
  });
  
  return result.rows.map((item: any) => ({
    id: String(item.id),
    title: item.title || "",
    subtitle: item.subtitle || "",
    date: item.date || "",
    description: item.description || "",
    images: item.images ? JSON.parse(item.images) : [],
  }));
}

// Team members API
export async function fetchTeamMembers(limit = 50) {
  const result = await fetchFromApi<{ rows: unknown[]; total: number }>("list", {
    resource: "team_members",
    limit,
  });
  
  return result.rows.map((item: any) => ({
    id: String(item.id),
    name: item.name || "",
    role: item.role || "",
    image: item.image || "",
    social: item.social ? JSON.parse(item.social) : {},
  }));
}

// Event registration API
export async function registerForEvent(data: {
  event_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  organization?: string | null;
  message?: string | null;
}) {
  const payload = {
    ...data,
    event_id: parseInt(data.event_id, 10),
  };
  
  const result = await fetchFromApi("create", { resource: "event_registrations" }, payload);
  return result;
}

// Event registration count API
export async function fetchEventRegistrationCount(eventId: string) {
  const result = await fetchFromApi<{ rows: unknown[]; total: number }>("list", {
    resource: "event_registrations",
    filter: `event_id=${eventId}`,
  });
  return result.total;
}

// Resource sections API
export async function fetchResourceSections(limit = 50) {
  const result = await fetchFromApi<{ rows: unknown[]; total: number }>("list", {
    resource: "resource_sections",
    limit,
  });
  
  return result.rows.map((item: any) => ({
    id: String(item.id),
    iconKey: item.iconKey || "bookOpen",
    category: item.category_fr || item.category || "",
    items: item.items ? JSON.parse(item.items) : [],
  }));
}

