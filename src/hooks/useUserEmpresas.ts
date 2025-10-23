import { useState, useEffect } from 'react';
import { empresaService } from '../services/empresa.service';
import { useAuth } from '../context/AuthContext';
import type { Empresa } from '../types/api.types';

export const useUserEmpresas = () => {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getClienteId } = useAuth();

  useEffect(() => {
    const fetchEmpresas = async () => {
      const clienteId = getClienteId();

      if (!clienteId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await empresaService.findByCliente(clienteId);
        setEmpresas(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao buscar empresas');
        console.error('Erro ao buscar empresas:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpresas();
  }, [getClienteId]);

  return { empresas, loading, error, hasEmpresas: empresas.length > 0 };
};
