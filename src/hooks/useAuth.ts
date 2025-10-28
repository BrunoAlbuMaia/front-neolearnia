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
    // onSuccess: (data) => {
    //   console.log("✅ Usuário sincronizado:", data.user.email);
    //   console.log("🔒 Sessão criada:", data.session.id.slice(0, 8) + "...");
      
    //   // Invalida cache para forçar re-fetch dos dados
    //   queryClient.invalidateQueries({ queryKey: ['flashcardSets'] });
    //   queryClient.invalidateQueries({ queryKey: ['user'] });
      
    //   // Mostra mensagem se outras sessões foram desconectadas
    //   if (data.message) {
    //     toast({
    //       title: "Sessão única ativada",
    //       description: data.message,
    //     });
    //   }
    // },
    // onError: (error: any) => {
    //   console.error("❌ Erro ao sincronizar usuário:", error);
      
    //   // Se for erro de sessão inválida, não mostra toast (já tratado no client)
    //   if (error?.status === 401 && error?.data?.message?.includes('Sessão inválida')) {
    //     return;
    //   }
      
    //   toast({
    //     title: "Erro ao sincronizar",
    //     description: error.message || "Tente novamente mais tarde",
    //     variant: "destructive",
    //   });
    // },
  });
}