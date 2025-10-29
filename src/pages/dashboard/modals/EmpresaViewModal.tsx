import React from 'react';
import type { Empresa } from '../../../types/api.types';
import { FiX } from 'react-icons/fi';

interface EmpresaViewModalProps {
  empresa: Empresa;
  onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value: string | number | null | undefined }> = ({
  label,
  value,
}) => (
  <div className="flex justify-between items-start border-b border-[var(--color-border)] py-2 last:border-b-0">
    <p className="text-sm font-semibold text-[var(--color-text-secondary)] w-1/3">{label}:</p>
    <p className="text-sm text-[var(--color-text-primary)] font-medium w-2/3 text-right break-words">
      {value || 'Não informado'}
    </p>
  </div>
);

const getStatus = (empresa: Empresa) => {
  return empresa.deleted_at ? 'Inativa' : 'Ativa';
};

export const EmpresaViewModal: React.FC<EmpresaViewModalProps> = ({ empresa, onClose }) => {
  const fullAddress = [
    empresa.logradouro,
    empresa.numero,
    empresa.complemento,
    empresa.bairro,
    `${empresa.cidade} - ${empresa.uf}`,
    empresa.cep,
  ]
    .filter(part => part && part.trim() !== '')
    .join(', ');

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 overflow-y-auto p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--color-surface)] rounded-lg shadow-xl w-full max-w-3xl mx-4 my-8 max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-[var(--color-border)] p-5 sticky top-0 bg-[var(--color-surface)] z-10">
          <h3 className="text-2xl font-bold text-[var(--color-text-primary)]">
            Detalhes da Empresa
          </h3>
          <button
            className="p-1 rounded-full hover:bg-[var(--color-primary-hover)] transition-colors"
            onClick={onClose}
            title="Fechar"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="p-5 space-y-8 overflow-y-auto">
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-[var(--color-primary)] border-b border-[var(--color-primary)] pb-1 mb-3">
              Informações Gerais
            </h4>
            <DetailItem label="ID" value={empresa.id} />
            <DetailItem label="Razão Social" value={empresa.razao_social} />
            <DetailItem label="Nome Fantasia" value={empresa.nome_fantasia} />

            <div className="flex justify-between items-start border-b border-[var(--color-border)] py-2 last:border-b-0">
              <p className="text-sm font-semibold text-[var(--color-text-secondary)] w-1/3">
                Status/Sede:
              </p>
              <div className="w-2/3 text-right flex justify-end items-center gap-2">
                <span
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    getStatus(empresa) === 'Ativa'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {getStatus(empresa)}
                </span>
                {!empresa.sede && (
                  <span className="px-3 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Sede
                  </span>
                )}
              </div>
            </div>

            <DetailItem
              label="Data Abertura"
              value={empresa.data_abertura ? new Date(empresa.data_abertura).toLocaleDateString('pt-BR') : 'Não informado'}
            />
            <DetailItem label="ID do Cliente" value={empresa.cliente_id} />
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-[var(--color-primary)] border-b border-[var(--color-primary)] pb-1 mb-3">
              Documentos
            </h4>
            <DetailItem label="CNPJ/CPF" value={empresa.cnpj_cpf} />
            <DetailItem label="Inscrição Estadual" value={empresa.inscricao_estadual} />
            <DetailItem label="Inscrição Municipal" value={empresa.inscricao_municipal} />
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-[var(--color-primary)] border-b border-[var(--color-primary)] pb-1 mb-3">
              Contatos
            </h4>
            <DetailItem label="E-mail" value={empresa.email} />
            <DetailItem label="Telefone" value={empresa.telefone} />
            <DetailItem label="Celular" value={empresa.celular} />
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-[var(--color-primary)] border-b border-[var(--color-primary)] pb-1 mb-3">
              Endereço
            </h4>

            <div className="py-2">
              <p className="text-sm font-semibold text-[var(--color-text-secondary)] mb-1">
                Endereço Completo:
              </p>
              <p className="text-sm text-[var(--color-text-primary)] font-medium bg-[var(--color-bg)] p-3 rounded-md">
                {fullAddress || 'Endereço não informado'}
              </p>
            </div>

            <DetailItem label="CEP" value={empresa.cep} />
            <DetailItem label="Logradouro" value={empresa.logradouro} />
            <DetailItem label="Número" value={empresa.numero} />
            <DetailItem label="Complemento" value={empresa.complemento} />
            <DetailItem label="Bairro" value={empresa.bairro} />
            <DetailItem label="Cidade/UF" value={`${empresa.cidade || ''} - ${empresa.uf || ''}`} />
          </div>
        </div>

        <div className="flex justify-end p-5 border-t border-[var(--color-border)] sticky bottom-0 bg-[var(--color-surface)]">
          <button
            className="px-6 py-2 bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)] rounded-md hover:bg-[var(--color-secondary-hover)] transition-colors font-medium"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
