import { describe, it, expect, beforeEach } from 'vitest';
import { dreRelatorioService } from './dre-relatorio.service';
import { server } from '../tests/mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:3002';

describe('dreRelatorioService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  describe('buscarRelatorio', () => {
    it('deve buscar relatório DRE com filtros obrigatórios', async () => {
      const filtros = {
        empresaId: 'empresa-123',
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
      };

      const result = await dreRelatorioService.buscarRelatorio(filtros);

      expect(result).toBeDefined();
      expect(result.periodo).toBeDefined();
      expect(result.linhas).toBeInstanceOf(Array);
      expect(result.totais).toBeDefined();
    });

    it('deve buscar relatório DRE com centro de custo', async () => {
      const filtros = {
        empresaId: 'empresa-123',
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
        centroCustoId: 'centro-custo-123',
      };

      const result = await dreRelatorioService.buscarRelatorio(filtros);

      expect(result).toBeDefined();
    });

    it('deve lançar erro quando empresaId não é fornecido', async () => {
      const filtros = {
        empresaId: '',
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
      };

      await expect(dreRelatorioService.buscarRelatorio(filtros)).rejects.toThrow(
        'empresaId é obrigatório'
      );
    });

    it('deve ignorar centroCustoId vazio', async () => {
      const filtros = {
        empresaId: 'empresa-123',
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
        centroCustoId: '   ',
      };

      const result = await dreRelatorioService.buscarRelatorio(filtros);
      expect(result).toBeDefined();
    });
  });

  describe('exportarCSV', () => {
    it('deve exportar relatório DRE em CSV', async () => {
      server.use(
        http.get(`${API_BASE_URL}/relatorios/dre/exportar`, () => {
          return new HttpResponse('col1,col2\nval1,val2', {
            headers: { 'Content-Type': 'text/csv' },
          });
        })
      );

      const filtros = {
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
        empresaId: 'empresa-123',
      };

      const blob = await dreRelatorioService.exportarCSV(filtros);

      expect(blob).toBeDefined();
      expect(blob.size).toBeGreaterThan(0);
    });

    it('deve exportar CSV com centro de custo', async () => {
      server.use(
        http.get(`${API_BASE_URL}/relatorios/dre/exportar`, () => {
          return new HttpResponse('data', {
            headers: { 'Content-Type': 'text/csv' },
          });
        })
      );

      const filtros = {
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
        empresaId: 'empresa-123',
        centroCustoId: 'centro-123',
      };

      const blob = await dreRelatorioService.exportarCSV(filtros);
      expect(blob).toBeDefined();
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('exportarXLSX', () => {
    it('deve exportar relatório DRE em Excel', async () => {
      server.use(
        http.get(`${API_BASE_URL}/relatorios/dre/exportar`, () => {
          return new HttpResponse(new ArrayBuffer(100), {
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
          });
        })
      );

      const filtros = {
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
        empresaId: 'empresa-123',
      };

      const blob = await dreRelatorioService.exportarXLSX(filtros);

      expect(blob).toBeDefined();
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('exportarPDF', () => {
    it('deve exportar relatório DRE em PDF', async () => {
      server.use(
        http.get(`${API_BASE_URL}/relatorios/dre/exportar`, () => {
          return new HttpResponse(new ArrayBuffer(100), {
            headers: { 'Content-Type': 'application/pdf' },
          });
        })
      );

      const filtros = {
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
        empresaId: 'empresa-123',
      };

      const blob = await dreRelatorioService.exportarPDF(filtros);

      expect(blob).toBeDefined();
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('fluxo de exportação', () => {
    it('deve exportar relatório em múltiplos formatos', async () => {
      server.use(
        http.get(`${API_BASE_URL}/relatorios/dre/exportar`, ({ request }) => {
          const url = new URL(request.url);
          const formato = url.searchParams.get('formato');

          const contentTypes: Record<string, string> = {
            csv: 'text/csv',
            xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            pdf: 'application/pdf',
          };

          return new HttpResponse('data', {
            headers: { 'Content-Type': contentTypes[formato || 'csv'] },
          });
        })
      );

      const filtros = {
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
        empresaId: 'empresa-123',
      };

      // CSV
      const csv = await dreRelatorioService.exportarCSV(filtros);
      expect(csv).toBeDefined();

      // XLSX
      const xlsx = await dreRelatorioService.exportarXLSX(filtros);
      expect(xlsx).toBeDefined();

      // PDF
      const pdf = await dreRelatorioService.exportarPDF(filtros);
      expect(pdf).toBeDefined();
    });
  });
});
