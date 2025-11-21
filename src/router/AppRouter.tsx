import { Switch, Route, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/ui/spinner";
import Navbar from "../components/ui/navbar";

// Lazy load de páginas pesadas para melhor performance
const AuthPage = lazy(() => import("../pages/Auth/AuthPage"));
const DashboardPage = lazy(() => import("../pages/Dashboard/DashboardPage").then(m => ({ default: m.DashboardPage })));
const StudyPage = lazy(() => import("../pages/Study/StudyPage"));
const ReviewPage = lazy(() => import("../pages/Review/ReviewPage"));
const HomePage = lazy(() => import("../pages/Home/HomePage").then(m => ({ default: m.HomePage })));
const AnalyticsPage = lazy(() => import("../pages/Analytics/AnalyticsPage"));
const PlansPage = lazy(() => import("../pages/Plans/PlansPage"));
const OnboardingPage = lazy(() => import("../pages/Onboarding/OnboardingPage"));
const SettingsPage = lazy(() => import("../pages/Settings/SettingsPage").then(m => ({ default: m.SettingsPage })));
const NotFoundPage = lazy(() => import("../pages/not-found"));

// Componente de loading para páginas
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spinner size="lg" text="Carregando..." />
  </div>
);

export function AppRouter() {
  const { user, logoutUser, loading } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Redirecionar usuários não autenticados para login
  useEffect(() => {
    if (!user && !loading && location !== "/login" && location !== "/") {
      setLocation("/login");
    }
  }, [user, loading, location, setLocation]);

  // Redirecionar usuários autenticados da rota raiz para home
  useEffect(() => {
    if (user && !loading && location === "/") {
      // Não redirecionar, deixar HomePage ser renderizada
      // HomePage vai decidir se mostra dashboard ou onboarding
    }
  }, [user, loading, location, setLocation]);

  // Funções de navegação
  const navigateToHome = () => setLocation("/");
  const navigateToDashboard = () => setLocation("/dashboard");
  const navigateToSettings = () => setLocation("/settings");
  const navigateToReviewMode = () => setLocation("/review");
  const navigateToPlans = () => setLocation("/plans");
  const navigateToAnalytics = () => setLocation("/analytics");

  // Se não há usuário, mostrar apenas tela de login
  if (!user && !loading) {
    return (
      <Switch>
        <Route path="/login">
          <Suspense fallback={<PageLoader />}>
            <AuthPage />
          </Suspense>
        </Route>
        <Route path="/">
          <Suspense fallback={<PageLoader />}>
            <AuthPage />
          </Suspense>
        </Route>
        <Route>
          <Suspense fallback={<PageLoader />}>
            <AuthPage />
          </Suspense>
        </Route>
      </Switch>
    );
  }

  // Mostrar loading durante autenticação
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="lg" text="Carregando..." />
      </div>
    );
  }

  // Renderizar navbar apenas quando user existe
  return (
    <>
      <Navbar 
        user={user} 
        onLogout={logoutUser} 
        onNavigateToDashboard={navigateToDashboard} 
        onNavigateToReviewMode={navigateToReviewMode}
        onNavigateToHome={navigateToHome} 
        onNavigateToSettings={navigateToSettings}
        onNavigateToPlans={navigateToPlans}
        onNavigateToAnalytics={navigateToAnalytics}
      />

      <Switch>
        {/* Rotas públicas */}
        <Route path="/login">
          <Suspense fallback={<PageLoader />}>
            <AuthPage />
          </Suspense>
        </Route>

        {/* Rotas protegidas */}
        {/* HomePage - Tela inicial (usa Dashboard component) */}
        <Route path="/">
          <Suspense fallback={<PageLoader />}>
            <HomePage />
          </Suspense>
        </Route>

        {/* DashboardPage - Página de analytics/estatísticas */}
        <Route path="/dashboard">
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        </Route>

        <Route path="/study/:deckId">
          {(params) => (
            <Suspense fallback={<PageLoader />}>
              <StudyPage deckId={params.deckId} />
            </Suspense>
          )}
        </Route>

        <Route path="/review">
          <Suspense fallback={<PageLoader />}>
            <ReviewPage />
          </Suspense>
        </Route>

        <Route path="/analytics">
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        </Route>

        <Route path="/plans">
          <Suspense fallback={<PageLoader />}>
            <PlansPage />
          </Suspense>
        </Route>

        <Route path="/onboarding">
          <Suspense fallback={<PageLoader />}>
            <OnboardingPage />
          </Suspense>
        </Route>

        <Route path="/settings">
          <Suspense fallback={<PageLoader />}>
            <SettingsPage />
          </Suspense>
        </Route>

        {/* 404 */}
        <Route>
          <Suspense fallback={<PageLoader />}>
            <NotFoundPage />
          </Suspense>
        </Route>
      </Switch>
    </>
  );
}
