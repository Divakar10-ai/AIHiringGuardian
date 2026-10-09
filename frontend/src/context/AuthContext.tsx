import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { apiClient } from '../api/client';

interface User {
  id?: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const minDuration = new Promise(resolve => setTimeout(resolve, 2500));
      const authProcess = (async () => {
        const token = localStorage.getItem('access_token');
        if (token) {
          try {
            const userData = await apiClient<User>('/api/v1/auth/me');
            setUser(userData);
          } catch (error) {
            console.error("Failed to restore session:", error);
            localStorage.removeItem('access_token');
            setUser(null);
          }
        }
      })();

      await Promise.all([minDuration, authProcess]);
      setIsLoading(false);
    };

    initializeAuth();

    const handleUnauthorized = () => {
      setUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, []);

  const login = async (email: string, password?: string) => {
    if (!password) {
      throw new Error("Password is required");
    }

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const tokenData = await apiClient<{ access_token: string }>('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });

    localStorage.setItem('access_token', tokenData.access_token);

    const userData = await apiClient<User>('/api/v1/auth/me');
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
