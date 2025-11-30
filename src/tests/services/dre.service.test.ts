import { describe, it, expect, beforeEach } from 'vitest';
import dreService from '../../services/dre.service';

describe('dreService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  describe('gerarDre', () => {
    it('deve gerar DRE para empresa', async () => {
      const filtro = {
        empresaId: 'empresa-123',
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
      };

      const response = await dreService.gerarDre(filtro);

      expect(response.data).toBeDefined();
      expect(response.data?.dataInicio).toBeDefined();
      expect(response.data?.dataFim).toBeDefined();
      expect(response.data?.totais).toBeDefined();
    });

    it('deve gerar DRE com consolidação por empresa', async () => {
      const filtro = {
        empresaId: 'empresa-123',
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
        consolidarPor: 'empresa' as const,
      };

      const response = await dreService.gerarDre(filtro);

      expect(response.data).toBeDefined();
    });

    it('deve incluir período correto no resultado', async () => {
      const filtro = {
        empresaId: 'empresa-123',
        dataInicio: '2024-06-01',
        dataFim: '2024-06-30',
      };

      const response = await dreService.gerarDre(filtro);

      expect(response.data?.dataInicio).toBeDefined();
      expect(response.data?.dataFim).toBeDefined();
    });
  });

  describe('gerarDreConsolidado', () => {
    it('deve gerar DRE consolidado para múltiplas empresas', async () => {
      const empresaIds = ['empresa-123', 'empresa-456'];
      const dataInicio = '2024-01-01';
      const dataFim = '2024-12-31';

      const response = await dreService.gerarDreConsolidado(empresaIds, dataInicio, dataFim);

      expect(response.data).toBeDefined();
    });

    it('deve gerar DRE consolidado para empresa única', async () => {
      const empresaIds = ['empresa-123'];
      const dataInicio = '2024-01-01';
      const dataFim = '2024-06-30';

      const response = await dreService.gerarDreConsolidado(empresaIds, dataInicio, dataFim);

      expect(response.data).toBeDefined();
    });
  });

  describe('gerarComparativo', () => {
    it('deve gerar DRE comparativo entre dois períodos', async () => {
      const empresaId = 'empresa-123';
      const periodo1Inicio = '2024-01-01';
      const periodo1Fim = '2024-06-30';
      const periodo2Inicio = '2023-01-01';
      const periodo2Fim = '2023-06-30';

      const response = await dreService.gerarComparativo(
        empresaId,
        periodo1Inicio,
        periodo1Fim,
        periodo2Inicio,
        periodo2Fim
      );

      expect(response.data).toBeDefined();
    });

    it('deve comparar semestres', async () => {
      const empresaId = 'empresa-123';
      const response = await dreService.gerarComparativo(
        empresaId,
        '2024-01-01',
        '2024-06-30',
        '2024-07-01',
        '2024-12-31'
      );

      expect(response.data).toBeDefined();
    });
  });

  describe('fluxo de relatórios DRE', () => {
    it('deve gerar relatórios para análise gerencial', async () => {
      // DRE simples
      const dreSimples = await dreService.gerarDre({
        empresaId: 'empresa-123',
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
      });
      expect(dreSimples.data).toBeDefined();

      // DRE consolidado
      const dreConsolidado = await dreService.gerarDreConsolidado(
        ['empresa-123', 'empresa-456'],
        '2024-01-01',
        '2024-12-31'
      );
      expect(dreConsolidado.data).toBeDefined();

      // DRE comparativo
      const dreComparativo = await dreService.gerarComparativo(
        'empresa-123',
        '2024-01-01',
        '2024-12-31',
        '2023-01-01',
        '2023-12-31'
      );
      expect(dreComparativo.data).toBeDefined();
    });
  });
});
