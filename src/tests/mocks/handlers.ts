import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:3002';

// Mock data
export const mockToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyIsInVzZXJuYW1lIjoidGVzdEBleGFtcGxlLmNvbSIsImNsaWVudGVJZCI6ImNsaWVudGUtMTIzIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MTYyMzkwMjJ9.mock-signature';

export const mockUser = {
  id: 'user-123',
  name: 'Test User',
  email: 'test@example.com',
  clienteId: 'cliente-123',
};

export const mockEmpresa = {
  id: 'empresa-123',
  razaoSocial: 'Empresa Teste LTDA',
  nomeFantasia: 'Empresa Teste',
  cnpj: '12345678000199',
  tipo: 'sede',
  ativo: true,
  clienteId: 'cliente-123',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockContaPagar = {
  id: 'conta-pagar-123',
  empresaId: 'empresa-123',
  pessoaId: 'pessoa-123',
  planoContasId: 'plano-123',
  documento: 'NF-001',
  serie: '1',
  parcela: 1,
  tipo: 'Fornecedor',
  descricao: 'Conta a Pagar Teste',
  data_emissao: '2024-01-01',
  vencimento: '2024-12-31',
  data_lancamento: '2024-01-01',
  valor_principal: 1000.0,
  acrescimos: 0,
  descontos: 0,
  valor_total: 1000.0,
  saldo: 1000.0,
  status: 'PENDENTE',
  pessoa: {
    id: 'pessoa-123',
    razaoNome: 'Fornecedor Teste',
    documento: '12345678000199',
  },
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
};

export const mockContaReceber = {
  id: 'conta-receber-123',
  empresaId: 'empresa-123',
  planoContasId: 'plano-456',
  documento: 'NF-001',
  serie: '1',
  parcela: 1,
  tipo: 'BOLETO',
  descricao: 'Conta a Receber Teste',
  dataEmissao: '2024-01-01',
  dataLancamento: '2024-01-01',
  vencimento: '2024-12-31',
  valorPrincipal: 2000.0,
  valorAcrescimos: 0,
  valorDescontos: 0,
  valorTotal: 2000.0,
  saldo: 2000.0,
  status: 'PENDENTE',
  criadoEm: '2024-01-01T00:00:00.000Z',
  atualizadoEm: '2024-01-01T00:00:00.000Z',
  pessoa: {
    id: 'pessoa-456',
    razaoNome: 'Cliente Teste',
    documento: '12345678901',
  },
};

export const mockContaBancaria = {
  id: 'conta-bancaria-123',
  empresaId: 'empresa-123',
  nome: 'Conta Corrente Principal',
  banco: 'Banco do Brasil',
  agencia: '1234',
  conta: '12345-6',
  saldoInicial: 10000.0,
  saldoAtual: 15000.0,
  ativo: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockMovimentacaoBancaria = {
  id: 'movimentacao-123',
  contaBancariaId: 'conta-bancaria-123',
  tipo: 'CREDITO',
  valor: 5000.0,
  data: '2024-06-15',
  descricao: 'Recebimento de venda',
  conciliado: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockPlanoContas = {
  id: 'plano-123',
  empresaId: 'empresa-123',
  codigo: '1.1.01',
  nome: 'Receita de Vendas',
  tipo: 'RECEITA',
  natureza: 'ANALITICA',
  ativo: true,
  nivel: 3,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

export const mockDreResponse = {
  periodo: {
    dataInicio: '2024-01-01',
    dataFim: '2024-12-31',
  },
  empresa: mockEmpresa,
  linhas: [
    { codigo: '1', descricao: 'Receita Bruta', valor: 100000, tipo: 'RECEITA' },
    { codigo: '2', descricao: 'Deduções', valor: -10000, tipo: 'DEDUCAO' },
    { codigo: '3', descricao: 'Receita Líquida', valor: 90000, tipo: 'SUBTOTAL' },
    { codigo: '4', descricao: 'Custos', valor: -50000, tipo: 'CUSTO' },
    { codigo: '5', descricao: 'Lucro Bruto', valor: 40000, tipo: 'SUBTOTAL' },
    { codigo: '6', descricao: 'Despesas Operacionais', valor: -15000, tipo: 'DESPESA' },
    { codigo: '7', descricao: 'Lucro Líquido', valor: 25000, tipo: 'RESULTADO' },
  ],
  totais: {
    receitaBruta: 100000,
    deducoes: -10000,
    receitaLiquida: 90000,
    custos: -50000,
    lucroBruto: 40000,
    despesasOperacionais: -15000,
    lucroLiquido: 25000,
  },
};

export const mockFluxoCaixaResponse = {
  linhas: [
    {
      data: '2024-01-15',
      entradasRealizadas: 10000,
      entradasPrevistas: 2000,
      saidasRealizadas: 5000,
      saidasPrevistas: 1000,
      saldoDiarioRealizado: 5000,
      saldoDiarioPrevisto: 1000,
      saldoAcumuladoRealizado: 15000,
      saldoAcumuladoPrevisto: 11000,
    },
  ],
  totais: {
    totalEntradasRealizadas: 10000,
    totalEntradasPrevistas: 2000,
    totalSaidasRealizadas: 5000,
    totalSaidasPrevistas: 1000,
    saldoFinalRealizado: 15000,
    saldoFinalPrevisto: 11000,
  },
  contaBancaria: {
    id: 'conta-bancaria-123',
    banco: 'Banco do Brasil',
    agencia: '1234',
    conta: '12345-6',
    descricao: 'Conta Corrente Principal',
    saldo_inicial: 10000,
  },
  empresa: {
    id: 'empresa-123',
    razao_social: 'Empresa Teste LTDA',
    nome_fantasia: 'Empresa Teste',
  },
};

// HTTP Handlers
export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === 'test@example.com' && body.password === 'password123') {
      return HttpResponse.json({
        token: mockToken,
        message: 'Login realizado com sucesso',
        statusCode: 200,
      });
    }
    return HttpResponse.json(
      { message: 'Credenciais inválidas', statusCode: 401 },
      { status: 401 }
    );
  }),

  http.post(`${API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({
      message: 'Logout realizado com sucesso',
      statusCode: 200,
    });
  }),

  // Contas a Pagar
  http.get(`${API_BASE_URL}/contas-pagar`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockContaPagar],
    });
  }),

  http.get(`${API_BASE_URL}/contas-pagar/empresa/:empresaId`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockContaPagar],
    });
  }),

  http.get(`${API_BASE_URL}/contas-pagar/:id`, ({ params }) => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: { ...mockContaPagar, id: params.id },
    });
  }),

  http.post(`${API_BASE_URL}/contas-pagar`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      message: 'Conta a pagar criada com sucesso',
      statusCode: 201,
      data: { ...mockContaPagar, ...body, id: 'new-conta-pagar-123' },
    });
  }),

  http.put(`${API_BASE_URL}/contas-pagar/:id`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      message: 'Conta a pagar atualizada com sucesso',
      statusCode: 200,
      data: { ...mockContaPagar, ...body, id: params.id },
    });
  }),

  http.post(`${API_BASE_URL}/contas-pagar/:id/registrar-baixa`, async ({ params }) => {
    return HttpResponse.json({
      message: 'Baixa registrada com sucesso',
      statusCode: 200,
      data: { ...mockContaPagar, id: params.id, status: 'PAGO' },
    });
  }),

  http.post(`${API_BASE_URL}/contas-pagar/:id/estornar-baixa`, ({ params }) => {
    return HttpResponse.json({
      message: 'Baixa estornada com sucesso',
      statusCode: 200,
      data: { ...mockContaPagar, id: params.id, status: 'PENDENTE' },
    });
  }),

  http.post(`${API_BASE_URL}/contas-pagar/:id/cancelar`, ({ params }) => {
    return HttpResponse.json({
      message: 'Conta cancelada com sucesso',
      statusCode: 200,
      data: { ...mockContaPagar, id: params.id, status: 'CANCELADO' },
    });
  }),

  http.post(`${API_BASE_URL}/contas-pagar/gerar-parcelas`, async ({ request }) => {
    const body = (await request.json()) as { quantidade_parcelas: number };
    const numParcelas = body.quantidade_parcelas || 3;
    const parcelas = Array.from({ length: numParcelas }, (_, i) => ({
      ...mockContaPagar,
      id: `parcela-${i + 1}`,
      parcela: i + 1,
    }));
    return HttpResponse.json({
      message: 'Parcelas geradas com sucesso',
      statusCode: 201,
      data: parcelas,
    });
  }),

  http.delete(`${API_BASE_URL}/contas-pagar/:id`, () => {
    return HttpResponse.json({
      message: 'Conta excluída com sucesso',
      statusCode: 200,
    });
  }),

  // Contas a Receber
  http.get(`${API_BASE_URL}/contas-receber`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockContaReceber],
    });
  }),

  http.get(`${API_BASE_URL}/contas-receber/empresa/:empresaId`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockContaReceber],
    });
  }),

  http.get(`${API_BASE_URL}/contas-receber/pessoa/:pessoaId`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockContaReceber],
    });
  }),

  http.get(`${API_BASE_URL}/contas-receber/:id`, ({ params }) => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: { ...mockContaReceber, id: params.id },
    });
  }),

  http.post(`${API_BASE_URL}/contas-receber`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      message: 'Conta a receber criada com sucesso',
      statusCode: 201,
      data: { ...mockContaReceber, ...body, id: 'new-conta-receber-123' },
    });
  }),

  http.post(`${API_BASE_URL}/contas-receber/parcelado`, async ({ request }) => {
    const body = (await request.json()) as { numeroParcelas: number };
    const numParcelas = body.numeroParcelas || 3;
    const parcelas = Array.from({ length: numParcelas }, (_, i) => ({
      ...mockContaReceber,
      id: `parcela-receber-${i + 1}`,
      parcela: i + 1,
    }));
    return HttpResponse.json({
      message: 'Parcelas criadas com sucesso',
      statusCode: 201,
      data: parcelas,
    });
  }),

  http.put(`${API_BASE_URL}/contas-receber/:id`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      message: 'Conta a receber atualizada com sucesso',
      statusCode: 200,
      data: { ...mockContaReceber, ...body, id: params.id },
    });
  }),

  http.post(`${API_BASE_URL}/contas-receber/:id/cancelar`, ({ params }) => {
    return HttpResponse.json({
      message: 'Conta cancelada com sucesso',
      statusCode: 200,
      data: { ...mockContaReceber, id: params.id, status: 'CANCELADO' },
    });
  }),

  http.delete(`${API_BASE_URL}/contas-receber/:id`, () => {
    return HttpResponse.json({
      message: 'Conta excluída com sucesso',
      statusCode: 200,
    });
  }),

  // Movimentações Bancárias
  http.get(`${API_BASE_URL}/movimentacoes-bancarias`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockMovimentacaoBancaria],
    });
  }),

  http.get(`${API_BASE_URL}/movimentacoes-bancarias/periodo`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockMovimentacaoBancaria],
    });
  }),

  http.get(`${API_BASE_URL}/movimentacoes-bancarias/conta/:contaId`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockMovimentacaoBancaria],
    });
  }),

  http.get(`${API_BASE_URL}/movimentacoes-bancarias/:id`, ({ params }) => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: { ...mockMovimentacaoBancaria, id: params.id },
    });
  }),

  http.post(`${API_BASE_URL}/movimentacoes-bancarias`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      message: 'Movimentação criada com sucesso',
      statusCode: 201,
      data: { ...mockMovimentacaoBancaria, ...body, id: 'new-movimentacao-123' },
    });
  }),

  http.put(`${API_BASE_URL}/movimentacoes-bancarias/:id`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      message: 'Movimentação atualizada com sucesso',
      statusCode: 200,
      data: { ...mockMovimentacaoBancaria, ...body, id: params.id },
    });
  }),

  http.delete(`${API_BASE_URL}/movimentacoes-bancarias/:id`, () => {
    return HttpResponse.json({
      message: 'Movimentação excluída com sucesso',
      statusCode: 200,
    });
  }),

  http.post(`${API_BASE_URL}/movimentacoes-bancarias/conciliar`, () => {
    return HttpResponse.json({
      message: 'Conciliação realizada com sucesso',
      statusCode: 200,
      data: { conciliadas: 1, total: 1, sucesso: true },
    });
  }),

  http.post(`${API_BASE_URL}/movimentacoes-bancarias/desconciliar`, () => {
    return HttpResponse.json({
      message: 'Desconciliação realizada com sucesso',
      statusCode: 200,
      data: { desconciliadas: 1, total: 1, sucesso: true },
    });
  }),

  // Plano de Contas
  http.get(`${API_BASE_URL}/plano-contas`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockPlanoContas],
    });
  }),

  http.get(`${API_BASE_URL}/plano-contas/empresa/:empresaId`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockPlanoContas],
    });
  }),

  http.get(`${API_BASE_URL}/plano-contas/empresa/:empresaId/tree`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockPlanoContas],
    });
  }),

  http.get(`${API_BASE_URL}/plano-contas/empresa/:empresaId/analiticas`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockPlanoContas],
    });
  }),

  http.get(`${API_BASE_URL}/plano-contas/empresa/:empresaId/analiticas-ativas`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockPlanoContas],
    });
  }),

  http.get(`${API_BASE_URL}/plano-contas/:id`, ({ params }) => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: { ...mockPlanoContas, id: params.id },
    });
  }),

  http.get(`${API_BASE_URL}/plano-contas/empresa/:empresaId/tipo/:tipo`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockPlanoContas],
    });
  }),

  http.get(`${API_BASE_URL}/plano-contas/:id/filhos`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockPlanoContas],
    });
  }),

  http.get(`${API_BASE_URL}/plano-contas/:id/breadcrumb`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockPlanoContas],
    });
  }),

  http.get(`${API_BASE_URL}/plano-contas/empresa/:empresaId/search`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: [mockPlanoContas],
    });
  }),

  http.post(`${API_BASE_URL}/plano-contas/:id/substituir`, () => {
    return HttpResponse.json({
      message: 'Conta substituída com sucesso',
      statusCode: 200,
      data: {
        sucesso: true,
        contasAtualizadas: 5,
        detalhes: {
          contasPagar: 2,
          contasReceber: 2,
          movimentacoes: 1,
        },
      },
    });
  }),

  http.patch(`${API_BASE_URL}/plano-contas/:id/toggle-status`, ({ params }) => {
    return HttpResponse.json({
      message: 'Status alterado com sucesso',
      statusCode: 200,
      data: { ...mockPlanoContas, id: params.id, ativo: false },
    });
  }),

  http.get(`${API_BASE_URL}/plano-contas/:id/uso`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: {
        emUso: false,
        contasPagar: 0,
        contasReceber: 0,
        movimentacoes: 0,
        total: 0,
      },
    });
  }),

  http.post(`${API_BASE_URL}/plano-contas`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      message: 'Plano de contas criado com sucesso',
      statusCode: 201,
      data: { ...mockPlanoContas, ...body, id: 'new-plano-123' },
    });
  }),

  http.patch(`${API_BASE_URL}/plano-contas/:id`, async ({ request, params }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      message: 'Plano de contas atualizado com sucesso',
      statusCode: 200,
      data: { ...mockPlanoContas, ...body, id: params.id },
    });
  }),

  http.patch(`${API_BASE_URL}/plano-contas/:id/inativar`, ({ params }) => {
    return HttpResponse.json({
      message: 'Conta inativada com sucesso',
      statusCode: 200,
      data: { ...mockPlanoContas, id: params.id, ativo: false },
    });
  }),

  http.patch(`${API_BASE_URL}/plano-contas/:id/reativar`, ({ params }) => {
    return HttpResponse.json({
      message: 'Conta reativada com sucesso',
      statusCode: 200,
      data: { ...mockPlanoContas, id: params.id, ativo: true },
    });
  }),

  http.delete(`${API_BASE_URL}/plano-contas/:id`, () => {
    return HttpResponse.json({
      message: 'Plano de contas excluído com sucesso',
      statusCode: 200,
    });
  }),

  // DRE
  http.get(`${API_BASE_URL}/dre`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: mockDreResponse,
    });
  }),

  http.get(`${API_BASE_URL}/dre/consolidado`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: {
        ...mockDreResponse,
        empresas: [mockEmpresa],
      },
    });
  }),

  http.get(`${API_BASE_URL}/dre/comparativo`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: {
        periodo1: mockDreResponse,
        periodo2: mockDreResponse,
        variacao: {
          receitaBruta: 0,
          lucroLiquido: 0,
        },
      },
    });
  }),

  http.get(`${API_BASE_URL}/relatorios/dre`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: mockDreResponse,
    });
  }),

  // Fluxo de Caixa
  http.get(`${API_BASE_URL}/relatorios/fluxo-caixa`, () => {
    return HttpResponse.json({
      message: 'Success',
      statusCode: 200,
      data: mockFluxoCaixaResponse,
    });
  }),
];
