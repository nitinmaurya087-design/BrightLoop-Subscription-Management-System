import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, AuthResponse } from '../types';
import { authApi } from '../api';
import apiClient from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  isCustomer: boolean;
  login: (credentials: { email: string; password: string }) => Promise<User>;
  register: (userData: { fullName: string; email: string; password: string; phone?: string; companyName?: string }) => Promise<User>;
  logout: () => void;
  loginAsDemo: (role: UserRole) => Promise<User>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const saveAuth = (authData: AuthResponse) => {
    setUser(authData.user);
    setToken(authData.token);
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${authData.token}`;
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const refreshProfile = async () => {
    try {
      if (token) {
        const freshUser = await authApi.getProfile();
        setUser(freshUser);
        localStorage.setItem('user', JSON.stringify(freshUser));
      }
    } catch (err) {
      console.warn('Could not refresh profile:', err);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        try {
          const freshUser = await authApi.getProfile();
          setUser(freshUser);
          localStorage.setItem('user', JSON.stringify(freshUser));
        } catch (error) {
          console.error('Session expired or invalid token:', error);
          clearAuth();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: { email: string; password: string }): Promise<User> => {
    const data = await authApi.login(credentials);
    saveAuth(data);
    return data.user;
  };

  const register = async (userData: { fullName: string; email: string; password: string; phone?: string; companyName?: string }): Promise<User> => {
    const data = await authApi.register(userData);
    saveAuth(data);
    return data.user;
  };

  const logout = () => {
    clearAuth();
    window.location.href = '/login';
  };

  const loginAsDemo = async (role: UserRole): Promise<User> => {
    const credentials = {
      ADMIN: { email: 'admin@brightloop.com', password: 'Admin@12345' },
      STAFF: { email: 'staff@brightloop.com', password: 'Staff@12345' },
      CUSTOMER: { email: 'customer@brightloop.com', password: 'Customer@12345' },
    }[role];

    return await login(credentials);
  };

  const isAdmin = user?.role === 'ADMIN';
  const isStaff = user?.role === 'STAFF';
  const isCustomer = user?.role === 'CUSTOMER';
  const isAuthenticated = !!user && !!token;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated,
        isAdmin,
        isStaff,
        isCustomer,
        login,
        register,
        logout,
        loginAsDemo,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
