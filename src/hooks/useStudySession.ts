import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { studyApi } from '../api';
import type {
  CreateStudySessionPayload,
  UpdateStudySessionPayload,
  RecordReviewPayload,
} from '../types';
import { SingleStoreJson } from 'drizzle-orm/singlestore-core';

export interface StudyStats {
  easy: number;
  medium: number;
  difficult: number;
}

export function useStudySession(flashcardSetId?: string, totalCards?: number) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionStartTime] = useState(new Date());
  const [stats, setStats] = useState<StudyStats>({ easy: 0, medium: 0, difficult: 0 });
  const queryClient = useQueryClient();

  const createSession = useMutation({
    mutationFn: (payload: CreateStudySessionPayload) =>
      studyApi.createStudySession(payload),
    onSuccess: (session) => {
      console.log(session)
      setSessionId(session.id);
    },
  });

  const updateSession = useMutation({
    mutationFn: ({ sessionId, payload }: { sessionId: string; payload: UpdateStudySessionPayload }) =>
      studyApi.updateStudySession(sessionId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
    },
  });

  const recordReview = useMutation({
    mutationFn: (payload: RecordReviewPayload) =>
      studyApi.recordCardReview(payload),
    onSuccess: () => {
      // Invalidar queries relacionadas após revisão
      queryClient.invalidateQueries({ queryKey: ['reviews-today'] });
      queryClient.invalidateQueries({ queryKey: ['reviews-summary'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['flashcards', 'recommended'] });
      queryClient.invalidateQueries({ queryKey: ['user', 'gamification'] });
    },
  });

  useEffect(() => {
    if (flashcardSetId && totalCards && totalCards > 0) {
      createSession.mutate({
        flashcardSetId,
        totalCards,
        startedAt: sessionStartTime.toISOString(),
      });
    }
  }, [flashcardSetId, totalCards]);

  useEffect(() => {
    return () => {
      if (sessionId) {
        const completedCards = stats.easy + stats.medium + stats.difficult;
        updateSession.mutate({
          sessionId,
          payload: {
            endedAt: new Date().toISOString(),
            completedCards,
            easyCount: stats.easy,
            mediumCount: stats.medium,
            difficultCount: stats.difficult,
          },
        });
      }
    };
  }, [sessionId, stats]);

  const updateStats = (difficulty: 'easy' | 'medium' | 'difficult') => {
    setStats(prev => ({
      ...prev,
      [difficulty]: prev[difficulty] + 1,
    }));
  };

  const finalizeSession = (completedCards?: number) => {
    if (!sessionId) return;

    const cardsCompleted = completedCards ?? stats.easy + stats.medium + stats.difficult;

    updateSession.mutate({
      sessionId,
      payload: {
        endedAt: new Date().toISOString(),
        completedCards: cardsCompleted,
        easyCount: stats.easy,
        mediumCount: stats.medium,
        difficultCount: stats.difficult,
      },
    });
  };

  return {
    sessionId,
    stats,
    updateStats,
    recordReview,
    finalizeSession,
    isCreatingSession: createSession.isPending,
    isRecordingReview: recordReview.isPending,
  };
}
