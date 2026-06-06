// Direct API calls to PHP backend without Strapi abstraction
const API_BASE_URL = "https://admin.ynukalabs.com/api/api.php";

export async function fetchFromApi<T = unknown>(
  action: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const url = new URL(API_BASE_URL);
  url.searchParams.set("action", action);
  
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
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
    imageUrl: item.image || null,
  }));
}

// Blog posts API
export async function fetchBlogPosts(limit = 100) {
  const result = await fetchFromApi<{ rows: unknown[]; total: number }>("list", {
    resource: "blog_posts",
    limit,
    search: "published=true",
  });
  
  return result.rows.map((item: any) => ({
    id: String(item.id),
    title: item.title || "",
    title_fr: item.title_fr || null,
    excerpt: item.excerpt || null,
    excerpt_fr: item.excerpt_fr || null,
    category: item.category || "",
    created_at: item.created_at || item.createdAt || "",
  }));
}

// Documentation API
export async function fetchDocumentation(limit = 50) {
  const result = await fetchFromApi<{ rows: unknown[]; total: number }>("list", {
    resource: "resource_items",
    limit,
    search: "type=documentation",
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
  event: string;
  full_name: string;
  email: string;
  phone?: string | null;
}) {
  const formData = new FormData();
  formData.append("table", "event_registrations");
  formData.append("data", JSON.stringify(data));
  
  const response = await fetch(`${API_BASE_URL}?action=insert`, {
    method: "POST",
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error(`Registration failed: ${response.status}`);
  }
  
  return response.json();
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
