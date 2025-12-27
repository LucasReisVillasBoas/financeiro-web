import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { getUserDataFromToken } from '../utils/jwt.utils';
import type { Permissoes } from '../types/api.types';

interface User {
  id: string;
  name: string;
  email: string;
  clienteId?: string;
}

interface AuthContextType {
  user: User | null;
  permissoes: Permissoes | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  loading: boolean;
  getClienteId: () => string | null;
  hasModuleAccess: (module: string) => boolean;
  hasPermission: (module: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissoes, setPermissoes] = useState<Permissoes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = authService.getToken();
    const storedPermissoes = authService.getPermissoes();

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

    if (storedPermissoes) {
      setPermissoes(storedPermissoes);
    }

    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });

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

      // Define permissões
      if (response.permissoes) {
        setPermissoes(response.permissoes);
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

  const logout = async () => {
    await authService.logout();
    setUser(null);
    setPermissoes(null);
  };

  const hasModuleAccess = (module: string): boolean => {
    if (!permissoes) return false;
    return (
      module in permissoes && Array.isArray(permissoes[module]) && permissoes[module].length > 0
    );
  };

  const hasPermission = (module: string, action: string): boolean => {
    if (!permissoes) return false;
    const modulePermissions = permissoes[module];
    if (!modulePermissions || !Array.isArray(modulePermissions)) return false;
    return modulePermissions.includes(action);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissoes,
        login,
        logout,
        isAuthenticated: !!user,
        loading,
        getClienteId,
        hasModuleAccess,
        hasPermission,
      }}
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
