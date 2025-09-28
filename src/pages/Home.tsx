import { useState, useEffect } from "react";
import { onAuthChange } from "../lib/firebase";
import { logout } from "../lib/firebase";
import AuthScreen from "../components/AuthScreen";
import Dashboard from "../components/Dashboard";
import StudyMode from "../components/StudyMode";
import { AnalyticsPage } from "../components/AnalyticsPage";
import { type Flashcard } from "../../shared/schema";
import { useToast } from "../hooks/use-toast";

type Screen = 'auth' | 'dashboard' | 'study' | 'analytics';

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

  const handleAuthSuccess = () => {
    setCurrentScreen('dashboard');
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logout realizado",
        description: "Até logo!",
      });
    } catch (error) {
      toast({
        title: "Erro no logout",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleStartStudy = (flashcards: Flashcard[]) => {
    setStudyFlashcards(flashcards);
    setCurrentScreen('study');
  };

  const handleBackToDashboard = () => {
    setCurrentScreen('dashboard');
  };

  const handleNavigateToAnalytics = () => {
    setCurrentScreen('analytics');
  };

  if (currentScreen === 'auth') {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  if (currentScreen === 'study') {
    return <StudyMode flashcards={studyFlashcards} onBack={handleBackToDashboard} />;
  }

  if (currentScreen === 'analytics') {
    return (
      <div className="min-h-screen bg-background">
        <nav className="bg-card border-b border-border px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground text-sm">📊</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">NeoLearnIA Analytics</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleBackToDashboard}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-back-to-dashboard"
              >
                ← Voltar ao Dashboard
              </button>
              <span className="text-sm text-muted-foreground" data-testid="text-user-name">
                {user?.email || "Usuário"}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                data-testid="button-logout"
              >
                Sair
              </button>
            </div>
          </div>
        </nav>
        <div className="max-w-6xl mx-auto p-4">
          <AnalyticsPage />
        </div>
      </div>
    );
  }

  return (
    <Dashboard 
      user={user}
      onLogout={handleLogout}
      onStartStudy={handleStartStudy}
      onNavigateToAnalytics={handleNavigateToAnalytics}
    />
  );
}
