import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import AuthScreen from "../../components/Auth/AuthScreen";
import Dashboard from "../../components/Dashboard";
import { type Flashcard } from "../../../shared/schema";
import { useToast } from "../../hooks/use-toast";
import { useUser } from "../../hooks/useUser";
import { Spinner } from "../../components/ui/spinner";
import { type Quiz } from "../../types";

// Lazy load de componentes pesados para melhor performance
const AnalyticsPage = lazy(() => import("../../components/AnalyticsPage").then(m => ({ default: m.AnalyticsPage })));
const StudyPage = lazy(() => import("./StudyPage").then(m => ({ default: m.StudyPage })));
const QuizPage = lazy(() => import("./QuizPage").then(m => ({ default: m.QuizPage })));
const OnboardingScreen = lazy(() => import("../../components/Auth/Onboarding/OnboardingScreen"));

type Screen = 'auth' | 'dashboard' | 'study' | 'quiz' | 'analytics' | 'reviewMode' | 'onboarding';

export default function Home() {
  const { user: authUser, loading: authLoading, logoutUser } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen | null>(null);
  const [studyFlashcards, setStudyFlashcards] = useState<Flashcard[]>([]);
  const [studyQuizzes, setStudyQuizzes] = useState<Quiz[]>([]);
  const [quizDeckColor, setQuizDeckColor] = useState<string>("#3B82F6");
  const { toast } = useToast();
  const { userState, isLoading: userLoading } = useUser();

  // Memoizar parsedUserState para evitar recálculos desnecessários
  const parsedUserState = useMemo(() => {
    if (!userState) return null;
    return Array.isArray(userState)
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
  }, [userState]);

  // Limpa estado local quando o usuário muda ou faz logout
  useEffect(() => {
    if (!authUser) {
      // Limpa estado local quando não há usuário (logout)
      setStudyFlashcards([]);
      setStudyQuizzes([]);
      setQuizDeckColor("#3B82F6");
      setCurrentScreen('auth');
    }
  }, [authUser]);

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
  }, [authUser, authLoading, parsedUserState, userLoading]);

  // Memoizar callbacks para evitar re-renders desnecessários
  const handleAuthSuccess = useCallback(() => {
    // Após login bem-sucedido, o AuthContext atualizará e o useEffect acima determinará a tela correta
    // Por enquanto, forçamos dashboard (será ajustado pelo useEffect baseado no userState)
    setCurrentScreen('dashboard');
  }, []);
  
  const handleStartStudy = useCallback((flashcards: Flashcard[]) => {
    setStudyFlashcards(flashcards);
    setCurrentScreen('study');
  }, []);

  const handleStartQuiz = useCallback((quizzes: Quiz[], deckColor?: string) => {
    setStudyQuizzes(quizzes);
    setQuizDeckColor(deckColor || "#3B82F6");
    setCurrentScreen('quiz');
  }, []);
  
  const handleBackToDashboard = useCallback(() => setCurrentScreen('dashboard'), []);
  const handleNavigateToAnalytics = useCallback(() => setCurrentScreen('analytics'), []);

  const handleLogout = useCallback(async () => {
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
  }, [logoutUser, toast]);

  // Memoizar renderScreen para evitar recriação a cada render
  const renderScreen = useMemo(() => {
    switch (currentScreen) {
      case 'auth':
        return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
      case 'study':
        return (
          <Suspense fallback={<Spinner size="lg" text="Carregando modo de estudo..." />}>
            <StudyPage flashcards={studyFlashcards} onBack={handleBackToDashboard} />
          </Suspense>
        );
      case 'quiz':
        return (
          <Suspense fallback={<Spinner size="lg" text="Carregando quiz..." />}>
            <QuizPage quizzes={studyQuizzes} onBack={handleBackToDashboard} deckColor={quizDeckColor} />
          </Suspense>
        );
      case 'analytics':
        return (
          <div className="min-h-screen bg-background">
            <div className="max-w-6xl mx-auto p-4">
              <Suspense fallback={<Spinner size="lg" text="Carregando analytics..." />}>
                <AnalyticsPage />
              </Suspense>
            </div>
          </div>
        );
      case 'onboarding':
        return (
          <Suspense fallback={<Spinner size="lg" text="Carregando onboarding..." />}>
            <OnboardingScreen />
          </Suspense>
        );
      default:
        return (
          <Dashboard 
            user={authUser}
            onLogout={handleLogout}
            onStartStudy={handleStartStudy}
            onStartQuiz={handleStartQuiz}
            onNavigateToAnalytics={handleNavigateToAnalytics}
          />
        );
    }
  }, [currentScreen, handleAuthSuccess, studyFlashcards, studyQuizzes, quizDeckColor, handleBackToDashboard, handleLogout, handleStartStudy, handleStartQuiz, handleNavigateToAnalytics, authUser]);

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
          {renderScreen}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
