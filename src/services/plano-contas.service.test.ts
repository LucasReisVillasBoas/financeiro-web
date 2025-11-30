import { describe, it, expect, beforeEach } from 'vitest';
import planoContasService from './plano-contas.service';
import { mockPlanoContas } from '../tests/mocks/handlers';

describe('planoContasService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  describe('create', () => {
    it('deve criar plano de contas com sucesso', async () => {
      const dto = {
        empresaId: 'empresa-123',
        codigo: '1.1.02',
        nome: 'Despesas Administrativas',
        tipo: 'DESPESA',
        natureza: 'ANALITICA',
      };

      const response = await planoContasService.create(dto);

      expect(response.data).toBeDefined();
      expect(response.data?.id).toBe('new-plano-123');
    });
  });

  describe('update', () => {
    it('deve atualizar plano de contas', async () => {
      const dto = {
        nome: 'Nome Atualizado',
      };

      const response = await planoContasService.update('plano-123', dto);

      expect(response.data).toBeDefined();
      expect(response.data?.id).toBe('plano-123');
    });
  });

  describe('findOne', () => {
    it('deve buscar plano de contas por id', async () => {
      const response = await planoContasService.findOne('plano-123');

      expect(response.data).toBeDefined();
      expect(response.data?.id).toBe('plano-123');
    });
  });

  describe('findAll', () => {
    it('deve listar todos os planos de contas', async () => {
      const response = await planoContasService.findAll();

      expect(response.data).toBeInstanceOf(Array);
      expect(response.data?.length).toBeGreaterThan(0);
    });

    it('deve listar com filtros', async () => {
      const filters = {
        tipo: 'RECEITA',
        ativo: true,
      };

      const response = await planoContasService.findAll(filters);

      expect(response.data).toBeInstanceOf(Array);
    });
  });

  describe('findByEmpresa', () => {
    it('deve listar planos de contas por empresa', async () => {
      const response = await planoContasService.findByEmpresa('empresa-123');

      expect(response.data).toBeInstanceOf(Array);
      expect(response.data?.length).toBeGreaterThan(0);
    });
  });

  describe('findByTipo', () => {
    it('deve listar planos de contas por tipo', async () => {
      const response = await planoContasService.findByTipo('empresa-123', 'RECEITA');

      expect(response.data).toBeInstanceOf(Array);
    });
  });

  describe('findAnaliticas', () => {
    it('deve listar contas analíticas', async () => {
      const response = await planoContasService.findAnaliticas('empresa-123');

      expect(response.data).toBeInstanceOf(Array);
    });
  });

  describe('findAnaliticasAtivas', () => {
    it('deve listar contas analíticas ativas', async () => {
      const response = await planoContasService.findAnaliticasAtivas('empresa-123');

      expect(response.data).toBeInstanceOf(Array);
    });
  });

  describe('findTree', () => {
    it('deve listar estrutura em árvore', async () => {
      const response = await planoContasService.findTree('empresa-123');

      expect(response.data).toBeInstanceOf(Array);
    });
  });

  describe('findChildren', () => {
    it('deve listar contas filhas', async () => {
      const response = await planoContasService.findChildren('plano-123');

      expect(response.data).toBeInstanceOf(Array);
    });
  });

  describe('verificarUso', () => {
    it('deve verificar se conta está em uso', async () => {
      const response = await planoContasService.verificarUso('plano-123');

      expect(response.data).toBeDefined();
      expect(response.data).toHaveProperty('emUso');
      expect(response.data).toHaveProperty('contasPagar');
      expect(response.data).toHaveProperty('contasReceber');
      expect(response.data).toHaveProperty('movimentacoes');
      expect(response.data).toHaveProperty('total');
    });
  });

  describe('substituirConta', () => {
    it('deve substituir conta origem por destino', async () => {
      const response = await planoContasService.substituirConta('conta-origem', 'conta-destino');

      expect(response.data).toBeDefined();
      expect(response.data).toHaveProperty('sucesso');
      expect(response.data).toHaveProperty('contasAtualizadas');
    });
  });

  describe('inativar', () => {
    it('deve inativar plano de contas', async () => {
      const response = await planoContasService.inativar('plano-123');

      expect(response.data).toBeDefined();
      expect(response.data?.ativo).toBe(false);
    });
  });

  describe('reativar', () => {
    it('deve reativar plano de contas', async () => {
      const response = await planoContasService.reativar('plano-123');

      expect(response.data).toBeDefined();
      expect(response.data?.ativo).toBe(true);
    });
  });

  describe('toggleStatus', () => {
    it('deve alternar status do plano de contas', async () => {
      const response = await planoContasService.toggleStatus('plano-123', false);

      expect(response.data).toBeDefined();
    });
  });

  describe('delete', () => {
    it('deve excluir plano de contas', async () => {
      const response = await planoContasService.delete('plano-123');

      expect(response.message).toBe('Plano de contas excluído com sucesso');
    });
  });

  describe('fluxo completo', () => {
    it('deve executar fluxo: criar → inativar → reativar', async () => {
      // Criar
      const createDto = {
        empresaId: 'empresa-123',
        codigo: '2.1.01',
        nome: 'Custo de Mercadorias',
        tipo: 'CUSTO',
        natureza: 'ANALITICA',
      };

      const criadoResponse = await planoContasService.create(createDto);
      expect(criadoResponse.data?.id).toBeDefined();

      // Inativar
      const inativadoResponse = await planoContasService.inativar(criadoResponse.data!.id);
      expect(inativadoResponse.data?.ativo).toBe(false);

      // Reativar
      const reativadoResponse = await planoContasService.reativar(criadoResponse.data!.id);
      expect(reativadoResponse.data?.ativo).toBe(true);
    });

    it('deve verificar uso antes de excluir', async () => {
      // Verificar uso
      const usoResponse = await planoContasService.verificarUso('plano-123');

      if (!usoResponse.data?.emUso) {
        // Se não está em uso, pode excluir
        const deleteResponse = await planoContasService.delete('plano-123');
        expect(deleteResponse.statusCode).toBe(200);
      } else {
        // Se está em uso, não deve excluir
        expect(usoResponse.data.total).toBeGreaterThan(0);
      }
    });
  });
});
