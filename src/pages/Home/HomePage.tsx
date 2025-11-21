import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../../context/AuthContext";
import { useUser } from "../../hooks/useUser";
import Dashboard from "../../components/Dashboard";
import { useToast } from "../../hooks/use-toast";
import type { Flashcard } from "../../../shared/schema";
import type { Quiz } from "../../types";

export function HomePage() {
  const { user, loading, logoutUser } = useAuth();
  const [, setLocation] = useLocation();
  const { userState, isLoading: userLoading } = useUser();
  const { toast } = useToast();

  // Redirecionar se não está logado
  useEffect(() => {
    if (!user && !loading) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  /* Verificar se precisa de onboarding
  useEffect(() => {
    if (user && !loading && !userLoading && userState) {
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
      }
    }
  }, [user, loading, userLoading, userState, setLocation]);*/

  const handleStartStudy = (flashcards: Flashcard[]) => {
    // Buscar o deckId do primeiro flashcard
    const deckId = flashcards[0]?.set_id;
    if (deckId) {
      setLocation(`/study/${deckId}`);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o estudo.",
        variant: "destructive",
      });
    }
  };

  const handleStartQuiz = (quizzes: Quiz[], deckColor?: string) => {
    // Para quiz, usar a mesma rota de study (detecta automaticamente)
    const deckId = quizzes[0]?.set_id;
    if (deckId) {
      setLocation(`/study/${deckId}`);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o quiz.",
        variant: "destructive",
      });
    }
  };

  const handleNavigateToAnalytics = () => {
    setLocation("/analytics");
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
      setLocation("/login");
    } catch {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // AppRouter já trata o loading inicial de autenticação
  // Se userLoading ainda estiver true, renderizar Dashboard mesmo assim
  // (Dashboard tem seus próprios skeletons para loading de dados)
  if (!user) {
    return null; // AppRouter já redirecionou para /login
  }

  return (
    <main className="min-h-screen bg-background transition-all duration-300">
      <Dashboard
        user={user}
        onLogout={handleLogout}
        onStartStudy={handleStartStudy}
        onStartQuiz={handleStartQuiz}
        onNavigateToAnalytics={handleNavigateToAnalytics}
      />
    </main>
  );
}
