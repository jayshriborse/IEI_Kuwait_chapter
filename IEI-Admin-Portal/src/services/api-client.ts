/**
 * Centralized API Client connecting to the existing IEI-Backend (Port 3000).
 * Reuses existing backend endpoints without any new backend logic.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SESSION_STORAGE_KEY = 'iei_admin_session_v1';

export class ApiError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export function getStoredToken(): string | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.accessToken || null;
  } catch {
    return null;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // If backend returns unauthorized, clear session
    localStorage.removeItem(SESSION_STORAGE_KEY);
    // Don't auto-redirect if we are already on login page
    if (!window.location.pathname.includes('/admin/login')) {
      window.location.href = '/admin/login?expired=true';
    }
  }

  const contentType = response.headers.get('content-type') || '';
  let responseData: any = null;

  if (contentType.includes('application/json')) {
    responseData = await response.json();
  } else {
    responseData = await response.text();
  }

  if (!response.ok) {
    const errorMsg =
      (responseData && typeof responseData === 'object' && responseData.message)
        ? (Array.isArray(responseData.message) ? responseData.message.join(', ') : responseData.message)
        : `Request failed with status ${response.status}`;

    throw new ApiError(errorMsg, response.status, responseData);
  }

  return responseData as T;
}

export async function apiClientBlob(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ blob: Blob; mimeType: string }> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new ApiError(`Download failed with status ${response.status}`, response.status);
  }

  const blob = await response.blob();
  const mimeType = response.headers.get('content-type') || 'application/octet-stream';
  return { blob, mimeType };
}

export { API_BASE_URL, SESSION_STORAGE_KEY };
