import { createContext, useContext, useEffect, useState } from 'react';
import apiClient from '../api/client';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('auth_token')
  );
  const [loading, setLoading] = useState(true);

  // Restore logged-in user when the app starts
  useEffect(() => {
    const restoreUser = async () => {
      const storedToken = localStorage.getItem('auth_token');

      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/auth/me');

        setUser(response.data.user);
        setToken(storedToken);
      } catch (error) {
        console.error('Failed to restore authentication:', error);
        localStorage.removeItem('auth_token');
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    restoreUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem('auth_token', token);

    setToken(token);
    setUser(user);
  };

  const loginWithGoogle = async (credential: string) => {
    const response = await apiClient.post('/auth/google', {
      credential,
    });

    const { token, user } = response.data;

    localStorage.setItem('auth_token', token);

    setToken(token);
    setUser(user);
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ) => {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem('auth_token', token);

    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        loginWithGoogle,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}