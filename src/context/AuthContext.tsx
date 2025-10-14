import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { getUserDataFromToken } from '../utils/jwt.utils';

interface User {
  id: string;
  name: string;
  email: string;
  clienteId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  getClienteId: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();

    if (token) {
      const userData = getUserDataFromToken(token);
      if (userData && userData.id && userData.email) {
        const user: User = {
          id: userData.id,
          name: userData.name || userData.email.split('@')[0],
          email: userData.email,
          clienteId: userData.clienteId || undefined,
        };
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        console.log('userData inválido ou incompleto');
      }
    } else {
      console.log('Nenhum token encontrado');
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await authService.login({ email, password });

      const token = authService.getToken();
      if (token) {
        const userData = getUserDataFromToken(token);
        if (userData && userData.id && userData.email) {
          const user: User = {
            id: userData.id,
            name: userData.name || email.split('@')[0],
            email: userData.email,
            clienteId: userData.clienteId || undefined,
          };
          setUser(user);
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          console.log('userData inválido após login');
        }
      } else {
        console.log('Token não encontrado após login');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  const getClienteId = (): string | null => {
    if (user?.clienteId) return user.clienteId;

    const token = authService.getToken();
    if (!token) return null;

    const userData = getUserDataFromToken(token);
    return userData?.clienteId || null;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, logout, isAuthenticated: !!user, loading, getClienteId }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
