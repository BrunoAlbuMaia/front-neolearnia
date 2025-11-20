// lib/firebase/auth.ts
import { auth } from "./config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";

/**
 * Cadastro por email/senha
 */
export const registerWithEmail = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

/**
 * Login por email/senha
 */
export const loginWithEmail = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

/**
 * Login com Google
 */
export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const result = await signInWithPopup(auth, provider);
  return result.user;
};

/**
 * Logout do Firebase Auth
 * IMPORTANTE: Sempre chame clearSession() antes de logout()
 */
export const logout = async () => {
  return signOut(auth);
};

/**
 * Observa mudanças no estado de autenticação
 * Retorna função de cleanup
 */
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

/**
 * Retorna usuário autenticado atual
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Retorna token de autenticação do usuário atual
 * Com retry logic para garantir que o token esteja disponível após login
 */
export const getCurrentUserToken = async (forceRefresh: boolean = false): Promise<string | null> => {
  if (!auth.currentUser) return null;
  
  try {
    // Se forceRefresh, força atualização do token (útil após login)
    return await auth.currentUser.getIdToken(forceRefresh);
  } catch (error) {
    console.error("Erro ao obter token:", error);
    
    // Se falhou e não é forceRefresh, tenta novamente após um pequeno delay
    if (!forceRefresh) {
      await new Promise(resolve => setTimeout(resolve, 500));
      try {
        return await auth.currentUser.getIdToken(true);
      } catch (retryError) {
        console.error("Erro ao obter token no retry:", retryError);
        return null;
      }
    }
    
    return null;
  }
};