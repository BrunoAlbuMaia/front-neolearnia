import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { flashcardsApi } from '../api';
import type { FlashcardSet, GenerateFlashcardsPayload } from '../types';

const QUERY_KEYS = {
  flashcardSets: () => [flashcardsApi.getFlashcardSets.name] as const,
  flashcardsBySet: (setId: string) => ['flashcards', setId] as const,
};

export function useFlashcardSets() {
  return useQuery<FlashcardSet[]>({
    queryKey: QUERY_KEYS.flashcardSets(),
    queryFn: () => flashcardsApi.getFlashcardSets(),
  });
}

export function useFlashcardsBySet(setId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.flashcardsBySet(setId),
    queryFn: () => flashcardsApi.getFlashcardsBySetId(setId),
    enabled: !!setId,
  });
}

export function useGenerateFlashcards() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GenerateFlashcardsPayload) =>
      flashcardsApi.generateFlashcards(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.flashcardSets() });
    },
  });
}

export function useDeleteFlashcardSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (setId: string) => flashcardsApi.deleteFlashcardSet(setId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.flashcardSets() });
    },
  });
}

export function useCreateFlashcardSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { title: string; type?: 'flashcard' | 'quiz'; color?: string }) =>
      flashcardsApi.createFlashcardSet(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.flashcardSets() });
    },
  });
}

export function useUpdateFlashcardDifficulty() {
  return useMutation({
    mutationFn: ({ flashcardId, difficulty }: { flashcardId: string; difficulty: 'easy' | 'medium' | 'difficult' }) =>
      flashcardsApi.updateFlashcardDifficulty(flashcardId, { difficulty }),
  });
}


export function useUpdateFlashcardSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setId, title }: { setId: string; title: string }) =>
      flashcardsApi.updateFlashcardSets(setId, { title }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.flashcardSets() });
    },
  });
}

export function useDeleteFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ setId, flashcardId }: { setId: string; flashcardId: string }) =>
      flashcardsApi.deleteFlashcard(setId, flashcardId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.flashcardsBySet(variables.setId) });
    },
  });
}