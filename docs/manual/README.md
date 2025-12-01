# Manual do Usuario - Sistema Financeiro

**Versao:** 1.0.0
**Ultima Atualizacao:** Novembro 2024

---

## Indice

1. [Introducao](#1-introducao)
2. [Primeiros Passos](#2-primeiros-passos)
3. [Modulo de Cadastros](#3-modulo-de-cadastros)
4. [Modulo de Lancamentos](#4-modulo-de-lancamentos)
5. [Modulo de Baixas e Movimentacoes](#5-modulo-de-baixas-e-movimentacoes)
6. [Modulo de Relatorios](#6-modulo-de-relatorios)
7. [Perguntas Frequentes](#7-perguntas-frequentes)

---

## 1. Introducao

O Sistema Financeiro e uma aplicacao web completa para gestao financeira empresarial, oferecendo:

- **Gestao Multi-empresa:** Suporte a matriz (sede) e filiais
- **Contas a Pagar e Receber:** Controle completo de obrigacoes e creditos
- **Movimentacoes Bancarias:** Registro e conciliacao de extratos
- **Relatorios Gerenciais:** DRE, Fluxo de Caixa e analises financeiras

### Requisitos do Sistema

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Conexao com internet
- Resolucao minima: 1280x720 pixels

---

## 2. Primeiros Passos

### 2.1 Acessando o Sistema

1. Acesse a URL do sistema no navegador
2. Insira seu **e-mail** e **senha**
3. Clique em **Entrar**

```
+------------------------------------------+
|           SISTEMA FINANCEIRO             |
|                                          |
|   Email: [____________________]          |
|   Senha: [____________________]          |
|                                          |
|           [    ENTRAR    ]               |
+------------------------------------------+
```

### 2.2 Primeiro Acesso - Cadastro de Empresa

No primeiro acesso, voce sera direcionado para o **Onboarding**:

1. Preencha os dados da empresa (CNPJ, Razao Social, etc.)
2. Defina se e uma **Sede** (matriz) ou **Filial**
3. Configure as informacoes fiscais
4. Clique em **Finalizar Cadastro**

### 2.3 Navegacao Principal

O menu lateral esquerdo oferece acesso a todas as funcionalidades:

```
+------------------+------------------------+
| MENU             |                        |
|------------------|                        |
| > Dashboard      |                        |
| > Cadastros      |     AREA DE           |
|   - Empresas     |     TRABALHO          |
|   - Pessoas      |                        |
|   - Plano Contas |                        |
| > Financeiro     |                        |
|   - Contas Pagar |                        |
|   - Contas Receb |                        |
|   - Movimentacoes|                        |
| > Relatorios     |                        |
|   - DRE          |                        |
|   - Fluxo Caixa  |                        |
+------------------+------------------------+
```

---

## 3. Modulo de Cadastros

### 3.1 Cadastro de Empresas

#### Criar Nova Empresa (Sede)

1. Acesse **Cadastros > Empresas**
2. Clique em **+ Nova Sede**
3. Preencha os campos obrigatorios:
   - **CNPJ:** Numero do CNPJ (14 digitos)
   - **Razao Social:** Nome legal da empresa
   - **Nome Fantasia:** Nome comercial
   - **Inscricao Estadual:** Numero da IE (se aplicavel)
   - **Regime Tributario:** Simples Nacional, Lucro Presumido, etc.

```
+--------------------------------------------------+
|              CADASTRO DE EMPRESA                 |
+--------------------------------------------------+
| CNPJ*:           [11.444.777/0001-61]           |
| Razao Social*:   [Empresa Exemplo LTDA_________]|
| Nome Fantasia:   [Empresa Exemplo______________]|
| Inscr. Estadual: [123.456.789.000______________]|
| Regime Tribut.*: [Simples Nacional________|v]   |
+--------------------------------------------------+
| Endereco                                         |
|--------------------------------------------------|
| CEP*:    [01310-100]  [Buscar]                  |
| Logradouro*: [Av. Paulista________________]     |
| Numero*: [1000]    Compl: [Sala 101____]        |
| Bairro*: [Bela Vista_____]                      |
| Cidade*: [Sao Paulo___] UF*: [SP|v]             |
+--------------------------------------------------+
|        [Cancelar]          [Salvar]             |
+--------------------------------------------------+
```

#### Criar Filial

1. Acesse **Cadastros > Empresas**
2. Clique em **+ Nova Filial**
3. Selecione a **Sede** vinculada
4. Preencha os dados da filial

**Importante:** Filiais herdam configuracoes da sede, mas podem ter enderecos e dados fiscais proprios.

### 3.2 Cadastro de Pessoas (Clientes/Fornecedores)

O cadastro de pessoas unifica clientes, fornecedores e outros contatos.

#### Criar Novo Contato

1. Acesse **Cadastros > Pessoas**
2. Clique em **+ Novo Contato**
3. Selecione o **Tipo de Pessoa:**
   - Pessoa Fisica (CPF)
   - Pessoa Juridica (CNPJ)

```
+--------------------------------------------------+
|             CADASTRO DE PESSOA                   |
+--------------------------------------------------+
| Tipo*: ( ) Pessoa Fisica   (x) Pessoa Juridica  |
+--------------------------------------------------+
| CPF/CNPJ*:       [11.444.777/0001-61]           |
| Nome/Razao*:     [Fornecedor ABC LTDA__________]|
| Apelido/Fantasia:[Fornecedor ABC_______________]|
+--------------------------------------------------+
| Categorias (marque todas aplicaveis):           |
| [x] Fornecedor   [ ] Cliente   [ ] Transportad. |
+--------------------------------------------------+
| Contato                                         |
|--------------------------------------------------|
| Telefone:  [(11) 99999-8888_____]               |
| Email:     [contato@fornecedor.com]             |
+--------------------------------------------------+
| Endereco                                         |
|--------------------------------------------------|
| CEP: [01310-100]  Logradouro: [Rua Exemplo, 100]|
| Cidade: [Sao Paulo]  UF: [SP]                   |
+--------------------------------------------------+
|        [Cancelar]          [Salvar]             |
+--------------------------------------------------+
```

#### Funcoes Disponiveis

| Funcao | Descricao |
|--------|-----------|
| **Listar** | Visualiza todos os contatos cadastrados |
| **Filtrar** | Busca por nome, CPF/CNPJ ou categoria |
| **Editar** | Modifica dados de um contato existente |
| **Inativar** | Desativa o contato (nao exclui) |

### 3.3 Plano de Contas

O Plano de Contas organiza as categorias financeiras para classificacao de receitas e despesas.

#### Estrutura Hierarquica

```
1. RECEITAS
   1.1 Receitas Operacionais
       1.1.01 Vendas de Produtos
       1.1.02 Prestacao de Servicos
   1.2 Receitas Financeiras
       1.2.01 Juros Recebidos
       1.2.02 Descontos Obtidos

2. DESPESAS
   2.1 Despesas Operacionais
       2.1.01 Custo das Mercadorias
       2.1.02 Salarios e Encargos
   2.2 Despesas Administrativas
       2.2.01 Aluguel
       2.2.02 Energia Eletrica

3. CUSTOS
   3.1 Custos de Producao
       3.1.01 Materia-Prima
       3.1.02 Mao de Obra Direta
```

#### Criar Nova Conta

1. Acesse **Cadastros > Plano de Contas**
2. Clique em **+ Nova Conta**
3. Preencha:
   - **Codigo:** Identificador hierarquico (ex: 2.1.03)
   - **Descricao:** Nome da conta
   - **Tipo:** RECEITA, DESPESA ou CUSTO
   - **Nivel:** Nivel na hierarquia (1, 2 ou 3)
   - **Conta Pai:** Conta superior (se nivel > 1)

```
+--------------------------------------------------+
|          CADASTRO DE CONTA CONTABIL              |
+--------------------------------------------------+
| Codigo*:    [2.1.03______________]               |
| Descricao*: [Despesas com Marketing]             |
| Tipo*:      [DESPESA_____________|v]             |
| Nivel*:     [3___________________]               |
| Conta Pai:  [2.1 - Desp. Operacionais|v]        |
+--------------------------------------------------+
| Status: (x) Ativo   ( ) Inativo                 |
+--------------------------------------------------+
|        [Cancelar]          [Salvar]             |
+--------------------------------------------------+
```

#### Verificar Uso de Conta

Antes de inativar uma conta, verifique se ela esta em uso:

1. Selecione a conta na lista
2. Clique em **Verificar Uso**
3. O sistema mostrara quantos lancamentos utilizam esta conta

**Nota:** Contas em uso nao podem ser excluidas, apenas inativadas.

---

## 4. Modulo de Lancamentos

### 4.1 Contas a Pagar

Gerencie todas as obrigacoes financeiras da empresa.

#### Lancar Nova Conta a Pagar

1. Acesse **Financeiro > Contas a Pagar**
2. Clique em **+ Novo Lancamento**
3. Preencha os dados:

```
+--------------------------------------------------+
|            LANCAMENTO - CONTA A PAGAR            |
+--------------------------------------------------+
| Empresa*:        [Empresa Exemplo LTDA___|v]    |
| Fornecedor*:     [Fornecedor ABC_________|v]    |
| Plano de Contas*:[2.1.01 - CMV__________|v]     |
+--------------------------------------------------+
| Documento*: [NF-12345____]  Parcela*: [1/3]     |
| Tipo*:      [FORNECEDOR__________________|v]    |
+--------------------------------------------------+
| Descricao*: [Compra de mercadorias - NF 12345]  |
+--------------------------------------------------+
| Valores                                          |
|--------------------------------------------------|
| Valor Principal*: [R$ 1.500,00_____]            |
| Juros:            [R$ 0,00_________]            |
| Multa:            [R$ 0,00_________]            |
| Desconto:         [R$ 0,00_________]            |
+--------------------------------------------------+
| Datas                                            |
|--------------------------------------------------|
| Data Emissao*:    [01/06/2024]                  |
| Data Vencimento*: [15/06/2024]                  |
| Data Lancamento:  [01/06/2024]                  |
+--------------------------------------------------+
|        [Cancelar]          [Salvar]             |
+--------------------------------------------------+
```

#### Tipos de Conta a Pagar

| Tipo | Descricao |
|------|-----------|
| FORNECEDOR | Compras de mercadorias/servicos |
| IMPOSTO | Tributos e taxas |
| FOLHA | Salarios e encargos trabalhistas |
| OUTROS | Demais despesas |

#### Lancar Conta Parcelada

Para criar multiplas parcelas automaticamente:

1. Clique em **+ Novo Parcelado**
2. Informe o **Valor Total**
3. Defina a **Quantidade de Parcelas**
4. Informe a data do **Primeiro Vencimento**
5. Defina o **Intervalo entre Parcelas** (dias)

```
+--------------------------------------------------+
|         LANCAMENTO PARCELADO - PAGAR             |
+--------------------------------------------------+
| Valor Total*:          [R$ 6.000,00____]        |
| Qtd. Parcelas*:        [6______________]        |
| Primeiro Vencimento*:  [15/07/2024_____]        |
| Intervalo (dias)*:     [30_____________]        |
+--------------------------------------------------+
| Previa das Parcelas:                            |
| 1/6 - R$ 1.000,00 - Venc: 15/07/2024           |
| 2/6 - R$ 1.000,00 - Venc: 14/08/2024           |
| 3/6 - R$ 1.000,00 - Venc: 13/09/2024           |
| 4/6 - R$ 1.000,00 - Venc: 13/10/2024           |
| 5/6 - R$ 1.000,00 - Venc: 12/11/2024           |
| 6/6 - R$ 1.000,00 - Venc: 12/12/2024           |
+--------------------------------------------------+
```

### 4.2 Contas a Receber

Gerencie todos os creditos e recebiveis da empresa.

#### Lancar Nova Conta a Receber

1. Acesse **Financeiro > Contas a Receber**
2. Clique em **+ Novo Lancamento**
3. O formulario e similar ao de Contas a Pagar

#### Tipos de Conta a Receber

| Tipo | Descricao |
|------|-----------|
| DUPLICATA | Vendas a prazo |
| BOLETO | Cobrancas bancarias |
| CARTAO | Vendas em cartao de credito |
| OUTROS | Demais receitas |

#### Venda Parcelada (Exemplo)

```
Venda de R$ 3.000,00 em 3x:

+--------------------------------------------------+
|         LANCAMENTO PARCELADO - RECEBER           |
+--------------------------------------------------+
| Cliente*:              [Cliente XYZ____|v]      |
| Documento*:            [PED-5678_______]        |
| Valor Total*:          [R$ 3.000,00____]        |
| Qtd. Parcelas*:        [3______________]        |
| Primeiro Vencimento*:  [15/08/2024_____]        |
+--------------------------------------------------+
| Parcelas Geradas:                               |
| Parc 1/3: R$ 1.000,00 - 15/08/2024 - PENDENTE  |
| Parc 2/3: R$ 1.000,00 - 15/09/2024 - PENDENTE  |
| Parc 3/3: R$ 1.000,00 - 15/10/2024 - PENDENTE  |
+--------------------------------------------------+
```

### 4.3 Status dos Lancamentos

| Status | Cor | Descricao |
|--------|-----|-----------|
| PENDENTE | Amarelo | Aguardando pagamento/recebimento |
| PAGO/RECEBIDO | Verde | Quitado |
| VENCIDO | Vermelho | Prazo expirado sem quitacao |
| CANCELADO | Cinza | Lancamento cancelado |

---

## 5. Modulo de Baixas e Movimentacoes

### 5.1 Registrar Baixa (Pagamento/Recebimento)

#### Baixar Conta a Pagar

1. Acesse **Financeiro > Contas a Pagar**
2. Localize a conta desejada
3. Clique no icone **$** (Baixar)
4. Preencha os dados da baixa:

```
+--------------------------------------------------+
|              REGISTRO DE BAIXA                   |
+--------------------------------------------------+
| Conta: NF-12345 - Fornecedor ABC                |
| Valor Original: R$ 1.500,00                     |
| Vencimento: 15/06/2024                          |
+--------------------------------------------------+
| Data do Pagamento*: [15/06/2024____]            |
| Valor Pago*:        [R$ 1.500,00___]            |
| Conta Bancaria*:    [Banco Brasil - CC|v]       |
+--------------------------------------------------+
| Acrescimos/Descontos                            |
|--------------------------------------------------|
| Juros:    [R$ 0,00____]                         |
| Multa:    [R$ 0,00____]                         |
| Desconto: [R$ 0,00____]                         |
+--------------------------------------------------+
|        [Cancelar]       [Confirmar Baixa]       |
+--------------------------------------------------+
```

#### Estornar Baixa

Caso um pagamento/recebimento tenha sido registrado por engano:

1. Localize a conta ja baixada
2. Clique em **Estornar**
3. Confirme a operacao

**Importante:** O estorno retorna o status para PENDENTE e permite nova baixa.

### 5.2 Movimentacoes Bancarias

Registre todas as entradas e saidas nas contas bancarias.

#### Criar Movimentacao

1. Acesse **Financeiro > Movimentacoes Bancarias**
2. Clique em **+ Nova Movimentacao**

```
+--------------------------------------------------+
|            MOVIMENTACAO BANCARIA                 |
+--------------------------------------------------+
| Conta Bancaria*: [Banco Brasil - CC 12345|v]    |
| Tipo*:          ( ) Entrada   (x) Saida         |
+--------------------------------------------------+
| Data*:        [15/06/2024____]                  |
| Valor*:       [R$ 1.500,00___]                  |
| Descricao*:   [Pag. NF-12345 - Fornecedor ABC]  |
| Categoria*:   [Fornecedores_____________|v]     |
+--------------------------------------------------+
|        [Cancelar]          [Salvar]             |
+--------------------------------------------------+
```

#### Tipos de Movimentacao

| Tipo | Simbolo | Descricao |
|------|---------|-----------|
| Entrada | + | Creditos (depositos, recebimentos) |
| Saida | - | Debitos (pagamentos, transferencias) |

### 5.3 Conciliacao Bancaria

A conciliacao vincula movimentacoes do sistema com o extrato bancario real.

#### Processo de Conciliacao

1. Acesse **Financeiro > Movimentacoes Bancarias**
2. Selecione o periodo desejado
3. Marque as movimentacoes que conferem com o extrato
4. Clique em **Conciliar Selecionadas**

```
+--------------------------------------------------+
|            CONCILIACAO BANCARIA                  |
+--------------------------------------------------+
| Conta: Banco Brasil - CC 12345                  |
| Periodo: 01/06/2024 a 30/06/2024                |
+--------------------------------------------------+
| [ ] | Data       | Tipo    | Valor      | Desc  |
|-----|------------|---------|------------|-------|
| [x] | 01/06/2024 | Entrada | R$ 5.000   | Dep.  |
| [x] | 05/06/2024 | Saida   | R$ 1.500   | Pag.  |
| [ ] | 10/06/2024 | Entrada | R$ 2.000   | Rec.  |
| [x] | 15/06/2024 | Saida   | R$ 800     | Trans.|
+--------------------------------------------------+
| Saldo Sistema: R$ 4.700,00                      |
| Saldo Extrato: R$ 4.700,00                      |
+--------------------------------------------------+
|    [Conciliar Selecionadas]    [Desconciliar]   |
+--------------------------------------------------+
```

---

## 6. Modulo de Relatorios

### 6.1 DRE - Demonstrativo de Resultado

O DRE apresenta o resultado financeiro do periodo, mostrando receitas, despesas e lucro/prejuizo.

#### Gerar DRE

1. Acesse **Relatorios > DRE**
2. Selecione a **Empresa** (ou consolidado)
3. Defina o **Periodo** (data inicio e fim)
4. Clique em **Gerar Relatorio**

```
+--------------------------------------------------+
|     DRE - DEMONSTRATIVO DE RESULTADO             |
+--------------------------------------------------+
| Empresa: Empresa Exemplo LTDA                   |
| Periodo: 01/01/2024 a 31/12/2024                |
+--------------------------------------------------+
|                                                  |
| 1. RECEITA BRUTA                    150.000,00  |
|    1.1 Vendas de Produtos            120.000,00 |
|    1.2 Prestacao de Servicos          30.000,00 |
|                                                  |
| 2. (-) DEDUCOES                      (15.000,00)|
|    2.1 Impostos sobre Vendas         (15.000,00)|
|                                                  |
| 3. (=) RECEITA LIQUIDA              135.000,00  |
|                                                  |
| 4. (-) CUSTOS                        (60.000,00)|
|    4.1 CMV                           (50.000,00)|
|    4.2 Custo dos Servicos            (10.000,00)|
|                                                  |
| 5. (=) LUCRO BRUTO                   75.000,00  |
|                                                  |
| 6. (-) DESPESAS OPERACIONAIS         (45.000,00)|
|    6.1 Despesas Administrativas      (25.000,00)|
|    6.2 Despesas com Pessoal          (20.000,00)|
|                                                  |
| 7. (=) LUCRO OPERACIONAL             30.000,00  |
|                                                  |
| 8. (+/-) RESULTADO FINANCEIRO         (2.000,00)|
|    8.1 Receitas Financeiras            1.000,00 |
|    8.2 Despesas Financeiras           (3.000,00)|
|                                                  |
| 9. (=) LUCRO LIQUIDO                 28.000,00  |
+--------------------------------------------------+
|         [Exportar PDF]    [Exportar Excel]      |
+--------------------------------------------------+
```

#### Opcoes de Consolidacao

| Opcao | Descricao |
|-------|-----------|
| Por Empresa | Resultado individual de cada empresa |
| Consolidado | Soma de todas as empresas do grupo |
| Comparativo | Compara dois periodos lado a lado |

### 6.2 Fluxo de Caixa

O Fluxo de Caixa demonstra as entradas e saidas de recursos financeiros.

#### Gerar Fluxo de Caixa

1. Acesse **Relatorios > Fluxo de Caixa**
2. Selecione a **Empresa**
3. Defina o **Periodo**
4. Escolha a **Visao** (Realizado, Previsto ou Ambos)
5. Clique em **Gerar Relatorio**

```
+--------------------------------------------------+
|              FLUXO DE CAIXA                      |
+--------------------------------------------------+
| Empresa: Empresa Exemplo LTDA                   |
| Periodo: Junho/2024                             |
+--------------------------------------------------+
|                    |  Previsto  |  Realizado    |
|--------------------|------------|---------------|
| SALDO INICIAL      |  10.000,00 |   10.000,00   |
|                    |            |               |
| (+) ENTRADAS       |  50.000,00 |   48.500,00   |
|   Vendas           |  45.000,00 |   43.000,00   |
|   Recebimentos     |   5.000,00 |    5.500,00   |
|                    |            |               |
| (-) SAIDAS         | (35.000,00)| (33.200,00)   |
|   Fornecedores     | (20.000,00)| (18.500,00)   |
|   Salarios         | (10.000,00)| (10.000,00)   |
|   Impostos         |  (3.000,00)|  (2.800,00)   |
|   Outros           |  (2.000,00)|  (1.900,00)   |
|                    |            |               |
| (=) SALDO FINAL    |  25.000,00 |   25.300,00   |
+--------------------------------------------------+
| Variacao: +R$ 300,00 (+1,2%)                    |
+--------------------------------------------------+
```

#### Indicadores do Fluxo de Caixa

| Indicador | Formula | Interpretacao |
|-----------|---------|---------------|
| Saldo Final | Inicial + Entradas - Saidas | Disponibilidade de caixa |
| Total Entradas | Soma de creditos | Volume de recebimentos |
| Total Saidas | Soma de debitos | Volume de pagamentos |
| Variacao | Realizado - Previsto | Aderencia ao planejado |

### 6.3 Exportacao de Relatorios

Todos os relatorios podem ser exportados em diferentes formatos:

| Formato | Uso Recomendado |
|---------|-----------------|
| **PDF** | Impressao, arquivo, apresentacoes |
| **Excel** | Analises adicionais, graficos personalizados |
| **CSV** | Integracao com outros sistemas |

---

## 7. Perguntas Frequentes

### Cadastros

**P: Posso excluir uma empresa?**
R: Nao. Empresas com movimentacao nao podem ser excluidas, apenas inativadas.

**P: Como alterar o CNPJ de uma empresa?**
R: O CNPJ nao pode ser alterado apos o cadastro. Crie uma nova empresa se necessario.

**P: Quantas filiais posso cadastrar?**
R: Nao ha limite de filiais por sede no sistema.

### Lancamentos

**P: Posso editar uma conta ja baixada?**
R: Nao. E necessario estornar a baixa primeiro, editar e baixar novamente.

**P: Como lancar uma despesa parcelada no cartao?**
R: Use a funcao "Novo Parcelado" em Contas a Pagar, selecionando o tipo adequado.

**P: E possivel vincular automaticamente lancamentos com movimentacoes?**
R: Sim, ao registrar a baixa e informar a conta bancaria, a movimentacao e sugerida.

### Relatorios

**P: Por que o DRE esta diferente do Fluxo de Caixa?**
R: O DRE usa regime de competencia (data do fato), enquanto o Fluxo de Caixa usa regime de caixa (data do pagamento/recebimento).

**P: Como comparar resultados de periodos diferentes?**
R: Use a opcao "Comparativo" nos relatorios, selecionando dois periodos.

**P: Os relatorios consideram contas canceladas?**
R: Nao. Contas canceladas sao excluidas dos relatorios.

---

## Suporte

Em caso de duvidas ou problemas:

- **Email:** suporte@sistemafinanceiro.com.br
- **Telefone:** (11) 3000-0000
- **Chat:** Disponivel no sistema (icone de mensagem)

---

**Sistema Financeiro v1.0.0**
Desenvolvido com React, TypeScript e Node.js

