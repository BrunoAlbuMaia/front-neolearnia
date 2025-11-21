import { apiRequest } from "./client";

export interface RetentionResponse {
  overallRetentionRate: number;
  retentionByDifficulty: {
    easy: number;
    medium: number;
    difficult: number;
  };
  retentionOverTime: Array<{
    date: string;
    retentionRate: number;
  }>;
  cardsMastered: number;
  cardsLearning: number;
  cardsNeedingReview: number;
  averageEaseFactor: number;
  longestStreak: number;
}

export interface RecommendedCard {
  flashcard_id: string;
  question: string;
  answer: string;
  color: string | null;
  name_deck: string;
  next_review_date: string;
  last_difficulty: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  priority: number;
  days_overdue: number;
  reason: string;
}

export interface RecommendedCardsResponse {
  cards: RecommendedCard[];
  adaptiveSuggestions: {
    focusOnDifficult: boolean;
    increaseDifficulty: boolean;
    reviewBasics: boolean;
  };
}

export interface GamificationResponse {
  currentStreak: number;
  longestStreak: number;
  totalStudyDays: number;
  badges: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    unlockedAt: string | null;
  }>;
  achievements: {
    cardsMastered: number;
    perfectWeek: boolean;
    earlyBird: boolean;
    nightOwl: boolean;
    speedDemon: boolean;
    marathon: boolean;
  };
  nextMilestone: {
    type: string;
    target: number;
    current: number;
    reward: string;
  };
}

export const analyticsApi = {
  getRetention: () =>
    apiRequest<RetentionResponse>("GET", "/api/analytics/retention"),

  getRecommendedCards: (params?: {
    limit?: number;
    difficulty?: "easy" | "medium" | "difficult";
    adaptive?: boolean;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.difficulty) queryParams.append("difficulty", params.difficulty);
    if (params?.adaptive !== undefined)
      queryParams.append("adaptive", params.adaptive.toString());
    const queryString = queryParams.toString();
    return apiRequest<RecommendedCardsResponse>(
      "GET",
      `/api/flashcards/recommended${queryString ? `?${queryString}` : ""}`
    );
  },

  getGamification: () =>
    apiRequest<GamificationResponse>("GET", "/api/user/gamification"),
};
