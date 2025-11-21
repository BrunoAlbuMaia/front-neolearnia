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
  color?: string; // Cor do deck (opcional, para exibição)
  // Campos para flashcards de múltipla escolha (quiz)
  type?: 'standard' | 'quiz'; // Tipo do flashcard
  alternatives?: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correct_answer?: 'A' | 'B' | 'C' | 'D'; // Resposta correta para quiz
}
export interface ReviewCard {
  flashcard_id: string;
  name_deck: string;
  question: string;
  answer: string;
  next_review_date: string;
  color?: string; // Cor do deck (opcional, para exibição)
}


export interface UserState {
  focus_area: string;
  learning_style: string;
  ai_level: string;
  motivation: string;
  preferred_schedule: string;
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
  color?: string;
  type?: 'flashcard' | 'quiz'; // Tipo do deck (flashcards padrão ou quizzes)
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
  qtdCards: number;
  title?: string;
  color?: string;
  cardType?: 'standard' | 'quiz'; // Tipo de flashcard a ser gerado
}

export interface GenerateFlashcardsResponse {
  flashcards: Flashcard[];
  flashcardSet: FlashcardSet;
}

// Interface duplicada removida - usando a definição completa acima

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

// Dashboard Types
export interface DashboardOverview {
  total_sessions: number;
  total_cards_studied: number;
  total_xp: number;
  avg_session_duration: number; // em minutos ou segundos
}

export interface DashboardActivity {
  day: string; // formato de data
  sessions: number;
}

export interface DashboardDifficulty {
  easy: number;
  medium: number;
  difficult: number;
}

export interface DashboardReviewSchedule {
  due_today: number;
  overdue: number;
  avg_ease_factor: number;
}

export interface SpeedAnalysisCard {
  flashcard_id: string;
  title?: string;
  question: string;
  answer: string;
  avg_time_seconds: number;
  total_reviews: number;
}

export interface DashboardSpeedAnalysis {
  slowest: SpeedAnalysisCard[];
  fastest: SpeedAnalysisCard[];
}

// Quiz Types
export interface QuizOption {
  id: string;
  quiz_id: string;
  text: string;
  is_correct: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Quiz {
  id: string;
  question: string;
  set_id: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  options: QuizOption[];
}

export interface GenerateQuizPayload {
  text: string;
  set_id?: string;
  qtd_questions: number;
  title?: string; // obrigatório se não enviar set_id
}

export interface GenerateQuizResponse {
  quizzes: Quiz[];
  flashcardSet: FlashcardSet;
}