import { apiRequest, apiGet } from './client';
import type {
  Flashcard,
  FlashcardSet,
  GenerateFlashcardsPayload,
  GenerateFlashcardsResponse,
  UpdateFlashcardDifficultyPayload,
  UpdateFlashcardSets
} from '../types';

export const flashcardsApi = {
  generateFlashcards: (payload: GenerateFlashcardsPayload) =>
    apiRequest<GenerateFlashcardsResponse>('POST', '/api/flashcards/generate', payload),

  getFlashcardsBySetId: (setId: string) =>
    apiGet<Flashcard[]>(`/api/flashcards/${setId}`),

  createFlashcard: (payload: { set_id: string; question: string; answer: string }) =>
    apiRequest<Flashcard>('POST', '/api/flashcards', payload),

  updateFlashcard: (setId: string, flashcardId: string, payload: { question: string; answer: string }) =>
    apiRequest<Flashcard>('PATCH', `/api/flashcards/${setId}/${flashcardId}`, payload),

  deleteFlashcard: (setId: string, flashcardId: string) =>
    apiRequest<void>('DELETE', `/api/flashcards/${setId}/${flashcardId}`),

  updateFlashcardDifficulty: (flashcardId: string, payload: UpdateFlashcardDifficultyPayload) =>
    apiRequest<void>('PATCH', `/api/flashcards/${flashcardId}/difficulty`, payload),

  updateFlashcardSets:(setId: string, payload: UpdateFlashcardSets) =>
    apiRequest<void>('PATCH', `/api/study-sets/${setId}`, payload),

  getFlashcardSets: () =>
    apiGet<FlashcardSet[]>('/api/study-sets'),

  createFlashcardSet: (payload: { title: string; type?: 'flashcard' | 'quiz'; color?: string }) =>
    apiRequest<FlashcardSet>('POST', '/api/study-sets', {
      ...payload,
      original_text: '', // Deck criado manualmente não tem texto original
    }),

  deleteFlashcardSet: (setId: string) =>
    apiRequest<void>('DELETE', `/api/study-sets/${setId}`),
};
