import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { getToken, setToken, removeToken } from '../lib/api';
import { queryClient } from '../lib/queryClient';
import { User, ApiResponse, AuthResponse } from '../types/api';

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getToken();
      if (storedToken) {
        setTokenState(storedToken);
        try {
          const response = await api.get<ApiResponse<User>>('/auth/me');
          if (response.data.success && response.data.data) {
            setUser(response.data.data);
          } else {
            removeToken();
            setTokenState(null);
          }
        } catch (error) {
          removeToken();
          setTokenState(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    const handleAuthLogout = () => {
      setUser(null);
      setTokenState(null);
      queryClient.clear();
      navigate('/auth');
    };

    window.addEventListener('auth:logout', handleAuthLogout);
    return () => {
      window.removeEventListener('auth:logout', handleAuthLogout);
    };
  }, [navigate]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });

    if (response.data.success && response.data.data) {
      const { user: userData, token: authToken } = response.data.data;
      setUser(userData);
      setToken(authToken);
      setTokenState(authToken);
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Best-effort logout
    }
    removeToken();
    setUser(null);
    setTokenState(null);
    queryClient.clear();
    navigate('/auth');
  }, [navigate]);

  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
