import { describe, it, expect, beforeEach } from 'vitest';
import { contaReceberService } from './conta-receber.service';

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
        descricao: 'Nova conta a receber',
        valor: 2000.0,
        dataVencimento: '2024-12-31',
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
        descricao: 'Venda parcelada',
        valorTotal: 6000.0,
        dataVencimentoPrimeira: '2024-02-15',
        quantidadeParcelas: 3,
      };

      const result = await contaReceberService.createParcelado(dto);

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBe(3);
      expect(result[0].numeroParcela).toBe(1);
      expect(result[2].numeroParcela).toBe(3);
    });

    it('deve criar parcelas com valores consistentes', async () => {
      const dto = {
        empresaId: 'empresa-123',
        pessoaId: 'pessoa-456',
        planoContasId: 'plano-456',
        descricao: 'Venda 6x',
        valorTotal: 1200.0,
        dataVencimentoPrimeira: '2024-03-01',
        quantidadeParcelas: 6,
      };

      const result = await contaReceberService.createParcelado(dto);

      expect(result.length).toBe(6);
      result.forEach((parcela, index) => {
        expect(parcela.numeroParcela).toBe(index + 1);
        expect(parcela.totalParcelas).toBe(6);
      });
    });
  });

  describe('findAll', () => {
    it('deve listar todas as contas a receber', async () => {
      const result = await contaReceberService.findAll();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('valor');
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
        valor: 2500.0,
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
        descricao: 'Venda para teste',
        valor: 3000.0,
        dataVencimento: '2024-12-31',
        dataEmissao: '2024-01-01',
      };

      const contaCriada = await contaReceberService.create(createDto);
      expect(contaCriada.id).toBeDefined();

      // Atualizar
      const updateDto = {
        descricao: 'Venda atualizada',
        valor: 3500.0,
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
        descricao: 'Venda 4x',
        valorTotal: 4000.0,
        dataVencimentoPrimeira: '2024-01-15',
        quantidadeParcelas: 4,
      };

      const parcelas = await contaReceberService.createParcelado(dto);
      expect(parcelas.length).toBe(4);

      // Listar por empresa
      const contasEmpresa = await contaReceberService.findByEmpresa('empresa-123');
      expect(contasEmpresa.length).toBeGreaterThan(0);
    });
  });
});
