import { apiRequest } from "./client";
import type { ReviewCard } from "../types";

export const reviewApi = {
  getReviewsToday: () =>
    apiRequest<ReviewCard[]>("GET", "/api/review"),

  recordCardReview: (payload: { flashcardId: string; difficulty: string }) =>
    apiRequest("POST", "/api/card-reviews", payload),
};
