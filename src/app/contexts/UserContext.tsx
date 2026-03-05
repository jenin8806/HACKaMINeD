import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface UserProfile {
  username: string;
  email: string;
  profilePic: string;
  plan: string;
}

interface UserContextType {
  user: UserProfile;
  isAuthenticated: boolean;
  updateUser: (updates: Partial<UserProfile>) => void;
  login: (email: string, password: string) => { success: boolean; error?: string };
  signup: (username: string, email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const defaultUser: UserProfile = {
  username: 'Username',
  email: 'user@example.com',
  profilePic: 'https://github.com/shadcn.png',
  plan: 'Pro Plan',
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
  };

  const login = (email: string, _password: string) => {
    if (!email || !_password) {
      return { success: false, error: 'Email and password are required.' };
    }
    setUser((prev) => ({ ...prev, email }));
    setIsAuthenticated(true);
    return { success: true };
  };

  const signup = (username: string, email: string, _password: string) => {
    if (!username || !email || !_password) {
      return { success: false, error: 'All fields are required.' };
    }
    setUser({ username, email, profilePic: '', plan: 'Free Plan' });
    setIsAuthenticated(true);
    return { success: true };
  };

  const logout = () => {
    setUser(defaultUser);
    setIsAuthenticated(false);
  };

  return (
    <UserContext.Provider value={{ user, isAuthenticated, updateUser, login, signup, logout }}>
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