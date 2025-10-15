export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  setId: string;
  difficulty?: 'easy' | 'medium' | 'difficult';
  createdAt?: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  userId: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StudySession {
  id: string;
  flashcardSetId: string;
  userId: string;
  totalCards: number;
  completedCards: number;
  startedAt: string;
  endedAt?: string;
  easyCount: number;
  mediumCount: number;
  difficultCount: number;
}

export interface CardReview {
  id: string;
  flashcardId: string;
  sessionId: string;
  userId: string;
  difficulty: 'easy' | 'medium' | 'difficult';
  timeSpent: number;
  reviewedAt: string;
}

export interface StudyProgressData {
  totalCards: number;
  studiedToday: number;
  weeklyGoal: number;
  currentStreak: number;
}

export interface DifficultyStats {
  easy: number;
  medium: number;
  difficult: number;
}

export interface TimeAnalyticsData {
  averageStudyTime: number;
  totalStudyTime: number;
  sessionsCount: number;
}

export interface GenerateFlashcardsPayload {
  text: string;
  setId?: string;
  title?: string;
}

export interface GenerateFlashcardsResponse {
  flashcards: Flashcard[];
  flashcardSet: FlashcardSet;
}

export interface SyncUserPayload {
  email: string;
  name?: string;
}

export interface CreateStudySessionPayload {
  flashcardSetId: string;
  totalCards: number;
  startedAt: string;
}

export interface UpdateStudySessionPayload {
  endedAt: string;
  completedCards: number;
  easyCount: number;
  mediumCount: number;
  difficultCount: number;
}

export interface RecordReviewPayload {
  flashcardId: string;
  sessionId: string;
  difficulty: 'easy' | 'medium' | 'difficult';
  timeSpent: number;
}

export interface UpdateFlashcardDifficultyPayload {
  difficulty: 'easy' | 'medium' | 'difficult';
}
