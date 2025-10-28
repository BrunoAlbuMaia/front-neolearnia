// src/lib/session.ts
/**
 * Gerenciador de SessionId no Frontend
 * Responsável por criar, armazenar e validar o sessionId local
 */

const SESSION_KEY = "session-id";

/**
 * Gera um novo sessionId único
 */
export const generateSessionId = (): string => {
  return `${Date.now()}-${crypto.randomUUID()}`;
};

/**
 * Salva sessionId no localStorage
 */
export const saveSessionId = (sessionId: string): void => {
  localStorage.setItem(SESSION_KEY, sessionId);
};

/**
 * Recupera sessionId do localStorage
 */
export const getSessionId = (): string | null => {
  return localStorage.getItem(SESSION_KEY);
};

/**
 * Remove sessionId do localStorage
 */
export const clearSessionId = (): void => {
  localStorage.removeItem(SESSION_KEY);
};

/**
 * Obtém ou cria um sessionId
 * Se não existir, cria um novo
 */
export const getOrCreateSessionId = (): string => {
  let sessionId = getSessionId();
  
  if (!sessionId) {
    sessionId = generateSessionId();
    saveSessionId(sessionId);
    console.log("🆕 Novo sessionId criado:", sessionId.slice(0, 8) + "...");
  }
  
  return sessionId;
};

/**
 * Verifica se existe um sessionId válido
 */
export const hasValidSession = (): boolean => {
  const sessionId = getSessionId();
  return !!sessionId;
};