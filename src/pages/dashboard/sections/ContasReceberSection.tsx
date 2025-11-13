import React, { useEffect, useState } from 'react';
import { FiDollarSign, FiCalendar, FiCheckCircle, FiCreditCard, FiPlus, FiX } from 'react-icons/fi';
import { StatusContaReceber, TipoContaReceber } from '../../../types/api.types';
import type {
  ContaReceber,
  CreateContaReceberDto,
  ContaBancaria,
  PlanoContas,
  CreateBaixaRecebimentoDto,
  Pessoa,
} from '../../../types/api.types';
import {
  contaReceberService,
  contaBancariaService,
  planoContasService,
  empresaService,
  baixaRecebimentoService,
  pessoaService,
} from '../../../services';
import { useAuth } from '../../../context/AuthContext';

export const ContasReceberSection: React.FC = () => {
  const { user } = useAuth();
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateContaReceberDto>({
    pessoaId: '',
    planoContasId: '',
    empresaId: '',
    documento: '',
    serie: '1',
    parcela: 1,
    tipo: TipoContaReceber.DUPLICATA,
    dataEmissao: new Date().toISOString().split('T')[0],
    vencimento: '',
    descricao: '',
    valorPrincipal: 0,
    valorAcrescimos: 0,
    valorDescontos: 0,
  });
  const [formError, setFormError] = useState('');
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([]);
  const [planosContas, setPlanosContas] = useState<PlanoContas[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);

  const [showBaixaModal, setShowBaixaModal] = useState(false);
  const [baixaData, setBaixaData] = useState<CreateBaixaRecebimentoDto>({
    contaReceberId: '',
    contaBancariaId: '',
    data: new Date().toISOString().split('T')[0],
    valor: 0,
    acrescimos: 0,
    descontos: 0,
  });

  useEffect(() => {
    loadPessoas();
    loadContasReceber();
  }, []);

  const loadPessoas = async () => {
    try {
      const data = await pessoaService.findAll();
      setPessoas(data.filter(p => p.ativo));
    } catch (err) {
      console.error('Erro ao carregar pessoas:', err);
    }
  };

  const loadContasReceber = async () => {
    try {
      setLoading(true);
      const data = await contaReceberService.findAll();
      console.log('Contas a Receber carregadas:', data);
      setContas(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar contas bancárias');
    } finally {
      setLoading(false);
    }
  };

  const handleBaixar = async (conta: ContaReceber) => {
    setBaixaData({
      contaReceberId: conta.id,
      contaBancariaId: '',
      data: new Date().toISOString().split('T')[0],
      valor: conta.saldo,
      acrescimos: 0,
      descontos: 0,
    });

    setShowBaixaModal(true);

    try {
      const contasBanc = await contaBancariaService.findAll();
      setContasBancarias(contasBanc.filter(cb => cb.ativo));
    } catch (err) {
      console.error('Erro ao carregar contas bancárias:', err);
    }
  };

  const handleConfirmarBaixa = async () => {
    try {
      await baixaRecebimentoService.create(baixaData);
      await loadContasReceber();
      setShowBaixaModal(false);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar baixa');
    }
  };

  const handleCancelarBaixaModal = () => {
    setShowBaixaModal(false);
    setBaixaData({
      contaReceberId: '',
      contaBancariaId: '',
      data: new Date().toISOString().split('T')[0],
      valor: 0,
      acrescimos: 0,
      descontos: 0,
    });
  };

  const handleNovaConta = async () => {
    setShowForm(true);
    setFormError('');

    try {
      if (user?.clienteId) {
        const empresas = await empresaService.findByCliente(user.clienteId);
        if (empresas && empresas.length > 0) {
          // Set empresaId in formData
          setFormData(prev => ({
            ...prev,
            empresaId: empresas[0].id,
          }));

          const planosResponse = await planoContasService.findByEmpresa(empresas[0].id);
          const planosDisponiveis =
            planosResponse.data?.filter(
              (p: PlanoContas) => p.tipo === 'Receita' && p.permite_lancamento && p.ativo
            ) || [];
          setPlanosContas(planosDisponiveis);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar planos de contas:', err);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      pessoaId: '',
      planoContasId: '',
      empresaId: '',
      documento: '',
      serie: '1',
      parcela: 1,
      tipo: TipoContaReceber.DUPLICATA,
      dataEmissao: new Date().toISOString().split('T')[0],
      vencimento: '',
      descricao: '',
      valorPrincipal: 0,
      valorAcrescimos: 0,
      valorDescontos: 0,
    });
    setFormError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['valorPrincipal', 'valorAcrescimos', 'valorDescontos', 'parcela'].includes(name)
        ? parseFloat(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      // Calculate valorTotal and saldo
      const valorTotal =
        formData.valorPrincipal + (formData.valorAcrescimos || 0) - (formData.valorDescontos || 0);

      // Prepare data with calculated fields
      const dataToSubmit = {
        ...formData,
        dataLancamento: formData.dataLancamento || new Date().toISOString().split('T')[0],
        valorTotal,
        saldo: valorTotal, // Initial saldo is the same as valorTotal
      };

      await contaReceberService.create(dataToSubmit);
      await loadContasReceber();
      handleCloseForm();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao criar conta a receber');
    }
  };

  const totalAReceber = contas
    .filter(
      conta =>
        conta.status === StatusContaReceber.PENDENTE || conta.status === StatusContaReceber.PARCIAL
    )
    .reduce((acc, conta) => acc + conta.saldo, 0);

  const recebidoEsteMes = contas
    .filter(conta => {
      if (conta.status !== StatusContaReceber.LIQUIDADO || !conta.dataLiquidacao) return false;
      const dataLiquidacao = new Date(conta.dataLiquidacao);
      const hoje = new Date();
      return (
        dataLiquidacao.getMonth() === hoje.getMonth() &&
        dataLiquidacao.getFullYear() === hoje.getFullYear()
      );
    })
    .reduce((acc, conta) => acc + conta.valorTotal, 0);

  const previsaoProximos30Dias = contas
    .filter(conta => {
      if (
        conta.status !== StatusContaReceber.PENDENTE &&
        conta.status !== StatusContaReceber.PARCIAL
      )
        return false;

      const vencimento = new Date(conta.vencimento);
      const hoje = new Date();
      const em30Dias = new Date();
      em30Dias.setDate(hoje.getDate() + 30);

      return vencimento >= hoje && vencimento <= em30Dias;
    })
    .reduce((acc, conta) => acc + conta.saldo, 0);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const StatusBadge: React.FC<{ status: StatusContaReceber }> = ({ status }) => {
    const statusConfig: Record<StatusContaReceber, { bg: string; text: string; label: string }> = {
      [StatusContaReceber.PENDENTE]: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Pendente',
      },
      [StatusContaReceber.PARCIAL]: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Parcial' },
      [StatusContaReceber.LIQUIDADO]: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Liquidado',
      },
      [StatusContaReceber.VENCIDO]: { bg: 'bg-red-100', text: 'text-red-800', label: 'Vencido' },
      [StatusContaReceber.CANCELADO]: {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        label: 'Cancelado',
      },
    };

    const config = statusConfig[status] || {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      label: status,
    };

    return (
      <span className={`px-2 py-1 rounded text-sm ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
          onClick={handleNovaConta}
        >
          Nova Receita
        </button>
      </div>

      {showBaixaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                Registrar Baixa de Recebimento
              </h2>
              <button
                onClick={handleCancelarBaixaModal}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Data da Baixa *
                </label>
                <input
                  type="date"
                  value={baixaData.data}
                  onChange={e => setBaixaData(prev => ({ ...prev, data: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Conta Bancária *
                </label>
                <select
                  value={baixaData.contaBancariaId}
                  onChange={e =>
                    setBaixaData(prev => ({ ...prev, contaBancariaId: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">Selecione uma conta</option>
                  {contasBancarias.map(cb => (
                    <option key={cb.id} value={cb.id}>
                      {cb.banco} - {cb.agencia}/{cb.conta} - Saldo: R${' '}
                      {cb.saldo_atual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Valor da Baixa *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={baixaData.valor}
                  onChange={e =>
                    setBaixaData(prev => ({ ...prev, valor: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Acréscimos
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={baixaData.acrescimos}
                  onChange={e =>
                    setBaixaData(prev => ({ ...prev, acrescimos: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Descontos
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={baixaData.descontos}
                  onChange={e =>
                    setBaixaData(prev => ({ ...prev, descontos: parseFloat(e.target.value) || 0 }))
                  }
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="0.00"
                />
              </div>

              <div className="p-3 bg-[var(--color-bg)] rounded-md">
                <div className="flex justify-between text-sm">
                  <span>Total a Receber:</span>
                  <span className="font-bold">
                    R${' '}
                    {(
                      baixaData.valor +
                      (baixaData.acrescimos ?? 0) -
                      (baixaData.descontos ?? 0)
                    ).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[var(--color-border)]">
              <button
                onClick={handleCancelarBaixaModal}
                className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarBaixa}
                disabled={!baixaData.contaBancariaId || baixaData.valor <= 0}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirmar Baixa
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Nova Conta a Receber
              </h2>
              <button
                onClick={handleCloseForm}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Pessoa (Cliente) *
                  </label>
                  <select
                    name="pessoaId"
                    value={formData.pessoaId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="">Selecione uma pessoa</option>
                    {pessoas.map(pessoa => (
                      <option key={pessoa.id} value={pessoa.id}>
                        {pessoa.razaoNome || pessoa.fantasiaApelido} - {pessoa.documento}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Documento *
                  </label>
                  <input
                    type="text"
                    name="documento"
                    value={formData.documento}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: 000001"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Série *
                  </label>
                  <input
                    type="text"
                    name="serie"
                    value={formData.serie}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: 1"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Parcela *
                  </label>
                  <input
                    type="number"
                    name="parcela"
                    value={formData.parcela}
                    onChange={handleInputChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Tipo *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    {Object.values(TipoContaReceber).map(tipo => (
                      <option key={tipo} value={tipo}>
                        {tipo.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Data Emissão *
                  </label>
                  <input
                    type="date"
                    name="dataEmissao"
                    value={formData.dataEmissao}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Vencimento *
                  </label>
                  <input
                    type="date"
                    name="vencimento"
                    value={formData.vencimento}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Ex: Pagamento de projeto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Valor Principal *
                  </label>
                  <input
                    type="number"
                    name="valorPrincipal"
                    value={formData.valorPrincipal}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Ex: 5000.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Acréscimos
                  </label>
                  <input
                    type="number"
                    name="valorAcrescimos"
                    value={formData.valorAcrescimos}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Ex: 50.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Descontos
                  </label>
                  <input
                    type="number"
                    name="valorDescontos"
                    value={formData.valorDescontos}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Ex: 100.00"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Plano de Contas (Receita)
                  </label>
                  <select
                    name="planoContasId"
                    value={formData.planoContasId || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="">Selecione um plano de contas (opcional)</option>
                    {planosContas.map(plano => (
                      <option key={plano.id} value={plano.id}>
                        {plano.codigo} - {plano.descricao}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    Vincule esta conta a receber a uma conta do plano de contas para gerar
                    relatórios (DRE)
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  Cadastrar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">A Receber</span>
            <FiDollarSign className="text-[var(--color-receivable)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--color-receivable)] mt-2">
            {formatarMoeda(totalAReceber)}
          </p>
        </div>

        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Recebido este mês</span>
            <FiCheckCircle className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-500 mt-2">{formatarMoeda(recebidoEsteMes)}</p>
        </div>

        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Previsão próx. 30 dias</span>
            <FiCalendar className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-500 mt-2">
            {formatarMoeda(previsaoProximos30Dias)}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">Carregando contas a receber...</p>
        </div>
      ) : contas.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
          <FiCreditCard size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            Nenhuma conta cadastrada
          </h3>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Comece adicionando sua primeira conta a receber
          </p>
          <button
            onClick={handleNovaConta}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors font-medium"
          >
            <FiPlus size={20} />
            Adicionar Conta
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-[var(--color-surface)] rounded-md shadow">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left p-4 text-[var(--color-text-secondary)]">
                  Documento/Parcela
                </th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Descrição</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Cliente</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Valor Total</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Saldo</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Vencimento</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Status</th>
                <th className="text-center p-4 text-[var(--color-text-secondary)]">Ações</th>
              </tr>
            </thead>
            <tbody>
              {contas.map(conta => (
                <tr
                  key={conta.id}
                  className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                >
                  <td className="p-4 text-[var(--color-text)]">
                    {conta.documento}/{conta.serie} - {conta.parcela}
                  </td>
                  <td className="p-4 text-[var(--color-text)]">{conta.descricao}</td>
                  <td className="p-4 text-[var(--color-text)]">
                    {conta.pessoa.fantasiaApelido || 'N/A'}
                  </td>
                  <td className="p-4 text-[var(--color-text)]">
                    R$ {conta.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-[var(--color-text)]">
                    R$ {conta.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-[var(--color-text)]">
                    {new Date(conta.vencimento).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <StatusBadge status={conta.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {(conta.status === StatusContaReceber.PENDENTE ||
                        conta.status === StatusContaReceber.PARCIAL) && (
                        <button
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          onClick={() => handleBaixar(conta)}
                        >
                          Baixar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
