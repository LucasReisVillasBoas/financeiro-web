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
  ativo: boolean;
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

// Estrutura real da API do backend
export interface PessoaEndereco {
  id: string;
  cep: string;
  logradouro: string;
  numero: string;
  bairro: string;
  complemento?: string;
  cidade: string;
  codigoIbge: string;
  uf: string;
  ativo: boolean;
  deletadoEm?: string;
  criadoEm: string;
  atualizadoEm: string;
}

export interface Pessoa {
  id: string;
  empresa?: {
    id: string;
    razao_social: string;
    nome_fantasia: string;
    cnpj_cpf: string;
  };
  endereco?: PessoaEndereco;
  razaoNome: string;
  fantasiaApelido?: string;
  documento?: string;
  ieRg?: string;
  aniversario?: string;
  ativo: boolean;
  deletadoEm?: string;
  criadoEm: string;
  atualizadoEm: string;
  criadoPor?: string;
  atualizadoPor?: string;

  // Campos computados para compatibilidade
  nome?: string; // Será preenchido com razaoNome
  tipo?: 'Física' | 'Jurídica'; // Será inferido do documento
  cpf_cnpj?: string; // Será preenchido com documento
  email?: string;
  telefone?: string;
  celular?: string;
  cidade?: string; // Será preenchido com endereco.cidade
  uf?: string; // Será preenchido com endereco.uf
}

export interface CreatePessoaDto {
  clienteId?: string;
  tipo: 'Física' | 'Jurídica';
  nome: string;
  razao_nome: string;
  cpf_cnpj: string;
  email?: string;
  telefone?: string;
  celular?: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  codigoIbge?: string;
  ativo?: boolean;
  aniversario?: string;
  criado_por_id?: string;
  atualizado_por_id?: string;
}

export interface UpdatePessoaDto {
  empresaId?: string;
  enderecoId?: string;
  razaoNome?: string;
  fantasiaApelido?: string;
  documento?: string;
  ieRg?: string;
  aniversario?: string;
  email?: string;
  telefone?: string;
  ativo?: boolean;
  // Campos de endereço
  cep?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
  codigoIbge?: string;
}

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
  saldo_atual: number;
  data_referencia_saldo: string;
}

export interface UpdateContaBancariaDto extends Partial<CreateContaBancariaDto> {}

export interface MovimentacaoBancaria {
  id: string;
  dataMovimento: string;
  descricao: string;
  conta: string;
  categoria: string;
  valor: number;
  tipoMovimento: 'Entrada' | 'Saída';
  contaBancariaId: string;
  empresaId?: string;
  filialId?: string;
  conciliado: 'S' | 'N';
  conciliadoEm?: string;
  conciliadoPor?: string;
  observacao?: string;
  referencia?: 'Pagar' | 'Receber' | 'Manual';
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

// Enums para Conta a Pagar
export enum StatusContaPagar {
  PENDENTE = 'Pendente',
  VENCIDA = 'Vencida',
  PAGA = 'Paga',
  PARCIALMENTE_PAGA = 'ParcialmentePaga',
  CANCELADA = 'Cancelada',
}

export enum TipoContaPagar {
  FORNECEDOR = 'Fornecedor',
  EMPRESTIMO = 'Empréstimo',
  IMPOSTO = 'Imposto',
  SALARIO = 'Salário',
  ALUGUEL = 'Aluguel',
  SERVICO = 'Serviço',
  OUTROS = 'Outros',
}

export interface ContaPagar {
  id: string;
  documento: string;
  serie?: string;
  parcela: number;
  tipo: TipoContaPagar;
  descricao: string;
  data_emissao: string;
  vencimento: string;
  data_lancamento: string;
  data_liquidacao?: string;
  valor_principal: number;
  acrescimos: number;
  descontos: number;
  valor_total: number;
  saldo: number;
  status: StatusContaPagar;
  pessoaId: string;
  pessoaNome?: string;
  planoContasId: string;
  planoContasCodigo?: string;
  planoContasDescricao?: string;
  empresaId: string;
  empresaNome?: string;
  movimentacaoBancariaId?: string;
  canceladoEm?: string;
  justificativaCancelamento?: string;
  deletadoEm?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateContaPagarDto {
  documento: string;
  serie?: string;
  parcela: number;
  tipo: string;
  descricao: string;
  data_emissao: string;
  vencimento: string;
  data_lancamento: string;
  data_liquidacao?: string;
  valor_principal: number;
  acrescimos?: number;
  descontos?: number;
  pessoaId: string;
  planoContasId: string;
  empresaId: string;
  status?: string;
}

export interface UpdateContaPagarDto {
  documento?: string;
  serie?: string;
  parcela?: number;
  tipo?: string;
  descricao?: string;
  data_emissao?: string;
  vencimento?: string;
  data_lancamento?: string;
  valor_principal?: number;
  acrescimos?: number;
  descontos?: number;
  pessoaId?: string;
  planoContasId?: string;
}

export interface RegistrarBaixaDto {
  dataPagamento: string;
  valorPago: number;
  contaBancariaId: string;
  observacao?: string;
}

export interface CancelarContaPagarDto {
  justificativa: string;
}

export interface GerarParcelasDto {
  documento: string;
  serie?: string;
  quantidade_parcelas: number;
  tipo: string;
  descricao: string;
  data_emissao: string;
  primeiro_vencimento: string;
  intervalo_dias: number;
  data_lancamento: string;
  valor_total: number;
  acrescimos?: number;
  descontos?: number;
  pessoaId: string;
  planoContasId: string;
  empresaId: string;
}

export interface ContaReceber {
  id: string;
  descricao: string;
  valor: number;
  vencimento: string;
  status: 'Pendente' | 'Recebida';
  cliente: string;
  dataRecebimento?: string;
  empresaId?: string;
  planoContasId?: string;
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
  planoContasId?: string;
}

export interface UpdateContaReceberDto extends Partial<CreateContaReceberDto> {}

// Plano de Contas
export enum TipoPlanoContas {
  RECEITA = 'Receita',
  CUSTO = 'Custo',
  DESPESA = 'Despesa',
  OUTROS = 'Outros',
}

export interface PlanoContas {
  id: string;
  codigo: string;
  descricao: string;
  tipo: TipoPlanoContas;
  nivel: number;
  permite_lancamento: boolean;
  ativo: boolean;
  empresaId: string;
  empresaNome?: string;
  parentId?: string;
  parentCodigo?: string;
  filhos?: PlanoContas[];
  created_at: string;
  updated_at: string;
}

export interface CreatePlanoContasDto {
  empresaId: string;
  codigo: string;
  descricao: string;
  tipo: TipoPlanoContas;
  nivel: number;
  parentId?: string;
  permite_lancamento?: boolean;
  ativo?: boolean;
}

export interface UpdatePlanoContasDto extends Partial<CreatePlanoContasDto> {}

export interface FilterPlanoContasDto {
  empresaId?: string;
  search?: string;
  tipo?: TipoPlanoContas;
  ativo?: boolean;
  permite_lancamento?: boolean;
  nivel?: number;
  parentId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedPlanoContasResponse {
  data: PlanoContas[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ImportPlanoContasRowDto {
  codigo: string;
  descricao: string;
  tipo: string;
  codigoPai?: string;
  permite_lancamento?: string | boolean;
  ativo?: string | boolean;
}

export interface ImportPlanoContasDto {
  empresaId: string;
  sobrescrever?: boolean;
  dryRun?: boolean;
  linhas: ImportPlanoContasRowDto[];
}

export interface ImportValidationResult {
  linha: number;
  codigo: string;
  valido: boolean;
  erros: string[];
  avisos: string[];
  contaExistente?: boolean;
  contaEmUso?: boolean;
}

export interface ImportResult {
  sucesso: boolean;
  totalLinhas: number;
  importadas: number;
  atualizadas: number;
  ignoradas: number;
  erros: ImportValidationResult[];
  avisos: ImportValidationResult[];
  mensagem: string;
}

// DRE (Demonstração do Resultado do Exercício)
export interface DreLinhaDto {
  contaId: string;
  codigo: string;
  descricao: string;
  tipo: TipoPlanoContas;
  nivel: number;
  valor: number;
  parentCodigo?: string;
}

export interface DreTotaisDto {
  totalReceitas: number;
  totalCustos: number;
  totalDespesas: number;
  totalOutros: number;
  lucroOperacional: number;
  resultadoLiquido: number;
}

export interface DreResponseDto {
  empresaId: string;
  empresaNome: string;
  dataInicio: string;
  dataFim: string;
  receitas: DreLinhaDto[];
  custos: DreLinhaDto[];
  despesas: DreLinhaDto[];
  outros: DreLinhaDto[];
  totais: DreTotaisDto;
  geradoEm: Date;
  totalLancamentos: number;
}

export interface DreConsolidadoDto {
  periodo: {
    dataInicio: string;
    dataFim: string;
  };
  empresas: Array<{
    empresaId: string;
    empresaNome: string;
    dre: DreResponseDto;
  }>;
  consolidado: {
    receitas: DreLinhaDto[];
    custos: DreLinhaDto[];
    despesas: DreLinhaDto[];
    outros: DreLinhaDto[];
    totais: DreTotaisDto;
  };
  geradoEm: Date;
}

export interface DreComparativoDto {
  empresaId: string;
  empresaNome: string;
  periodo1: {
    dataInicio: string;
    dataFim: string;
    dre: DreResponseDto;
  };
  periodo2: {
    dataInicio: string;
    dataFim: string;
    dre: DreResponseDto;
  };
  comparativo: {
    receitas: Array<DreLinhaDto & { variacao: number; variacaoPercentual: number }>;
    custos: Array<DreLinhaDto & { variacao: number; variacaoPercentual: number }>;
    despesas: Array<DreLinhaDto & { variacao: number; variacaoPercentual: number }>;
    outros: Array<DreLinhaDto & { variacao: number; variacaoPercentual: number }>;
    totais: DreTotaisDto & {
      variacao: {
        receitas: number;
        custos: number;
        despesas: number;
        outros: number;
        lucroOperacional: number;
        resultadoLiquido: number;
      };
      variacaoPercentual: {
        receitas: number;
        custos: number;
        despesas: number;
        outros: number;
        lucroOperacional: number;
        resultadoLiquido: number;
      };
    };
  };
  geradoEm: Date;
}

export interface FilterDreDto {
  empresaId: string;
  dataInicio: string;
  dataFim: string;
  consolidarPor?: 'empresa' | 'filial';
}

// Conciliação de Movimentações Bancárias
export interface ConciliarMovimentacoesDto {
  movimentacaoIds: string[];
}

export interface ConciliacaoResponse {
  conciliadas?: number;
  desconciliadas?: number;
  erros: string[];
}

// Extrato Bancário
export enum StatusExtratoItem {
  PENDENTE = 'pendente',
  SUGESTAO = 'sugestao',
  CONCILIADO = 'conciliado',
  IGNORADO = 'ignorado',
}

export enum TipoTransacao {
  DEBITO = 'debito',
  CREDITO = 'credito',
}

export enum FormatoExtrato {
  OFX = 'OFX',
  CSV = 'CSV',
}

export interface SugestaoMatch {
  movimentacaoId: string;
  score: number;
  razoes: string[];
  movimentacao: {
    id: string;
    data: Date;
    descricao: string;
    valor: number;
    tipo: string;
  };
}

export interface ExtratoBancario {
  id: string;
  contaBancaria?: {
    id: string;
    descricao: string;
    banco: string;
  };
  dataTransacao: string;
  descricao: string;
  documento?: string;
  valor: number;
  tipoTransacao: TipoTransacao;
  status: StatusExtratoItem;
  movimentacaoSugerida?: {
    id: string;
    descricao: string;
    valor: number;
    dataMovimento: string;
  };
  movimentacaoConciliada?: {
    id: string;
    descricao: string;
    valor: number;
    dataMovimento: string;
  };
  scoreMatch?: number;
  observacao?: string;
  formatoOrigem: string;
  nomeArquivo: string;
  empresaId?: string;
  importadoPor?: string;
  criadoEm: string;
  sugestao?: SugestaoMatch;
}

export interface ImportarExtratoDto {
  contaBancariaId: string;
  formato: FormatoExtrato;
  nomeArquivo: string;
}

export interface ItemExtratoImportado {
  id: string;
  data: Date;
  descricao: string;
  valor: number;
  tipo: TipoTransacao;
  status: StatusExtratoItem;
  sugestao?: SugestaoMatch;
}

export interface ResultadoImportacao {
  totalImportado: number;
  comSugestao: number;
  semSugestao: number;
  itens: ItemExtratoImportado[];
}
