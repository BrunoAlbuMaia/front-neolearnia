import { apiRequest } from "./client";

export const paymentsApi = {
  getPlans: () => apiRequest("GET", "/api/plans"),

  // Recebe planId e body com card_token_id + dados do pagador
  createCheckout: (planId: string) =>
    apiRequest("POST", `/api/checkout/${planId}`),

  subscribe: (body: any) => apiRequest("POST", "/api/payments/subscribe", body), // novo endpoint

};
