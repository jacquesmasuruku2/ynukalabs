/**
 * PHP API Client
 * Generic CRUD client for the PHP API
 */

import { phpAuth } from "./php-auth";
import { fetchWithFallback } from "./php-fetch";

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
