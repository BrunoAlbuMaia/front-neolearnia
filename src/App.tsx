import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { ThemeProvider } from "./components/ThemeProvider";
import Home from "./pages/Home";
import NotFound from "./pages/not-found";
import Navbar from "./components/ui/navbar";
import { useState } from "react";
import { logout } from "./lib/firebase";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}


function App() {
  const [user, setUser] = useState<any>(null);

  const handleLogout = async () => {
    try {
      await logout();
      // Aqui você pode adicionar toast se quiser
      setUser(null);
    } catch (error) {
      console.error("Erro no logout", error);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          {/* Navbar sempre visível */}
          {user && (
            <Navbar 
              user={user} 
              onLogout={handleLogout} 
              onNavigateToAnalytics={() => { /* sua navegação */ }}
              onNavigateToHome={() => {}}
            />
          )}
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
