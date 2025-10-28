import { getCurrentUserToken, logout } from '../lib/firebase/auth';
import { getSessionId } from '../lib/firebase/session';

const API_BASE_URL = import.meta.env.VITE_LINK_API;

export class ApiError extends Error {
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new ApiError(res.status, `${res.status}: ${text}`);
  }
}

/**
 * Cliente HTTP genérico com suporte a autenticação e sessão
 */
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  endpoint: string,
  body?: any,
  requiresAuth: boolean = true
): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  // ✅ Adiciona token de autenticação
  if (requiresAuth) {
    const token = await getCurrentUserToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // ✅ CRÍTICO: Adiciona sessionId em TODAS as requisições autenticadas
  if (requiresAuth) {
    const sessionId = await getSessionId();
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }
  }
  // console.log(getSessionId())

  const config: RequestInit = {
    method,
    headers,
  };

  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // ✅ Detecta sessão inválida
    const sessionInvalid = response.headers.get('X-Session-Invalid');
    if (sessionInvalid === 'true') {
      // Dispara evento customizado para o AuthContext capturar
      window.dispatchEvent(new CustomEvent('session-invalid'));
      throw new ApiError(401, 'Sessão inválida', {
        message: 'Outro dispositivo fez login nesta conta',
      });
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(response.status, response.statusText, errorData);
    }

    // Se resposta for 204 No Content, retorna objeto vazio
    if (response.status === 204) {
      return {} as T;
    }

    if (response.status === 401){
      await logout()
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      console.log('401 que pena')
      throw error;
    }
    
    // Erro de rede ou outro erro desconhecido
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
export async function apiGet<T = unknown>(endpoint: string): Promise<T> {
  const token = await getCurrentUserToken();
  const headers: Record<string, string> = {};


  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    const sessionId = getSessionId();
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }
    
  }  
  const url = `${API_BASE_URL}${endpoint}`;
  
  const res = await fetch(url, {
    headers,
    credentials: 'include',
  });

  if (res.status === 401){
    await logout()
  }


  await throwIfResNotOk(res);
  return res.json();
}
