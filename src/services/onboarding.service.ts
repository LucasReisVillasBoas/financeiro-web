import { apiService } from './api.service';

export interface OnboardingEmpresaDto {
  empresa: {
    razao_social: string;
    nome_fantasia: string;
    cnpj_cpf: string;
    inscricao_estadual?: string;
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    codigo_ibge?: string;
    telefone?: string;
    celular?: string;
    email?: string;
    data_abertura?: Date;
  };
  perfil: {
    nome: string;
    permissoes: {
      usuarios?: string[];
      relatorios?: string[];
      empresas?: string[];
    };
  };
  contato: {
    nome: string;
    funcao?: string;
    telefone?: string;
    celular?: string;
    email?: string;
  };
}

export interface OnboardingEmpresaResponse {
  empresa: {
    id: string;
    razao_social: string;
    nome_fantasia: string;
    cnpj_cpf: string;
  };
  perfil: {
    id: string;
    nome: string;
  };
  contato: {
    id: string;
    nome: string;
    email: string;
  };
}

export const onboardingService = {
  createEmpresa: (data: OnboardingEmpresaDto) =>
    apiService.post<OnboardingEmpresaResponse>('/onboarding/empresa', data),
};
