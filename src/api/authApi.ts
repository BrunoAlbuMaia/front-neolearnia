import { apiRequest } from './client';
import type { SyncUserPayload } from '../types';

export const authApi = {
  syncUser: (payload: SyncUserPayload) =>
    // CRÍTICO: sync-user REQUER autenticação (precisa do token Firebase)
    // O X-Session-ID já é enviado automaticamente em TODAS as requisições
    apiRequest<{ success: boolean }>('POST', '/api/sync-user', payload, true),
};
