import { getCurrentUserToken } from '../lib/firebase';

const API_BASE_URL = import.meta.env.VITE_LINK_API;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new ApiError(res.status, `${res.status}: ${text}`);
  }
}

export async function apiRequest<T = unknown>(
  method: string,
  endpoint: string,
  data?: unknown
): Promise<T> {
  const token = await getCurrentUserToken();
  const headers: Record<string, string> = {};
  
  if (data) {
    headers['Content-Type'] = 'application/json';
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
  });

  await throwIfResNotOk(res);
  return res.json();
}

export async function apiGet<T = unknown>(endpoint: string): Promise<T> {
  const token = await getCurrentUserToken();
  const headers: Record<string, string> = {};
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const url = `${API_BASE_URL}${endpoint}`;
  
  const res = await fetch(url, {
    headers,
    credentials: 'include',
  });

  await throwIfResNotOk(res);
  return res.json();
}
