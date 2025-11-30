import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../../services/auth.service';
import { contaPagarService } from '../../services/conta-pagar.service';
import { contaReceberService } from '../../services/conta-receber.service';
import { movimentacaoBancariaService } from '../../services/movimentacao-bancaria.service';
import planoContasService from '../../services/plano-contas.service';
import dreService from '../../services/dre.service';
import { fluxoCaixaService } from '../../services/fluxo-caixa.service';
import { dreRelatorioService } from '../../services/dre-relatorio.service';
import { TipoContaPagar, TipoContaReceber, TipoPlanoContas } from '../../types/api.types';

/**
 * Testes E2E - Fluxos Completos
 *
 * Simula cenários reais de uso do sistema desde login até relatórios
 */

describe('E2E - Fluxos Completos do Sistema Financeiro', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Cenário 1: Ciclo completo de compra', () => {
    it('deve executar fluxo: login → cadastrar fornecedor → lançar compra → pagar → relatório', async () => {
      // 1. Login
      const loginResponse = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(loginResponse.token).toBeDefined();
      expect(authService.isAuthenticated()).toBe(true);

      // 2. Lançar conta a pagar (compra de fornecedor)
      const contaPagar = await contaPagarService.create({
        empresaId: 'empresa-123',
        pessoaId: 'fornecedor-abc',
        planoContasId: 'plano-custo-mercadoria',
        documento: 'NF-12345',
        parcela: 1,
        tipo: TipoContaPagar.FORNECEDOR,
        descricao: 'Compra de mercadorias - NF 12345',
        valor_principal: 15000.0,
        vencimento: '2024-07-15',
        data_emissao: '2024-06-15',
        data_lancamento: '2024-06-15',
      });
      expect(contaPagar.id).toBeDefined();

      // 3. Registrar pagamento (baixa)
      const contaBaixada = await contaPagarService.registrarBaixa(contaPagar.id, {
        dataPagamento: '2024-07-15',
        valorPago: 15000.0,
        contaBancariaId: 'conta-bancaria-principal',
      });
      expect(contaBaixada.status).toBe('PAGO');

      // 4. Criar movimentação bancária correspondente
      const movimentacao = await movimentacaoBancariaService.create({
        contaBancaria: 'conta-bancaria-principal',
        tipo: 'Saída' as const,
        valor: 15000.0,
        data: '2024-07-15',
        descricao: 'Pagamento NF 12345 - Fornecedor ABC',
        conta: '12345-6',
        categoria: 'Fornecedores',
      });
      expect(movimentacao.id).toBeDefined();

      // 5. Conciliar movimentação
      const conciliacao = await movimentacaoBancariaService.conciliar({
        movimentacaoIds: [movimentacao.id],
      });
      expect(conciliacao.conciliadas).toBeDefined();

      // 6. Gerar DRE do período
      const dre = await dreRelatorioService.buscarRelatorio({
        empresaId: 'empresa-123',
        dataInicio: '2024-07-01',
        dataFim: '2024-07-31',
      });
      expect(dre.totalizadores).toBeDefined();

      // 7. Gerar Fluxo de Caixa
      const fluxoCaixa = await fluxoCaixaService.buscarRelatorio({
        dataInicio: '2024-07-01',
        dataFim: '2024-07-31',
        empresaId: 'empresa-123',
      });
      expect(fluxoCaixa.totais.totalSaidasRealizadas).toBeDefined();
    });
  });

  describe('Cenário 2: Ciclo completo de venda parcelada', () => {
    it('deve executar fluxo: login → lançar venda parcelada → receber parcelas → relatório', async () => {
      // 1. Login
      await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(authService.isAuthenticated()).toBe(true);

      // 2. Criar venda parcelada (6x)
      const parcelas = await contaReceberService.createParcelado({
        empresaId: 'empresa-123',
        pessoaId: 'cliente-xyz',
        planoContasId: 'plano-receita-venda',
        documento: 'PED-5678',
        serie: '1',
        tipo: TipoContaReceber.DUPLICATA,
        dataEmissao: '2024-08-01',
        primeiroVencimento: '2024-08-15',
        descricao: 'Venda de equipamento - Pedido 5678',
        valorTotal: 12000.0,
        numeroParcelas: 6,
      });
      expect(parcelas).toHaveLength(6);

      // 3. Simular recebimento das primeiras 3 parcelas
      for (let i = 0; i < 3; i++) {
        const movimentacao = await movimentacaoBancariaService.create({
          contaBancaria: 'conta-bancaria-principal',
          tipo: 'Entrada' as const,
          valor: 2000.0,
          data: `2024-0${8 + i}-15`,
          descricao: `Recebimento parcela ${i + 1}/6 - Pedido 5678`,
          conta: '12345-6',
          categoria: 'Vendas',
        });
        expect(movimentacao.id).toBeDefined();
      }

      // 4. Gerar relatório de contas a receber
      const contasReceber = await contaReceberService.findByEmpresa('empresa-123');
      expect(contasReceber.length).toBeGreaterThan(0);

      // 5. Gerar DRE do período
      const dre = await dreRelatorioService.buscarRelatorio({
        empresaId: 'empresa-123',
        dataInicio: '2024-08-01',
        dataFim: '2024-10-31',
      });
      expect(dre.itens).toBeInstanceOf(Array);

      // 6. Gerar Fluxo de Caixa
      const fluxoCaixa = await fluxoCaixaService.buscarRelatorio({
        dataInicio: '2024-08-01',
        dataFim: '2024-10-31',
        empresaId: 'empresa-123',
      });
      expect(fluxoCaixa.totais.totalEntradasRealizadas).toBeDefined();
    });
  });

  describe('Cenário 3: Gestão do plano de contas', () => {
    it('deve executar fluxo: login → criar contas → verificar uso → inativar', async () => {
      // 1. Login
      await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      // 2. Criar nova conta no plano de contas
      const novaConta = await planoContasService.create({
        empresaId: 'empresa-123',
        codigo: '3.1.01',
        descricao: 'Despesas com Marketing Digital',
        tipo: TipoPlanoContas.DESPESA,
        nivel: 3,
      });
      expect(novaConta.data?.id).toBeDefined();

      // 3. Verificar se conta está em uso
      const uso = await planoContasService.verificarUso(novaConta.data!.id);
      expect(uso.data?.emUso).toBe(false);

      // 4. Inativar conta não utilizada
      const contaInativada = await planoContasService.inativar(novaConta.data!.id);
      expect(contaInativada.data?.ativo).toBe(false);

      // 5. Listar contas ativas
      const contasAtivas = await planoContasService.findAnaliticasAtivas('empresa-123');
      expect(contasAtivas.data).toBeInstanceOf(Array);
    });
  });

  describe('Cenário 4: Fechamento mensal', () => {
    it('deve executar fluxo: reconciliar movimentações → gerar DRE → gerar Fluxo de Caixa', async () => {
      // 1. Login
      await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      // 2. Listar movimentações do período
      const movimentacoes = await movimentacaoBancariaService.findByPeriodo(
        '2024-11-01',
        '2024-11-30'
      );
      expect(movimentacoes).toBeInstanceOf(Array);

      // 3. Conciliar todas as movimentações pendentes
      if (movimentacoes.length > 0) {
        const ids = movimentacoes.map((m) => m.id);
        const conciliacao = await movimentacaoBancariaService.conciliar({
          movimentacaoIds: ids,
        });
        expect(conciliacao.conciliadas).toBeDefined();
      }

      // 4. Gerar DRE mensal
      const dre = await dreRelatorioService.buscarRelatorio({
        empresaId: 'empresa-123',
        dataInicio: '2024-11-01',
        dataFim: '2024-11-30',
      });
      expect(dre.periodo).toBeDefined();
      expect(dre.totalizadores).toBeDefined();

      // 5. Gerar Fluxo de Caixa mensal
      const fluxoCaixa = await fluxoCaixaService.buscarRelatorio({
        dataInicio: '2024-11-01',
        dataFim: '2024-11-30',
        empresaId: 'empresa-123',
      });
      expect(fluxoCaixa.linhas).toBeDefined();
      expect(fluxoCaixa.totais.saldoFinalRealizado).toBeDefined();

      // 6. Comparar DRE com período anterior
      const dreComparativo = await dreService.gerarComparativo(
        'empresa-123',
        '2024-11-01',
        '2024-11-30',
        '2024-10-01',
        '2024-10-31'
      );
      expect(dreComparativo.data).toBeDefined();
    });
  });

  describe('Cenário 5: Tratamento de erros e estornos', () => {
    it('deve executar fluxo: lançar conta errada → pagar → estornar → corrigir → pagar novamente', async () => {
      // 1. Login
      await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });

      // 2. Lançar conta a pagar com valor errado
      const contaErrada = await contaPagarService.create({
        empresaId: 'empresa-123',
        pessoaId: 'fornecedor-erro',
        planoContasId: 'plano-despesa',
        documento: 'NF-ERRO',
        parcela: 1,
        tipo: TipoContaPagar.FORNECEDOR,
        descricao: 'Conta com valor errado',
        valor_principal: 999.0, // Valor errado
        vencimento: '2024-12-15',
        data_emissao: '2024-12-01',
        data_lancamento: '2024-12-01',
      });

      // 3. Pagar conta (por engano)
      const contaPaga = await contaPagarService.registrarBaixa(contaErrada.id, {
        dataPagamento: '2024-12-10',
        valorPago: 999.0,
        contaBancariaId: 'conta-bancaria-123',
      });
      expect(contaPaga.status).toBe('PAGO');

      // 4. Perceber erro e estornar
      const contaEstornada = await contaPagarService.estornarBaixa(contaErrada.id);
      expect(contaEstornada.status).toBe('PENDENTE');

      // 5. Atualizar valor correto
      const contaCorrigida = await contaPagarService.update(contaErrada.id, {
        valor_principal: 1999.0, // Valor correto
        descricao: 'Conta com valor corrigido',
      });
      expect(contaCorrigida.id).toBe(contaErrada.id);

      // 6. Pagar novamente com valor correto
      const contaPagaCorreta = await contaPagarService.registrarBaixa(contaErrada.id, {
        dataPagamento: '2024-12-12',
        valorPago: 1999.0,
        contaBancariaId: 'conta-bancaria-123',
      });
      expect(contaPagaCorreta.status).toBe('PAGO');
    });
  });

  describe('Cenário 6: Logout e segurança', () => {
    it('deve fazer logout corretamente e limpar dados', async () => {
      // 1. Login
      await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });
      expect(authService.isAuthenticated()).toBe(true);
      expect(localStorage.getItem('token')).not.toBeNull();

      // 2. Logout
      await authService.logout();

      // 3. Verificar que dados foram limpos
      expect(authService.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });
});
