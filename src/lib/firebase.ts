// lib/firebase/index.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from "firebase/auth";

// ========================
// CONFIGURAÇÃO DO FIREBASE
// ========================
const useMockAuth = import.meta.env.VITE_AUTH_MODE === 'mock' || import.meta.env.DEV === true;
const hasFirebaseConfig =
  import.meta.env.VITE_FIREBASE_API_KEY &&
  import.meta.env.VITE_FIREBASE_PROJECT_ID &&
  import.meta.env.VITE_FIREBASE_APP_ID;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemo-Key-For-Development-Only",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "studycards-demo"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "studycards-demo",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "studycards-demo"}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo-app-id",
};

let app: any = null;
let auth: any = null;

if (!useMockAuth) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
}

// ========================
// MOCK AUTH PARA DESENVOLVIMENTO
// ========================
class MockAuth {
  private currentUser: any = null;
  private listeners: ((user: any) => void)[] = [];

  constructor() {
    const savedUser = localStorage.getItem("mockUser");
    if (savedUser) this.currentUser = JSON.parse(savedUser);
  }

  async mockSignUp(data: { email: string; password: string; name?: string; cep?: string; school?: string; educationLevel?: string }) {
    await new Promise(r => setTimeout(r, 1000));
    const existingUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    if (existingUsers.find((u: any) => u.email === data.email))
      throw { code: "auth/email-already-in-use", message: "Email já cadastrado." };

    const user = {
      uid: "mock-" + Date.now(),
      email: data.email,
      emailVerified: true,
      name: data.name || data.email.split("@")[0],
      cep: data.cep || "",
      school: data.school || "",
      educationLevel: data.educationLevel || "",
    };

    existingUsers.push(user);
    localStorage.setItem("mockUsers", JSON.stringify(existingUsers));
    localStorage.setItem("mockUser", JSON.stringify(user));

    this.currentUser = user;
    this.notifyListeners();
    return { user };
  }

  async mockSignIn(email: string) {
    await new Promise(r => setTimeout(r, 800));
    const existingUsers = JSON.parse(localStorage.getItem("mockUsers") || "[]");
    const user = existingUsers.find((u: any) => u.email === email);
    if (!user) throw { code: "auth/user-not-found", message: "Usuário não encontrado." };
    localStorage.setItem("mockUser", JSON.stringify(user));
    this.currentUser = user;
    this.notifyListeners();
    return { user };
  }

  async mockSignOut() {
    localStorage.removeItem("mockUser");
    this.currentUser = null;
    this.notifyListeners();
  }

  onAuthStateChanged(callback: (user: any) => void) {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => { this.listeners = this.listeners.filter(l => l !== callback); };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  get user() { return this.currentUser; }
}

const mockAuth = new MockAuth();

// ========================
// FUNÇÕES DE AUTH EMAIL
// ========================
export const registerWithEmail = async (data: { email: string; password: string; name?: string; cep?: string; school?: string; educationLevel?: string }) => {
  if (useMockAuth) return mockAuth.mockSignUp(data);
  return createUserWithEmailAndPassword(auth, data.email, data.password);
};

export const loginWithEmail = async (email: string, password?: string) => {
  if (useMockAuth) return mockAuth.mockSignIn(email);
  return signInWithEmailAndPassword(auth, email, password!);
};

// ========================
// FUNÇÕES DE AUTH SOCIAL
// ========================
export const loginWithGoogle = async () => {
  if (useMockAuth) {
    const user = { uid: "mock-google-" + Date.now(), email: "google@mock.com", name: "Usuário Google" };
    localStorage.setItem("mockUser", JSON.stringify(user));
    mockAuth.user = user;
    return { user };
  }

  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);
  return result.user;
};
// ========================
// LOGOUT E AUTH STATE
// ========================
export const logout = async () => {
  if (useMockAuth) return mockAuth.mockSignOut();
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (useMockAuth) return mockAuth.onAuthStateChanged(callback);
  return onAuthStateChanged(auth, callback);
};

// ========================
// GET CURRENT USER / TOKEN
// ========================
export const getCurrentUser = () => (useMockAuth ? mockAuth.user : auth?.currentUser || null);

export const getCurrentUserToken = async (): Promise<string | null> => {
  if (useMockAuth) return mockAuth.user ? `mock-token-${mockAuth.user.uid}` : null;
  if (!auth?.currentUser) return null;
  try { return await auth.currentUser.getIdToken(); } catch { return null; }
};
