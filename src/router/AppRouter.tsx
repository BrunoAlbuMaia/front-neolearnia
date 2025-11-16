import { Switch, Route, useLocation } from "wouter";
import { useEffect, lazy, Suspense } from "react";
import Home from "../pages/Home/index";
import NotFound from "../pages/not-found";
import Navbar from "../components/ui/navbar";
import { useAuth } from "../context/AuthContext";
import { Spinner } from "../components/ui/spinner";

// Lazy load de páginas pesadas para melhor performance
const AnalyticsPage = lazy(() => import("../pages/Home/AnalyticsPage").then(m => ({ default: m.AnalyticsPage })));
const ReviewModePage = lazy(() => import("../pages/Home/ReviewModePage").then(m => ({ default: m.ReviewModePage })));
const PlansPage = lazy(() => import("../pages/Plans/PlansPage"));
const DashboardPage = lazy(() => import("../pages/Dashboard/DashboardPage").then(m => ({ default: m.DashboardPage })));

// Componente de loading para páginas
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spinner size="lg" text="Carregando..." />
  </div>
);

export function AppRouter() {
  const { user, logoutUser, loading } = useAuth();
  const [location, setLocation] = useLocation();
  
  // Se não há usuário, sempre mostrar a tela de login (Home)
  // Isso deve acontecer antes do check de loading para evitar tela preta durante logout
  useEffect(() => {
    if (!user && location !== "/") {
      setLocation("/");
    }
  }, [user, location, setLocation]);

  // Se não há usuário, mostrar apenas a tela de login (Home)
  // Mesmo durante loading, se não há user, mostramos o Home que tratará o loading internamente
  if (!user) {
    return <Home />;
  }

  // Mostrar loading apenas se há user (não durante logout)
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Carregando...
      </div>
    );
  }

  const navigateToHome = () => setLocation("/");
  const navigateToDashboard = () => setLocation("/dashboard");
  const navigateToSettings = () => setLocation("/settings");
  const navigateToReviewMode = () => setLocation("/reviewMode");
  const navigateToPlans = () => setLocation("/plans");

  // Renderizar navbar apenas quando user existe
  // O Home component irá gerenciar se mostra AuthScreen ou não
  const shouldShowNavbar = !!user;

  return (
    <>
      {shouldShowNavbar && (
        <Navbar 
          user={user} 
          onLogout={logoutUser} 
          onNavigateToDashboard={navigateToDashboard} 
          onNavigateToReviewMode={navigateToReviewMode}
          onNavigateToHome={navigateToHome} 
          onNavigateToSettings={navigateToSettings}
          onNavigateToPlans={navigateToPlans}
        />
      )}

      <Switch>
        <Route path="/" component={Home} />
        <Route path="/plans">
          <Suspense fallback={<PageLoader />}>
            <PlansPage />
          </Suspense>
        </Route>
        <Route path="/analytics">
          <Suspense fallback={<PageLoader />}>
            <AnalyticsPage />
          </Suspense>
        </Route>
        <Route path="/dashboard">
          <Suspense fallback={<PageLoader />}>
            <DashboardPage />
          </Suspense>
        </Route>
        <Route path="/reviewMode">
          <Suspense fallback={<PageLoader />}>
            <ReviewModePage />
          </Suspense>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}
