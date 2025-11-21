import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../../context/AuthContext";
import { AnalyticsPage as AnalyticsComponent } from "../../components/AnalyticsPage";
import { Spinner } from "../../components/ui/spinner";

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user && !loading) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" text="Carregando..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4">
        <AnalyticsComponent />
      </div>
    </div>
  );
}

