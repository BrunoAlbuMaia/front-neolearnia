import { useQuery } from "@tanstack/react-query";
import { reviewApi } from "../api/reviewApi";
import type { ReviewCard } from "../types";

export function useReviews() {
  return useQuery<ReviewCard[]>({
    queryKey: ["reviews-today"],
    queryFn: reviewApi.getReviewsToday,
  });
}
