'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, ApiResponse } from '../types';
import { apiClient } from './apiClient';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<ApiResponse<unknown>>;
  register: (name: string, email: string, password: string, role: 'customer' | 'provider') => Promise<ApiResponse<unknown>>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<ApiResponse<unknown>> => {
    const res = await apiClient.post<{ token: string; user: User }>('/auth/login', { email, password });
    
    if (res.success && res.data) {
      const { token: userToken, user: userData } = res.data;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setToken(userToken);
      
      if (userData.role === 'provider') {
        router.push('/dashboard/provider');
      } else {
        router.push('/dashboard/customer');
      }
    }
    return res;
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: 'customer' | 'provider'
  ): Promise<ApiResponse<unknown>> => {
    const res = await apiClient.post<{ token: string; user: User }>('/auth/register', {
      name,
      email,
      password,
      role,
    });
    
    if (res.success && res.data) {
      const { token: userToken, user: userData } = res.data;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setToken(userToken);
      
      if (userData.role === 'provider') {
        router.push('/profile/edit');
      } else {
        router.push('/dashboard/customer');
      }
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
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
