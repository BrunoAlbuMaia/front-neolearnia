// src/hooks/useSyncUser.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { SyncUserPayload } from '../types';
import { getCurrentUserToken, logout } from '../lib/firebase/auth';
import { useToast } from '../hooks/use-toast';
import { clearSessionId } from '../lib/firebase/session';

export function useSyncUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: SyncUserPayload) => {
      // Verifica se o token ainda é válido
      const token = await getCurrentUserToken();
      
      if (!token) {
        toast({
          title: "Sessão expirada",
          description: "Você foi deslogado automaticamente.",
          variant: "destructive",
        });
        
        clearSessionId();
        await logout();
        // throw new Error("Token inválido");
      }

      // Se token válido, sincroniza com backend
      return authApi.syncUser(payload);
    },
  });
}