import Dashboard from "../../components/Dashboard";
import { type Flashcard } from "../../../shared/schema";

interface DashboardPageProps {
  user: any;
  onLogout: () => void;
  onStartStudy: (flashcards: Flashcard[]) => void;
  onNavigateToAnalytics: () => void;
}

export function DashboardPage({
  user,
  onLogout,
  onStartStudy,
  onNavigateToAnalytics,
}: DashboardPageProps) {
  return (
    <main className="min-h-screen bg-background transition-all duration-300">
      <Dashboard
        user={user}
        onLogout={onLogout}
        onStartStudy={onStartStudy}
        onNavigateToAnalytics={onNavigateToAnalytics}
      />
    </main>
  );
}
