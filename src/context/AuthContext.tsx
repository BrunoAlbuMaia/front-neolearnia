// src/context/AuthContext.tsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { onAuthChange, logout } from "../lib/firebase/auth";
import type { User } from "firebase/auth";
import {
  getOrCreateSessionId,
  clearSessionId,
  getSessionId,
} from "../lib/firebase/session";
// import { authApi } from "../api/authApi";
import { useToast } from "../hooks/use-toast";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  sessionId: string | null;
  isSessionValid: boolean;
  logoutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionValid, setIsSessionValid] = useState(true);
  
  const isLoggingOut = useRef(false);
  const isSyncing = useRef(false);
  const { toast } = useToast();

  /**
   * Sincroniza usuário com backend e cria sessão única
   */
  const syncUserWithBackend = useCallback(async (firebaseUser: User) => {
    if (isSyncing.current) {

      return;
    }

    isSyncing.current = true;

    try {
      const token = await firebaseUser.getIdToken();
      const newSessionId = getOrCreateSessionId();


      // const response = await authApi.syncUser({
      //   email: firebaseUser.email || "",
      //   name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Usuário",
      //   sessionId: newSessionId,
      // });

      setSessionId(newSessionId);
      setIsSessionValid(true);


    } catch (error: any) {
      console.error("❌ Erro na sincronização:", error);
      
      // Se falhou, limpa sessão local e força logout
      clearSessionId();
      setSessionId(null);
      setIsSessionValid(false);
      
      toast({
        title: "Erro ao autenticar",
        description: "Não foi possível conectar ao servidor. Tente novamente.",
        variant: "destructive",
      });
      
      await logout();
    } finally {
      isSyncing.current = false;
    }
  }, [toast]);

  /**
   * Função de logout otimizada
   */
  const logoutUser = useCallback(async () => {
    if (isLoggingOut.current) {
      console.log("⏳ Logout já em progresso...");
      return;
    }

    isLoggingOut.current = true;
    
    try {
      setLoading(true);
      
      // Limpa sessionId local
      clearSessionId();
      setSessionId(null);
      setIsSessionValid(false);
      
      // Faz logout do Firebase
      await logout();
      
      setUser(null);

      
    } catch (err) {
      console.error("❌ Erro ao fazer logout:", err);
    } finally {
      setLoading(false);
      isLoggingOut.current = false;
    }
  }, []);

  /**
   * Listener para evento de sessão inválida (disparado pelo apiRequest)
   */
  useEffect(() => {
    const handleSessionInvalid = async () => {
      
      
      setIsSessionValid(false);
      
      toast({
        title: "Sessão encerrada",
        description: "Outro dispositivo fez login nesta conta.",
        variant: "destructive",
      });
      
      await logoutUser();
    };

    window.addEventListener('session-invalid', handleSessionInvalid);
    
    return () => {
      window.removeEventListener('session-invalid', handleSessionInvalid);
    };
  }, [logoutUser, toast]);

  /**
   * Gerenciamento principal de autenticação
   */
  useEffect(() => {
    const unsubscribeAuth = onAuthChange(async (firebaseUser) => {

      
      setUser(firebaseUser);
      setLoading(false);

      // Se não há usuário, limpa tudo
      if (!firebaseUser) {
        clearSessionId();
        setSessionId(null);
        setIsSessionValid(false);
        return;
      }

      // Se há usuário, sincroniza com backend
      await syncUserWithBackend(firebaseUser);
    });

    // Cleanup
    return () => {
 
      unsubscribeAuth();
    };
  }, [syncUserWithBackend]);

  /**
   * Validação periódica da sessão (heartbeat visual)
   * Verifica se sessionId ainda existe localmente
   */
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const currentSessionId = getSessionId();
      
      if (!currentSessionId) {

        setIsSessionValid(false);
        logoutUser();
      }
    }, 30000); // Verifica a cada 30 segundos

    return () => clearInterval(interval);
  }, [user, logoutUser]);

  /**
   * Valida sessão ao voltar para a aba
   */
  useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
     
        
        const currentSessionId = getSessionId();
        if (!currentSessionId) {

          setIsSessionValid(false);
          logoutUser();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, logoutUser]);

  /**
   * Memoização dos valores do contexto
   */
  const value = useMemo(
    () => ({
      user,
      loading,
      sessionId,
      isSessionValid,
      logoutUser,
    }),
    [user, loading, sessionId, isSessionValid, logoutUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook para acessar o contexto de autenticação
 */
export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
};