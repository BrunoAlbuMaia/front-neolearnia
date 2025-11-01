// providers/AppProviders.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { ThemeProvider } from "../components/ThemeProvider";
import { TooltipProvider } from "../components/ui/tooltip";
import { Toaster } from "../components/ui/toaster";
import { AuthProvider } from "../context/AuthContext";
import { LoadingProvider } from "../context/LoadingContext";
import { SessionGuard } from "../components/SessionGuard";
import { GlobalSpinner } from "../components/GlobalSpinner";

interface Props {
  children: React.ReactNode;
}

export function AppProviders({ children }: Props) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <LoadingProvider>
            <AuthProvider>
              {/* SessionGuard monitora e exibe feedback visual */}
              <SessionGuard />
              {/* Spinner global que aparece automaticamente durante requisições */}
              <GlobalSpinner />
              {children}
              <Toaster />
            </AuthProvider>
          </LoadingProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}