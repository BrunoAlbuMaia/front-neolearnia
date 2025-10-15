import { apiRequest } from './client';
import type {
  StudySession,
  CreateStudySessionPayload,
  UpdateStudySessionPayload,
  RecordReviewPayload,
  CardReview,
} from '../types';

export const studyApi = {
  createStudySession: (payload: CreateStudySessionPayload) =>
    apiRequest<StudySession>('POST', '/api/study-sessions', payload),

  updateStudySession: (sessionId: string, payload: UpdateStudySessionPayload) =>
    apiRequest<StudySession>('PATCH', `/api/study-sessions/${sessionId}`, payload),

  recordCardReview: (payload: RecordReviewPayload) =>
    apiRequest<CardReview>('POST', '/api/card-reviews', payload),
};
