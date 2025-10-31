import React, { useState, useEffect } from 'react';
import {
  FiPlus,
  FiEye,
  FiCreditCard,
  FiTrendingUp,
  FiX,
  FiArrowUp,
  FiArrowDown,
} from 'react-icons/fi';
import { contaBancariaService } from '../../../services/conta-bancaria.service';
import { movimentacaoBancariaService } from '../../../services/movimentacao-bancaria.service';
import { empresaService } from '../../../services/empresa.service';
import { ContaBancariaCard } from '../../../components/ContaBancariaCard';
import type {
  ContaBancaria,
  Empresa,
  CreateContaBancariaDto,
  MovimentacaoBancaria,
} from '../../../types/api.types';

export const ContasBancariasSection: React.FC = () => {
  const [contas, setContas] = useState<ContaBancaria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [variacaoMensal, setVariacaoMensal] = useState<number | null>(null);
  const [showSaldo, setShowSaldo] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [formData, setFormData] = useState<CreateContaBancariaDto>({
    banco: '',
    agencia: '',
    agencia_digito: '',
    conta: '',
    conta_digito: '',
    descricao: '',
    tipo: 'Conta Corrente',
    saldo_inicial: 0,
    empresaId: '',
    cliente_id: '',
    data_referencia_saldo: '',
  });
  const [formError, setFormError] = useState('');
  const [saldoFormatado, setSaldoFormatado] = useState('R$ 0,00');
  const [showExtratoModal, setShowExtratoModal] = useState(false);
  const [contaSelecionadaExtrato, setContaSelecionadaExtrato] = useState<ContaBancaria | null>(
    null
  );
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoBancaria[]>([]);
  const [loadingMovimentacoes, setLoadingMovimentacoes] = useState(false);
  const [showConfigurarModal, setShowConfigurarModal] = useState(false);
  const [contaSelecionadaConfig, setContaSelecionadaConfig] = useState<ContaBancaria | null>(null);
  const [configData, setConfigData] = useState({ tipo: '', ativo: true });
  const [configError, setConfigError] = useState('');

  useEffect(() => {
    loadContas();
    calcularVariacaoMensal();
  }, []);

  const loadContas = async () => {
    try {
      setLoading(true);
      const data = await contaBancariaService.findAll();
      setContas(data);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar contas bancárias');
    } finally {
      setLoading(false);
    }
  };

  const calcularVariacaoMensal = async () => {
    try {
      const hoje = new Date();

      const inicioMesAtual = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMesAtual = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

      const inicioMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth() - 1, 1);
      const fimMesAnterior = new Date(hoje.getFullYear(), hoje.getMonth(), 0);

      const formatarData = (data: Date) => data.toISOString().split('T')[0];

      const [movimentacoesMesAtual, movimentacoesMesAnterior] = await Promise.all([
        movimentacaoBancariaService.findByPeriodo(
          formatarData(inicioMesAtual),
          formatarData(fimMesAtual)
        ),
        movimentacaoBancariaService.findByPeriodo(
          formatarData(inicioMesAnterior),
          formatarData(fimMesAnterior)
        ),
      ]);

      const saldoMesAtual = movimentacoesMesAtual.reduce((acc, mov) => {
        return acc + (mov.tipo === 'Entrada' ? mov.valor : -mov.valor);
      }, 0);

      const saldoMesAnterior = movimentacoesMesAnterior.reduce((acc, mov) => {
        return acc + (mov.tipo === 'Entrada' ? mov.valor : -mov.valor);
      }, 0);

      if (saldoMesAnterior === 0) {
        if (saldoMesAtual > 0) {
          setVariacaoMensal(100);
        } else if (saldoMesAtual < 0) {
          setVariacaoMensal(-100);
        } else {
          setVariacaoMensal(0);
        }
      } else {
        const variacao = ((saldoMesAtual - saldoMesAnterior) / Math.abs(saldoMesAnterior)) * 100;
        setVariacaoMensal(variacao);
      }
    } catch (err: any) {
      console.error('Erro ao calcular variação mensal:', err);
      setVariacaoMensal(null);
    }
  };

  const handleVerExtrato = async (id: string) => {
    const conta = contas.find(c => c.id === id);
    if (!conta) return;

    setContaSelecionadaExtrato(conta);
    setShowExtratoModal(true);
    setLoadingMovimentacoes(true);

    try {
      const movimentacoesData = await movimentacaoBancariaService.findByConta(id);
      const movimentacoesOrdenadas = movimentacoesData.sort((a, b) => {
        return new Date(b.data).getTime() - new Date(a.data).getTime();
      });
      setMovimentacoes(movimentacoesOrdenadas);
    } catch (err) {
      console.error('Erro ao carregar movimentações:', err);
      setMovimentacoes([]);
    } finally {
      setLoadingMovimentacoes(false);
    }
  };

  const handleCloseExtrato = () => {
    setShowExtratoModal(false);
    setContaSelecionadaExtrato(null);
    setMovimentacoes([]);
  };

  const handleConfigurar = (id: string) => {
    const conta = contas.find(c => c.id === id);
    if (!conta) return;

    setContaSelecionadaConfig(conta);
    setConfigData({
      tipo: conta.tipo,
      ativo: conta.ativo,
    });
    setConfigError('');
    setShowConfigurarModal(true);
  };

  const handleCloseConfigurar = () => {
    setShowConfigurarModal(false);
    setContaSelecionadaConfig(null);
    setConfigData({ tipo: '', ativo: true });
    setConfigError('');
  };

  const handleConfigInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setConfigData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmitConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contaSelecionadaConfig) return;

    setConfigError('');

    try {
      await contaBancariaService.update(contaSelecionadaConfig.id, configData);
      await loadContas();
      handleCloseConfigurar();
    } catch (err: any) {
      setConfigError(err.message || 'Erro ao atualizar conta bancária');
    }
  };

  const handleNovaConta = async () => {
    setShowForm(true);
    setFormError('');
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.clienteId) {
          const empresasData = await empresaService.findByCliente(user.clienteId);
          setEmpresas(empresasData);
        }
      }
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setFormData({
      banco: '',
      agencia: '',
      agencia_digito: '',
      conta: '',
      conta_digito: '',
      descricao: '',
      tipo: 'Conta Corrente',
      saldo_inicial: 0,
      empresaId: '',
      cliente_id: '',
      data_referencia_saldo: '',
    });
    setFormError('');
    setSaldoFormatado('R$ 0,00');
  };

  const formatarMoedaInput = (valor: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  const desformatarMoeda = (valorFormatado: string): number => {
    // Remove tudo exceto números e vírgula
    const apenasNumeros = valorFormatado.replace(/[^\d,]/g, '');
    // Substitui vírgula por ponto
    const valorComPonto = apenasNumeros.replace(',', '.');
    // Converte para número
    const numero = parseFloat(valorComPonto) || 0;
    return numero;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaldoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;

    // Remove tudo exceto números
    const apenasNumeros = valor.replace(/\D/g, '');

    // Converte para número (considerando os últimos 2 dígitos como centavos)
    const numero = parseFloat(apenasNumeros) / 100 || 0;

    // Atualiza o valor numérico no formData
    setFormData(prev => ({
      ...prev,
      saldo_inicial: numero,
    }));

    // Atualiza o valor formatado
    setSaldoFormatado(formatarMoedaInput(numero));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        formData.cliente_id = user.clienteId;
      }
      formData.data_referencia_saldo = new Date().toISOString().split('T')[0];
      await contaBancariaService.create(formData);
      await loadContas();
      handleCloseForm();
    } catch (err: any) {
      setFormError(err.message || 'Erro ao criar conta bancária');
    }
  };

  const handleEye = () => {
    const show = showSaldo;
    setShowSaldo(!show);
  };

  const saldoTotal = contas.reduce((acc, conta) => acc + conta.saldo_atual, 0);
  const contasAtivas = contas.filter(conta => conta.ativo).length;
  const totalContas = contas.length;

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">
            Contas Bancárias
          </h1>
          <p className="text-[var(--color-text-secondary)]">
            Gerencie suas contas e saldos bancários
          </p>
        </div>
        <button
          onClick={handleNovaConta}
          className="flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors font-medium"
        >
          <FiPlus size={20} />
          Nova Conta
        </button>
      </div>

      {/* Formulário de Nova Conta */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                Nova Conta Bancária
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
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Banco *
                  </label>
                  <input
                    type="text"
                    name="banco"
                    value={formData.banco}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Ex: Banco do Brasil"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Tipo de Conta *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  >
                    <option value="Conta Corrente">Conta Corrente</option>
                    <option value="Conta Poupança">Conta Poupança</option>
                    <option value="Conta Salário">Conta Salário</option>
                    <option value="Conta Investimento">Conta Investimento</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Agência *
                  </label>
                  <input
                    type="text"
                    name="agencia"
                    value={formData.agencia}
                    onChange={handleInputChange}
                    required
                    pattern="\d+"
                    title="Agência deve conter apenas números"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Ex: 1234"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Dígito
                  </label>
                  <input
                    type="text"
                    name="agencia_digito"
                    value={formData.agencia_digito}
                    onChange={handleInputChange}
                    pattern="\d+"
                    title="Dígito deve conter apenas números"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Ex: 9"
                    maxLength={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Conta *
                  </label>
                  <input
                    type="text"
                    name="conta"
                    value={formData.conta}
                    onChange={handleInputChange}
                    required
                    pattern="\d+"
                    title="Conta deve conter apenas números"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Ex: 12345678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Dígito
                  </label>
                  <input
                    type="text"
                    name="conta_digito"
                    value={formData.conta_digito}
                    onChange={handleInputChange}
                    pattern="\d+"
                    title="Dígito deve conter apenas números"
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="Ex: 9"
                    maxLength={2}
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
                    placeholder="Ex: Conta principal da empresa"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                    Saldo Disponível *
                  </label>
                  <input
                    type="text"
                    name="saldo_inicial"
                    value={saldoFormatado}
                    onChange={handleSaldoChange}
                    required
                    className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    placeholder="R$ 0,00"
                  />
                  <p className="mt-1 text-xs text-[var(--color-text-secondary)]">
                    Digite apenas números. Ex: 500000 = R$ 5.000,00
                  </p>
                </div>

                {empresas.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                      Empresa *
                    </label>
                    <select
                      name="empresaId"
                      value={formData.empresaId}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                    >
                      <option value="">Selecione uma empresa</option>
                      {empresas.map(empresa => (
                        <option key={empresa.id} value={empresa.id}>
                          {empresa.nome_fantasia || empresa.razao_social}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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

      {/* Modal de Extrato */}
      {showExtratoModal && contaSelecionadaExtrato && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                  Extrato Bancário
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {contaSelecionadaExtrato.banco} - Ag: {contaSelecionadaExtrato.agencia}-
                  {contaSelecionadaExtrato.agencia_digito} / Conta: {contaSelecionadaExtrato.conta}-
                  {contaSelecionadaExtrato.conta_digito}
                </p>
              </div>
              <button
                onClick={handleCloseExtrato}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="p-6">
              {/* Informações da Conta */}
              <div className="bg-[var(--color-bg)] p-4 rounded-md mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Tipo de Conta</p>
                    <p className="text-[var(--color-text)] font-medium">
                      {contaSelecionadaExtrato.tipo}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Saldo Atual</p>
                    <p className="text-[var(--color-text)] font-bold text-lg">
                      {formatarMoeda(contaSelecionadaExtrato.saldo_atual)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--color-text-secondary)]">Saldo Inicial</p>
                    <p className="text-[var(--color-text)] font-medium">
                      {formatarMoeda(contaSelecionadaExtrato.saldo_inicial)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lista de Movimentações */}
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
                  Movimentações
                </h3>

                {loadingMovimentacoes ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--color-primary)]"></div>
                    <p className="mt-2 text-[var(--color-text-secondary)]">
                      Carregando movimentações...
                    </p>
                  </div>
                ) : movimentacoes.length === 0 ? (
                  <div className="text-center py-8 bg-[var(--color-bg)] rounded-md">
                    <p className="text-[var(--color-text-secondary)]">
                      Nenhuma movimentação encontrada
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {movimentacoes.map(mov => (
                      <div
                        key={mov.id}
                        className="flex items-center justify-between p-4 bg-[var(--color-bg)] rounded-md hover:bg-[var(--color-surface)] transition-colors"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div
                            className={`p-2 rounded-full ${
                              mov.tipo === 'Entrada'
                                ? 'bg-green-100 dark:bg-green-900/30'
                                : 'bg-red-100 dark:bg-red-900/30'
                            }`}
                          >
                            {mov.tipo === 'Entrada' ? (
                              <FiArrowDown
                                className="text-green-600 dark:text-green-400"
                                size={20}
                              />
                            ) : (
                              <FiArrowUp className="text-red-600 dark:text-red-400" size={20} />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-[var(--color-text)] font-medium">{mov.descricao}</p>
                            <p className="text-sm text-[var(--color-text-secondary)]">
                              {new Date(mov.data).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold text-lg ${
                              mov.tipo === 'Entrada'
                                ? 'text-green-600 dark:text-green-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {mov.tipo === 'Entrada' ? '+' : '-'} {formatarMoeda(mov.valor)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end p-6 border-t border-[var(--color-border)]">
              <button
                onClick={handleCloseExtrato}
                className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Configuração */}
      {showConfigurarModal && contaSelecionadaConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-surface)] rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)]">
              <div>
                <h2 className="text-2xl font-bold text-[var(--color-text-primary)]">
                  Configurar Conta
                </h2>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {contaSelecionadaConfig.banco} - {contaSelecionadaConfig.conta}-
                  {contaSelecionadaConfig.conta_digito}
                </p>
              </div>
              <button
                onClick={handleCloseConfigurar}
                className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitConfig} className="p-6 space-y-4">
              {configError && (
                <div className="p-4 bg-red-600 dark:bg-red-700 text-white rounded-md font-medium border border-red-700 dark:border-red-800">
                  {configError}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  Tipo de Conta
                </label>
                <select
                  name="tipoConta"
                  value={configData.tipo}
                  onChange={handleConfigInputChange}
                  required
                  className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-md text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                >
                  <option value="Conta Corrente">Conta Corrente</option>
                  <option value="Conta Poupança">Conta Poupança</option>
                  <option value="Conta Salário">Conta Salário</option>
                  <option value="Conta Investimento">Conta Investimento</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ativo"
                  name="ativo"
                  checked={configData.ativo}
                  onChange={handleConfigInputChange}
                  className="w-4 h-4 text-[var(--color-primary)] bg-[var(--color-bg)] border-[var(--color-border)] rounded focus:ring-2 focus:ring-[var(--color-primary)]"
                />
                <label htmlFor="ativo" className="text-sm font-medium text-[var(--color-text)]">
                  Conta Ativa
                </label>
              </div>

              <div className="bg-[var(--color-bg)] p-4 rounded-md">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {configData.ativo
                    ? 'Esta conta está ativa e pode ser utilizada para transações.'
                    : 'Esta conta será desativada e não poderá ser utilizada para novas transações.'}
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseConfigurar}
                  className="px-4 py-2 bg-[var(--color-bg)] text-[var(--color-text)] border border-[var(--color-border)] rounded-md hover:bg-[var(--color-surface)] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[var(--color-primary)] text-[var(--color-primary-foreground)] rounded-md hover:bg-[var(--color-primary-hover)] transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--color-surface)] rounded-lg shadow-md p-6 border border-[var(--color-border)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">Saldo Total</h3>
            <button
              className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
              onClick={handleEye}
            >
              <FiEye size={18} />
            </button>
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">
            {showSaldo ? <>{formatarMoeda(saldoTotal)}</> : <>*****</>}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">Todas as contas ativas</p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg shadow-md p-6 border border-[var(--color-border)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
              Contas Ativas
            </h3>
            <FiCreditCard size={18} className="text-[var(--color-text-secondary)]" />
          </div>
          <p className="text-3xl font-bold text-[var(--color-text-primary)] mb-1">{contasAtivas}</p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            De {totalContas} contas totais
          </p>
        </div>

        <div className="bg-[var(--color-surface)] rounded-lg shadow-md p-6 border border-[var(--color-border)]">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
              Variação Mensal
            </h3>
            <FiTrendingUp
              size={18}
              className={
                variacaoMensal !== null && variacaoMensal >= 0 ? 'text-green-500' : 'text-red-500'
              }
            />
          </div>
          {variacaoMensal !== null ? (
            <p
              className={`text-3xl font-bold mb-1 ${variacaoMensal >= 0 ? 'text-green-500' : 'text-red-500'}`}
            >
              {variacaoMensal >= 0 ? '+' : ''}
              {variacaoMensal.toFixed(1)}%
            </p>
          ) : (
            <p className="text-3xl font-bold text-[var(--color-text-secondary)] mb-1">--</p>
          )}
          <p className="text-xs text-[var(--color-text-secondary)]">Comparado ao mês anterior</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
          <p className="mt-4 text-[var(--color-text-secondary)]">Carregando contas...</p>
        </div>
      ) : contas.length === 0 ? (
        <div className="text-center py-12 bg-[var(--color-surface)] rounded-lg border border-[var(--color-border)]">
          <FiCreditCard size={48} className="mx-auto text-[var(--color-text-secondary)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
            Nenhuma conta cadastrada
          </h3>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Comece adicionando sua primeira conta bancária
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contas.map(conta => (
            <ContaBancariaCard
              key={conta.id}
              conta={conta}
              onVerExtrato={handleVerExtrato}
              onConfigurar={handleConfigurar}
            />
          ))}
        </div>
      )}
    </div>
  );
};
