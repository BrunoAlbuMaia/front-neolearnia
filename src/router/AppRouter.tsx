import { Switch, Route, Redirect,useLocation } from "wouter";
import Home from "../pages/Home/index";
import NotFound from "../pages/not-found";
import Navbar from "../components/ui/navbar";
import { useAuth } from "../context/AuthContext";
import { AnalyticsPage } from "../pages/Home/AnalyticsPage";
import { ReviewModePage } from "../pages/Home/ReviewModePage";

export function AppRouter() {
  const { user, logoutUser, loading } = useAuth();
  const [, setLocation] = useLocation();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        Carregando...
      </div>
    );
  }

  const navigateToHome = () => setLocation("/");
  const navigateToAnalytics = () => setLocation("/analytics");
  const navigateToSettings = () => setLocation("/settings");
  const navigateToReviewMode = () => setLocation("/reviewMode");


  return (
    <>
      {user && 
        <Navbar 
            user={user} 
            onLogout={logoutUser} 
            onNavigateToAnalytics={navigateToAnalytics} 
            onNavigateToReviewMode={navigateToReviewMode}
            onNavigateToHome={navigateToHome} 
            onNavigateToSettings={navigateToSettings}
        />}

      <Switch>
        <Route path="/" component={Home} />
        <Route path="/analytics" component={AnalyticsPage}/>
        <Route path="/reviewMode" component={ReviewModePage}/>
        <Route component={NotFound} />
      </Switch>
    </>
  );
}
