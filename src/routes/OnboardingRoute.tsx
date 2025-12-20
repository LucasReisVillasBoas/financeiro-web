import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { empresaService } from '../services/empresa.service';

interface OnboardingRouteProps {
  children: React.ReactElement;
}

/**
 * Route guard for onboarding pages.
 * - Redirects to login if not authenticated
 * - Redirects to dashboard if user already has empresa
 * - Shows onboarding if user has no empresa
 */
export const OnboardingRoute: React.FC<OnboardingRouteProps> = ({ children }) => {
  const { isAuthenticated, loading: authLoading, getClienteId } = useAuth();
  const [hasEmpresa, setHasEmpresa] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkEmpresa = async () => {
      if (!isAuthenticated || authLoading) {
        return;
      }

      const clienteId = getClienteId();
      if (!clienteId) {
        setHasEmpresa(false);
        setLoading(false);
        return;
      }

      try {
        const empresas = await empresaService.findByCliente(clienteId);
        setHasEmpresa(empresas && empresas.length > 0);
      } catch (error) {
        console.error('Erro ao verificar empresas:', error);
        setHasEmpresa(false);
      } finally {
        setLoading(false);
      }
    };

    checkEmpresa();
  }, [isAuthenticated, authLoading, getClienteId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin h-8 w-8 border-4 border-[var(--color-primary)] border-t-transparent rounded-full"></div>
          <div className="text-[var(--color-text)]">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se já tem empresa, redireciona para dashboard
  if (hasEmpresa) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};
