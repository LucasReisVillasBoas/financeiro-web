import { describe, it, expect, beforeEach } from 'vitest';
import { fluxoCaixaService } from '../../services/fluxo-caixa.service';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:3002';

describe('fluxoCaixaService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  describe('buscarRelatorio', () => {
    it('deve buscar relatório de fluxo de caixa', async () => {
      const filtros = {
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31',
      };

      const result = await fluxoCaixaService.buscarRelatorio(filtros);

      expect(result).toBeDefined();
      expect(result.linhas).toBeInstanceOf(Array);
      expect(result.totais).toBeDefined();
      expect(result.totais.saldoFinalRealizado).toBeDefined();
    });

    it('deve buscar fluxo de caixa com conta bancária específica', async () => {
      const filtros = {
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31',
        contaBancariaId: 'conta-bancaria-123',
      };

      const result = await fluxoCaixaService.buscarRelatorio(filtros);

      expect(result).toBeDefined();
    });

    it('deve buscar fluxo de caixa por empresa', async () => {
      const filtros = {
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31',
        empresaId: 'empresa-123',
      };

      const result = await fluxoCaixaService.buscarRelatorio(filtros);

      expect(result).toBeDefined();
    });

    it('deve buscar fluxo de caixa consolidado', async () => {
      const filtros = {
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31',
        consolidado: true,
      };

      const result = await fluxoCaixaService.buscarRelatorio(filtros);

      expect(result).toBeDefined();
    });

    it('deve retornar totais corretos', async () => {
      const filtros = {
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31',
      };

      const result = await fluxoCaixaService.buscarRelatorio(filtros);

      expect(result.totais).toHaveProperty('totalEntradasRealizadas');
      expect(result.totais).toHaveProperty('totalSaidasRealizadas');
      expect(result.totais).toHaveProperty('saldoFinalRealizado');
    });
  });

  describe('exportarCSV', () => {
    it('deve exportar fluxo de caixa em CSV', async () => {
      server.use(
        http.get(`${API_BASE_URL}/relatorios/fluxo-caixa/exportar`, () => {
          return new HttpResponse('data,entradas,saidas\n2024-01-01,1000,500', {
            headers: { 'Content-Type': 'text/csv' },
          });
        })
      );

      const filtros = {
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31',
      };

      const blob = await fluxoCaixaService.exportarCSV(filtros);

      expect(blob).toBeDefined();
      expect(blob.size).toBeGreaterThan(0);
    });

    it('deve exportar CSV com todos os filtros', async () => {
      server.use(
        http.get(`${API_BASE_URL}/relatorios/fluxo-caixa/exportar`, () => {
          return new HttpResponse('data', {
            headers: { 'Content-Type': 'text/csv' },
          });
        })
      );

      const filtros = {
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31',
        contaBancariaId: 'conta-123',
        empresaId: 'empresa-123',
        consolidado: true,
      };

      const blob = await fluxoCaixaService.exportarCSV(filtros);
      expect(blob).toBeDefined();
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('exportarXLSX', () => {
    it('deve exportar fluxo de caixa em Excel', async () => {
      server.use(
        http.get(`${API_BASE_URL}/relatorios/fluxo-caixa/exportar`, () => {
          return new HttpResponse(new ArrayBuffer(100), {
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
          });
        })
      );

      const filtros = {
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31',
      };

      const blob = await fluxoCaixaService.exportarXLSX(filtros);

      expect(blob).toBeDefined();
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('exportarPDF', () => {
    it('deve exportar fluxo de caixa em PDF', async () => {
      server.use(
        http.get(`${API_BASE_URL}/relatorios/fluxo-caixa/exportar`, () => {
          return new HttpResponse(new ArrayBuffer(100), {
            headers: { 'Content-Type': 'application/pdf' },
          });
        })
      );

      const filtros = {
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31',
      };

      const blob = await fluxoCaixaService.exportarPDF(filtros);

      expect(blob).toBeDefined();
      expect(blob.size).toBeGreaterThan(0);
    });
  });

  describe('fluxo de análise financeira', () => {
    it('deve gerar relatórios para análise de caixa', async () => {
      // Fluxo de caixa mensal
      const fluxoMensal = await fluxoCaixaService.buscarRelatorio({
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31',
        empresaId: 'empresa-123',
      });
      expect(fluxoMensal).toBeDefined();
      expect(fluxoMensal.totais.saldoFinalRealizado).toBeDefined();

      // Fluxo de caixa trimestral
      const fluxoTrimestral = await fluxoCaixaService.buscarRelatorio({
        dataInicio: '2024-01-01',
        dataFim: '2024-03-31',
        empresaId: 'empresa-123',
      });
      expect(fluxoTrimestral).toBeDefined();
    });

    it('deve comparar fluxo de caixa entre períodos', async () => {
      // Primeiro período
      const periodo1 = await fluxoCaixaService.buscarRelatorio({
        dataInicio: '2024-01-01',
        dataFim: '2024-06-30',
        empresaId: 'empresa-123',
      });

      // Segundo período
      const periodo2 = await fluxoCaixaService.buscarRelatorio({
        dataInicio: '2024-07-01',
        dataFim: '2024-12-31',
        empresaId: 'empresa-123',
      });

      expect(periodo1.totais).toBeDefined();
      expect(periodo2.totais).toBeDefined();
    });

    it('deve exportar relatório em múltiplos formatos', async () => {
      server.use(
        http.get(`${API_BASE_URL}/relatorios/fluxo-caixa/exportar`, () => {
          return new HttpResponse('data', {
            headers: { 'Content-Type': 'application/octet-stream' },
          });
        })
      );

      const filtros = {
        dataInicio: '2024-01-01',
        dataFim: '2024-12-31',
        empresaId: 'empresa-123',
      };

      const csv = await fluxoCaixaService.exportarCSV(filtros);
      const xlsx = await fluxoCaixaService.exportarXLSX(filtros);
      const pdf = await fluxoCaixaService.exportarPDF(filtros);

      expect(csv).toBeDefined();
      expect(xlsx).toBeDefined();
      expect(pdf).toBeDefined();
    });
  });
});
