import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, type User } from "firebase/auth";

// Check if we should use mock auth mode (for development)
const useMockAuth = import.meta.env.VITE_AUTH_MODE === 'mock' || import.meta.env.DEV === true;

// Check if we have real Firebase config
const hasFirebaseConfig = import.meta.env.VITE_FIREBASE_API_KEY && 
                          import.meta.env.VITE_FIREBASE_PROJECT_ID && 
                          import.meta.env.VITE_FIREBASE_APP_ID;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemo-Key-For-Development-Only",
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "studycards-demo"}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "studycards-demo",
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID || "studycards-demo"}.appspot.com`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:demo-app-id",
};

// console.log('Firebase config loaded:', { 
//   hasRealConfig: hasFirebaseConfig,
//   useMockAuth,
//   projectId: firebaseConfig.projectId,
//   apiKeyPresent: !!firebaseConfig.apiKey
// });

// Initialize Firebase only once (but only if not using mock auth)
let app: any = null;
let auth: any = null;

if (!useMockAuth) {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
}

// Mock auth implementation for development
class MockAuth {
  private currentUser: any = null;
  private listeners: ((user: any) => void)[] = [];

  constructor() {
    // Check for existing user in localStorage
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  async mockSignUp(email: string, password: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    if (existingUsers.find((u: any) => u.email === email)) {
      throw { code: 'auth/email-already-in-use', message: 'The email address is already in use by another account.' };
    }

    // Create new user
    const user = {
      uid: 'mock-' + Date.now(),
      email,
      emailVerified: true
    };

    // Save user
    existingUsers.push(user);
    localStorage.setItem('mockUsers', JSON.stringify(existingUsers));
    localStorage.setItem('mockUser', JSON.stringify(user));
    
    this.currentUser = user;
    this.notifyListeners();
    
    return { user };
  }

  async mockSignIn(email: string, password: string) {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const existingUsers = JSON.parse(localStorage.getItem('mockUsers') || '[]');
    const user = existingUsers.find((u: any) => u.email === email);
    
    if (!user) {
      throw { code: 'auth/user-not-found', message: 'There is no user record corresponding to this identifier.' };
    }

    localStorage.setItem('mockUser', JSON.stringify(user));
    this.currentUser = user;
    this.notifyListeners();
    
    return { user };
  }

  async mockSignOut() {
    localStorage.removeItem('mockUser');
    this.currentUser = null;
    this.notifyListeners();
  }

  onAuthStateChanged(callback: (user: any) => void) {
    this.listeners.push(callback);
    // Call immediately with current user
    callback(this.currentUser);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  get user() {
    return this.currentUser;
  }
}

const mockAuth = new MockAuth();

export { auth };

export const loginWithEmail = async (email: string, password: string) => {
  if (useMockAuth) {
    return mockAuth.mockSignIn(email, password);
  }
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerWithEmail = async (email: string, password: string) => {
  if (useMockAuth) {
    return mockAuth.mockSignUp(email, password);
  }
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logout = async () => {
  if (useMockAuth) {
    return mockAuth.mockSignOut();
  }
  return signOut(auth);
};

export const onAuthChange = (callback: (user: User | null) => void) => {
  if (useMockAuth) {
    return mockAuth.onAuthStateChanged(callback);
  }
  return onAuthStateChanged(auth, callback);
};

// Get current user's ID token for API calls
export const getCurrentUserToken = async (): Promise<string | null> => {
  if (useMockAuth) {
    // Return user-specific mock token for development
    const token = mockAuth.user ? `mock-token-${mockAuth.user.uid}` : null;
    // console.log('getCurrentUserToken - mockAuth.user:', mockAuth.user);
    // console.log('getCurrentUserToken - returning token:', token);
    return token;
  }
  
  if (!auth?.currentUser) {
    return null;
  }
  
  try {
    return await auth.currentUser.getIdToken();
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

// Get current user
export const getCurrentUser = () => {
  if (useMockAuth) {
    return mockAuth.user;
  }
  return auth?.currentUser || null;
};
