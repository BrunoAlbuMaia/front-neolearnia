import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import AuthScreen from "../../components/Auth/AuthScreen";
import Dashboard from "../../components/Dashboard";
import { AnalyticsPage } from "../../components/AnalyticsPage";
import { type Flashcard } from "../../../shared/schema";
import { useToast } from "../../hooks/use-toast";
import { StudyPage } from "./StudyPage";
import { useUser } from "../../hooks/useUser";
import OnboardingScreen from "../../components/Auth/Onboarding/OnboardingScreen";
import { Spinner } from "../../components/ui/spinner";

type Screen = 'auth' | 'dashboard' | 'study' | 'analytics' | 'reviewMode' | 'onboarding';

export default function Home() {
  const { user: authUser, loading: authLoading, logoutUser } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen | null>(null);
  const [studyFlashcards, setStudyFlashcards] = useState<Flashcard[]>([]);
  const { toast } = useToast();
  const { userState, isLoading: userLoading } = useUser();

  // Determina o screen inicial baseado no estado do AuthContext
  useEffect(() => {
    // Se não há usuário, mostra tela de auth imediatamente (mesmo durante loading)
    // Isso evita tela preta durante logout
    if (!authUser) {
      setCurrentScreen('auth');
      return;
    }

    // Aguarda o carregamento do AuthContext antes de decidir para usuários logados
    if (authLoading) {
      return;
    }

    // Se há usuário mas ainda está carregando userState, aguarda
    if (userLoading) {
      return;
    }

    // Processa o userState para determinar a tela
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

    if (parsedUserState) {
      if (!parsedUserState.has_onboarded) {
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen('dashboard');
      }
    } else {
      // Se não há userState ainda, mostra dashboard (assumindo que será carregado)
      setCurrentScreen('dashboard');
    }
  }, [authUser, authLoading, userState, userLoading]);

  const handleAuthSuccess = () => {
    // Após login bem-sucedido, o AuthContext atualizará e o useEffect acima determinará a tela correta
    // Por enquanto, forçamos dashboard (será ajustado pelo useEffect baseado no userState)
    setCurrentScreen('dashboard');
  };
  
  const handleStartStudy = (flashcards: Flashcard[]) => {
    setStudyFlashcards(flashcards);
    setCurrentScreen('study');
  };
  
  const handleBackToDashboard = () => setCurrentScreen('dashboard');
  const handleNavigateToAnalytics = () => setCurrentScreen('analytics');

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'auth':
        return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
      case 'study':
        return <StudyPage flashcards={studyFlashcards} onBack={handleBackToDashboard} />;
      case 'analytics':
        return (
          <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto p-4">
              <AnalyticsPage />
            </div>
          </div>
        );
      case 'onboarding':
        return(
          <OnboardingScreen></OnboardingScreen>
        )
      default:
        return (
          <Dashboard 
            user={authUser}
            onLogout={handleLogout}
            onStartStudy={handleStartStudy}
            onNavigateToAnalytics={handleNavigateToAnalytics}
          />
        );
    }
  };

  // Mostra loading apenas se há usuário mas ainda está carregando
  // Se não há usuário, sempre mostra auth (não mostra loading)
  if (authUser && (authLoading || currentScreen === null)) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" text="Carregando..." />
      </div>
    );
  }

  // Se não há usuário mas currentScreen ainda não foi definido, mostrar auth
  if (!authUser && currentScreen === null) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="relative min-h-screen bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="relative w-full"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
