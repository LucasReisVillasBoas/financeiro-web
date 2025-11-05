import React, { useEffect, useState, useRef } from 'react';
import {
  FiDollarSign,
  FiCalendar,
  FiAlertCircle,
  FiCreditCard,
  FiPlus,
  FiX,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiRotateCcw,
  FiMoreVertical,
} from 'react-icons/fi';
import type {
  ContaPagar,
  CreateContaPagarDto,
  ContaBancaria,
  PlanoContas,
  Pessoa,
  TipoContaPagar,
} from '../../../types/api.types';
import {
  contaPagarService,
  contaBancariaService,
  planoContasService,
  empresaService,
  pessoaService,
} from '../../../services';
import { useAuth } from '../../../context/AuthContext';

export const ContasPagarSection: React.FC = () => {
  const { user } = useAuth();
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<'bottom' | 'top'>('bottom');
  const menuRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<CreateContaPagarDto>({
    documento: '',
    serie: '',
    parcela: 1,
    tipo: 'Outros',
    descricao: '',
    data_emissao: new Date().toISOString().split('T')[0],
    vencimento: '',
    data_lancamento: new Date().toISOString().split('T')[0],
    valor_principal: 0,
    acrescimos: 0,
    descontos: 0,
    pessoaId: '',
    planoContasId: '',
    empresaId: '',
  });
  const [formError, setFormError] = useState('');

  const [showBaixaModal, setShowBaixaModal] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState<ContaPagar | null>(null);
  const [contasBancarias, setContasBancarias] = useState<ContaBancaria[]>([]);
  const [baixaData, setBaixaData] = useState({
    dataPagamento: new Date().toISOString().split('T')[0],
    valorPago: 0,
    contaBancariaId: '',
    observacao: '',
  });
  const [showCancelarModal, setShowCancelarModal] = useState(false);
  const [justificativaCancelamento, setJustificativaCancelamento] = useState('');
  const [planosContas, setPlanosContas] = useState<PlanoContas[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);

  const tiposContaPagar: TipoContaPagar[] = [
    'Fornecedor' as TipoContaPagar,
    'Empréstimo' as TipoContaPagar,
    'Imposto' as TipoContaPagar,
    'Salário' as TipoContaPagar,
    'Aluguel' as TipoContaPagar,
    'Serviço' as TipoContaPagar,
    'Outros' as TipoContaPagar,
  ];

  useEffect(() => {
    loadContas();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadContas = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await contaPagarService.findAll();
      setContas(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar contas a pagar');
    } finally {
      setLoading(false);
    }
  };

  const loadRecursos = async () => {
    try {
      if (user?.clienteId) {
        const empresas = await empresaService.findByCliente(user.clienteId);
        if (empresas && empresas.length > 0) {
          setFormData(prev => ({ ...prev, empresaId: empresas[0].id }));

          const planosResponse = await planoContasService.findByEmpresa(empresas[0].id);
          const planosDisponiveis =
            planosResponse.data?.filter(
              (p: PlanoContas) => p.tipo === 'Despesa' && p.permite_lancamento && p.ativo
            ) || [];
          setPlanosContas(planosDisponiveis);
        }

        const pessoasData = await pessoaService.findByCliente(user.clienteId);
        setPessoas(pessoasData.filter((p: Pessoa) => p.ativo));
      }
    } catch (err) {
      console.error('Erro ao carregar recursos:', err);
    }
  };

  const handleNovaConta = async () => {
    setShowForm(true);
    setFormError('');
    await loadRecursos();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      documento: '',
      serie: '',
      parcela: 1,
      tipo: 'Outros',
      descricao: '',
      data_emissao: new Date().toISOString().split('T')[0],
      vencimento: '',
      data_lancamento: new Date().toISOString().split('T')[0],
      valor_principal: 0,
      acrescimos: 0,
      descontos: 0,
      pessoaId: '',
      planoContasId: '',
      empresaId: '',
    });
    setFormError('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]:
        name === 'valor_principal' || name === 'acrescimos' || name === 'descontos'
          ? parseFloat(value) || 0
          : name === 'parcela'
            ? parseInt(value) || 1
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      await contaPagarService.create(formData);
      await loadContas();
      handleCloseForm();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao criar conta a pagar');
    }
  };

  const handleRegistrarBaixa = async (conta: ContaPagar) => {
    setContaSelecionada(conta);

    let empresaId = formData.empresaId;
    if (!empresaId && user?.clienteId) {
      const empresas = await empresaService.findByCliente(user.clienteId);
      if (empresas && empresas.length > 0) {
        empresaId = empresas[0].id;
      }
    }

    const contasBanc = empresaId
      ? await contaBancariaService.findByEmpresa(empresaId)
      : await contaBancariaService.findAll();

    setContasBancarias(contasBanc.filter(cb => cb.ativo));
    setBaixaData({
      dataPagamento: new Date().toISOString().split('T')[0],
      valorPago: conta.saldo,
      contaBancariaId: '',
      observacao: `Pagamento: ${conta.descricao}`,
    });
    setShowBaixaModal(true);
  };

  const handleConfirmarBaixa = async () => {
    if (!contaSelecionada || !baixaData.contaBancariaId) {
      setError('Selecione uma conta bancária');
      return;
    }

    try {
      await contaPagarService.registrarBaixa(contaSelecionada.id, baixaData);
      await loadContas();
      setShowBaixaModal(false);
      setContaSelecionada(null);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar baixa');
    }
  };

  const handleEstornarBaixa = async (conta: ContaPagar) => {
    if (
      !window.confirm(
        `Deseja realmente estornar a baixa desta conta?\n\nDocumento: ${conta.documento}\nDescrição: ${conta.descricao}`
      )
    ) {
      return;
    }

    try {
      await contaPagarService.estornarBaixa(conta.id);
      await loadContas();
    } catch (err: any) {
      setError(err.message || 'Erro ao estornar baixa');
    }
  };

  const handleCancelar = (conta: ContaPagar) => {
    setContaSelecionada(conta);
    setJustificativaCancelamento('');
    setShowCancelarModal(true);
  };

  const handleConfirmarCancelamento = async () => {
    if (!contaSelecionada || !justificativaCancelamento.trim()) {
      setError('Justificativa é obrigatória');
      return;
    }

    try {
      await contaPagarService.cancelar(contaSelecionada.id, {
        justificativa: justificativaCancelamento,
      });
      await loadContas();
      setShowCancelarModal(false);
      setContaSelecionada(null);
      setJustificativaCancelamento('');
      setError('');
    } catch (err: any) {
      setError(err.message || 'Erro ao cancelar conta');
    }
  };

  const handleDelete = async (conta: ContaPagar) => {
    if (
      !window.confirm(
        `Deseja realmente excluir esta conta?\n\nDocumento: ${conta.documento}\nDescrição: ${conta.descricao}\n\nEsta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    try {
      await contaPagarService.delete(conta.id);
      await loadContas();
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir conta');
    }
  };

  const calcularValorTotal = () => {
    return formData.valor_principal + (formData.acrescimos || 0) - (formData.descontos || 0);
  };

  const totalPendente = contas
    .filter(conta => conta.status === 'Pendente')
    .reduce((acc, conta) => acc + conta.saldo, 0);

  const totalVencidas = contas
    .filter(conta => conta.status === 'Vencida')
    .reduce((acc, conta) => acc + conta.saldo, 0);

  const pagasEsteMes = contas
    .filter(conta => {
      if (conta.status !== 'Paga' || !conta.data_liquidacao) return false;

      const dataLiquidacao = new Date(conta.data_liquidacao);
      const hoje = new Date();

      return (
        dataLiquidacao.getMonth() === hoje.getMonth() &&
        dataLiquidacao.getFullYear() === hoje.getFullYear()
      );
    })
    .reduce((acc, conta) => acc + conta.valor_total, 0);

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Paga':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Vencida':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'ParcialmentePaga':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Cancelada':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
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

      {/* Modal de Baixa */}
      {showBaixaModal && contaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
                Registrar Baixa
              </h2>
              <button
                onClick={() => setShowBaixaModal(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Documento</p>
                <p className="text-[var(--color-text)] font-medium">
                  {contaSelecionada.documento}
                  {contaSelecionada.serie && ` - Série: ${contaSelecionada.serie}`} - Parcela{' '}
                  {contaSelecionada.parcela}
                </p>
              </div>

              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Descrição</p>
                <p className="text-[var(--color-text)]">{contaSelecionada.descricao}</p>
              </div>

              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Saldo Devedor</p>
                <p className="text-2xl font-bold text-[var(--color-payable)]">
                  {formatarMoeda(contaSelecionada.saldo)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Data de Liquidação *
                </label>
                <input
                  type="date"
                  value={baixaData.dataPagamento}
                  onChange={e =>
                    setBaixaData(prev => ({ ...prev, dataPagamento: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Valor Pago *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={baixaData.valorPago}
                  onChange={e =>
                    setBaixaData(prev => ({ ...prev, valorPago: parseFloat(e.target.value) || 0 }))
                  }
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
                      {cb.banco} - {cb.agencia}/{cb.conta} - Saldo: {formatarMoeda(cb.saldo_atual)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Observação (opcional)
                </label>
                <input
                  type="text"
                  value={baixaData.observacao}
                  onChange={e => setBaixaData(prev => ({ ...prev, observacao: e.target.value }))}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-600 dark:bg-red-700 text-white rounded-md font-medium border border-red-700 dark:border-red-800 text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[var(--color-border)]">
              <button
                onClick={() => setShowBaixaModal(false)}
                className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarBaixa}
                className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Confirmar Baixa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Cancelamento */}
      {showCancelarModal && contaSelecionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Cancelar Conta</h2>
              <button
                onClick={() => setShowCancelarModal(false)}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Documento</p>
                <p className="text-[var(--color-text)] font-medium">
                  {contaSelecionada.documento} - Parcela {contaSelecionada.parcela}
                </p>
              </div>

              <div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-1">Descrição</p>
                <p className="text-[var(--color-text)]">{contaSelecionada.descricao}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Justificativa *
                </label>
                <textarea
                  value={justificativaCancelamento}
                  onChange={e => setJustificativaCancelamento(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  placeholder="Informe o motivo do cancelamento..."
                />
              </div>

              {error && (
                <div className="p-3 bg-red-600 dark:bg-red-700 text-white rounded-md font-medium border border-red-700 dark:border-red-800 text-sm">
                  {error}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-[var(--color-border)]">
              <button
                onClick={() => setShowCancelarModal(false)}
                className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface)] transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleConfirmarCancelamento}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de Nova Conta a Pagar */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Ex: NF-12345"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Série
                  </label>
                  <input
                    type="text"
                    name="serie"
                    value={formData.serie}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Ex: A"
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {tiposContaPagar.map(tipo => (
                      <option key={tipo} value={tipo}>
                        {tipo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Pessoa/Fornecedor *
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
                        {pessoa.razaoNome} {pessoa.documento ? `- ${pessoa.documento}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
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
                  placeholder="Ex: Aluguel do escritório - Janeiro/2025"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Data de Emissão *
                  </label>
                  <input
                    type="date"
                    name="data_emissao"
                    value={formData.data_emissao}
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

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Data de Lançamento *
                  </label>
                  <input
                    type="date"
                    name="data_lancamento"
                    value={formData.data_lancamento}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Valor Principal *
                  </label>
                  <input
                    type="number"
                    name="valor_principal"
                    value={formData.valor_principal}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0.01"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Acréscimos
                  </label>
                  <input
                    type="number"
                    name="acrescimos"
                    value={formData.acrescimos}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Descontos
                  </label>
                  <input
                    type="number"
                    name="descontos"
                    value={formData.descontos}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  />
                </div>
              </div>

              <div className="p-4 bg-[var(--color-bg)] rounded-md border border-[var(--color-border)]">
                <p className="text-sm text-[var(--color-text-secondary)]">Valor Total</p>
                <p className="text-2xl font-bold text-[var(--color-text)]">
                  {formatarMoeda(calcularValorTotal())}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Plano de Contas (Despesa) *
                </label>
                <select
                  name="planoContasId"
                  value={formData.planoContasId}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="">Selecione um plano de contas</option>
                  {planosContas.map(plano => (
                    <option key={plano.id} value={plano.id}>
                      {plano.codigo} - {plano.descricao}
                    </option>
                  ))}
                </select>
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
        <div className="w-full pb-48" style={{ overflow: 'visible', position: 'relative', minHeight: '200px' }}>
          <div style={{ overflow: 'visible' }}>
            <table className="w-full bg-[var(--color-surface)] rounded-md shadow">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Documento</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Parcela</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Tipo</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Descrição</th>
                <th className="text-left p-4 text-[var(--color-text-secondary)]">Pessoa</th>
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
                    {conta.documento}
                    {conta.serie && (
                      <span className="text-sm text-[var(--color-text-secondary)]">
                        {' '}
                        ({conta.serie})
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-[var(--color-text)]">{conta.parcela}</td>
                  <td className="p-4 text-[var(--color-text)]">{conta.tipo}</td>
                  <td className="p-4 text-[var(--color-text)]">{conta.descricao}</td>
                  <td className="p-4 text-[var(--color-text)]">{conta.pessoaNome || '-'}</td>
                  <td className="p-4 text-[var(--color-text)]">
                    {formatarMoeda(conta.valor_total)}
                  </td>
                  <td className="p-4 text-[var(--color-text)] font-semibold">
                    {formatarMoeda(conta.saldo)}
                  </td>
                  <td className="p-4 text-[var(--color-text)]">
                    {new Date(conta.vencimento).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${getStatusBadgeClass(conta.status)}`}
                    >
                      {conta.status}
                    </span>
                  </td>
                  <td className="p-4" style={{ position: 'relative' }}>
                    <div className="flex justify-center">
                      <button
                        onClick={(e) => {
                          const newOpenId = openMenuId === conta.id ? null : conta.id;
                          setOpenMenuId(newOpenId);

                          if (newOpenId) {
                            const button = e.currentTarget;
                            const rect = button.getBoundingClientRect();
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const spaceAbove = rect.top;

                            // Se não houver espaço suficiente embaixo (menos de 200px), abre para cima
                            setMenuPosition(spaceBelow < 200 && spaceAbove > 200 ? 'top' : 'bottom');
                          }
                        }}
                        className="p-2 hover:bg-[var(--color-bg)] rounded transition-colors"
                        title="Ações"
                      >
                        <FiMoreVertical size={18} className="text-[var(--color-text)]" />
                      </button>

                      {openMenuId === conta.id && (
                        <div
                          ref={menuRef}
                          className="absolute right-4 w-48 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-md shadow-xl"
                          style={{
                            ...(menuPosition === 'bottom'
                              ? { top: '100%', marginTop: '4px' }
                              : { bottom: '100%', marginBottom: '4px' }
                            ),
                            zIndex: 9999
                          }}
                        >
                          <div className="py-1">
                            {(conta.status === 'Pendente' ||
                              conta.status === 'Vencida' ||
                              conta.status === 'ParcialmentePaga') && (
                              <button
                                onClick={() => {
                                  handleRegistrarBaixa(conta);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors text-left"
                              >
                                <FiCheckCircle size={16} className="text-green-600" />
                                Pagar
                              </button>
                            )}
                            {conta.status === 'Paga' && conta.movimentacaoBancariaId && (
                              <button
                                onClick={() => {
                                  handleEstornarBaixa(conta);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors text-left"
                              >
                                <FiRotateCcw size={16} className="text-blue-600" />
                                Estornar Baixa
                              </button>
                            )}
                            {conta.status !== 'Cancelada' && conta.status !== 'Paga' && (
                              <button
                                onClick={() => {
                                  handleCancelar(conta);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors text-left"
                              >
                                <FiXCircle size={16} className="text-gray-600" />
                                Cancelar
                              </button>
                            )}
                            {(conta.status === 'Pendente' || conta.status === 'Cancelada') && (
                              <button
                                onClick={() => {
                                  handleDelete(conta);
                                  setOpenMenuId(null);
                                }}
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-bg)] transition-colors text-left border-t border-[var(--color-border)]"
                              >
                                <FiTrash2 size={16} className="text-red-600" />
                                Excluir
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
};
