import { useQuery, useQueryClient } from "@tanstack/react-query";
import { reviewApi, type ReviewsResponse, type ReviewSummary } from "../api/reviewApi";
import type { ReviewCard } from "../types";

const DEFAULT_SUMMARY: ReviewSummary = {
  totalDue: 0,
  overdue: 0,
  dueToday: 0,
  dueThisWeek: 0,
  byDifficulty: {
    easy: 0,
    medium: 0,
    difficult: 0,
  },
};

/**
 * Hook para buscar cards de revisão
 * Cache: 1 minuto (dados podem mudar com novas revisões)
 * Otimização: Usa select para extrair apenas cards quando necessário
 */
export function useReviews(options?: { 
  onlyDifficult?: boolean; 
  onlyOverdue?: boolean;
  difficulty?: "easy" | "medium" | "difficult";
  limit?: number;
}) {
  return useQuery<ReviewsResponse>({
    queryKey: ["reviews-today", options],
    queryFn: () => reviewApi.getReviewsToday(options),
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    select: (data) => {
      // Garantir que sempre retorna estrutura válida
      if (!data) {
        return { cards: [], summary: DEFAULT_SUMMARY };
      }
      return {
        cards: data.cards || [],
        summary: data.summary || DEFAULT_SUMMARY,
      };
    },
  });
}

/**
 * Hook para obter apenas o resumo (mais leve, reutiliza cache quando possível)
 * Otimização: Tenta usar dados do cache de useReviews primeiro
 */
export function useReviewSummary() {
  const queryClient = useQueryClient();
  
  return useQuery<ReviewSummary>({
    queryKey: ["reviews-summary"],
    queryFn: async () => {
      try {
        // Tentar pegar do cache primeiro (se useReviews já foi chamado)
        const cachedData = queryClient.getQueryData<ReviewsResponse>(["reviews-today"]);
        if (cachedData?.summary) {
          return cachedData.summary;
        }
        
        // Se não tem cache, buscar apenas summary
        const data = await reviewApi.getReviewsToday();
        return data.summary || DEFAULT_SUMMARY;
      } catch (error) {
        console.error("Erro ao buscar resumo de revisões:", error);
        return DEFAULT_SUMMARY;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    gcTime: 5 * 60 * 1000, // 5 minutos
    // Usar dados do cache de useReviews se disponível
    initialData: () => {
      const cachedData = queryClient.getQueryData<ReviewsResponse>(["reviews-today"]);
      return cachedData?.summary || DEFAULT_SUMMARY;
    },
  });
}
