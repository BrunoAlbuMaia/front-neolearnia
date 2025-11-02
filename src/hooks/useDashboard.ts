import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboardApi";
import type {
  DashboardOverview,
  DashboardActivity,
  DashboardDifficulty,
  DashboardReviewSchedule,
  DashboardSpeedAnalysis,
} from "../types";

const QUERY_KEYS = {
  overview: ["dashboard", "overview"] as const,
  activity: ["dashboard", "activity"] as const,
  difficulty: ["dashboard", "difficulty"] as const,
  reviewSchedule: ["dashboard", "review_schedule"] as const,
  speedAnalysis: ["dashboard", "speed_analysis"] as const,
};

export function useDashboardOverview() {
  return useQuery<DashboardOverview>({
    queryKey: QUERY_KEYS.overview,
    queryFn: () => dashboardApi.getOverview(),
  });
}

export function useDashboardActivity() {
  return useQuery<DashboardActivity[]>({
    queryKey: QUERY_KEYS.activity,
    queryFn: () => dashboardApi.getActivity(),
  });
}

export function useDashboardDifficulty() {
  return useQuery<DashboardDifficulty>({
    queryKey: QUERY_KEYS.difficulty,
    queryFn: () => dashboardApi.getDifficulty(),
  });
}

export function useDashboardReviewSchedule() {
  return useQuery<DashboardReviewSchedule>({
    queryKey: QUERY_KEYS.reviewSchedule,
    queryFn: () => dashboardApi.getReviewSchedule(),
  });
}

export function useDashboardSpeedAnalysis() {
  return useQuery<DashboardSpeedAnalysis>({
    queryKey: QUERY_KEYS.speedAnalysis,
    queryFn: () => dashboardApi.getSpeedAnalysis(),
  });
}

