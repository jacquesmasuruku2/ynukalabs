/**
 * PHP API Client
 * Generic CRUD client for the PHP API
 */

import { phpAuth } from "./php-auth";

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost/api.php';

function apiCandidates(base: string): string[] {
  const seen = new Set<string>();
  const add = (u: string) => seen.add(u) && u;
  const norm = (s: string) => s.replace(/\/+$/, '');
  const b = norm(base);
  add(b);
  if (b.endsWith('/api.php')) {
    add(b.replace(/\/api.php$/, '/api/api.php'));
    add(b.replace(/\/api.php$/, '/api/api..php'));
  } else if (b.endsWith('/api/api.php')) {
    add(b.replace(/\/api\/api.php$/, '/api.php'));
    add(b.replace(/\/api\/api.php$/, '/api/api..php'));
  } else {
    add(b + '/api.php');
    add(b + '/api/api.php');
    add(b + '/api/api..php');
  }
  return Array.from(seen);
}

async function fetchWithFallback(path: string, init?: RequestInit) {
  const candidates = apiCandidates(API_BASE_URL);
  let lastError: any = null;
  let lastResp: Response | null = null;
  for (const cand of candidates) {
    try {
      const url = cand + (path.startsWith('?') ? path : path.startsWith('/') ? path : path);
      const resp = await fetch(url, init);
      lastResp = resp;
      if (resp.ok) return resp;
      lastError = resp;
    } catch (e) {
      lastError = e;
    }
  }
  if (lastResp) {
    try {
      const json = await lastResp.json();
      throw new Error(json.error || JSON.stringify(json));
    } catch (e) {
      throw new Error('Request failed to all API endpoints');
    }
  }
  throw lastError || new Error('Request failed to all API endpoints');
}

export interface ListResponse {
  rows: any[];
  total: number;
  columns: string[];
}

export interface GetResponse {
  row: any;
  columns: string[];
}

export class PhpApiClient {
  /**
   * List rows from a resource
   */
  async list(
    resource: string,
    options?: {
      page?: number;
      limit?: number;
      search?: string;
    }
  ): Promise<ListResponse> {
    const params = new URLSearchParams({
      action: 'list',
      resource,
      page: String(options?.page ?? 1),
      limit: String(options?.limit ?? 25),
      search: options?.search ?? '',
    });

    const response = await fetchWithFallback(`?${params}`, {
      headers: phpAuth.getAuthHeader(),
    });

    return response.json();
  }

  /**
   * Get a single row
   */
  async get(resource: string, id: string | number): Promise<GetResponse> {
    const params = new URLSearchParams({
      action: 'get',
      resource,
      id: String(id),
    });

    const response = await fetchWithFallback(`?${params}`, {
      headers: phpAuth.getAuthHeader(),
    });

    return response.json();
  }

  /**
   * Create a new row
   */
  async create(resource: string, data: Record<string, any>): Promise<{ id: string }> {
    const response = await fetchWithFallback(`?action=create&resource=${resource}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...phpAuth.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  /**
   * Update a row
   */
  async update(
    resource: string,
    id: string | number,
    data: Record<string, any>
  ): Promise<{ ok: boolean }> {
    const response = await fetchWithFallback(`?action=update&resource=${resource}&id=${id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...phpAuth.getAuthHeader(),
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  /**
   * Delete a row
   */
  async delete(resource: string, id: string | number): Promise<{ ok: boolean }> {
    const response = await fetchWithFallback(`?action=delete&resource=${resource}&id=${id}`, {
      method: 'POST',
      headers: phpAuth.getAuthHeader(),
    });

    return response.json();
  }
}

export const phpApi = new PhpApiClient();
