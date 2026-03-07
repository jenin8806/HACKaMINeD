
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../firebase';

const API_URL = import.meta.env.VITE_API_URL;

export interface UserProfile {
  username: string;
  email: string;
  profilePic: string;
  plan: string;
}

interface UserContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  loading: boolean;
  updateUser: (updates: Partial<UserProfile>) => void;
  saveProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const defaultUser: UserProfile = {
  username: 'Username',
  email: 'user@example.com',
  profilePic: '',
  plan: 'Free Plan',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

function firebaseUserToProfile(fbUser: FirebaseUser): UserProfile {
  return {
    username: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
    email: fbUser.email || '',
    profilePic: fbUser.photoURL || '',
    plan: 'Free Plan',
  };
}

function getFirebaseAuthError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use': return 'This email is already registered.';
    case 'auth/invalid-email': return 'Invalid email address.';
    case 'auth/weak-password': return 'Password is too weak.';
    case 'auth/user-not-found': return 'No account found with this email.';
    case 'auth/wrong-password': return 'Incorrect password.';
    case 'auth/invalid-credential': return 'Invalid email or password.';
    case 'auth/too-many-requests': return 'Too many attempts. Please try again later.';
    case 'auth/popup-closed-by-user': return 'Sign-in popup was closed.';
    case 'auth/account-exists-with-different-credential': return 'An account already exists with this email using a different sign-in method.';
    default: return 'Authentication failed. Please try again.';
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Try to fetch extended profile from backend
        try {
          const token = await fbUser.getIdToken();
          const res = await fetch(`${API_URL}/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const data = await res.json();
            setUser({
              username: data.username || fbUser.displayName || 'User',
              email: data.email || fbUser.email || '',
              profilePic: data.profile_pic || fbUser.photoURL || '',
              plan: data.plan || 'Free Plan',
            });
          } else {
            setUser(firebaseUserToProfile(fbUser));
          }
        } catch {
          // Backend unavailable — use Firebase user data directly
          setUser(firebaseUserToProfile(fbUser));
        }
        setIsAuthenticated(true);
      } else {
        setUser(defaultUser);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const saveProfile = async (updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    const fbUser = auth.currentUser;
    if (!fbUser) return { success: false, error: 'Not signed in' };
    try {
      const token = await fbUser.getIdToken();
      const body: Record<string, string> = {};
      if (updates.username != null) body.username = updates.username;
      if (updates.email != null) body.email = updates.email;
      if (updates.profilePic != null) body.profile_pic = updates.profilePic;
      const res = await fetch(`${API_URL}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { success: false, error: (err as any).detail || 'Failed to save profile' };
      }
      setUser((prev) => ({ ...prev, ...updates }));
      if (updates.username != null || updates.profilePic != null) {
        try {
          await updateProfile(fbUser, {
            displayName: updates.username ?? fbUser.displayName ?? undefined,
            photoURL: updates.profilePic ?? fbUser.photoURL ?? undefined,
          });
        } catch {
          // Firestore saved; Auth profile update failed (non-fatal)
        }
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    const fbUser = auth.currentUser;
    if (!fbUser) return { success: false, error: 'Not signed in' };
    if (!fbUser.email) return { success: false, error: 'Cannot change password for accounts without email' };
    const provider = fbUser.providerData.find((p) => p?.providerId === 'password');
    if (!provider) {
      return { success: false, error: 'You signed in with Google. Use your Google account to change your password.' };
    }
    try {
      const credential = EmailAuthProvider.credential(fbUser.email, currentPassword);
      await reauthenticateWithCredential(fbUser, credential);
      await updatePassword(fbUser, newPassword);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: getFirebaseAuthError(err.code) };
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: getFirebaseAuthError(err.code) };
    }
  };

  const signup = async (username: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, password);
      // Set display name in Firebase Auth
      await updateProfile(credential.user, { displayName: username });

      // Send profile to backend for Firestore storage
      try {
        const token = await credential.user.getIdToken();
        await fetch(`${API_URL.replace('/auth', '/auth')}/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ username, email }),
        });
      } catch {
        // Backend offline — user is still created in Firebase Auth
      }

      // Update local state
      setUser({
        username,
        email,
        profilePic: '',
        plan: 'Free Plan',
      });
      return { success: true };
    } catch (err: any) {
      return { success: false, error: getFirebaseAuthError(err.code) };
    }
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: getFirebaseAuthError(err.code) };
    }
  };

  const logout = () => {
    signOut(auth);
    setUser(defaultUser);
    setIsAuthenticated(false);
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated, loading, updateUser, saveProfile, changePassword, login, signup, loginWithGoogle, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}