export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  set_id: string;
  review_count: number;
  created_at?: string ;
  created_by:string;
  updated_at?:string;
  updated_by?:string;
}
export interface ReviewCard {
  flashcard_id: string;
  name_deck: string;
  question: string;
  answer: string;
  next_review_date: string;
}


export interface SyncUserPayload {
  email: string;
  name: string;
  sessionId: string; 
}

export interface SyncUserResponse {
  user: {
    id: string;
    email: string;
    name: string;
    firebase_uid: string;
    created_at: string;
  };
  session: {
    id: string;
    createdAt: string;
  };
  message: string;
}

export interface SessionInfo {
  sessionId: string;
  createdAt: number;
  isValid: boolean;
}

export interface CardReviewShedules{
  flashcardId:string;
  difficulty:string
}

export interface FlashcardSet {
  id: string;
  user_id: string;
  title: string;
  original_text:string;
  created_at: string;

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

export interface UpdateFlashcardSets {
  title:string
}