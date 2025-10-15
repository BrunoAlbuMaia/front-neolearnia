import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api';
import type { StudyProgressData, DifficultyStats, TimeAnalyticsData } from '../types';

export type AnalyticsView = 'progress' | 'difficulty' | 'time';

export function useAnalytics(view: AnalyticsView) {
  const progressQuery = useQuery<StudyProgressData>({
    queryKey: ['analytics', 'progress'],
    queryFn: () => analyticsApi.getStudyProgress(),
    enabled: view === 'progress',
  });

  const difficultyQuery = useQuery<DifficultyStats>({
    queryKey: ['analytics', 'difficulty'],
    queryFn: () => analyticsApi.getDifficultyStats(),
    enabled: view === 'difficulty',
  });

  const timeQuery = useQuery<TimeAnalyticsData>({
    queryKey: ['analytics', 'time'],
    queryFn: () => analyticsApi.getTimeAnalytics(),
    enabled: view === 'time',
  });

  return {
    progressData: progressQuery.data,
    difficultyStats: difficultyQuery.data,
    timeData: timeQuery.data,
    isLoading: progressQuery.isLoading || difficultyQuery.isLoading || timeQuery.isLoading,
  };
}
