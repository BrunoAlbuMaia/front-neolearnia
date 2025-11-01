import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";

interface LoadingContextValue {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

/**
 * Provider que gerencia o estado global de loading
 * Rastreia múltiplas requisições simultâneas usando um contador
 * Escuta eventos do client.ts para atualizar automaticamente
 */
export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = useCallback(() => {
    setLoadingCount((prev) => prev + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount((prev) => Math.max(0, prev - 1));
  }, []);

  // ✅ Escuta eventos do client.ts
  useEffect(() => {
    const handleStart = () => startLoading();
    const handleStop = () => stopLoading();

    window.addEventListener('api-loading-start', handleStart);
    window.addEventListener('api-loading-stop', handleStop);

    return () => {
      window.removeEventListener('api-loading-start', handleStart);
      window.removeEventListener('api-loading-stop', handleStop);
    };
  }, [startLoading, stopLoading]);

  const isLoading = loadingCount > 0;

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
    </LoadingContext.Provider>
  );
}

/**
 * Hook para acessar o contexto de loading
 */
export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading deve ser usado dentro de LoadingProvider");
  }
  return context;
}

