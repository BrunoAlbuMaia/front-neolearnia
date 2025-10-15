import { apiGet } from './client';
import type {
  StudyProgressData,
  DifficultyStats,
  TimeAnalyticsData,
} from '../types';

export const analyticsApi = {
  getStudyProgress: () =>
    apiGet<StudyProgressData>('/api/analytics/progress'),

  getDifficultyStats: () =>
    apiGet<DifficultyStats>('/api/analytics/stats'),

  getTimeAnalytics: () =>
    apiGet<TimeAnalyticsData>('/api/analytics/time-data'),
};
