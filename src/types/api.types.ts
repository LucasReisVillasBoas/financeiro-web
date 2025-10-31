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
  login?: string;
  telefone?: string;
  cargo?: string;
  data_nascimento?: string;
  deleted_at?: string;
}

export interface Empresa {
  id: string;
  cliente_id: string;
  sede?: string;
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

export interface ContaBancaria {
  id: string;
  cliente_id: string;
  empresaId: string;
  banco: string;
  agencia: string;
  agencia_digito?: string;
  conta: string;
  conta_digito?: string;
  descricao: string;
  tipo: 'Conta Corrente' | 'Conta Poupança' | 'Conta Salário' | 'Conta Investimento';
  saldo_inicial: number;
  saldo_atual: number;
  data_referencia_saldo: string;
  ativo: boolean;
  deleted_at?: string;
}

export interface CreateContaBancariaDto {
  cliente_id: string;
  empresaId: string;
  banco: string;
  agencia: string;
  agencia_digito?: string;
  conta: string;
  conta_digito?: string;
  descricao: string;
  tipo: string;
  saldo_inicial: number;
  data_referencia_saldo: string;
}

export interface UpdateContaBancariaDto extends Partial<CreateContaBancariaDto> {}

export interface MovimentacaoBancaria {
  id: string;
  data: string;
  descricao: string;
  conta: string;
  categoria: string;
  valor: number;
  tipo: 'Entrada' | 'Saída';
  contaBancariaId: string;
  empresaId?: string;
  filialId?: string;
  deleted_at?: string;
}

export interface CreateMovimentacaoBancariaDto {
  data: string;
  descricao: string;
  conta: string;
  categoria: string;
  valor: number;
  tipo: 'Entrada' | 'Saída';
  contaBancaria: string;
  empresaId?: string;
}

export interface UpdateMovimentacaoBancariaDto extends Partial<CreateMovimentacaoBancariaDto> {}

export interface ContaPagar {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'Pendente' | 'Vencida' | 'Paga';
  fornecedor: string;
  dataPagamento?: string;
  empresaId?: string;
  deletadoEm?: string;
}

export interface CreateContaPagarDto {
  descricao: string;
  valor: number;
  vencimento: string;
  status?: 'Pendente' | 'Vencida' | 'Paga';
  fornecedor: string;
  dataPagamento?: string;
  empresaId?: string;
}

export interface UpdateContaPagarDto extends Partial<CreateContaPagarDto> {}

export interface ContaReceber {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'Pendente' | 'Recebida';
  cliente: string;
  dataRecebimento?: string;
  empresaId?: string;
  deletadoEm?: string;
}

export interface CreateContaReceberDto {
  descricao: string;
  valor: number;
  vencimento: string;
  status?: 'Pendente' | 'Recebida';
  cliente: string;
  dataRecebimento?: string;
  empresaId?: string;
}

export interface UpdateContaReceberDto extends Partial<CreateContaReceberDto> {}
