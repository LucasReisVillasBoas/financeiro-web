import React, { useEffect, useState } from 'react';
import { FiDollarSign, FiCalendar, FiCheckCircle, FiCreditCard, FiPlus, FiX } from 'react-icons/fi';
import type { ContaReceber, CreateContaReceberDto, ContaBancaria } from '../../../types/api.types';
import { contaReceberService, contaBancariaService, movimentacaoBancariaService } from '../../../services';

export const ContasReceberSection: React.FC = () => {
  const [contas, setContas] = useState<ContaReceber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateContaReceberDto>({
    descricao: '',
    valor: 0,
    vencimento: '',
    status: 'Pendente',
    cliente: '',
  });
  const [formError, setFormError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState<ContaReceber | null>(null);
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([]);
  const [contaBancariaSelecionada, setContaBancariaSelecionada] = useState('');

  useEffect(() => {
    loadContasReceber();
  }, []);

  const loadContasReceber = async () => {
    try {
      setLoading(true);
      const data = await contaReceberService.findAll();
      setContas(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar contas bancárias');
    } finally {
      setLoading(false);
    }
  };

  const handleReceber = async (id: string) => {
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

  const handleConfirmarRecebimento = async () => {
    if (!contaSelecionada || !contaBancariaSelecionada) {
      setError('Selecione uma conta bancária');
      return;
    }

    try {
      await contaReceberService.update(contaSelecionada.id, {
        status: 'Recebida',
        dataRecebimento: new Date().toISOString().split('T')[0],
      });

      const contaBancaria = contasBancarias.find(cb => cb.id === contaBancariaSelecionada);
      if (contaBancaria) {
        const novoSaldo = contaBancaria.saldoDisponivel + contaSelecionada.valor;
        await contaBancariaService.update(contaBancaria.id, {
          saldoDisponivel: novoSaldo,
        });

        await movimentacaoBancariaService.create({
          data: new Date().toISOString().split('T')[0],
          descricao: `Recebimento: ${contaSelecionada.descricao}`,
          conta: contaBancaria.conta,
          categoria: 'Recebimento',
          valor: contaSelecionada.valor,
          tipo: 'Entrada',
          contaBancaria: contaBancaria.id,
        });
      }

      await loadContasReceber();
      setShowConfirmModal(false);
      setContaSelecionada(null);
      setContaBancariaSelecionada('');
    } catch (err: any) {
      setError(err.message || 'Erro ao processar recebimento');
    }
  };

  const handleCancelarModal = () => {
    setShowConfirmModal(false);
    setContaSelecionada(null);
    setContaBancariaSelecionada('');
  };

  const handleNovaConta = () => {
    setShowForm(true);
    setFormError('');
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      descricao: '',
      valor: 0,
      vencimento: '',
      status: 'Pendente',
      cliente: '',
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
      await contaReceberService.create(formData);
      await loadContasReceber();
      handleCloseForm();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao criar conta a receber');
    }
  };

  const totalAReceber = contas
    .filter(conta => conta.status === 'Pendente')
    .reduce((acc, conta) => acc + conta.valor, 0);

  const recebidoEsteMes = contas
    .filter(conta => {
      if (conta.status !== 'Recebida' || !conta.dataRecebimento) return false;

      const dataRecebimento = new Date(conta.dataRecebimento);
      const hoje = new Date();

      return (
        dataRecebimento.getMonth() === hoje.getMonth() &&
        dataRecebimento.getFullYear() === hoje.getFullYear()
      );
    })
    .reduce((acc, conta) => acc + conta.valor, 0);

  const previsaoProximos30Dias = contas
    .filter(conta => {
      if (conta.status !== 'Pendente') return false;

      const vencimento = new Date(conta.vencimento);
      const hoje = new Date();
      const em30Dias = new Date();
      em30Dias.setDate(hoje.getDate() + 30);

      return vencimento >= hoje && vencimento <= em30Dias;
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
          Nova Receita
        </button>
      </div>

      {showConfirmModal && contaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Confirmar Recebimento</h2>
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
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Cliente</p>
                <p className="text-[var(--color-text)]">{contaSelecionada.cliente}</p>
              </div>

              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Valor</p>
                <p className="text-2xl font-bold text-[var(--color-receivable)]">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(contaSelecionada.valor)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Conta Bancária para Crédito *
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
                      }).format(cb.saldoDisponivel)}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-md text-sm">
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
                onClick={handleConfirmarRecebimento}
                className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Confirmar Recebimento
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">Nova Conta a Receber</h2>
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
                    Cliente *
                  </label>
                  <input
                    type="text"
                    name="cliente"
                    value={formData.cliente}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Ex: Empresa ABC Ltda"
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
                    placeholder="Ex: 5000.00"
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
                    <option value="Recebida">Recebida</option>
                  </select>
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
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Descrição</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Cliente</th>
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
                  <td className="p-4 text-[var(--color-text)]">{conta.cliente}</td>
                  <td className="p-4 text-[var(--color-text)]">
                    R$ {conta.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-[var(--color-text)]">
                    {new Date(conta.vencimento).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        conta.status === 'Recebida'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                      }`}
                    >
                      {conta.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {conta.status === 'Pendente' && (
                        <button
                          className="px-3 py-1 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded text-sm hover:bg-[var(--color-primary-hover)] transition-colors"
                          onClick={() => handleReceber(conta.id)}
                        >
                          Receber
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
