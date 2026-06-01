import { getApiUrl } from "./api";

function getActivitiesUrl(): string {
  const baseUrl = getApiUrl().replace('/api.php', '');
  return `${baseUrl}/activities.php`;
}

export interface Activity {
  id: number;
  type: "login" | "register" | "message" | "notification" | "alert";
  user: string;
  message: string;
  details?: string;
  metadata?: Record<string, any>;
  read: boolean;
  timestamp: string;
  created_at: string;
  updated_at: string;
}

export interface ActivityWithDate extends Omit<Activity, 'timestamp'> {
  timestamp: Date;
}

export interface CreateActivityData {
  type: "login" | "register" | "message" | "notification" | "alert";
  user: string;
  message: string;
  details?: string;
  metadata?: Record<string, any>;
}

/**
 * Récupère toutes les activités
 */
export async function getActivities(filter: "all" | "unread" = "all", limit: number = 50, offset: number = 0): Promise<Activity[]> {
  const url = new URL(getActivitiesUrl());
  url.searchParams.append("action", "list");
  url.searchParams.append("filter", filter);
  url.searchParams.append("limit", limit.toString());
  url.searchParams.append("offset", offset.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch activities");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Récupère le nombre de notifications non lues
 */
export async function getUnreadCount(): Promise<number> {
  const url = new URL(getActivitiesUrl());
  url.searchParams.append("action", "unread-count");

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch unread count");
  }

  const result = await response.json();
  return result.data.count;
}

/**
 * Crée une nouvelle activité
 */
export async function createActivity(data: CreateActivityData): Promise<Activity> {
  const url = new URL(getActivitiesUrl());
  url.searchParams.append("action", "create");

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create activity");
  }

  const result = await response.json();
  return result.data;
}

/**
 * Marque une activité comme lue
 */
export async function markAsRead(id: number): Promise<void> {
  const url = new URL(getActivitiesUrl());
  url.searchParams.append("action", "mark-read");
  url.searchParams.append("id", id.toString());

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to mark activity as read");
  }
}

/**
 * Marque toutes les activités comme lues
 */
export async function markAllAsRead(): Promise<void> {
  const url = new URL(getActivitiesUrl());
  url.searchParams.append("action", "mark-all-read");

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to mark all activities as read");
  }
}

/**
 * Supprime une activité
 */
export async function deleteActivity(id: number): Promise<void> {
  const url = new URL(getActivitiesUrl());
  url.searchParams.append("action", "delete");
  url.searchParams.append("id", id.toString());

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete activity");
  }
}

/**
 * Supprime toutes les activités
 */
export async function deleteAllActivities(): Promise<void> {
  const url = new URL(getActivitiesUrl());
  url.searchParams.append("action", "delete-all");

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to delete all activities");
  }
}
