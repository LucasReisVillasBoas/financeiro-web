import { describe, it, expect, beforeEach } from 'vitest';
import { movimentacaoBancariaService } from '../../services/movimentacao-bancaria.service';

describe('movimentacaoBancariaService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  describe('create', () => {
    it('deve criar movimentação bancária de entrada', async () => {
      const dto = {
        contaBancaria: 'conta-bancaria-123',
        tipo: 'Entrada' as const,
        valor: 5000.0,
        data: '2024-06-15',
        descricao: 'Depósito de cliente',
        conta: '12345-6',
        categoria: 'Vendas',
      };

      const result = await movimentacaoBancariaService.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBe('new-movimentacao-123');
    });

    it('deve criar movimentação bancária de saída', async () => {
      const dto = {
        contaBancaria: 'conta-bancaria-123',
        tipo: 'Saída' as const,
        valor: 2000.0,
        data: '2024-06-15',
        descricao: 'Pagamento de fornecedor',
        conta: '12345-6',
        categoria: 'Fornecedores',
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
      expect(result).toHaveProperty('conciliadas');
    });
  });

  describe('desconciliar', () => {
    it('deve desconciliar movimentações', async () => {
      const dto = {
        movimentacaoIds: ['movimentacao-123'],
      };

      const result = await movimentacaoBancariaService.desconciliar(dto);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('desconciliadas');
    });
  });

  describe('fluxo completo de movimentação bancária', () => {
    it('deve executar fluxo: criar → conciliar → desconciliar', async () => {
      // Criar movimentação
      const createDto = {
        contaBancaria: 'conta-bancaria-123',
        tipo: 'Entrada' as const,
        valor: 10000.0,
        data: '2024-07-01',
        descricao: 'Recebimento de venda',
        conta: '12345-6',
        categoria: 'Vendas',
      };

      const movimentacaoCriada = await movimentacaoBancariaService.create(createDto);
      expect(movimentacaoCriada.id).toBeDefined();

      // Conciliar
      const conciliarDto = {
        movimentacaoIds: [movimentacaoCriada.id],
      };

      const resultConciliar = await movimentacaoBancariaService.conciliar(conciliarDto);
      expect(resultConciliar.conciliadas).toBeDefined();

      // Desconciliar
      const resultDesconciliar = await movimentacaoBancariaService.desconciliar(conciliarDto);
      expect(resultDesconciliar.desconciliadas).toBeDefined();
    });

    it('deve criar múltiplas movimentações e listar por período', async () => {
      // Criar entrada
      await movimentacaoBancariaService.create({
        contaBancaria: 'conta-bancaria-123',
        tipo: 'Entrada' as const,
        valor: 5000.0,
        data: '2024-06-01',
        descricao: 'Entrada 1',
        conta: '12345-6',
        categoria: 'Vendas',
      });

      // Criar saída
      await movimentacaoBancariaService.create({
        contaBancaria: 'conta-bancaria-123',
        tipo: 'Saída' as const,
        valor: 2000.0,
        data: '2024-06-15',
        descricao: 'Saída 1',
        conta: '12345-6',
        categoria: 'Fornecedores',
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
