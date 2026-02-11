import React from 'react';
import type { Empresa, Filial } from '../../../types/api.types';
import { FiX } from 'react-icons/fi';

interface EmpresaViewModalProps {
  data: Empresa | Filial;
  tipo: 'sede' | 'filial';
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

const getStatus = (data: Empresa | Filial) => {
  const deletedAt =
    'deleted_at' in data ? data.deleted_at : 'deletadoEm' in data ? data.deletadoEm : null;
  return deletedAt ? 'Inativa' : 'Ativa';
};

// Funções de formatação
const formatCnpjCpf = (value: string | null | undefined): string => {
  if (!value) return 'Não informado';
  const numbers = value.replace(/\D/g, '');
  if (numbers.length === 11) {
    // CPF: 000.000.000-00
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (numbers.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  return value;
};

const formatCep = (value: string | null | undefined): string => {
  if (!value) return 'Não informado';
  const numbers = value.replace(/\D/g, '');
  if (numbers.length === 8) {
    return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  return value;
};

const formatPhone = (value: string | null | undefined): string => {
  if (!value) return 'Não informado';
  const numbers = value.replace(/\D/g, '');
  if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return value;
};

export const EmpresaViewModal: React.FC<EmpresaViewModalProps> = ({ data, tipo, onClose }) => {
  const fullAddress = [
    data.logradouro,
    data.numero,
    data.complemento,
    data.bairro,
    `${data.cidade || ''} - ${data.uf || ''}`,
    data.cep,
  ]
    .filter(part => part && part.trim() !== '' && part !== ' - ')
    .join(', ');

  // Verificar se é filial com contatos
  const contatos = 'contatos' in data ? data.contatos : undefined;

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
            Detalhes da {tipo === 'sede' ? 'Empresa' : 'Filial'}
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
            <DetailItem label="Razão Social" value={data.razao_social} />
            <DetailItem label="Nome Fantasia" value={data.nome_fantasia} />

            <div className="flex justify-between items-start border-b border-[var(--color-border)] py-2 last:border-b-0">
              <p className="text-sm font-semibold text-[var(--color-text-secondary)] w-1/3">
                Status/Tipo:
              </p>
              <div className="w-2/3 text-right flex justify-end items-center gap-2">
                <span
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    getStatus(data) === 'Ativa'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {getStatus(data)}
                </span>
                <span
                  className={`px-3 py-1 rounded text-xs font-medium ${
                    tipo === 'sede' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {tipo === 'sede' ? 'Sede' : 'Filial'}
                </span>
              </div>
            </div>

            <DetailItem
              label="Data Abertura"
              value={
                data.data_abertura
                  ? new Date(data.data_abertura).toLocaleDateString('pt-BR')
                  : 'Não informado'
              }
            />
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-[var(--color-primary)] border-b border-[var(--color-primary)] pb-1 mb-3">
              Documentos
            </h4>
            <DetailItem label="CNPJ/CPF" value={formatCnpjCpf(data.cnpj_cpf)} />
            <DetailItem label="Inscrição Estadual" value={data.inscricao_estadual} />
            <DetailItem label="Inscrição Municipal" value={data.inscricao_municipal} />
          </div>

          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-[var(--color-primary)] border-b border-[var(--color-primary)] pb-1 mb-3">
              Contatos da Empresa
            </h4>
            <DetailItem label="E-mail" value={data.email} />
            <DetailItem label="Telefone" value={formatPhone(data.telefone)} />
            <DetailItem label="Celular" value={formatPhone(data.celular)} />
          </div>

          {/* Contatos da Filial */}
          {contatos && contatos.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-[var(--color-primary)] border-b border-[var(--color-primary)] pb-1 mb-3">
                Pessoas de Contato
              </h4>
              {contatos.map((contato, index) => (
                <div key={contato.id} className="bg-[var(--color-bg)] p-4 rounded-md space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {contato.nome}
                    </span>
                    {contato.funcao && (
                      <span className="px-2 py-1 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded text-xs">
                        {contato.funcao}
                      </span>
                    )}
                  </div>
                  <DetailItem label="E-mail" value={contato.email} />
                  <DetailItem label="Telefone" value={formatPhone(contato.telefone)} />
                  <DetailItem label="Celular" value={formatPhone(contato.celular)} />
                </div>
              ))}
            </div>
          )}

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

            <DetailItem label="CEP" value={formatCep(data.cep)} />
            <DetailItem label="Logradouro" value={data.logradouro} />
            <DetailItem label="Número" value={data.numero} />
            <DetailItem label="Complemento" value={data.complemento} />
            <DetailItem label="Bairro" value={data.bairro} />
            <DetailItem label="Cidade/UF" value={`${data.cidade || ''} - ${data.uf || ''}`} />
            <DetailItem label="Código IBGE" value={data.codigo_ibge} />
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
