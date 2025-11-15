import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quizzesApi } from '../api';
import type { FlashcardSet, GenerateQuizPayload, Quiz } from '../types';

const QUERY_KEYS = {
  quizzesBySet: (setId: string) => ['quizzes', setId] as const,
  quizById: (setId: string, quizId: string) => ['quizzes', setId, quizId] as const,
};

export function useQuizzesBySet(setId: string) {
  return useQuery<Quiz[]>({
    queryKey: QUERY_KEYS.quizzesBySet(setId),
    queryFn: () => quizzesApi.getQuizzesBySetId(setId),
    enabled: !!setId,
  });
}

export function useQuizById(setId: string, quizId: string) {
  return useQuery<Quiz>({
    queryKey: QUERY_KEYS.quizById(setId, quizId),
    queryFn: () => quizzesApi.getQuizById(setId, quizId),
    enabled: !!setId && !!quizId,
  });
}

export function useGenerateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateQuizPayload) =>
      quizzesApi.generateQuiz(payload),
    onSuccess: () => {
      // Invalida os sets de flashcards para atualizar a lista (já que quizzes também aparecem como sets)
      queryClient.invalidateQueries({ queryKey: ['getFlashcardSets'] });
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setId, quizId }: { setId: string; quizId: string }) =>
      quizzesApi.deleteQuiz(setId, quizId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quizzesBySet(variables.setId) });
    },
  });
}




