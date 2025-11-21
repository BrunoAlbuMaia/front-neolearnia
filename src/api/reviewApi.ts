import { apiRequest } from "./client";
import type { ReviewCard } from "../types";

export interface ReviewSummary {
  totalDue: number;
  overdue: number;
  dueToday: number;
  dueThisWeek: number;
  byDifficulty: {
    easy: number;
    medium: number;
    difficult: number;
  };
}

export interface ReviewsResponse {
  cards: ReviewCard[];
  summary?: ReviewSummary;
}

export const reviewApi = {
  getReviewsToday: (params?: { 
    onlyDifficult?: boolean; 
    onlyOverdue?: boolean;
    difficulty?: "easy" | "medium" | "difficult";
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.onlyDifficult) queryParams.append("onlyDifficult", "true");
    if (params?.onlyOverdue) queryParams.append("onlyOverdue", "true");
    if (params?.difficulty) queryParams.append("difficulty", params.difficulty);
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const queryString = queryParams.toString();
    return apiRequest<ReviewsResponse>(
      "GET",
      `/api/review${queryString ? `?${queryString}` : ""}`
    );
  },

  recordCardReview: (payload: { flashcardId: string; difficulty: string }) =>
    apiRequest("POST", "/api/card-reviews", payload),
};
