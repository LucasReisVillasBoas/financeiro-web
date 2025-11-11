/**
 * Valida CPF
 */
export function validarCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cpf)) return false;

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(9))) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = (soma * 10) % 11;
  if (resto === 10 || resto === 11) resto = 0;
  if (resto !== parseInt(cpf.charAt(10))) return false;

  return true;
}

/**
 * Valida CNPJ
 */
export function validarCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/\D/g, '');

  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1+$/.test(cnpj)) return false;

  // Validação do primeiro dígito verificador
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  const digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(0))) return false;

  // Validação do segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += parseInt(numeros.charAt(tamanho - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado !== parseInt(digitos.charAt(1))) return false;

  return true;
}

/**
 * Valida CPF ou CNPJ
 */
export function validarCpfCnpj(documento: string): boolean {
  if (!documento) return false;

  const limpo = documento.replace(/\D/g, '');

  if (limpo.length === 11) {
    return validarCPF(limpo);
  } else if (limpo.length === 14) {
    return validarCNPJ(limpo);
  }

  return false;
}

/**
 * Formata CPF
 */
export function formatarCPF(cpf: string): string {
  const limpo = cpf.replace(/\D/g, '');
  if (limpo.length !== 11) return cpf;
  return limpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ
 */
export function formatarCNPJ(cnpj: string): string {
  const limpo = cnpj.replace(/\D/g, '');
  if (limpo.length !== 14) return cnpj;
  return limpo.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata CPF ou CNPJ automaticamente
 */
export function formatarCpfCnpj(documento: string): string {
  if (!documento) return '';

  const limpo = documento.replace(/\D/g, '');

  if (limpo.length === 11) {
    return formatarCPF(limpo);
  } else if (limpo.length === 14) {
    return formatarCNPJ(limpo);
  }

  return documento;
}

/**
 * Formata telefone (11) 99999-9999 ou (11) 9999-9999
 */
export function formatarTelefone(telefone: string): string {
  const limpo = telefone.replace(/\D/g, '');

  if (limpo.length === 11) {
    return limpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (limpo.length === 10) {
    return limpo.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return telefone;
}

/**
 * Formata CEP 99999-999
 */
export function formatarCEP(cep: string): string {
  const limpo = cep.replace(/\D/g, '');
  if (limpo.length !== 8) return cep;
  return limpo.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Formata valor monetário
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

/**
 * Converte string monetária para number
 */
export function parseMoeda(valor: string): number {
  return parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
}

/**
 * Valida email
 */
export function validarEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Valida data no formato ISO (YYYY-MM-DD)
 */
export function validarData(data: string): boolean {
  const re = /^\d{4}-\d{2}-\d{2}$/;
  if (!re.test(data)) return false;

  const date = new Date(data);
  return !isNaN(date.getTime());
}

/**
 * Formata data de ISO para DD/MM/YYYY
 */
export function formatarData(data: string): string {
  if (!data) return '';
  const date = new Date(data);
  return date.toLocaleDateString('pt-BR');
}

/**
 * Converte data de DD/MM/YYYY para ISO (YYYY-MM-DD)
 */
export function dataParaISO(data: string): string {
  if (!data) return '';
  const parts = data.split('/');
  if (parts.length !== 3) return data;
  return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
}
