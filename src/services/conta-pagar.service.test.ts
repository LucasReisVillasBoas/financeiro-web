import { describe, it, expect, beforeEach } from 'vitest';
import { contaPagarService } from './conta-pagar.service';
import { mockContaPagar } from '../tests/mocks/handlers';

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
        descricao: 'Nova conta a pagar',
        valor: 500.0,
        dataVencimento: '2024-12-31',
        dataEmissao: '2024-01-01',
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
      expect(result[0]).toHaveProperty('valor');
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
        valor: 750.0,
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
        descricao: 'Compra parcelada',
        valorTotal: 3000.0,
        dataVencimentoPrimeira: '2024-02-15',
        quantidadeParcelas: 3,
      };

      const result = await contaPagarService.gerarParcelas(dto);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(3);
      expect(result[0].numeroParcela).toBe(1);
      expect(result[2].numeroParcela).toBe(3);
    });

    it('deve gerar parcelas com valores corretos', async () => {
      const dto = {
        empresaId: 'empresa-123',
        pessoaId: 'pessoa-123',
        planoContasId: 'plano-123',
        descricao: 'Compra parcelada',
        valorTotal: 1000.0,
        dataVencimentoPrimeira: '2024-02-15',
        quantidadeParcelas: 4,
      };

      const result = await contaPagarService.gerarParcelas(dto);

      expect(result.length).toBe(4);
      result.forEach((parcela, index) => {
        expect(parcela.numeroParcela).toBe(index + 1);
        expect(parcela.totalParcelas).toBe(4);
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
        descricao: 'Conta para teste de fluxo',
        valor: 1000.0,
        dataVencimento: '2024-12-31',
        dataEmissao: '2024-01-01',
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
        descricao: 'Conta para cancelamento',
        valor: 500.0,
        dataVencimento: '2024-12-31',
        dataEmissao: '2024-01-01',
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
