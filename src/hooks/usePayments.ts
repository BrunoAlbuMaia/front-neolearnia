import { useQuery, useMutation } from "@tanstack/react-query";
import { paymentsApi } from "../api/paymentsApi";

export function usePayments() {
  // Buscar todos os planos disponíveis
  const {
    data: plans,
    isLoading: loadingPlans,
    error: plansError,
  } = useQuery({
    queryKey: ["plans"],
    queryFn: () => paymentsApi.getPlans(),
  });

  // Criar checkout
  const checkoutMutation = useMutation({
    mutationFn: (planId: string) => paymentsApi.createCheckout(planId),
  });

  return {
    plans,
    loadingPlans,
    plansError,
    createCheckout: checkoutMutation.mutateAsync,
  };
}
