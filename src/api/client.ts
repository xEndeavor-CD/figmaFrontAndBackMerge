/**
 * Base API client for all backend requests.
 *
 * All calls use credentials: "include" so that the Spring Session cookie is
 * automatically sent with every request — this is what keeps the user logged in.
 *
 * The Vite dev-server proxy (vite.config.ts → server.proxy) forwards /api/**
 * to localhost:8080, so there is no need for an absolute URL in this file.
 *
 * Future considerations:
 *   - Add request-level abort signal / timeout support
 *   - Add a request interceptor queue (e.g. retry on 401 if using refresh tokens)
 *   - Add response logging in development mode
 *   - Swap fetch for a library (ky, axios) if interceptor complexity grows
 */

/** Base path — matches Vite proxy rule + Spring Boot context path. */
const BASE = '/api';

// ── Error types ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    /** Raw response body if available */
    public readonly body?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── Core request helper ──────────────────────────────────────────────────────

/**
 * Perform an authenticated HTTP request to the backend.
 *
 * @param path    Path relative to /api (e.g. "/auth/me")
 * @param options Standard RequestInit options (method, body, etc.)
 * @returns       Parsed JSON response
 * @throws        ApiError on non-2xx responses
 */
export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${BASE}${path}`;

  const response = await fetch(url, {
    ...options,
    // Always send session cookie so Spring Security can authenticate the request
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  // Parse body (may be empty for 204 No Content)
  const text = await response.text();
  const data: unknown = text ? JSON.parse(text) : null;

  if (!response.ok) {
    // Try to extract a meaningful message from the backend error body
    const message =
      (data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : null) ?? `Request failed: ${response.status} ${response.statusText}`;

    throw new ApiError(response.status, message, data);
  }

  return data as T;
}

// ── Convenience wrappers ──────────────────────────────────────────────────────

export const get = <T>(path: string) =>
  request<T>(path, { method: 'GET' });

export const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body: body !== undefined ? JSON.stringify(body) : undefined });

export const put = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'PUT', body: body !== undefined ? JSON.stringify(body) : undefined });

export const del = <T>(path: string) =>
  request<T>(path, { method: 'DELETE' });

/**
 * Multipart/form-data POST — used for quest proof file uploads.
 * Does NOT set Content-Type so the browser can set the correct boundary.
 */
export async function postFormData<T>(path: string, formData: FormData): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    // No Content-Type header — browser sets multipart boundary automatically
  });

  const text = await response.text();
  const data: unknown = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const message =
      (data && typeof data === 'object' && 'message' in data
        ? String((data as { message: unknown }).message)
        : null) ?? `Upload failed: ${response.status}`;
    throw new ApiError(response.status, message, data);
  }

  return data as T;
}
