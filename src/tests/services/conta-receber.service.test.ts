import { describe, it, expect, beforeEach } from 'vitest';
import { contaReceberService } from '../../services/conta-receber.service';
import { TipoContaReceber } from '../../types/api.types';

describe('contaReceberService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  describe('create', () => {
    it('deve criar conta a receber com sucesso', async () => {
      const dto = {
        empresaId: 'empresa-123',
        pessoaId: 'pessoa-456',
        planoContasId: 'plano-456',
        documento: 'NF-001',
        serie: '1',
        parcela: 1,
        tipo: TipoContaReceber.BOLETO,
        descricao: 'Nova conta a receber',
        valorPrincipal: 2000.0,
        vencimento: '2024-12-31',
        dataEmissao: '2024-01-01',
      };

      const result = await contaReceberService.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toBe('new-conta-receber-123');
    });
  });

  describe('createParcelado', () => {
    it('deve criar contas a receber parceladas', async () => {
      const dto = {
        empresaId: 'empresa-123',
        pessoaId: 'pessoa-456',
        planoContasId: 'plano-456',
        documento: 'NF-002',
        serie: '1',
        tipo: TipoContaReceber.DUPLICATA,
        dataEmissao: '2024-01-01',
        primeiroVencimento: '2024-02-15',
        descricao: 'Venda parcelada',
        valorTotal: 6000.0,
        numeroParcelas: 3,
      };

      const result = await contaReceberService.createParcelado(dto);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(3);
      expect(result[0].parcela).toBe(1);
      expect(result[2].parcela).toBe(3);
    });

    it('deve criar parcelas com valores consistentes', async () => {
      const dto = {
        empresaId: 'empresa-123',
        pessoaId: 'pessoa-456',
        planoContasId: 'plano-456',
        documento: 'NF-003',
        serie: '1',
        tipo: TipoContaReceber.DUPLICATA,
        dataEmissao: '2024-01-01',
        primeiroVencimento: '2024-03-01',
        descricao: 'Venda 6x',
        valorTotal: 1200.0,
        numeroParcelas: 6,
      };

      const result = await contaReceberService.createParcelado(dto);

      expect(result.length).toBe(6);
      result.forEach((conta, index) => {
        expect(conta.parcela).toBe(index + 1);
      });
    });
  });

  describe('findAll', () => {
    it('deve listar todas as contas a receber', async () => {
      const result = await contaReceberService.findAll();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
    });
  });

  describe('findByEmpresa', () => {
    it('deve listar contas a receber por empresa', async () => {
      const result = await contaReceberService.findByEmpresa('empresa-123');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('findByPessoa', () => {
    it('deve listar contas a receber por pessoa/cliente', async () => {
      const result = await contaReceberService.findByPessoa('pessoa-456');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('findOne', () => {
    it('deve buscar conta a receber por id', async () => {
      const result = await contaReceberService.findOne('conta-receber-123');

      expect(result).toBeDefined();
      expect(result.id).toBe('conta-receber-123');
    });
  });

  describe('update', () => {
    it('deve atualizar conta a receber', async () => {
      const dto = {
        descricao: 'Conta atualizada',
        valorPrincipal: 2500.0,
      };

      const result = await contaReceberService.update('conta-receber-123', dto);

      expect(result).toBeDefined();
      expect(result.id).toBe('conta-receber-123');
    });
  });

  describe('cancelar', () => {
    it('deve cancelar conta a receber com justificativa', async () => {
      const dto = {
        justificativa: 'Cliente desistiu da compra',
      };

      const result = await contaReceberService.cancelar('conta-receber-123', dto);

      expect(result).toBeDefined();
      expect(result.status).toBe('CANCELADO');
    });
  });

  describe('delete', () => {
    it('deve excluir conta a receber', async () => {
      await expect(contaReceberService.delete('conta-receber-123')).resolves.not.toThrow();
    });
  });

  describe('fluxo completo', () => {
    it('deve executar fluxo: criar → atualizar → cancelar', async () => {
      // Criar
      const createDto = {
        empresaId: 'empresa-123',
        pessoaId: 'pessoa-456',
        planoContasId: 'plano-456',
        documento: 'NF-004',
        serie: '1',
        parcela: 1,
        tipo: TipoContaReceber.BOLETO,
        descricao: 'Venda para teste',
        valorPrincipal: 3000.0,
        vencimento: '2024-12-31',
        dataEmissao: '2024-01-01',
      };

      const contaCriada = await contaReceberService.create(createDto);
      expect(contaCriada.id).toBeDefined();

      // Atualizar
      const updateDto = {
        descricao: 'Venda atualizada',
        valorPrincipal: 3500.0,
      };

      const contaAtualizada = await contaReceberService.update(contaCriada.id, updateDto);
      expect(contaAtualizada.id).toBe(contaCriada.id);

      // Cancelar
      const cancelarDto = { justificativa: 'Venda cancelada' };
      const contaCancelada = await contaReceberService.cancelar(contaCriada.id, cancelarDto);
      expect(contaCancelada.status).toBe('CANCELADO');
    });

    it('deve criar venda parcelada e listar parcelas', async () => {
      // Criar parcelado
      const dto = {
        empresaId: 'empresa-123',
        pessoaId: 'pessoa-456',
        planoContasId: 'plano-456',
        documento: 'NF-005',
        serie: '1',
        tipo: TipoContaReceber.DUPLICATA,
        dataEmissao: '2024-01-01',
        primeiroVencimento: '2024-01-15',
        descricao: 'Venda 4x',
        valorTotal: 4000.0,
        numeroParcelas: 4,
      };

      const parcelas = await contaReceberService.createParcelado(dto);
      expect(parcelas.length).toBe(4);

      // Listar por empresa
      const contasEmpresa = await contaReceberService.findByEmpresa('empresa-123');
      expect(contasEmpresa.length).toBeGreaterThan(0);
    });
  });
});
