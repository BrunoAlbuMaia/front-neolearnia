import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, type UpdateProfilePayload, type UpdateSettingsPayload, type UpdatePersonalDataPayload } from "../api/settingsApi";
import { useAuth } from "../context/AuthContext";

export function useSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Query para obter perfil do usuário
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: () => settingsApi.getUserProfile(),
    enabled: !!user,
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 3;
    },
  });

  // Query para obter configurações/preferências do usuário
  const { data: userSettings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["userSettings"],
    queryFn: () => settingsApi.getUserSettings(),
    enabled: !!user,
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 3;
    },
  });

  // Query para obter dados pessoais do usuário
  const { data: personalData, isLoading: isLoadingPersonalData } = useQuery({
    queryKey: ["personalData"],
    queryFn: () => settingsApi.getPersonalData(),
    enabled: !!user,
    retry: (failureCount, error: any) => {
      if (error?.status === 401) return false;
      return failureCount < 3;
    },
  });

  // Mutation para atualizar perfil
  const updateProfile = useMutation({
    mutationFn: (data: UpdateProfilePayload) => settingsApi.updateUserProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });

  // Mutation para atualizar configurações/preferências
  const updateSettings = useMutation({
    mutationFn: (data: UpdateSettingsPayload) => settingsApi.updateUserSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userSettings"] });
    },
  });

  // Mutation para atualizar dados pessoais
  const updatePersonalData = useMutation({
    mutationFn: (data: UpdatePersonalDataPayload) => settingsApi.updatePersonalData(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["personalData"] });
    },
  });

  return {
    userProfile,
    userSettings,
    personalData,
    isLoadingProfile,
    isLoadingSettings,
    isLoadingPersonalData,
    isLoading: isLoadingProfile || isLoadingSettings || isLoadingPersonalData,
    updateProfile,
    updateSettings,
    updatePersonalData,
  };
}
