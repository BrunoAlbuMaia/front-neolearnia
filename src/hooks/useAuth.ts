import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api';
import type { SyncUserPayload } from '../types';
import { getCurrentUserToken, logout } from '../lib/firebase';
import { useToast } from '../hooks/use-toast';

export function useSyncUser() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (payload: SyncUserPayload) => {
      // verifica se o token ainda é válido
      const token = await getCurrentUserToken();
      if (!token) {
        toast({
          title: "Sessão expirada",
          description: "Você foi deslogado automaticamente.",
          variant: "destructive",
        });
        await logout();
        throw new Error("Token inválido");
      }

      // se token válido, continua a sincronização
      return authApi.syncUser(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcardSets'] });
    },
  });
}
