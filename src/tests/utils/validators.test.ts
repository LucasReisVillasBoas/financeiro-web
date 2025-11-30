import { describe, it, expect } from 'vitest';
import {
  validarCPF,
  validarCNPJ,
  validarCpfCnpj,
  formatarCPF,
  formatarCNPJ,
  formatarCpfCnpj,
  formatarTelefone,
  formatarCEP,
  formatarMoeda,
  parseMoeda,
  validarEmail,
  validarData,
  formatarData,
  dataParaISO,
} from '../../utils/validators';

describe('validators', () => {
  describe('validarCPF', () => {
    it('deve validar CPF válido', () => {
      expect(validarCPF('529.982.247-25')).toBe(true);
      expect(validarCPF('52998224725')).toBe(true);
    });

    it('deve rejeitar CPF inválido', () => {
      expect(validarCPF('111.111.111-11')).toBe(false);
      expect(validarCPF('123.456.789-00')).toBe(false);
      expect(validarCPF('000.000.000-00')).toBe(false);
    });

    it('deve rejeitar CPF com tamanho incorreto', () => {
      expect(validarCPF('1234567890')).toBe(false);
      expect(validarCPF('123456789012')).toBe(false);
      expect(validarCPF('')).toBe(false);
    });

    it('deve rejeitar CPF com todos os dígitos iguais', () => {
      expect(validarCPF('11111111111')).toBe(false);
      expect(validarCPF('22222222222')).toBe(false);
      expect(validarCPF('99999999999')).toBe(false);
    });
  });

  describe('validarCNPJ', () => {
    it('deve validar CNPJ válido', () => {
      expect(validarCNPJ('11.444.777/0001-61')).toBe(true);
      expect(validarCNPJ('11444777000161')).toBe(true);
    });

    it('deve rejeitar CNPJ inválido', () => {
      expect(validarCNPJ('11.111.111/1111-11')).toBe(false);
      expect(validarCNPJ('12.345.678/0001-00')).toBe(false);
    });

    it('deve rejeitar CNPJ com tamanho incorreto', () => {
      expect(validarCNPJ('1234567890123')).toBe(false);
      expect(validarCNPJ('123456789012345')).toBe(false);
      expect(validarCNPJ('')).toBe(false);
    });

    it('deve rejeitar CNPJ com todos os dígitos iguais', () => {
      expect(validarCNPJ('11111111111111')).toBe(false);
      expect(validarCNPJ('00000000000000')).toBe(false);
    });
  });

  describe('validarCpfCnpj', () => {
    it('deve validar CPF quando tem 11 dígitos', () => {
      expect(validarCpfCnpj('529.982.247-25')).toBe(true);
      expect(validarCpfCnpj('52998224725')).toBe(true);
    });

    it('deve validar CNPJ quando tem 14 dígitos', () => {
      expect(validarCpfCnpj('11.444.777/0001-61')).toBe(true);
      expect(validarCpfCnpj('11444777000161')).toBe(true);
    });

    it('deve rejeitar documento inválido', () => {
      expect(validarCpfCnpj('12345')).toBe(false);
      expect(validarCpfCnpj('')).toBe(false);
      expect(validarCpfCnpj('123456789012345')).toBe(false);
    });

    it('deve retornar false para documento vazio ou null', () => {
      expect(validarCpfCnpj('')).toBe(false);
    });
  });

  describe('formatarCPF', () => {
    it('deve formatar CPF corretamente', () => {
      expect(formatarCPF('52998224725')).toBe('529.982.247-25');
    });

    it('deve retornar o valor original se não tiver 11 dígitos', () => {
      expect(formatarCPF('1234567890')).toBe('1234567890');
      expect(formatarCPF('123456789012')).toBe('123456789012');
    });

    it('deve remover formatação existente e reformatar', () => {
      expect(formatarCPF('529.982.247-25')).toBe('529.982.247-25');
    });
  });

  describe('formatarCNPJ', () => {
    it('deve formatar CNPJ corretamente', () => {
      expect(formatarCNPJ('11444777000161')).toBe('11.444.777/0001-61');
    });

    it('deve retornar o valor original se não tiver 14 dígitos', () => {
      expect(formatarCNPJ('1234567890123')).toBe('1234567890123');
      expect(formatarCNPJ('123456789012345')).toBe('123456789012345');
    });

    it('deve remover formatação existente e reformatar', () => {
      expect(formatarCNPJ('11.444.777/0001-61')).toBe('11.444.777/0001-61');
    });
  });

  describe('formatarCpfCnpj', () => {
    it('deve formatar CPF quando tem 11 dígitos', () => {
      expect(formatarCpfCnpj('52998224725')).toBe('529.982.247-25');
    });

    it('deve formatar CNPJ quando tem 14 dígitos', () => {
      expect(formatarCpfCnpj('11444777000161')).toBe('11.444.777/0001-61');
    });

    it('deve retornar vazio para string vazia', () => {
      expect(formatarCpfCnpj('')).toBe('');
    });

    it('deve retornar o valor original se não for CPF nem CNPJ', () => {
      expect(formatarCpfCnpj('12345')).toBe('12345');
    });
  });

  describe('formatarTelefone', () => {
    it('deve formatar telefone celular (11 dígitos)', () => {
      expect(formatarTelefone('11999998888')).toBe('(11) 99999-8888');
    });

    it('deve formatar telefone fixo (10 dígitos)', () => {
      expect(formatarTelefone('1133334444')).toBe('(11) 3333-4444');
    });

    it('deve retornar o valor original se não tiver 10 ou 11 dígitos', () => {
      expect(formatarTelefone('123456789')).toBe('123456789');
      expect(formatarTelefone('123456789012')).toBe('123456789012');
    });

    it('deve remover formatação existente e reformatar', () => {
      expect(formatarTelefone('(11) 99999-8888')).toBe('(11) 99999-8888');
    });
  });

  describe('formatarCEP', () => {
    it('deve formatar CEP corretamente', () => {
      expect(formatarCEP('01310100')).toBe('01310-100');
    });

    it('deve retornar o valor original se não tiver 8 dígitos', () => {
      expect(formatarCEP('0131010')).toBe('0131010');
      expect(formatarCEP('013101001')).toBe('013101001');
    });

    it('deve remover formatação existente e reformatar', () => {
      expect(formatarCEP('01310-100')).toBe('01310-100');
    });
  });

  describe('formatarMoeda', () => {
    it('deve formatar valor em Reais', () => {
      const resultado = formatarMoeda(1000);
      expect(resultado).toContain('1.000');
      expect(resultado).toContain('R$');
    });

    it('deve formatar valor com centavos', () => {
      const resultado = formatarMoeda(1234.56);
      expect(resultado).toContain('1.234');
      expect(resultado).toContain('56');
    });

    it('deve formatar zero', () => {
      const resultado = formatarMoeda(0);
      expect(resultado).toContain('0');
    });

    it('deve formatar valor negativo', () => {
      const resultado = formatarMoeda(-500);
      expect(resultado).toContain('500');
    });
  });

  describe('parseMoeda', () => {
    it('deve converter string monetária para number', () => {
      expect(parseMoeda('R$ 1.000,00')).toBe(1000);
      expect(parseMoeda('R$ 1.234,56')).toBe(1234.56);
    });

    it('deve converter valores simples', () => {
      expect(parseMoeda('100,00')).toBe(100);
      expect(parseMoeda('50,50')).toBe(50.5);
    });

    it('deve retornar 0 para string vazia ou inválida', () => {
      expect(parseMoeda('')).toBe(0);
      expect(parseMoeda('abc')).toBe(0);
    });
  });

  describe('validarEmail', () => {
    it('deve validar email válido', () => {
      expect(validarEmail('test@example.com')).toBe(true);
      expect(validarEmail('user.name@domain.com.br')).toBe(true);
      expect(validarEmail('email+tag@gmail.com')).toBe(true);
    });

    it('deve rejeitar email inválido', () => {
      expect(validarEmail('invalid')).toBe(false);
      expect(validarEmail('invalid@')).toBe(false);
      expect(validarEmail('@domain.com')).toBe(false);
      expect(validarEmail('invalid@domain')).toBe(false);
      expect(validarEmail('')).toBe(false);
    });

    it('deve rejeitar email com espaços', () => {
      expect(validarEmail('test @example.com')).toBe(false);
      expect(validarEmail('test@ example.com')).toBe(false);
    });
  });

  describe('validarData', () => {
    it('deve validar data ISO válida', () => {
      expect(validarData('2024-01-15')).toBe(true);
      expect(validarData('2024-12-31')).toBe(true);
    });

    it('deve rejeitar formato inválido', () => {
      expect(validarData('15/01/2024')).toBe(false);
      expect(validarData('01-15-2024')).toBe(false);
      expect(validarData('2024/01/15')).toBe(false);
    });

    it('deve rejeitar data com mês inválido', () => {
      expect(validarData('2024-13-01')).toBe(false);
    });

    it('deve rejeitar string vazia', () => {
      expect(validarData('')).toBe(false);
    });
  });

  describe('formatarData', () => {
    it('deve formatar data ISO para formato local', () => {
      // A função usa toLocaleDateString que depende do locale do sistema
      const resultado = formatarData('2024-01-15');
      expect(resultado).toBeTruthy();
      expect(resultado.length).toBeGreaterThan(0);
    });

    it('deve retornar vazio para data vazia', () => {
      expect(formatarData('')).toBe('');
    });

    it('deve formatar data com timestamp', () => {
      const resultado = formatarData('2024-01-15T12:00:00.000Z');
      expect(resultado).toBeTruthy();
      expect(resultado.length).toBeGreaterThan(0);
    });
  });

  describe('dataParaISO', () => {
    it('deve converter data DD/MM/YYYY para ISO', () => {
      expect(dataParaISO('15/01/2024')).toBe('2024-01-15');
      expect(dataParaISO('31/12/2024')).toBe('2024-12-31');
    });

    it('deve preencher zeros à esquerda', () => {
      expect(dataParaISO('1/1/2024')).toBe('2024-01-01');
      expect(dataParaISO('5/3/2024')).toBe('2024-03-05');
    });

    it('deve retornar vazio para data vazia', () => {
      expect(dataParaISO('')).toBe('');
    });

    it('deve retornar o valor original se não conseguir converter', () => {
      expect(dataParaISO('invalid')).toBe('invalid');
      expect(dataParaISO('2024-01-15')).toBe('2024-01-15');
    });
  });
});
