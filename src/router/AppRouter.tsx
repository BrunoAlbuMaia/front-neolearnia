import { Switch, Route, Redirect, useLocation } from "wouter";
import Home from "../pages/Home/index";
import NotFound from "../pages/not-found";
import Navbar from "../components/ui/navbar";
import { useAuth } from "../context/AuthContext";
import { AnalyticsPage } from "../pages/Home/AnalyticsPage";
import { ReviewModePage } from "../pages/Home/ReviewModePage";
import PlansPage from "../pages/Plans/PlansPage";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";

export function AppRouter() {
  const { user, logoutUser, loading } = useAuth();
  const [location, setLocation] = useLocation();
  
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
        <Route path="/plans" component={PlansPage} />
        <Route path="/analytics" component={AnalyticsPage}/>
        <Route path="/dashboard" component={DashboardPage}/>
        <Route path="/reviewMode" component={ReviewModePage}/>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}
