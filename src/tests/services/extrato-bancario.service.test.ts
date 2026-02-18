import { describe, it, expect, beforeEach } from 'vitest';
import { extratoBancarioService } from '../../services/extrato-bancario.service';
import { FormatoExtrato } from '../../types/api.types';

describe('extratoBancarioService', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'test-token');
  });

  describe('importar', () => {
    it('deve importar extrato OFX com sucesso', async () => {
      const arquivo = new File(['conteudo ofx'], 'extrato.ofx', {
        type: 'application/octet-stream',
      });

      const result = await extratoBancarioService.importar(
        'conta-bancaria-123',
        FormatoExtrato.OFX,
        arquivo
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data!.totalImportado).toBe(10);
      expect(result.data!.comSugestao).toBe(7);
      expect(result.data!.semSugestao).toBe(3);
    });

    it('deve importar extrato CSV com sucesso', async () => {
      const arquivo = new File(['data;descricao;valor'], 'extrato.csv', {
        type: 'text/csv',
      });

      const result = await extratoBancarioService.importar(
        'conta-bancaria-123',
        FormatoExtrato.CSV,
        arquivo
      );

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data!.totalImportado).toBeGreaterThan(0);
    });
  });

  describe('findAll', () => {
    it('deve listar todos os extratos', async () => {
      const result = await extratoBancarioService.findAll();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('dataTransacao');
      expect(result[0]).toHaveProperty('valor');
    });

    it('deve listar extratos por conta bancária', async () => {
      const result = await extratoBancarioService.findAll('conta-bancaria-123');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('findPendentes', () => {
    it('deve listar extratos pendentes de conciliação', async () => {
      const result = await extratoBancarioService.findPendentes('conta-bancaria-123');

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('aceitarSugestao', () => {
    it('deve aceitar sugestão de conciliação', async () => {
      await expect(extratoBancarioService.aceitarSugestao('extrato-123')).resolves.not.toThrow();
    });
  });

  describe('rejeitarSugestao', () => {
    it('deve rejeitar sugestão de conciliação', async () => {
      await expect(extratoBancarioService.rejeitarSugestao('extrato-123')).resolves.not.toThrow();
    });
  });

  describe('ignorarItem', () => {
    it('deve ignorar item do extrato', async () => {
      await expect(extratoBancarioService.ignorarItem('extrato-456')).resolves.not.toThrow();
    });
  });

  describe('fluxo completo de conciliação', () => {
    it('deve executar fluxo: importar → listar pendentes → aceitar', async () => {
      const arquivo = new File(['conteudo ofx'], 'extrato.ofx', {
        type: 'application/octet-stream',
      });

      const importResult = await extratoBancarioService.importar(
        'conta-bancaria-123',
        FormatoExtrato.OFX,
        arquivo
      );
      expect(importResult.data).toBeDefined();
      expect(importResult.data!.totalImportado).toBeGreaterThan(0);

      const pendentes = await extratoBancarioService.findPendentes('conta-bancaria-123');
      expect(pendentes).toBeInstanceOf(Array);
      expect(pendentes.length).toBeGreaterThan(0);

      await expect(extratoBancarioService.aceitarSugestao(pendentes[0].id)).resolves.not.toThrow();
    });
  });
});
