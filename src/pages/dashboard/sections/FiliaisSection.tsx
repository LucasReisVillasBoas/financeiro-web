import React, { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { empresaService } from '../../../services/empresa.service';
import type { Filial } from '../../../types/api.types';

interface FiliaisSectionProps {
  empresaId: string;
}

export const FiliaisSection: React.FC<FiliaisSectionProps> = ({ empresaId }) => {
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (empresaId) {
      loadFiliais();
    }
  }, [empresaId]);

  const loadFiliais = async () => {
    try {
      setLoading(true);
      const data = await empresaService.listFiliais(empresaId);
      setFiliais(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar filiais');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (filialId: string) => {
    if (!confirm('Deseja realmente excluir esta filial?')) return;

    try {
      await empresaService.deleteFilial(filialId);
      setFiliais(filiais.filter(f => f.id !== filialId));
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir filial');
    }
  };

  const getStatus = (filial: Filial) => {
    return filial.deleted_at ? 'Inativa' : 'Ativa';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors flex items-center gap-2">
          <FiPlus size={18} />
          Nova Filial
        </button>
      </div>

      {error && <div className="p-4 bg-red-100/30 text-red-800 rounded-md">{error}</div>}

      {loading ? (
        <div className="text-center py-8 text-[var(--color-text-secondary)]">
          Carregando filiais...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-[var(--color-surface)] rounded-md shadow">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Razão Social</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Nome Fantasia</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">CNPJ</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Cidade</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Status</th>
                <th className="text-center p-4 text-[var(--color-text-secondary)]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filiais.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--color-text-secondary)]">
                    Nenhuma filial cadastrada
                  </td>
                </tr>
              ) : (
                filiais.map(filial => (
                  <tr
                    key={filial.id}
                    className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                  >
                    <td className="p-4 text-[var(--color-text)]">{filial.razao_social}</td>
                    <td className="p-4 text-[var(--color-text)]">{filial.nome_fantasia}</td>
                    <td className="p-4 text-[var(--color-text)]">{filial.cnpj_cpf}</td>
                    <td className="p-4 text-[var(--color-text)]">{filial.cidade || '-'}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          getStatus(filial) === 'Ativa'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {getStatus(filial)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          className="p-2 hover:bg-[var(--color-primary-hover)] rounded transition-colors"
                          title="Editar"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          className="p-2 hover:bg-red-100:bg-red-900 rounded transition-colors text-red-600"
                          onClick={() => handleDelete(filial.id)}
                          title="Excluir"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
