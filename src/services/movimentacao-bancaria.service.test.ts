import { describe, it, expect, beforeEach } from 'vitest';
import { movimentacaoBancariaService } from './movimentacao-bancaria.service';

describe('movimentacaoBancariaService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  describe('create', () => {
    it('deve criar movimentação bancária de crédito', async () => {
      const dto = {
        contaBancariaId: 'conta-bancaria-123',
        tipo: 'CREDITO',
        valor: 5000.0,
        data: '2024-06-15',
        descricao: 'Depósito de cliente',
      };

      const result = await movimentacaoBancariaService.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBe('new-movimentacao-123');
    });

    it('deve criar movimentação bancária de débito', async () => {
      const dto = {
        contaBancariaId: 'conta-bancaria-123',
        tipo: 'DEBITO',
        valor: 2000.0,
        data: '2024-06-15',
        descricao: 'Pagamento de fornecedor',
      };

      const result = await movimentacaoBancariaService.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBe('new-movimentacao-123');
    });
  });

  describe('findAll', () => {
    it('deve listar todas as movimentações bancárias', async () => {
      const result = await movimentacaoBancariaService.findAll();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('valor');
      expect(result[0]).toHaveProperty('tipo');
    });
  });

  describe('findByPeriodo', () => {
    it('deve listar movimentações por período', async () => {
      const result = await movimentacaoBancariaService.findByPeriodo('2024-01-01', '2024-12-31');

      expect(result).toBeInstanceOf(Array);
    });
  });

  describe('findByConta', () => {
    it('deve listar movimentações por conta bancária', async () => {
      const result = await movimentacaoBancariaService.findByConta('conta-bancaria-123');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('findOne', () => {
    it('deve buscar movimentação por id', async () => {
      const result = await movimentacaoBancariaService.findOne('movimentacao-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('movimentacao-123');
    });
  });

  describe('update', () => {
    it('deve atualizar movimentação bancária', async () => {
      const dto = {
        descricao: 'Descrição atualizada',
        valor: 6000.0,
      };

      const result = await movimentacaoBancariaService.update('movimentacao-123', dto);

      expect(result).toBeDefined();
      expect(result.id).toBe('movimentacao-123');
    });
  });

  describe('delete', () => {
    it('deve excluir movimentação bancária', async () => {
      await expect(
        movimentacaoBancariaService.delete('movimentacao-123')
      ).resolves.not.toThrow();
    });
  });

  describe('conciliar', () => {
    it('deve conciliar movimentações', async () => {
      const dto = {
        movimentacaoIds: ['movimentacao-123', 'movimentacao-456'],
      };

      const result = await movimentacaoBancariaService.conciliar(dto);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('sucesso');
    });
  });

  describe('desconciliar', () => {
    it('deve desconciliar movimentações', async () => {
      const dto = {
        movimentacaoIds: ['movimentacao-123'],
      };

      const result = await movimentacaoBancariaService.desconciliar(dto);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('sucesso');
    });
  });

  describe('fluxo completo de movimentação bancária', () => {
    it('deve executar fluxo: criar → conciliar → desconciliar', async () => {
      // Criar movimentação
      const createDto = {
        contaBancariaId: 'conta-bancaria-123',
        tipo: 'CREDITO',
        valor: 10000.0,
        data: '2024-07-01',
        descricao: 'Recebimento de venda',
      };

      const movimentacaoCriada = await movimentacaoBancariaService.create(createDto);
      expect(movimentacaoCriada.id).toBeDefined();

      // Conciliar
      const conciliarDto = {
        movimentacaoIds: [movimentacaoCriada.id],
      };

      const resultConciliar = await movimentacaoBancariaService.conciliar(conciliarDto);
      expect(resultConciliar.sucesso).toBe(true);

      // Desconciliar
      const resultDesconciliar = await movimentacaoBancariaService.desconciliar(conciliarDto);
      expect(resultDesconciliar.sucesso).toBe(true);
    });

    it('deve criar múltiplas movimentações e listar por período', async () => {
      // Criar crédito
      await movimentacaoBancariaService.create({
        contaBancariaId: 'conta-bancaria-123',
        tipo: 'CREDITO',
        valor: 5000.0,
        data: '2024-06-01',
        descricao: 'Entrada 1',
      });

      // Criar débito
      await movimentacaoBancariaService.create({
        contaBancariaId: 'conta-bancaria-123',
        tipo: 'DEBITO',
        valor: 2000.0,
        data: '2024-06-15',
        descricao: 'Saída 1',
      });

      // Listar por período
      const movimentacoes = await movimentacaoBancariaService.findByPeriodo(
        '2024-06-01',
        '2024-06-30'
      );

      expect(movimentacoes).toBeInstanceOf(Array);
    });
  });
});
