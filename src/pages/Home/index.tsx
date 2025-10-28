import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { onAuthChange, logout } from "../../lib/firebase/auth";
import AuthScreen from "../../components/Auth/AuthScreen";
import Dashboard from "../../components/Dashboard";
import { AnalyticsPage } from "../../components/AnalyticsPage";
import { type Flashcard } from "../../../shared/schema";
import { useToast } from "../../hooks/use-toast";
import { StudyPage } from "./StudyPage";
type Screen = 'auth' | 'dashboard' | 'study' | 'analytics' | 'reviewMode';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  const [user, setUser] = useState<any>(null);
  const [studyFlashcards, setStudyFlashcards] = useState<Flashcard[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        setCurrentScreen('dashboard');
      } else {
        setUser(null);
        setCurrentScreen('auth');
      }
    });

    return () => unsubscribe();
  }, []);

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
