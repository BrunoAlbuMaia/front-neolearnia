import { apiRequest } from "./client";

export interface UserProfile {
  name: string;
  email: string;
}

export interface UpdateProfilePayload {
  name?: string;
}

export interface UserSettings {
  focus_area: string;
  learning_style: string;
  ai_level: string;
  motivation: string;
  preferred_schedule: string;
}

export interface UpdateSettingsPayload {
  focus_area?: string;
  learning_style?: string;
  ai_level?: string;
  motivation?: string;
  preferred_schedule?: string;
}

export interface PersonalData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  institution: string;
}

export interface UpdatePersonalDataPayload {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  institution?: string;
}

export const settingsApi = {
  // Obter perfil do usuário
  getUserProfile: () =>
    apiRequest<UserProfile>("GET", "/api/user/profile"),

  // Atualizar perfil do usuário (nome, email)
  updateUserProfile: (payload: UpdateProfilePayload) =>
    apiRequest<UserProfile>("PATCH", "/api/user/profile", payload),

  // Obter configurações/preferências do usuário
  getUserSettings: () =>
    apiRequest<UserSettings | null>("GET", "/api/user/settings"),

  // Atualizar configurações/preferências do usuário (parcial)
  updateUserSettings: (payload: UpdateSettingsPayload) =>
    apiRequest<UserSettings>("PATCH", "/api/user/settings", payload),

  // Obter dados pessoais do usuário
  getPersonalData: () =>
    apiRequest<PersonalData | null>("GET", "/api/user/personal-data"),

  // Atualizar dados pessoais do usuário (parcial)
  updatePersonalData: (payload: UpdatePersonalDataPayload) =>
    apiRequest<PersonalData>("PATCH", "/api/user/personal-data", payload),
};
