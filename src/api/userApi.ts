import { apiRequest } from "./client";

export interface UserState {
  focus_area: string;
  learning_style: string;
  ai_level: string;
  motivation: string;
  preferred_schedule: string;
  has_onboarded?: boolean;
}

export const userApi = {
  getUserState: () =>
    apiRequest<UserState | null>("GET", `/api/onboarding`),

  saveUserState: (payload: UserState) =>
    apiRequest<void>("POST", "/api/onboarding", payload),
};
