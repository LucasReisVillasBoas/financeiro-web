export interface ApiResponse<T = any> {
  message: string;
  statusCode: number;
  data?: T;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}

export interface User {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo?: string;
  data_nascimento?: string;
  deleted_at?: string;
}

export interface Empresa {
  id: string;
  cliente_id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj_cpf: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  cidade?: string;
  codigo_ibge?: string;
  uf?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  data_abertura?: string;
  deleted_at?: string;
}

export interface CreateEmpresaDto {
  cliente_id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj_cpf: string;
  inscricao_estadual?: string;
  inscricao_municipal?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  cidade?: string;
  codigo_ibge?: string;
  uf?: string;
  telefone?: string;
  celular?: string;
  email?: string;
  data_abertura?: Date;
}

export interface UpdateEmpresaDto extends Partial<CreateEmpresaDto> {}

export interface Filial {
  id: string;
  empresa_id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj_cpf: string;
  inscricao_estadual?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  cidade?: string;
  uf?: string;
  telefone?: string;
  email?: string;
  deleted_at?: string;
}

export interface CreateFilialDto {
  empresa_id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj_cpf: string;
  inscricao_estadual?: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  complemento?: string;
  cidade?: string;
  uf?: string;
  telefone?: string;
  email?: string;
}

export interface UpdateFilialDto extends Partial<CreateFilialDto> {}

export interface Contato {
  id: string;
  clienteId?: string;
  filialId?: string;
  funcao: string;
  celular: string;
  nome: string;
  email: string;
  telefone: string;
  deletadoEm?: string;
}

export interface CreateContatoDto {
  clienteId?: string;
  filialId?: string;
  funcao: string;
  celular: string;
  nome: string;
  email: string;
  telefone: string;
}

export interface UpdateContatoDto extends Partial<CreateContatoDto> {}

export interface Cidade {
  id: string;
  clienteId: string;
  filialId: string;
  nome: string;
  codigoIbge: string;
  uf: string;
  pais: string;
  codigoBacen?: string;
}

export interface CreateCidadeDto {
  clienteId?: string;
  filialId?: string;
  codigoIbge: string;
  uf: string;
  pais: string;
  nome: string;
  codigoBacen?: string;
}

export interface UpdateCidadeDto extends Partial<CreateCidadeDto> {}

export interface UsuarioEmpresaFilial {
  id: string;
  usuario_id: string;
  empresa_id?: string;
  filial_id?: string;
  deleted_at?: string;
}

export interface AssociarEmpresaFilialDto {
  empresaId?: string;
  filialId?: string;
}

export interface Perfil {
  id: string;
  clienteId: string;
  nome: string;
  permissoes: Record<string, string[]>;
  ativo: boolean;
  deleted_at?: string;
}
