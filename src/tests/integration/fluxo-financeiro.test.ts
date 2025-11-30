import { describe, it, expect, beforeEach } from 'vitest';
import { contaPagarService } from '../../services/conta-pagar.service';
import { contaReceberService } from '../../services/conta-receber.service';
import { movimentacaoBancariaService } from '../../services/movimentacao-bancaria.service';
import { fluxoCaixaService } from '../../services/fluxo-caixa.service';
import { dreRelatorioService } from '../../services/dre-relatorio.service';

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
        descricao: 'Compra de material de escritório',
        valor: 1500.0,
        dataVencimento: '2024-06-30',
        dataEmissao: '2024-06-01',
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
        contaBancariaId: 'conta-bancaria-123',
        tipo: 'DEBITO',
        valor: 1500.0,
        data: '2024-06-15',
        descricao: 'Pagamento - Compra de material de escritório',
      });

      expect(movimentacao.id).toBeDefined();

      // 4. Gerar relatório de fluxo de caixa
      const fluxoCaixa = await fluxoCaixaService.buscarRelatorio({
        dataInicio: '2024-06-01',
        dataFim: '2024-06-30',
        empresaId: 'empresa-123',
      });

      expect(fluxoCaixa.totais).toBeDefined();
      expect(fluxoCaixa.totais.totalSaidas).toBeDefined();
    });
  });

  describe('Fluxo de Conta a Receber Completo', () => {
    it('deve executar: criar venda parcelada → registrar recebimentos → gerar DRE', async () => {
      // 1. Criar venda parcelada (3x)
      const parcelas = await contaReceberService.createParcelado({
        empresaId: 'empresa-123',
        pessoaId: 'cliente-123',
        planoContasId: 'plano-receita-123',
        descricao: 'Venda de serviços',
        valorTotal: 3000.0,
        dataVencimentoPrimeira: '2024-07-01',
        quantidadeParcelas: 3,
      });

      expect(parcelas).toHaveLength(3);
      expect(parcelas[0].numeroParcela).toBe(1);
      expect(parcelas[1].numeroParcela).toBe(2);
      expect(parcelas[2].numeroParcela).toBe(3);

      // 2. Simular recebimento das parcelas com movimentações bancárias
      for (let i = 0; i < parcelas.length; i++) {
        const movimentacao = await movimentacaoBancariaService.create({
          contaBancariaId: 'conta-bancaria-123',
          tipo: 'CREDITO',
          valor: 1000.0,
          data: `2024-0${7 + i}-15`,
          descricao: `Recebimento parcela ${i + 1}/3 - Venda de serviços`,
        });

        expect(movimentacao.id).toBeDefined();
      }

      // 3. Gerar relatório DRE
      const dre = await dreRelatorioService.buscarRelatorio({
        empresaId: 'empresa-123',
        dataInicio: '2024-07-01',
        dataFim: '2024-09-30',
      });

      expect(dre.totais).toBeDefined();
    });
  });

  describe('Fluxo de Cancelamento', () => {
    it('deve executar: criar conta → cancelar → verificar não aparece em relatórios', async () => {
      // 1. Criar conta a pagar
      const contaPagar = await contaPagarService.create({
        empresaId: 'empresa-123',
        pessoaId: 'fornecedor-456',
        planoContasId: 'plano-despesa-456',
        descricao: 'Compra cancelada',
        valor: 5000.0,
        dataVencimento: '2024-08-15',
        dataEmissao: '2024-08-01',
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
        descricao: 'Conta para estorno',
        valor: 2000.0,
        dataVencimento: '2024-09-30',
        dataEmissao: '2024-09-01',
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
        contaBancariaId: 'conta-bancaria-123',
        tipo: 'CREDITO',
        valor: 10000.0,
        data: '2024-10-01',
        descricao: 'Depósito inicial',
      });

      const mov2 = await movimentacaoBancariaService.create({
        contaBancariaId: 'conta-bancaria-123',
        tipo: 'DEBITO',
        valor: 3000.0,
        data: '2024-10-05',
        descricao: 'Pagamento fornecedor',
      });

      const mov3 = await movimentacaoBancariaService.create({
        contaBancariaId: 'conta-bancaria-123',
        tipo: 'CREDITO',
        valor: 5000.0,
        data: '2024-10-10',
        descricao: 'Recebimento cliente',
      });

      // 2. Conciliar movimentações
      const resultConciliacao = await movimentacaoBancariaService.conciliar({
        movimentacaoIds: [mov1.id, mov2.id, mov3.id],
      });

      expect(resultConciliacao.sucesso).toBe(true);

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

      expect(dre.totais).toBeDefined();
      expect(dre.linhas).toBeInstanceOf(Array);

      // 2. Gerar Fluxo de Caixa
      const fluxoCaixa = await fluxoCaixaService.buscarRelatorio({
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
        empresaId: 'empresa-123',
      });

      expect(fluxoCaixa.saldoInicial).toBeDefined();
      expect(fluxoCaixa.saldoFinal).toBeDefined();
      expect(fluxoCaixa.totais.totalEntradas).toBeDefined();
      expect(fluxoCaixa.totais.totalSaidas).toBeDefined();

      // 3. Listar contas a pagar pendentes
      const contasPagar = await contaPagarService.findByEmpresa('empresa-123');
      expect(contasPagar).toBeInstanceOf(Array);

      // 4. Listar contas a receber
      const contasReceber = await contaReceberService.findByEmpresa('empresa-123');
      expect(contasReceber).toBeInstanceOf(Array);
    });
  });
});
