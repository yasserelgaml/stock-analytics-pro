"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, register, User, AuthResponse } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (formData: FormData) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (formData: FormData) => {
    const data: AuthResponse = await login(formData);
    const dummyUser = { id: 1, email: formData.get('username') as string };
    localStorage.setItem('user', JSON.stringify(dummyUser));
    setUser(dummyUser);
    router.push('/');
  };

  const signUp = async (email: string, password: string) => {
    const user = await register(email, password);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
    // After signup, we usually redirect to login or auto-login
    router.push('/login');
  };

  const signOut = () => {
    localStorage.removeItem('user');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}