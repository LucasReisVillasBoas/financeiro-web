import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../../services/auth.service';
import { contaPagarService } from '../../services/conta-pagar.service';
import { contaReceberService } from '../../services/conta-receber.service';
import { movimentacaoBancariaService } from '../../services/movimentacao-bancaria.service';
import planoContasService from '../../services/plano-contas.service';
import dreService from '../../services/dre.service';
import { fluxoCaixaService } from '../../services/fluxo-caixa.service';
import { dreRelatorioService } from '../../services/dre-relatorio.service';

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
        descricao: 'Compra de mercadorias - NF 12345',
        valor: 15000.0,
        dataVencimento: '2024-07-15',
        dataEmissao: '2024-06-15',
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
        contaBancariaId: 'conta-bancaria-principal',
        tipo: 'DEBITO',
        valor: 15000.0,
        data: '2024-07-15',
        descricao: 'Pagamento NF 12345 - Fornecedor ABC',
      });
      expect(movimentacao.id).toBeDefined();

      // 5. Conciliar movimentação
      const conciliacao = await movimentacaoBancariaService.conciliar({
        movimentacaoIds: [movimentacao.id],
      });
      expect(conciliacao.sucesso).toBe(true);

      // 6. Gerar DRE do período
      const dre = await dreRelatorioService.buscarRelatorio({
        empresaId: 'empresa-123',
        dataInicio: '2024-07-01',
        dataFim: '2024-07-31',
      });
      expect(dre.totais).toBeDefined();

      // 7. Gerar Fluxo de Caixa
      const fluxoCaixa = await fluxoCaixaService.buscarRelatorio({
        dataInicio: '2024-07-01',
        dataFim: '2024-07-31',
        empresaId: 'empresa-123',
      });
      expect(fluxoCaixa.totais.totalSaidas).toBeDefined();
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
        descricao: 'Venda de equipamento - Pedido 5678',
        valorTotal: 12000.0,
        dataVencimentoPrimeira: '2024-08-15',
        quantidadeParcelas: 6,
      });
      expect(parcelas).toHaveLength(6);

      // 3. Simular recebimento das primeiras 3 parcelas
      for (let i = 0; i < 3; i++) {
        const movimentacao = await movimentacaoBancariaService.create({
          contaBancariaId: 'conta-bancaria-principal',
          tipo: 'CREDITO',
          valor: 2000.0,
          data: `2024-0${8 + i}-15`,
          descricao: `Recebimento parcela ${i + 1}/6 - Pedido 5678`,
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
      expect(dre.linhas).toBeInstanceOf(Array);

      // 6. Gerar Fluxo de Caixa
      const fluxoCaixa = await fluxoCaixaService.buscarRelatorio({
        dataInicio: '2024-08-01',
        dataFim: '2024-10-31',
        empresaId: 'empresa-123',
      });
      expect(fluxoCaixa.totais.totalEntradas).toBeDefined();
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
        nome: 'Despesas com Marketing Digital',
        tipo: 'DESPESA',
        natureza: 'ANALITICA',
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
        expect(conciliacao.sucesso).toBe(true);
      }

      // 4. Gerar DRE mensal
      const dre = await dreRelatorioService.buscarRelatorio({
        empresaId: 'empresa-123',
        dataInicio: '2024-11-01',
        dataFim: '2024-11-30',
      });
      expect(dre.periodo).toBeDefined();
      expect(dre.totais).toBeDefined();

      // 5. Gerar Fluxo de Caixa mensal
      const fluxoCaixa = await fluxoCaixaService.buscarRelatorio({
        dataInicio: '2024-11-01',
        dataFim: '2024-11-30',
        empresaId: 'empresa-123',
      });
      expect(fluxoCaixa.saldoInicial).toBeDefined();
      expect(fluxoCaixa.saldoFinal).toBeDefined();

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
        descricao: 'Conta com valor errado',
        valor: 999.0, // Valor errado
        dataVencimento: '2024-12-15',
        dataEmissao: '2024-12-01',
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
        valor: 1999.0, // Valor correto
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
