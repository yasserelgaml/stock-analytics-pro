"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { login, register, User, AuthResponse } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (formData: FormData) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const signIn = async (formData: FormData) => {
    const data: AuthResponse = await login(formData);
    localStorage.setItem('token', data.access_token);
    // In a real app, we'd fetch user profile here. For now, we store a dummy user or handle it via token.
    const dummyUser = { id: 1, email: formData.get('username') as string };
    localStorage.setItem('user', JSON.stringify(dummyUser));
    setUser(dummyUser);
    setToken(data.access_token);
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, signIn, signUp, signOut }}>
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