# Guia Detalhado - Modulo de Cadastros

**Versao:** 1.0.0

---

## Sumario

1. [Cadastro de Empresas](#1-cadastro-de-empresas)
2. [Cadastro de Pessoas](#2-cadastro-de-pessoas)
3. [Plano de Contas](#3-plano-de-contas)
4. [Contas Bancarias](#4-contas-bancarias)

---

## 1. Cadastro de Empresas

### 1.1 Conceitos Importantes

O sistema suporta uma estrutura **multi-empresa** com dois niveis:

| Tipo | Descricao | Funcao |
|------|-----------|--------|
| **Sede (Matriz)** | Empresa principal do grupo | Consolida dados das filiais |
| **Filial** | Unidade vinculada a uma sede | Opera de forma independente |

### 1.2 Fluxo Visual - Criar Sede

```
+----------------------+     +----------------------+     +----------------------+
|   MENU > CADASTROS   | --> |   LISTA DE EMPRESAS  | --> |   FORM. NOVA SEDE    |
|   > EMPRESAS         |     |   [+ Nova Sede]      |     |   (Preencher dados)  |
+----------------------+     +----------------------+     +----------------------+
                                                                    |
                                                                    v
+----------------------+     +----------------------+     +----------------------+
|   SEDE CRIADA        | <-- |   VALIDACAO          | <-- |   [SALVAR]           |
|   (Lista atualizada) |     |   (CNPJ, campos)     |     |                      |
+----------------------+     +----------------------+     +----------------------+
```

### 1.3 Campos do Formulario - Empresa

#### Dados Basicos (Obrigatorios)

| Campo | Formato | Validacao | Exemplo |
|-------|---------|-----------|---------|
| CNPJ | XX.XXX.XXX/XXXX-XX | Digitos verificadores | 11.444.777/0001-61 |
| Razao Social | Texto (max 200) | Obrigatorio | Empresa Exemplo LTDA |
| Nome Fantasia | Texto (max 100) | Opcional | Exemplo Corp |
| Inscr. Estadual | Texto (max 20) | Formato por UF | 123.456.789.000 |
| Regime Tributario | Selecao | Obrigatorio | Simples Nacional |

#### Regimes Tributarios Disponiveis

```
+--------------------------------------------------+
| REGIMES TRIBUTARIOS                              |
+--------------------------------------------------+
| SIMPLES_NACIONAL    - Micro e pequenas empresas  |
| LUCRO_PRESUMIDO     - Faturamento ate R$ 78 mi   |
| LUCRO_REAL          - Grandes empresas           |
| MEI                 - Microempreendedor Indiv.   |
+--------------------------------------------------+
```

#### Dados de Endereco

| Campo | Formato | Exemplo |
|-------|---------|---------|
| CEP | XXXXX-XXX | 01310-100 |
| Logradouro | Texto | Av. Paulista |
| Numero | Texto | 1000 |
| Complemento | Texto | Sala 101 |
| Bairro | Texto | Bela Vista |
| Cidade | Texto | Sao Paulo |
| UF | 2 letras | SP |

**Dica:** Ao informar o CEP e clicar em "Buscar", os campos de endereco sao preenchidos automaticamente.

### 1.4 Fluxo Visual - Criar Filial

```
IMPORTANTE: Uma filial DEVE estar vinculada a uma sede existente.

+----------------------+     +----------------------+
|   LISTA DE EMPRESAS  | --> |   FORM. NOVA FILIAL  |
|   [+ Nova Filial]    |     |                      |
+----------------------+     +----------------------+
                                      |
                             +--------v--------+
                             | SELECIONAR SEDE |
                             | [Sede X      v] |
                             +-----------------+
                                      |
                             +--------v--------+
                             | PREENCHER DADOS |
                             | DA FILIAL       |
                             +-----------------+
```

### 1.5 Acoes Disponiveis

```
+--------------------------------------------------+
| LISTA DE EMPRESAS                                |
+--------------------------------------------------+
| Empresa Exemplo LTDA        [Editar] [Inativar] |
| > Filial SP Centro          [Editar] [Inativar] |
| > Filial SP Zona Sul        [Editar] [Inativar] |
+--------------------------------------------------+

Acoes:
- Editar: Modifica dados cadastrais
- Inativar: Desativa a empresa (nao exclui dados)
```

### 1.6 Validacoes e Erros Comuns

| Erro | Causa | Solucao |
|------|-------|---------|
| "CNPJ invalido" | Digitos verificadores incorretos | Verifique o numero |
| "CNPJ ja cadastrado" | Empresa duplicada | Use a existente ou verifique |
| "Sede nao encontrada" | Filial sem vinculo | Selecione uma sede valida |

---

## 2. Cadastro de Pessoas

### 2.1 Conceitos

O cadastro de **Pessoas** unifica:
- Clientes
- Fornecedores
- Transportadoras
- Representantes
- Outros contatos

Uma mesma pessoa pode ter multiplas categorias (ex: fornecedor E cliente).

### 2.2 Fluxo Visual - Novo Cadastro

```
+--------------------------------------------------+
|              CADASTRO DE PESSOA                  |
+--------------------------------------------------+
|                                                  |
|  ETAPA 1: Tipo de Pessoa                        |
|  +--------------------------------------------+ |
|  | ( ) Pessoa Fisica    (x) Pessoa Juridica   | |
|  +--------------------------------------------+ |
|                                                  |
|  ETAPA 2: Documento Principal                   |
|  +--------------------------------------------+ |
|  | CPF/CNPJ: [11.444.777/0001-61]            | |
|  | [Validar]                                  | |
|  +--------------------------------------------+ |
|                                                  |
|  ETAPA 3: Dados Completos                       |
|  +--------------------------------------------+ |
|  | (Formulario completo apos validacao)       | |
|  +--------------------------------------------+ |
|                                                  |
+--------------------------------------------------+
```

### 2.3 Campos por Tipo de Pessoa

#### Pessoa Fisica (CPF)

| Campo | Obrigatorio | Validacao |
|-------|-------------|-----------|
| CPF | Sim | 11 digitos + verificador |
| Nome Completo | Sim | Min. 3 caracteres |
| Apelido | Nao | - |
| RG | Nao | Formato livre |
| Data Nascimento | Nao | DD/MM/AAAA |

#### Pessoa Juridica (CNPJ)

| Campo | Obrigatorio | Validacao |
|-------|-------------|-----------|
| CNPJ | Sim | 14 digitos + verificador |
| Razao Social | Sim | Min. 3 caracteres |
| Nome Fantasia | Nao | - |
| Inscr. Estadual | Nao | Formato por UF |
| Inscr. Municipal | Nao | Formato livre |

### 2.4 Categorias de Pessoa

```
+--------------------------------------------------+
| CATEGORIAS (multipla selecao)                   |
+--------------------------------------------------+
| [x] Fornecedor   - Quem vende para voce         |
| [x] Cliente      - Quem compra de voce          |
| [ ] Transportad. - Empresas de transporte       |
| [ ] Funcionario  - Colaboradores                |
| [ ] Outros       - Demais contatos              |
+--------------------------------------------------+
```

### 2.5 Informacoes de Contato

```
+--------------------------------------------------+
| CONTATOS                                         |
+--------------------------------------------------+
| Telefone Principal: [(11) 99999-8888__________] |
| Telefone Secundar.: [(11) 3333-4444___________] |
| Email Principal:    [contato@empresa.com______] |
| Email Financeiro:   [financeiro@empresa.com___] |
| Website:            [www.empresa.com.br_______] |
+--------------------------------------------------+
```

### 2.6 Endereco (Igual ao de Empresas)

O cadastro de endereco segue o mesmo padrao do cadastro de empresas, com busca automatica por CEP.

### 2.7 Listagem e Filtros

```
+--------------------------------------------------+
| PESSOAS CADASTRADAS                    [+ Nova] |
+--------------------------------------------------+
| Filtros:                                        |
| Busca: [________________] Categoria: [Todos v] |
| Tipo: [Todos v]         Status: [Ativos v]     |
+--------------------------------------------------+
| Nome/Razao       | CPF/CNPJ        | Categoria  |
|------------------|-----------------|------------|
| Fornecedor ABC   | 11.444.777/...  | Fornecedor |
| Cliente XYZ      | 529.982.247-25  | Cliente    |
| Empresa 123      | 22.333.444/...  | Forn/Cli   |
+--------------------------------------------------+
```

---

## 3. Plano de Contas

### 3.1 Estrutura Hierarquica

O Plano de Contas organiza as categorias financeiras em 3 niveis:

```
NIVEL 1 (Grupo Principal)
|
+-- NIVEL 2 (Subgrupo)
    |
    +-- NIVEL 3 (Conta Analitica)
```

### 3.2 Tipos de Conta

| Tipo | Simbolo | Uso |
|------|---------|-----|
| RECEITA | + | Entradas de recursos |
| DESPESA | - | Saidas de recursos |
| CUSTO | - | Gastos ligados a producao |

### 3.3 Exemplo de Estrutura Completa

```
+--------------------------------------------------+
| PLANO DE CONTAS - MODELO                         |
+--------------------------------------------------+
|                                                  |
| 1. RECEITAS                           [RECEITA]  |
| |                                                |
| +-- 1.1 Receitas Operacionais                   |
| |   +-- 1.1.01 Vendas de Produtos               |
| |   +-- 1.1.02 Vendas de Servicos               |
| |   +-- 1.1.03 Comissoes Recebidas              |
| |                                                |
| +-- 1.2 Receitas Financeiras                    |
|     +-- 1.2.01 Juros Recebidos                  |
|     +-- 1.2.02 Rendimentos Aplicacoes           |
|     +-- 1.2.03 Descontos Obtidos                |
|                                                  |
| 2. DESPESAS                           [DESPESA]  |
| |                                                |
| +-- 2.1 Despesas Operacionais                   |
| |   +-- 2.1.01 Aluguel                          |
| |   +-- 2.1.02 Energia Eletrica                 |
| |   +-- 2.1.03 Agua e Esgoto                    |
| |   +-- 2.1.04 Telefone e Internet              |
| |                                                |
| +-- 2.2 Despesas com Pessoal                    |
| |   +-- 2.2.01 Salarios                         |
| |   +-- 2.2.02 Encargos Sociais                 |
| |   +-- 2.2.03 Beneficios                       |
| |                                                |
| +-- 2.3 Despesas Administrativas                |
| |   +-- 2.3.01 Material de Escritorio           |
| |   +-- 2.3.02 Servicos Contabeis               |
| |   +-- 2.3.03 Taxas e Licencas                 |
| |                                                |
| +-- 2.4 Despesas Financeiras                    |
|     +-- 2.4.01 Juros Pagos                      |
|     +-- 2.4.02 Tarifas Bancarias                |
|     +-- 2.4.03 IOF                              |
|                                                  |
| 3. CUSTOS                               [CUSTO]  |
| |                                                |
| +-- 3.1 Custo das Mercadorias Vendidas          |
| |   +-- 3.1.01 Compras de Mercadorias           |
| |   +-- 3.1.02 Frete sobre Compras              |
| |                                                |
| +-- 3.2 Custo dos Servicos Prestados            |
|     +-- 3.2.01 Mao de Obra Direta               |
|     +-- 3.2.02 Materiais Aplicados              |
|                                                  |
+--------------------------------------------------+
```

### 3.4 Criar Nova Conta

```
+--------------------------------------------------+
|          NOVA CONTA NO PLANO DE CONTAS           |
+--------------------------------------------------+
| Codigo*:    [2.3.04______________]               |
|                                                  |
| Descricao*: [Despesas com Marketing Digital]     |
|                                                  |
| Tipo*:      [DESPESA_______________|v]           |
|             - RECEITA                            |
|             - DESPESA                            |
|             - CUSTO                              |
|                                                  |
| Nivel*:     [3 - Conta Analitica___|v]           |
|             - 1 - Grupo Principal                |
|             - 2 - Subgrupo                       |
|             - 3 - Conta Analitica                |
|                                                  |
| Conta Pai*: [2.3 - Desp. Administrativas|v]     |
|             (Apenas para nivel 2 ou 3)           |
|                                                  |
| Status:     (x) Ativo    ( ) Inativo            |
+--------------------------------------------------+
|        [Cancelar]          [Salvar]             |
+--------------------------------------------------+
```

### 3.5 Regras de Negocio

| Regra | Descricao |
|-------|-----------|
| Codigo unico | Nao podem existir duas contas com mesmo codigo |
| Hierarquia | Conta nivel 3 precisa ter pai nivel 2 |
| Uso em lancamentos | Apenas contas nivel 3 (analiticas) podem ser usadas |
| Inativacao | Contas com lancamentos nao podem ser excluidas |

### 3.6 Verificar Uso de Conta

Antes de inativar uma conta, verifique se ha lancamentos vinculados:

```
+--------------------------------------------------+
| VERIFICACAO DE USO                               |
+--------------------------------------------------+
| Conta: 2.1.01 - Aluguel                         |
|                                                  |
| Status: EM USO                                  |
|                                                  |
| Lancamentos vinculados:                         |
| - Contas a Pagar: 24 registros                  |
| - Movimentacoes: 12 registros                   |
|                                                  |
| [!] Esta conta nao pode ser excluida.           |
|     Voce pode inativa-la para bloquear          |
|     novos lancamentos.                          |
|                                                  |
|        [Cancelar]        [Inativar]             |
+--------------------------------------------------+
```

---

## 4. Contas Bancarias

### 4.1 Cadastrar Conta Bancaria

```
+--------------------------------------------------+
|          CADASTRO DE CONTA BANCARIA              |
+--------------------------------------------------+
| Empresa*:     [Empresa Exemplo LTDA_____|v]     |
|                                                  |
| Banco*:       [001 - Banco do Brasil____|v]     |
|                                                  |
| Tipo Conta*:  [Conta Corrente___________|v]     |
|               - Conta Corrente                   |
|               - Conta Poupanca                   |
|               - Conta Investimento               |
|                                                  |
| Agencia*:     [1234-5___]                       |
| Conta*:       [12345-6__]                       |
|                                                  |
| Descricao:    [Conta Principal_________]        |
|                                                  |
| Saldo Inicial*: [R$ 10.000,00__________]        |
| Data Saldo*:    [01/01/2024____________]        |
+--------------------------------------------------+
|        [Cancelar]          [Salvar]             |
+--------------------------------------------------+
```

### 4.2 Principais Bancos

```
+--------------------------------------------------+
| CODIGOS DOS PRINCIPAIS BANCOS                    |
+--------------------------------------------------+
| 001 - Banco do Brasil                           |
| 033 - Santander                                 |
| 104 - Caixa Economica Federal                   |
| 237 - Bradesco                                  |
| 341 - Itau                                      |
| 422 - Safra                                     |
| 756 - Sicoob                                    |
| 260 - Nubank                                    |
| 077 - Inter                                     |
| 336 - C6 Bank                                   |
+--------------------------------------------------+
```

### 4.3 Uso das Contas Bancarias

As contas bancarias sao utilizadas em:

1. **Baixas de Contas a Pagar/Receber** - Indica de onde saiu/entrou o dinheiro
2. **Movimentacoes Bancarias** - Registra o historico de transacoes
3. **Conciliacao Bancaria** - Compara sistema vs extrato real
4. **Fluxo de Caixa** - Calcula saldos por conta

---

## Proximos Passos

Apos configurar os cadastros basicos, voce pode:

1. [Lancar Contas a Pagar](./02-lancamentos.md#contas-a-pagar)
2. [Lancar Contas a Receber](./02-lancamentos.md#contas-a-receber)
3. [Registrar Movimentacoes](./03-movimentacoes.md)
4. [Gerar Relatorios](./04-relatorios.md)

