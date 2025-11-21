import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../../context/AuthContext";
import ReviewMode from "../../components/ReviewMode";
import { Spinner } from "../../components/ui/spinner";

export default function ReviewPage() {
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
    <div className="min-h-screen bg-background flex flex-col">
      <ReviewMode />
    </div>
  );
}

