import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { onAuthChange, logout } from "../../lib/firebase/auth";
import AuthScreen from "../../components/Auth/AuthScreen";
import Dashboard from "../../components/Dashboard";
import { AnalyticsPage } from "../../components/AnalyticsPage";
import { type Flashcard } from "../../../shared/schema";
import { useToast } from "../../hooks/use-toast";
import { StudyPage } from "./StudyPage";
import { useUser } from "../../hooks/useUser";
import OnboardingScreen from "../../components/Auth/Onboarding/OnboardingScreen";
type Screen = 'auth' | 'dashboard' | 'study' | 'analytics' | 'reviewMode' | 'onboarding';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [user, setUser] = useState<any>(null);
  const [studyFlashcards, setStudyFlashcards] = useState<Flashcard[]>([]);
  const { toast } = useToast();
  const { userState, isLoading: userLoading } = useUser()

   useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        setCurrentScreen('auth');
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
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
        has_onboarded: true // padrão quando já existe user_state
      }
    : userState;
    
    // ✅ Quando o estado do usuário é carregado
    if (parsedUserState) {
      if (!parsedUserState.has_onboarded) {
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen('dashboard');
      }
    }
  }, [user, userState]);


  const handleAuthSuccess = () => setCurrentScreen('dashboard');
  
  const handleStartStudy = (flashcards: Flashcard[]) => {
    setStudyFlashcards(flashcards);
    setCurrentScreen('study');
  };
  
  const handleBackToDashboard = () => setCurrentScreen('dashboard');
  const handleNavigateToAnalytics = () => setCurrentScreen('analytics');

  const handleLogout = async () => {
    try {
      await logout();
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
            user={user}
            onLogout={handleLogout}
            onStartStudy={handleStartStudy}
            onNavigateToAnalytics={handleNavigateToAnalytics}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {renderScreen()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
