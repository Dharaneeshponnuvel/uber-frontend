import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'rider' | 'driver';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  token: string | null;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'rider' | 'driver';
  phone?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const response = await axios.get(`${API_BASE_URL}/users/profile`, {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          
          setUser(response.data.user);
          setToken(savedToken);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      const { user: userData, token: authToken } = response.data;
      
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Login failed');
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      const { user: newUser, token: authToken } = response.data;
      
      setUser(newUser);
      setToken(authToken);
      localStorage.setItem('token', authToken);
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};