import { describe, it, expect, beforeEach } from 'vitest';
import { contaPagarService } from '../../services/conta-pagar.service';
import { TipoContaPagar } from '../../types/api.types';

describe('contaPagarService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  describe('create', () => {
    it('deve criar conta a pagar com sucesso', async () => {
      const dto = {
        empresaId: 'empresa-123',
        pessoaId: 'pessoa-123',
        planoContasId: 'plano-123',
        documento: 'NF-001',
        parcela: 1,
        tipo: TipoContaPagar.FORNECEDOR,
        descricao: 'Nova conta a pagar',
        data_emissao: '2024-01-01',
        vencimento: '2024-12-31',
        data_lancamento: '2024-01-01',
        valor_principal: 500.0,
      };

      const result = await contaPagarService.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBe('new-conta-pagar-123');
      expect(result.descricao).toBe(dto.descricao);
    });
  });

  describe('findAll', () => {
    it('deve listar todas as contas a pagar', async () => {
      const result = await contaPagarService.findAll();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
    });
  });

  describe('findByEmpresa', () => {
    it('deve listar contas a pagar por empresa', async () => {
      const result = await contaPagarService.findByEmpresa('empresa-123');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('findOne', () => {
    it('deve buscar conta a pagar por id', async () => {
      const result = await contaPagarService.findOne('conta-pagar-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('conta-pagar-123');
    });
  });

  describe('update', () => {
    it('deve atualizar conta a pagar', async () => {
      const dto = {
        descricao: 'Conta atualizada',
        valor_principal: 750.0,
      };

      const result = await contaPagarService.update('conta-pagar-123', dto);

      expect(result).toBeDefined();
      expect(result.id).toBe('conta-pagar-123');
    });
  });

  describe('registrarBaixa', () => {
    it('deve registrar baixa na conta a pagar', async () => {
      const dto = {
        dataPagamento: '2024-06-15',
        valorPago: 1000.0,
        contaBancariaId: 'conta-bancaria-123',
      };

      const result = await contaPagarService.registrarBaixa('conta-pagar-123', dto);

      expect(result).toBeDefined();
      expect(result.status).toBe('PAGO');
    });

    it('deve registrar baixa parcial', async () => {
      const dto = {
        dataPagamento: '2024-06-15',
        valorPago: 500.0,
        contaBancariaId: 'conta-bancaria-123',
      };

      const result = await contaPagarService.registrarBaixa('conta-pagar-123', dto);

      expect(result).toBeDefined();
    });
  });

  describe('estornarBaixa', () => {
    it('deve estornar baixa da conta a pagar', async () => {
      const result = await contaPagarService.estornarBaixa('conta-pagar-123');

      expect(result).toBeDefined();
      expect(result.status).toBe('PENDENTE');
    });
  });

  describe('cancelar', () => {
    it('deve cancelar conta a pagar com justificativa', async () => {
      const dto = {
        justificativa: 'Conta duplicada',
      };

      const result = await contaPagarService.cancelar('conta-pagar-123', dto);

      expect(result).toBeDefined();
      expect(result.status).toBe('CANCELADO');
    });
  });

  describe('gerarParcelas', () => {
    it('deve gerar parcelas para conta a pagar', async () => {
      const dto = {
        empresaId: 'empresa-123',
        pessoaId: 'pessoa-123',
        planoContasId: 'plano-123',
        documento: 'NF-002',
        tipo: TipoContaPagar.FORNECEDOR,
        descricao: 'Compra parcelada',
        data_emissao: '2024-01-01',
        primeiro_vencimento: '2024-02-15',
        intervalo_dias: 30,
        data_lancamento: '2024-01-01',
        valor_total: 3000.0,
        quantidade_parcelas: 3,
      };

      const result = await contaPagarService.gerarParcelas(dto);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(3);
      expect(result[0].parcela).toBe(1);
      expect(result[2].parcela).toBe(3);
    });

    it('deve gerar parcelas com valores corretos', async () => {
      const dto = {
        empresaId: 'empresa-123',
        pessoaId: 'pessoa-123',
        planoContasId: 'plano-123',
        documento: 'NF-003',
        tipo: TipoContaPagar.FORNECEDOR,
        descricao: 'Compra parcelada',
        data_emissao: '2024-01-01',
        primeiro_vencimento: '2024-02-15',
        intervalo_dias: 30,
        data_lancamento: '2024-01-01',
        valor_total: 1000.0,
        quantidade_parcelas: 4,
      };

      const result = await contaPagarService.gerarParcelas(dto);

      expect(result.length).toBe(4);
      result.forEach((conta, index) => {
        expect(conta.parcela).toBe(index + 1);
      });
    });
  });

  describe('delete', () => {
    it('deve excluir conta a pagar', async () => {
      await expect(contaPagarService.delete('conta-pagar-123')).resolves.not.toThrow();
    });
  });

  describe('fluxo completo', () => {
    it('deve executar fluxo: criar → baixar → estornar', async () => {
      // Criar
      const createDto = {
        empresaId: 'empresa-123',
        pessoaId: 'pessoa-123',
        planoContasId: 'plano-123',
        documento: 'NF-004',
        parcela: 1,
        tipo: TipoContaPagar.FORNECEDOR,
        descricao: 'Conta para teste de fluxo',
        data_emissao: '2024-01-01',
        vencimento: '2024-12-31',
        data_lancamento: '2024-01-01',
        valor_principal: 1000.0,
      };

      const contaCriada = await contaPagarService.create(createDto);
      expect(contaCriada.id).toBeDefined();

      // Registrar baixa
      const baixaDto = {
        dataPagamento: '2024-06-15',
        valorPago: 1000.0,
        contaBancariaId: 'conta-bancaria-123',
      };

      const contaBaixada = await contaPagarService.registrarBaixa(contaCriada.id, baixaDto);
      expect(contaBaixada.status).toBe('PAGO');

      // Estornar baixa
      const contaEstornada = await contaPagarService.estornarBaixa(contaCriada.id);
      expect(contaEstornada.status).toBe('PENDENTE');
    });

    it('deve executar fluxo: criar → cancelar', async () => {
      // Criar
      const createDto = {
        empresaId: 'empresa-123',
        pessoaId: 'pessoa-123',
        planoContasId: 'plano-123',
        documento: 'NF-005',
        parcela: 1,
        tipo: TipoContaPagar.FORNECEDOR,
        descricao: 'Conta para cancelamento',
        data_emissao: '2024-01-01',
        vencimento: '2024-12-31',
        data_lancamento: '2024-01-01',
        valor_principal: 500.0,
      };

      const contaCriada = await contaPagarService.create(createDto);
      expect(contaCriada.id).toBeDefined();

      // Cancelar
      const cancelarDto = { justificativa: 'Compra cancelada pelo fornecedor' };
      const contaCancelada = await contaPagarService.cancelar(contaCriada.id, cancelarDto);
      expect(contaCancelada.status).toBe('CANCELADO');
    });
  });
});
