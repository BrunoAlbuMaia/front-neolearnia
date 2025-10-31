import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userApi } from "../api/userApi";
import {type UserState} from "../types/index"

export function useUser() {
  const queryClient = useQueryClient();

  const { data: userState, isLoading } = useQuery({
    queryKey: ["userState"],
    queryFn: () => {
      return userApi.getUserState();
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
