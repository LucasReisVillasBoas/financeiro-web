import React, { useEffect, useState } from 'react';
import { FiDollarSign, FiCalendar, FiAlertCircle, FiCreditCard, FiPlus, FiX } from 'react-icons/fi';
import type {
  ContaPagar,
  CreateContaPagarDto,
  ContaBancaria,
  PlanoContas,
} from '../../../types/api.types';
import {
  contaPagarService,
  contaBancariaService,
  movimentacaoBancariaService,
  planoContasService,
  empresaService,
} from '../../../services';
import { useAuth } from '../../../context/AuthContext';

export const ContasPagarSection: React.FC = () => {
  const { user } = useAuth();
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateContaPagarDto>({
    descricao: '',
    valor: 0,
    vencimento: '',
    status: 'Pendente',
    fornecedor: '',
  });
  const [formError, setFormError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState<ContaPagar | null>(null);
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([]);
  const [contaBancariaSelecionada, setContaBancariaSelecionada] = useState('');
  const [planosContas, setPlanosContas] = useState<PlanoContas[]>([]);

  useEffect(() => {
    loadContasReceber();
  }, []);

  const loadContasReceber = async () => {
    try {
      setLoading(true);
      const data = await contaPagarService.findAll();

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const contasParaAtualizar = data.filter(conta => {
        if (conta.status !== 'Pendente') return false;

        const vencimento = new Date(conta.vencimento);
        vencimento.setHours(0, 0, 0, 0);

        return vencimento < hoje;
      });

      if (contasParaAtualizar.length > 0) {
        await Promise.all(
          contasParaAtualizar.map(conta =>
            contaPagarService.update(conta.id, { status: 'Vencida' })
          )
        );

        const dataAtualizada = await contaPagarService.findAll();
        setContas(dataAtualizada);
      } else {
        setContas(data);
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar contas bancárias');
    } finally {
      setLoading(false);
    }
  };

  const handlePagar = async (id: string) => {
    const conta = contas.find(c => c.id === id);
    if (!conta) return;

    setContaSelecionada(conta);
    setContaBancariaSelecionada('');
    setShowConfirmModal(true);

    try {
      const contasBanc = await contaBancariaService.findAll();
      setContasBancarias(contasBanc.filter(cb => cb.ativo));
    } catch (err) {
      console.error('Erro ao carregar contas bancárias:', err);
    }
  };

  const handleConfirmarPagamento = async () => {
    if (!contaSelecionada || !contaBancariaSelecionada) {
      setError('Selecione uma conta bancária');
      return;
    }

    try {
      await contaPagarService.update(contaSelecionada.id, {
        status: 'Paga',
        dataPagamento: new Date().toISOString().split('T')[0],
      });

      const contaBancaria = contasBancarias.find(cb => cb.id === contaBancariaSelecionada);
      if (contaBancaria) {
        await movimentacaoBancariaService.create({
          data: new Date().toISOString().split('T')[0],
          descricao: `Pagamento: ${contaSelecionada.descricao}`,
          conta: contaBancaria.conta,
          categoria: 'Pagamento',
          valor: contaSelecionada.valor,
          tipo: 'Saída',
          contaBancaria: contaBancaria.id,
        });
      }

      await loadContasReceber();
      setShowConfirmModal(false);
      setContaSelecionada(null);
      setContaBancariaSelecionada('');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar pagamento');
    }
  };

  const handleCancelarModal = () => {
    setShowConfirmModal(false);
    setContaSelecionada(null);
    setContaBancariaSelecionada('');
  };

  const handleNovaConta = async () => {
    setShowForm(true);
    setFormError('');

    // Carregar planos de contas de despesa
    try {
      if (user?.clienteId) {
        const empresas = await empresaService.findByCliente(user.clienteId);
        if (empresas && empresas.length > 0) {
          const planosResponse = await planoContasService.findByEmpresa(empresas[0].id);
          console.log('Todos os planos:', planosResponse.data);

          // Filtrar apenas contas de despesa e que permitem lançamento
          const planosDisponiveis =
            planosResponse.data?.filter((p: PlanoContas) => {
              console.log(
                `Conta ${p.codigo}: tipo=${p.tipo}, permite=${p.permite_lancamento}, ativo=${p.ativo}`
              );
              return p.tipo === 'Despesa' && p.permite_lancamento && p.ativo;
            }) || [];

          console.log('Planos de despesa disponíveis:', planosDisponiveis);
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
      descricao: '',
      valor: 0,
      vencimento: '',
      status: 'Pendente',
      fornecedor: '',
    });
    setFormError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valor' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      await contaPagarService.create(formData);
      await loadContasReceber();
      handleCloseForm();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao criar conta a pagar');
    }
  };

  const totalPendente = contas
    .filter(conta => conta.status === 'Pendente')
    .reduce((acc, conta) => acc + conta.valor, 0);

  const totalVencidas = contas
    .filter(conta => conta.status === 'Vencida')
    .reduce((acc, conta) => acc + conta.valor, 0);

  const pagasEsteMes = contas
    .filter(conta => {
      if (conta.status !== 'Paga' || !conta.dataPagamento) return false;

      const dataPagamento = new Date(conta.dataPagamento);
      const hoje = new Date();

      return (
        dataPagamento.getMonth() === hoje.getMonth() &&
        dataPagamento.getFullYear() === hoje.getFullYear()
      );
    })
    .reduce((acc, conta) => acc + conta.valor, 0);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
          onClick={handleNovaConta}
        >
          Nova Conta
        </button>
      </div>

      {/* Modal de Confirmação de Pagamento */}
      {showConfirmModal && contaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                Confirmar Pagamento
              </h2>
              <button
                onClick={handleCancelarModal}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Descrição</p>
                <p className="text-[var(--color-text)] font-medium">{contaSelecionada.descricao}</p>
              </div>

              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Fornecedor</p>
                <p className="text-[var(--color-text)]">{contaSelecionada.fornecedor}</p>
              </div>

              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Valor</p>
                <p className="text-2xl font-bold text-[var(--color-payable)]">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(contaSelecionada.valor)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Conta Bancária para Débito *
                </label>
                <select
                  value={contaBancariaSelecionada}
                  onChange={e => setContaBancariaSelecionada(e.target.value)}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">Selecione uma conta</option>
                  {contasBancarias.map(cb => (
                    <option key={cb.id} value={cb.id}>
                      {cb.banco} - {cb.agencia}/{cb.conta} - Saldo:{' '}
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(cb.saldo_atual)}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-600 dark:bg-red-700 text-white rounded-md font-medium border border-red-700 dark:border-red-800 text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[var(--color-border)]">
              <button
                onClick={handleCancelarModal}
                className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarPagamento}
                className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Confirmar Pagamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de Nova Conta a Pagar */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Nova Conta a Pagar
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
                <div className="p-4 bg-red-600 dark:bg-red-700 text-white rounded-md font-medium border border-red-700 dark:border-red-800">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    placeholder="Ex: Aluguel do escritório"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Fornecedor *
                  </label>
                  <input
                    type="text"
                    name="fornecedor"
                    value={formData.fornecedor}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Ex: Imobiliária XYZ"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Valor *
                  </label>
                  <input
                    type="number"
                    name="valor"
                    value={formData.valor}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Ex: 1500.00"
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

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Status *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Vencida">Vencida</option>
                    <option value="Paga">Paga</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Plano de Contas (Despesa)
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
                    Vincule esta conta a pagar a uma conta do plano de contas para gerar relatórios
                    (DRE)
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
            <span className="text-[var(--color-text-secondary)]">Total Pendente</span>
            <FiDollarSign className="text-[var(--color-payable)]" />
          </div>
          <p className="text-2xl font-bold text-[var(--color-payable)] mt-2">
            {formatarMoeda(totalPendente)}
          </p>
        </div>

        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Vencidas</span>
            <FiAlertCircle className="text-red-500" />
          </div>
          <p className="text-2xl font-bold text-red-500 mt-2">{formatarMoeda(totalVencidas)}</p>
        </div>

        <div className="p-4 bg-[var(--color-surface)] rounded-md shadow">
          <div className="flex items-center justify-between">
            <span className="text-[var(--color-text-secondary)]">Pagas este mês</span>
            <FiCalendar className="text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-500 mt-2">{formatarMoeda(pagasEsteMes)}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-600 dark:bg-red-700 text-white rounded-md font-medium border border-red-700 dark:border-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">Carregando contas a pagar...</p>
        </div>
      ) : contas.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
          <FiCreditCard size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            Nenhuma conta cadastrada
          </h3>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Comece adicionando sua primeira conta a pagar
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
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Descrição</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Fornecedor</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Valor</th>
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
                  <td className="p-4 text-[var(--color-text)]">{conta.descricao}</td>
                  <td className="p-4 text-[var(--color-text)]">{conta.fornecedor}</td>
                  <td className="p-4 text-[var(--color-text)]">
                    R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-[var(--color-text)]">
                    {new Date(conta.vencimento).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        conta.status === 'Paga'
                          ? 'bg-green-100 text-green-800'
                          : conta.status === 'Vencida'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {conta.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {conta.status === 'Pendente' && (
                        <button
                          onClick={() => handlePagar(conta.id)}
                          className="px-3 py-1 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded text-sm hover:bg-[var(--color-primary-hover)] transition-colors"
                        >
                          Pagar
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
