import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../hooks/useUser";
import AuthScreen from "../../components/Auth/AuthScreen";
import { Spinner } from "../../components/ui/spinner";
import { lazy, Suspense } from "react";

//const OnboardingScreen = lazy(() => import("../../components/Auth/Onboarding/OnboardingScreen"));

export default function AuthPage() {
  const { user, loading: authLoading } = useAuth();
  const { userState, isLoading: userLoading } = useUser();
  const [, setLocation] = useLocation();

  // Se usuário está logado, verificar se precisa de onboarding
  useEffect(() => {
    if (user && !authLoading && !userLoading) {

      //if (parsedUserState && !parsedUserState.has_onboarded) {
       // setLocation("/onboarding");
      //} else {
       // setLocation("/dashboard");
      //}
      setLocation("/dashboard");
    }
  }, [user, authLoading, userLoading, userState]);

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

