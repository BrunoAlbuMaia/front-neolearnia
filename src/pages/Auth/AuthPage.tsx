import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../hooks/useUser";
import AuthScreen from "../../components/Auth/AuthScreen";
import { Spinner } from "../../components/ui/spinner";
import { lazy, Suspense } from "react";

const OnboardingScreen = lazy(() => import("../../components/Auth/Onboarding/OnboardingScreen"));

export default function AuthPage() {
  const { user, loading: authLoading } = useAuth();
  const { userState, isLoading: userLoading } = useUser();
  const [, setLocation] = useLocation();

  // Se usuário está logado, verificar se precisa de onboarding
  useEffect(() => {
    if (user && !authLoading && !userLoading) {
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

      if (parsedUserState && !parsedUserState.has_onboarded) {
        setLocation("/onboarding");
      } else {
        setLocation("/dashboard");
      }
    }
  }, [user, authLoading, userLoading, userState, setLocation]);

  // Se usuário está logado, mostrar loading enquanto redireciona
  if (user && !authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" text="Redirecionando..." />
      </div>
    );
  }

  // Mostrar tela de autenticação
  const handleAuthSuccess = () => {
    // O useEffect acima vai lidar com o redirecionamento
  };

  return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
}

