import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/userApi";
import {type UserState} from "../types/index";
import { useAuth } from "../context/AuthContext";

export function useUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: userState, isLoading } = useQuery({
    queryKey: ["userState"],
    queryFn: () => {
      return userApi.getUserState();
    },
    // CRÍTICO: Só executa quando há usuário autenticado
    enabled: !!user,
    // Retry apenas se for erro de rede, não 401
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 3;
    },
  });

  const saveUserState = useMutation({
    mutationFn: (data: UserState) => userApi.saveUserState(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userState"] });
    },
  });

  return {
    userState,
    isLoading,
    saveUserState,
  };
}
