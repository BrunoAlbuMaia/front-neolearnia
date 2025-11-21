import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../hooks/useUser";
import { Spinner } from "../../components/ui/spinner";
import { lazy, Suspense } from "react";

const OnboardingScreen = lazy(() => import("../../components/Auth/Onboarding/OnboardingScreen"));

export default function OnboardingPage() {
  const { user, loading: authLoading } = useAuth();
  const { userState, isLoading: userLoading } = useUser();
  const [, setLocation] = useLocation();

  // Redirecionar se não está logado
  useEffect(() => {
    if (!user && !authLoading) {
      setLocation("/login");
    }
  }, [user, authLoading, setLocation]);

  // Redirecionar se já completou onboarding
  useEffect(() => {
    if (user && !authLoading && !userLoading && userState) {
      const parsedUserState = Array.isArray(userState)
        ? {
            id: userState[0],
            user_id: userState[1],
            focus_area: userState[2],
            learning_style: userState[3],
            ai_level: userState[4],
            motivation: userState[5],
            preferred_schedule: userState[6],
            created_at: userState[7],
            has_onboarded: true
          }
        : userState;

      if (parsedUserState && parsedUserState.has_onboarded) {
        setLocation("/dashboard");
      }
    }
  }, [user, authLoading, userLoading, userState, setLocation]);

  if (!user || authLoading || userLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" text="Carregando..." />
      </div>
    );
  }

  return (
    <Suspense fallback={<Spinner size="lg" text="Carregando onboarding..." />}>
      <OnboardingScreen />
    </Suspense>
  );
}

