import { apiRequest, apiGet } from './client';
import type {
  Quiz,
  GenerateQuizPayload,
  GenerateQuizResponse,
  FlashcardSet,
} from '../types';

export const quizzesApi = {
  generateQuiz: (payload: GenerateQuizPayload) =>
    apiRequest<GenerateQuizResponse>('POST', '/api/quizzes/generate', payload),

  getQuizzesBySetId: (setId: string) =>
    apiGet<Quiz[]>(`/api/quizzes/${setId}`),

  getQuizById: (setId: string, quizId: string) =>
    apiGet<Quiz>(`/api/quizzes/${setId}/${quizId}`),
};




