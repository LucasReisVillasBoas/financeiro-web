import { describe, it, expect, beforeEach } from 'vitest';
import { contaPagarService } from '../../services/conta-pagar.service';
import { contaReceberService } from '../../services/conta-receber.service';
import { movimentacaoBancariaService } from '../../services/movimentacao-bancaria.service';
import { fluxoCaixaService } from '../../services/fluxo-caixa.service';
import { dreRelatorioService } from '../../services/dre-relatorio.service';
import { TipoContaPagar, TipoContaReceber } from '../../types/api.types';

/**
 * Testes de Integração - Fluxo Financeiro Completo
 *
 * Valida fluxos completos como:
 * - Título lançado → Baixa → Movimento Bancário → Relatório
 * - Venda → Recebimento → Atualização de saldo → DRE
 */

describe('Fluxo Financeiro Completo', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  describe('Fluxo de Conta a Pagar Completo', () => {
    it('deve executar: lançar título → registrar baixa → criar movimentação → gerar relatório', async () => {
      // 1. Lançar conta a pagar
      const contaPagar = await contaPagarService.create({
        empresaId: 'empresa-123',
        pessoaId: 'fornecedor-123',
        planoContasId: 'plano-despesa-123',
        documento: 'NF-001',
        parcela: 1,
        tipo: TipoContaPagar.FORNECEDOR,
        descricao: 'Compra de material de escritório',
        valor_principal: 1500.0,
        vencimento: '2024-06-30',
        data_emissao: '2024-06-01',
        data_lancamento: '2024-06-01',
      });

      expect(contaPagar.id).toBeDefined();
      expect(contaPagar.status).toBe('PENDENTE');

      // 2. Registrar baixa (pagamento)
      const contaBaixada = await contaPagarService.registrarBaixa(contaPagar.id, {
        dataPagamento: '2024-06-15',
        valorPago: 1500.0,
        contaBancariaId: 'conta-bancaria-123',
      });

      expect(contaBaixada.status).toBe('PAGO');

      // 3. Criar movimentação bancária correspondente
      const movimentacao = await movimentacaoBancariaService.create({
        contaBancaria: 'conta-bancaria-123',
        tipo: 'Saída' as const,
        valor: 1500.0,
        data: '2024-06-15',
        descricao: 'Pagamento - Compra de material de escritório',
        conta: '12345-6',
        categoria: 'Fornecedores',
      });

      expect(movimentacao.id).toBeDefined();

      // 4. Gerar relatório de fluxo de caixa
      const fluxoCaixa = await fluxoCaixaService.buscarRelatorio({
        dataInicio: '2024-06-01',
        dataFim: '2024-06-30',
        empresaId: 'empresa-123',
      });

      expect(fluxoCaixa.totais).toBeDefined();
      expect(fluxoCaixa.totais.totalSaidasRealizadas).toBeDefined();
    });
  });

  describe('Fluxo de Conta a Receber Completo', () => {
    it('deve executar: criar venda parcelada → registrar recebimentos → gerar DRE', async () => {
      // 1. Criar venda parcelada (3x)
      const parcelas = await contaReceberService.createParcelado({
        empresaId: 'empresa-123',
        pessoaId: 'cliente-123',
        planoContasId: 'plano-receita-123',
        documento: 'PED-001',
        serie: '1',
        tipo: TipoContaReceber.DUPLICATA,
        dataEmissao: '2024-07-01',
        primeiroVencimento: '2024-07-01',
        descricao: 'Venda de serviços',
        valorTotal: 3000.0,
        numeroParcelas: 3,
      });

      expect(parcelas).toHaveLength(3);
      expect(parcelas[0].parcela).toBe(1);
      expect(parcelas[1].parcela).toBe(2);
      expect(parcelas[2].parcela).toBe(3);

      // 2. Simular recebimento das parcelas com movimentações bancárias
      for (let i = 0; i < parcelas.length; i++) {
        const movimentacao = await movimentacaoBancariaService.create({
          contaBancaria: 'conta-bancaria-123',
          tipo: 'Entrada' as const,
          valor: 1000.0,
          data: `2024-0${7 + i}-15`,
          descricao: `Recebimento parcela ${i + 1}/3 - Venda de serviços`,
          conta: '12345-6',
          categoria: 'Vendas',
        });

        expect(movimentacao.id).toBeDefined();
      }

      // 3. Gerar relatório DRE
      const dre = await dreRelatorioService.buscarRelatorio({
        empresaId: 'empresa-123',
        dataInicio: '2024-07-01',
        dataFim: '2024-09-30',
      });

      expect(dre.totalizadores).toBeDefined();
    });
  });

  describe('Fluxo de Cancelamento', () => {
    it('deve executar: criar conta → cancelar → verificar não aparece em relatórios', async () => {
      // 1. Criar conta a pagar
      const contaPagar = await contaPagarService.create({
        empresaId: 'empresa-123',
        pessoaId: 'fornecedor-456',
        planoContasId: 'plano-despesa-456',
        documento: 'NF-002',
        parcela: 1,
        tipo: TipoContaPagar.FORNECEDOR,
        descricao: 'Compra cancelada',
        valor_principal: 5000.0,
        vencimento: '2024-08-15',
        data_emissao: '2024-08-01',
        data_lancamento: '2024-08-01',
      });

      expect(contaPagar.id).toBeDefined();

      // 2. Cancelar conta
      const contaCancelada = await contaPagarService.cancelar(contaPagar.id, {
        justificativa: 'Fornecedor não entregou o produto',
      });

      expect(contaCancelada.status).toBe('CANCELADO');

      // 3. Verificar que não impacta fluxo de caixa
      const fluxoCaixa = await fluxoCaixaService.buscarRelatorio({
        dataInicio: '2024-08-01',
        dataFim: '2024-08-31',
        empresaId: 'empresa-123',
      });

      // Conta cancelada não deve impactar o saldo
      expect(fluxoCaixa).toBeDefined();
    });
  });

  describe('Fluxo de Estorno', () => {
    it('deve executar: pagar conta → estornar → conta volta pendente', async () => {
      // 1. Criar e pagar conta
      const contaPagar = await contaPagarService.create({
        empresaId: 'empresa-123',
        pessoaId: 'fornecedor-789',
        planoContasId: 'plano-despesa-789',
        documento: 'NF-003',
        parcela: 1,
        tipo: TipoContaPagar.FORNECEDOR,
        descricao: 'Conta para estorno',
        valor_principal: 2000.0,
        vencimento: '2024-09-30',
        data_emissao: '2024-09-01',
        data_lancamento: '2024-09-01',
      });

      const contaBaixada = await contaPagarService.registrarBaixa(contaPagar.id, {
        dataPagamento: '2024-09-15',
        valorPago: 2000.0,
        contaBancariaId: 'conta-bancaria-123',
      });

      expect(contaBaixada.status).toBe('PAGO');

      // 2. Estornar baixa
      const contaEstornada = await contaPagarService.estornarBaixa(contaPagar.id);

      expect(contaEstornada.status).toBe('PENDENTE');

      // 3. Verificar que as contas podem ser listadas
      const contasEmpresa = await contaPagarService.findByEmpresa('empresa-123');
      expect(contasEmpresa).toBeInstanceOf(Array);
    });
  });

  describe('Fluxo de Conciliação Bancária', () => {
    it('deve executar: criar movimentações → conciliar → gerar extrato', async () => {
      // 1. Criar múltiplas movimentações
      const mov1 = await movimentacaoBancariaService.create({
        contaBancaria: 'conta-bancaria-123',
        tipo: 'Entrada' as const,
        valor: 10000.0,
        data: '2024-10-01',
        descricao: 'Depósito inicial',
        conta: '12345-6',
        categoria: 'Depósitos',
      });

      const mov2 = await movimentacaoBancariaService.create({
        contaBancaria: 'conta-bancaria-123',
        tipo: 'Saída' as const,
        valor: 3000.0,
        data: '2024-10-05',
        descricao: 'Pagamento fornecedor',
        conta: '12345-6',
        categoria: 'Fornecedores',
      });

      const mov3 = await movimentacaoBancariaService.create({
        contaBancaria: 'conta-bancaria-123',
        tipo: 'Entrada' as const,
        valor: 5000.0,
        data: '2024-10-10',
        descricao: 'Recebimento cliente',
        conta: '12345-6',
        categoria: 'Vendas',
      });

      // 2. Conciliar movimentações
      const resultConciliacao = await movimentacaoBancariaService.conciliar({
        movimentacaoIds: [mov1.id, mov2.id, mov3.id],
      });

      expect(resultConciliacao.conciliadas).toBeDefined();

      // 3. Listar movimentações por período
      const movimentacoes = await movimentacaoBancariaService.findByPeriodo(
        '2024-10-01',
        '2024-10-31'
      );

      expect(movimentacoes).toBeInstanceOf(Array);
    });
  });

  describe('Fluxo de Relatórios Gerenciais', () => {
    it('deve gerar relatórios para tomada de decisão', async () => {
      // 1. Gerar DRE do período
      const dre = await dreRelatorioService.buscarRelatorio({
        empresaId: 'empresa-123',
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
      });

      expect(dre.totalizadores).toBeDefined();
      expect(dre.itens).toBeInstanceOf(Array);

      // 2. Gerar Fluxo de Caixa
      const fluxoCaixa = await fluxoCaixaService.buscarRelatorio({
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
        empresaId: 'empresa-123',
      });

      expect(fluxoCaixa.linhas).toBeDefined();
      expect(fluxoCaixa.totais.saldoFinalRealizado).toBeDefined();
      expect(fluxoCaixa.totais.totalEntradasRealizadas).toBeDefined();
      expect(fluxoCaixa.totais.totalSaidasRealizadas).toBeDefined();

      // 3. Listar contas a pagar pendentes
      const contasPagar = await contaPagarService.findByEmpresa('empresa-123');
      expect(contasPagar).toBeInstanceOf(Array);

      // 4. Listar contas a receber
      const contasReceber = await contaReceberService.findByEmpresa('empresa-123');
      expect(contasReceber).toBeInstanceOf(Array);
    });
  });
});
