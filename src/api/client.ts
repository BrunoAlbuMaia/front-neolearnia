import { getCurrentUserToken, logout } from '../lib/firebase/auth';
import { auth } from '../lib/firebase/config';
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

  // ✅ CRÍTICO: Adiciona sessionId em TODAS as requisições (incluindo sync-user)
  // O sessionId DEVE estar presente mesmo em requisições não autenticadas como sync-user
  const sessionId = getSessionId();
  if (sessionId) {
    headers['X-Session-ID'] = sessionId;
  }

  // ✅ Adiciona token de autenticação
  if (requiresAuth) {
    // Força refresh do token para garantir que está atualizado
    const token = await getCurrentUserToken(true);
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Se não conseguiu obter token, aguarda um pouco e tenta novamente
      await new Promise(resolve => setTimeout(resolve, 1000));
      const retryToken = await getCurrentUserToken(true);
      if (retryToken) {
        headers['Authorization'] = `Bearer ${retryToken}`;
      }
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

    // Tratamento especial para 401 - pode ser token ainda não pronto após login
    if (response.status === 401) {
      // Se for 401 e tiver usuário logado, tenta refresh do token e retry uma vez
      const currentUser = auth.currentUser;
      if (currentUser && requiresAuth) {
        try {
          console.log("🔄 401 detectado - tentando refresh do token e retry...");
          // Força refresh do token
          await currentUser.getIdToken(true);
          // Aguarda um momento para o token ser processado
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Retry da requisição com novo token
          const retryToken = await getCurrentUserToken(true);
          if (retryToken) {
            const retryHeaders = { ...headers, 'Authorization': `Bearer ${retryToken}` };
            const retryConfig = { ...config, headers: retryHeaders };
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, retryConfig);
            
            if (retryResponse.ok) {
              if (retryResponse.status === 204) {
                stopLoading();
                return {} as T;
              }
              const retryResult = await retryResponse.json();
              stopLoading();
              return retryResult;
            }
          }
        } catch (retryError) {
          console.error("❌ Erro no retry após 401:", retryError);
        }
      }
      
      // Se retry falhou ou não há usuário, faz logout
      await logout();
      throw new ApiError(401, 'Não autorizado. Faça login novamente.');
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
