import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api';
import type { SyncUserPayload } from '../types';

export function useSyncUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SyncUserPayload) => authApi.syncUser(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['flashcardSets'] });
    },
  });
}
