import { apiRequest } from './client';
import type { SyncUserPayload } from '../types';

export const authApi = {
  syncUser: (payload: SyncUserPayload) =>
    apiRequest<{ success: boolean }>('POST', '/api/sync-user', payload),
};
