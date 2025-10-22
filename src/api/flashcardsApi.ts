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

  updateFlashcardDifficulty: (flashcardId: string, payload: UpdateFlashcardDifficultyPayload) =>
    apiRequest<void>('PATCH', `/api/flashcards/${flashcardId}/difficulty`, payload),

  updateFlashcardSets:(setId: string, payload: UpdateFlashcardSets) =>
    apiRequest<void>('PATCH', `/api/flashcard-sets/${setId}`, payload),

  getFlashcardSets: () =>
    apiGet<FlashcardSet[]>('/api/flashcard-sets'),

  deleteFlashcardSet: (setId: string) =>
    apiRequest<void>('DELETE', `/api/flashcard-sets/${setId}`),
};
