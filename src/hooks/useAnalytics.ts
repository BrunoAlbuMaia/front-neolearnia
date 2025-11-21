import { useQuery } from "@tanstack/react-query";
import { analyticsApi, type RetentionResponse, type RecommendedCardsResponse, type GamificationResponse } from "../api/analyticsApi";

/**
 * Hook para buscar estatísticas de retenção
 * Cache: 5 minutos (dados não mudam frequentemente)
 */
export function useRetention() {
  return useQuery<RetentionResponse>({
    queryKey: ["analytics", "retention"],
    queryFn: analyticsApi.getRetention,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes era cacheTime)
  });
}

/**
 * Hook para buscar cards recomendados
 * Cache: 2 minutos (pode mudar com novas revisões)
 */
export function useRecommendedCards(params?: {
  limit?: number;
  difficulty?: "easy" | "medium" | "difficult";
  adaptive?: boolean;
}) {
  return useQuery<RecommendedCardsResponse>({
    queryKey: ["flashcards", "recommended", params],
    queryFn: () => analyticsApi.getRecommendedCards(params),
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    enabled: true, // Sempre habilitado, mas pode ser condicional
  });
}

/**
 * Hook para buscar dados de gamificação
 * Cache: 1 minuto (streaks podem mudar rapidamente)
 */
export function useGamification() {
  return useQuery<GamificationResponse>({
    queryKey: ["user", "gamification"],
    queryFn: analyticsApi.getGamification,
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
  });
}
