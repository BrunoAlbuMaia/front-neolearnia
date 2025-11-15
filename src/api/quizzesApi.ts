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

  createQuiz: (payload: { 
    set_id: string; 
    question: string; 
    options: Array<{ text: string; is_correct: boolean }> 
  }) =>
    apiRequest<Quiz>('POST', '/api/quizzes', payload),

  updateQuiz: (
    setId: string, 
    quizId: string, 
    payload: { 
      question: string; 
      options: Array<{ text: string; is_correct: boolean }> 
    }
  ) =>
    apiRequest<Quiz>('PATCH', `/api/quizzes/${setId}/${quizId}`, payload),

  deleteQuiz: (setId: string, quizId: string) =>
    apiRequest<void>('DELETE', `/api/quizzes/${setId}/${quizId}`),
};




