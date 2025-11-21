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
import { authApi } from "../api/authApi";
import { useToast } from "../hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  sessionId: string | null;
  isSessionValid: boolean;
  logoutUser: () => Promise<void>;
}

// Exporta o contexto para uso direto quando necessário (ex: SessionGuard)
export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isSessionValid, setIsSessionValid] = useState(true);
  
  const isLoggingOut = useRef(false);
  const isSyncing = useRef(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Rastreia o UID do usuário anterior para detectar mudanças
  const previousUserIdRef = useRef<string | null>(null);

  /**
   * Sincroniza usuário com backend e cria sessão única
   */
  const syncUserWithBackend = useCallback(async (firebaseUser: User) => {
    if (isSyncing.current) {

      return;
    }

    isSyncing.current = true;

    try {
      // CRÍTICO: Aguarda alguns segundos após criar o usuário no Firebase
      // Isso garante que o Firebase processou completamente o usuário antes de sincronizar
      console.log("⏳ Aguardando Firebase processar usuário...");
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 segundos inicial

      // CRÍTICO: Aguarda o token estar totalmente processado após login
      // O Firebase pode precisar de um momento para processar o token na primeira vez
      let token: string | null = null;
      let attempts = 0;
      const maxAttempts = 8; // Aumentado para dar mais tempo
      
      while (!token && attempts < maxAttempts) {
        try {
          token = await firebaseUser.getIdToken(true); // Force refresh
          if (token) {
            console.log("✅ Token obtido com sucesso!");
            break;
          }
        } catch (tokenError) {
          console.log(`⏳ Tentativa ${attempts + 1}/${maxAttempts} de obter token...`);
        }
        
        if (!token && attempts < maxAttempts - 1) {
          // Aguarda mais tempo entre tentativas para dar tempo do Firebase processar
          await new Promise(resolve => setTimeout(resolve, 800));
        }
        attempts++;
      }
      
      if (!token) {
        throw new Error("Não foi possível obter o token de autenticação após múltiplas tentativas.");
      }

      // CRÍTICO: Aguarda mais tempo para garantir que o Firebase atualizou todas as informações do usuário
      console.log("⏳ Aguardando Firebase finalizar processamento...");
      await new Promise(resolve => setTimeout(resolve, 1500)); // Mais 1.5 segundos

      // Recarrega o usuário do Firebase para obter informações atualizadas (displayName, etc)
      await firebaseUser.reload();
      
      // Obtém o name do Firebase - prioriza displayName, depois email sem @, depois "Usuário"
      let userName = firebaseUser.displayName;
      
      // Se não tem displayName, tenta obter do email
      if (!userName || userName.trim() === "") {
        userName = firebaseUser.email?.split("@")[0] || "Usuário";
      }
      
      // Garante que sempre tenha um nome válido (não vazio)
      if (!userName || userName.trim() === "") {
        userName = "Usuário";
      }
      
      console.log("📝 Nome do usuário obtido:", userName);
      
      const newSessionId = getOrCreateSessionId();

      // CRÍTICO: Sincroniza usuário com backend ANTES de permitir outras requisições
      // Garante que name sempre seja enviado (não pode ser vazio)
      await authApi.syncUser({
        email: firebaseUser.email || "",
        name: userName,
        sessionId: newSessionId,
      });

      setSessionId(newSessionId);
      setIsSessionValid(true);
      
      // CRÍTICO: Aguarda um momento adicional para garantir que o token está totalmente processado
      // antes de permitir que outras requisições sejam feitas
      await new Promise(resolve => setTimeout(resolve, 500));


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
   * CRÍTICO: Limpa todo o cache do React Query para evitar dados de usuários anteriores
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
      
      // CRÍTICO: Remove todas as queries do cache
      // Isso garante que dados do usuário anterior não sejam exibidos
      queryClient.removeQueries();
      
      // Faz logout do Firebase
      await logout();
      
      setUser(null);
      previousUserIdRef.current = null;

      
    } catch (err) {
      console.error("❌ Erro ao fazer logout:", err);
    } finally {
      setLoading(false);
      isLoggingOut.current = false;
    }
  }, [queryClient]);

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
   * CRÍTICO: Detecta mudanças de usuário e limpa/invalida queries quando necessário
   * CRÍTICO: sync-user DEVE ser chamado ANTES de qualquer outra requisição
   */
  useEffect(() => {
    const unsubscribeAuth = onAuthChange(async (firebaseUser) => {
      const currentUserId = firebaseUser?.uid || null;
      
      // Detecta mudança de usuário (login com outro usuário)
      if (previousUserIdRef.current !== null && 
          previousUserIdRef.current !== currentUserId && 
          currentUserId !== null) {
        console.log("🔄 Mudança de usuário detectada - limpando cache...");
        // Remove todas as queries quando detecta mudança de usuário
        queryClient.removeQueries();
      }
      
      // Atualiza referência do usuário atual
      previousUserIdRef.current = currentUserId;
      
      // Se não há usuário, limpa tudo
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        clearSessionId();
        setSessionId(null);
        setIsSessionValid(false);
        // Remove queries quando não há usuário (logout)
        queryClient.removeQueries();
        return;
      }

      // CRÍTICO: Define loading como true para bloquear queries até sincronização completa
      setLoading(true);
      
      // CRÍTICO: Sincroniza com backend ANTES de definir user e permitir queries
      // Isso garante que sync-user seja chamado ANTES de qualquer outra requisição
      try {
        await syncUserWithBackend(firebaseUser);
        
        // Só define user e loading como false APÓS sincronização bem-sucedida
        setUser(firebaseUser);
        setLoading(false);
        
        // CRÍTICO: Após sincronizar, invalida todas as queries para forçar refetch
        // Isso garante que os dados do novo usuário sejam carregados com token válido
        await new Promise(resolve => setTimeout(resolve, 300));
        queryClient.invalidateQueries();
      } catch (error) {
        // Se sincronização falhou, mantém loading e não define user
        console.error("❌ Erro na sincronização inicial:", error);
        setLoading(false);
        // Não define user se sincronização falhou
      }
    });

    // Cleanup
    return () => {
      unsubscribeAuth();
    };
  }, [syncUserWithBackend, queryClient]);

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