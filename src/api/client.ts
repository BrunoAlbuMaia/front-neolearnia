import { getCurrentUserToken, logout } from '../lib/firebase/auth';
import { getSessionId } from '../lib/firebase/session';

const API_BASE_URL = import.meta.env.VITE_LINK_API;

/**
 * Dispara eventos customizados para controlar o spinner global
 * O LoadingContext escuta esses eventos
 */
function startLoading() {
  window.dispatchEvent(new CustomEvent('api-loading-start'));
}

function stopLoading() {
  window.dispatchEvent(new CustomEvent('api-loading-stop'));
}

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
    startLoading();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // ✅ Detecta sessão inválida
    const sessionInvalid = response.headers.get('X-Session-Invalid');
    if (sessionInvalid === 'true') {
      // Dispara evento customizado para o AuthContext capturar
      window.dispatchEvent(new CustomEvent('session-invalid'));
      throw new ApiError(401, 'Sessão inválida: Outro dispositivo fez login nesta conta');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || response.statusText || 'Erro na requisição';
      throw new ApiError(response.status, errorMessage);
    }

    // Se resposta for 204 No Content, retorna objeto vazio
    if (response.status === 204) {
      return {} as T;
    }

    if (response.status === 401){
      await logout()
    }

    const result = await response.json();
    stopLoading();
    return result;
  } catch (error) {
    stopLoading();
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
  
  try {
    startLoading();
    const res = await fetch(url, {
      headers,
      credentials: 'include',
    });

    if (res.status === 401){
      await logout()
    }

    await throwIfResNotOk(res);
    const result = await res.json();
    stopLoading();
    return result;
  } catch (error) {
    stopLoading();
    throw error;
  }
}
