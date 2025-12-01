# Guia Detalhado - Modulo de Lancamentos

**Versao:** 1.0.0

---

## Sumario

1. [Contas a Pagar](#1-contas-a-pagar)
2. [Contas a Receber](#2-contas-a-receber)
3. [Lancamentos Parcelados](#3-lancamentos-parcelados)
4. [Gestao de Status](#4-gestao-de-status)

---

## 1. Contas a Pagar

### 1.1 Visao Geral

O modulo de **Contas a Pagar** gerencia todas as obrigacoes financeiras da empresa:
- Pagamentos a fornecedores
- Impostos e tributos
- Folha de pagamento
- Despesas diversas

### 1.2 Fluxo de Trabalho

```
+-------------+     +-------------+     +-------------+     +-------------+
|   LANCAR    | --> |   PENDENTE  | --> |   BAIXAR    | --> |    PAGO     |
|   (criar)   |     |   (aguarda) |     |   (pagar)   |     |   (quitado) |
+-------------+     +-------------+     +-------------+     +-------------+
                          |                                       |
                          v                                       v
                    +-------------+                         +-------------+
                    |  CANCELAR   |                         |  ESTORNAR   |
                    +-------------+                         +-------------+
```

### 1.3 Criar Novo Lancamento

#### Passo a Passo Visual

```
PASSO 1: Acessar o modulo
+--------------------------------------------------+
| MENU LATERAL                                     |
| > Financeiro                                     |
|   > Contas a Pagar  <-- Clique aqui             |
+--------------------------------------------------+

PASSO 2: Iniciar novo lancamento
+--------------------------------------------------+
| CONTAS A PAGAR                      [+ Novo]    |
|                                     ^            |
|                                     |            |
|                              Clique aqui         |
+--------------------------------------------------+

PASSO 3: Preencher formulario
+--------------------------------------------------+
|            NOVO LANCAMENTO - PAGAR               |
+--------------------------------------------------+
| DADOS DO TITULO                                  |
|--------------------------------------------------|
| Empresa*:        [Selecione______________|v]    |
| Fornecedor*:     [Selecione______________|v]    |
| Plano de Contas*:[Selecione______________|v]    |
+--------------------------------------------------+
| IDENTIFICACAO                                    |
|--------------------------------------------------|
| Documento*:      [NF-12345___________]          |
| Parcela*:        [1] / [1]  (parcela/total)     |
| Tipo*:           [FORNECEDOR_________|v]        |
|                  - FORNECEDOR                    |
|                  - IMPOSTO                       |
|                  - FOLHA                         |
|                  - OUTROS                        |
+--------------------------------------------------+
| DESCRICAO                                        |
|--------------------------------------------------|
| [Compra de material de escritorio - NF 12345]   |
| (Maximo 500 caracteres)                         |
+--------------------------------------------------+
| VALORES                                          |
|--------------------------------------------------|
| Valor Principal*: [R$ 1.500,00_______]          |
| Juros:            [R$ 0,00___________]          |
| Multa:            [R$ 0,00___________]          |
| Desconto:         [R$ 0,00___________]          |
|--------------------------------------------------|
| VALOR TOTAL:        R$ 1.500,00                 |
+--------------------------------------------------+
| DATAS                                            |
|--------------------------------------------------|
| Data Emissao*:      [01/06/2024]                |
| Data Vencimento*:   [15/06/2024]                |
| Data Lancamento:    [01/06/2024] (auto)         |
+--------------------------------------------------+
|        [Cancelar]          [Salvar]             |
+--------------------------------------------------+
```

### 1.4 Campos Detalhados

#### Empresa
Selecione a empresa responsavel pelo pagamento. Pode ser a sede ou uma filial.

#### Fornecedor/Pessoa
Selecione o credor (quem vai receber o pagamento). Deve estar previamente cadastrado em **Pessoas**.

#### Plano de Contas
Classifica a despesa para fins de relatorio. Exemplos:
- 2.1.01 - Fornecedores
- 2.2.01 - Salarios
- 2.3.01 - Impostos

#### Documento
Numero do documento fiscal ou referencia:
- NF-12345 (Nota Fiscal)
- BOL-001 (Boleto)
- FAT-2024/06 (Fatura)

#### Tipo de Conta

| Tipo | Quando Usar | Exemplos |
|------|-------------|----------|
| FORNECEDOR | Compras de produtos/servicos | NFs de fornecedores |
| IMPOSTO | Tributos e taxas | ICMS, ISS, PIS, COFINS |
| FOLHA | Despesas com pessoal | Salarios, FGTS, INSS |
| OUTROS | Demais despesas | Aluguel, energia |

### 1.5 Listagem de Contas a Pagar

```
+--------------------------------------------------+
| CONTAS A PAGAR                       [+ Novo]   |
+--------------------------------------------------+
| Filtros:                                        |
| Periodo: [01/06/2024] a [30/06/2024]           |
| Status: [Todos v]  Empresa: [Todas v]          |
| Fornecedor: [_______________] [Buscar]         |
+--------------------------------------------------+
| Doc.    | Fornecedor  | Venc.     | Valor  | St |
|---------|-------------|-----------|--------|-----|
| NF-123  | Fornec. A   | 15/06/24  | 1.500  | PE |
| NF-124  | Fornec. B   | 20/06/24  | 3.200  | PE |
| NF-100  | Fornec. C   | 05/06/24  | 800    | PG |
| NF-099  | Fornec. D   | 01/06/24  | 2.100  | VE |
+--------------------------------------------------+
| Legenda: PE=Pendente  PG=Pago  VE=Vencido  CA=Cancelado |
+--------------------------------------------------+
| Total Pendente: R$ 4.700,00                     |
| Total Vencido:  R$ 2.100,00                     |
+--------------------------------------------------+
```

### 1.6 Acoes por Registro

```
+--------------------------------------------------+
| Acoes disponiveis (menu de contexto ou icones): |
+--------------------------------------------------+
| [Visualizar] - Abre detalhes em modo leitura    |
| [Editar]     - Modifica dados (se PENDENTE)     |
| [Baixar $]   - Registra pagamento               |
| [Cancelar]   - Cancela o lancamento             |
| [Duplicar]   - Cria copia do lancamento         |
+--------------------------------------------------+
```

---

## 2. Contas a Receber

### 2.1 Visao Geral

O modulo de **Contas a Receber** gerencia todos os creditos da empresa:
- Vendas a prazo
- Prestacao de servicos
- Outras receitas

### 2.2 Fluxo de Trabalho

```
+-------------+     +-------------+     +-------------+     +-------------+
|   LANCAR    | --> |   PENDENTE  | --> |  RECEBER    | --> |  RECEBIDO   |
|   (venda)   |     |   (aguarda) |     |  (creditar) |     |   (quitado) |
+-------------+     +-------------+     +-------------+     +-------------+
                          |                                       |
                          v                                       v
                    +-------------+                         +-------------+
                    |  CANCELAR   |                         |  ESTORNAR   |
                    +-------------+                         +-------------+
```

### 2.3 Criar Novo Lancamento

```
+--------------------------------------------------+
|            NOVO LANCAMENTO - RECEBER             |
+--------------------------------------------------+
| DADOS DO TITULO                                  |
|--------------------------------------------------|
| Empresa*:        [Selecione______________|v]    |
| Cliente*:        [Selecione______________|v]    |
| Plano de Contas*:[Selecione______________|v]    |
+--------------------------------------------------+
| IDENTIFICACAO                                    |
|--------------------------------------------------|
| Documento*:      [PED-5678___________]          |
| Serie:           [1__]                          |
| Parcela*:        [1] / [1]                      |
| Tipo*:           [DUPLICATA________|v]          |
|                  - DUPLICATA                     |
|                  - BOLETO                        |
|                  - CARTAO                        |
|                  - OUTROS                        |
+--------------------------------------------------+
| DESCRICAO                                        |
|--------------------------------------------------|
| [Venda de equipamento - Pedido 5678]            |
+--------------------------------------------------+
| VALORES                                          |
|--------------------------------------------------|
| Valor Principal*: [R$ 2.500,00_______]          |
| Juros:            [R$ 0,00___________]          |
| Multa:            [R$ 0,00___________]          |
| Desconto:         [R$ 0,00___________]          |
|--------------------------------------------------|
| VALOR TOTAL:        R$ 2.500,00                 |
+--------------------------------------------------+
| DATAS                                            |
|--------------------------------------------------|
| Data Emissao*:      [01/07/2024]                |
| Data Vencimento*:   [15/07/2024]                |
+--------------------------------------------------+
|        [Cancelar]          [Salvar]             |
+--------------------------------------------------+
```

### 2.4 Tipos de Conta a Receber

| Tipo | Quando Usar | Caracteristicas |
|------|-------------|-----------------|
| DUPLICATA | Vendas a prazo | Titulo comercial |
| BOLETO | Cobranca bancaria | Registro em banco |
| CARTAO | Vendas no cartao | Recebimento parcelado |
| OUTROS | Demais receitas | Flexivel |

---

## 3. Lancamentos Parcelados

### 3.1 Quando Usar

Use lancamentos parcelados para:
- Compras financiadas
- Vendas parceladas
- Contratos com pagamentos mensais

### 3.2 Contas a Pagar Parceladas

```
+--------------------------------------------------+
|         LANCAMENTO PARCELADO - PAGAR             |
+--------------------------------------------------+
| DADOS BASICOS                                    |
|--------------------------------------------------|
| Empresa*:        [Empresa Exemplo_______|v]     |
| Fornecedor*:     [Fornecedor ABC________|v]     |
| Plano de Contas*:[2.1.01 - Fornecedores_|v]     |
| Documento*:      [NF-999_________________]      |
| Tipo*:           [FORNECEDOR____________|v]     |
| Descricao*:      [Compra parcelada equipamento] |
+--------------------------------------------------+
| CONFIGURACAO DO PARCELAMENTO                     |
|--------------------------------------------------|
| Valor Total*:         [R$ 6.000,00_____]        |
| Qtd. Parcelas*:       [6_______________]        |
| Primeiro Vencimento*: [15/07/2024______]        |
| Intervalo (dias)*:    [30______________]        |
+--------------------------------------------------+
| PREVIA DAS PARCELAS                              |
|--------------------------------------------------|
| Parc | Vencimento | Valor      | Acumulado      |
|------|------------|------------|----------------|
| 1/6  | 15/07/2024 | R$ 1.000   | R$ 1.000      |
| 2/6  | 14/08/2024 | R$ 1.000   | R$ 2.000      |
| 3/6  | 13/09/2024 | R$ 1.000   | R$ 3.000      |
| 4/6  | 13/10/2024 | R$ 1.000   | R$ 4.000      |
| 5/6  | 12/11/2024 | R$ 1.000   | R$ 5.000      |
| 6/6  | 12/12/2024 | R$ 1.000   | R$ 6.000      |
+--------------------------------------------------+
|        [Cancelar]          [Gerar Parcelas]     |
+--------------------------------------------------+
```

### 3.3 Contas a Receber Parceladas

```
+--------------------------------------------------+
|         LANCAMENTO PARCELADO - RECEBER           |
+--------------------------------------------------+
| DADOS BASICOS                                    |
|--------------------------------------------------|
| Empresa*:        [Empresa Exemplo_______|v]     |
| Cliente*:        [Cliente XYZ___________|v]     |
| Plano de Contas*:[1.1.01 - Vendas_______|v]     |
| Documento*:      [PED-1234_______________]      |
| Serie:           [1______________________]      |
| Tipo*:           [DUPLICATA_____________|v]     |
| Descricao*:      [Venda parcelada - Pedido 1234]|
+--------------------------------------------------+
| CONFIGURACAO DO PARCELAMENTO                     |
|--------------------------------------------------|
| Valor Total*:         [R$ 3.000,00_____]        |
| Qtd. Parcelas*:       [3_______________]        |
| Primeiro Vencimento*: [15/08/2024______]        |
+--------------------------------------------------+
| PREVIA DAS PARCELAS                              |
|--------------------------------------------------|
| Parc | Vencimento | Valor      | Status         |
|------|------------|------------|----------------|
| 1/3  | 15/08/2024 | R$ 1.000   | PENDENTE      |
| 2/3  | 15/09/2024 | R$ 1.000   | PENDENTE      |
| 3/3  | 15/10/2024 | R$ 1.000   | PENDENTE      |
+--------------------------------------------------+
|        [Cancelar]          [Gerar Parcelas]     |
+--------------------------------------------------+
```

### 3.4 Gerenciando Parcelas

Apos gerar as parcelas, cada uma aparece como um lancamento individual:

```
+--------------------------------------------------+
| CONTAS A RECEBER - DOCUMENTO PED-1234           |
+--------------------------------------------------+
| Doc.      | Parc | Vencimento | Valor   | Status |
|-----------|------|------------|---------|--------|
| PED-1234  | 1/3  | 15/08/2024 | 1.000   | RECEB. |
| PED-1234  | 2/3  | 15/09/2024 | 1.000   | PEND.  |
| PED-1234  | 3/3  | 15/10/2024 | 1.000   | PEND.  |
+--------------------------------------------------+
```

Cada parcela pode ser:
- Baixada individualmente
- Editada (se pendente)
- Cancelada

---

## 4. Gestao de Status

### 4.1 Ciclo de Vida dos Lancamentos

```
                    CRIACAO
                       |
                       v
+--------------------------------------------------+
|                   PENDENTE                       |
|                                                  |
| Acoes disponiveis:                              |
| - Editar dados                                  |
| - Registrar baixa (pagamento/recebimento)       |
| - Cancelar lancamento                           |
+--------------------------------------------------+
        |                           |
        | (Baixar)                  | (Cancelar)
        v                           v
+------------------+        +------------------+
|   PAGO/RECEBIDO  |        |    CANCELADO     |
|                  |        |                  |
| Acoes:           |        | Acoes:           |
| - Visualizar     |        | - Visualizar     |
| - Estornar       |        | (imutavel)       |
+------------------+        +------------------+
        |
        | (Estornar)
        v
+------------------+
|    PENDENTE      |
| (volta ao inicio)|
+------------------+
```

### 4.2 Status e Cores

| Status | Cor | Significado |
|--------|-----|-------------|
| PENDENTE | Amarelo | Aguardando pagamento/recebimento |
| PAGO | Verde | Conta a pagar quitada |
| RECEBIDO | Verde | Conta a receber quitada |
| VENCIDO | Vermelho | Passou da data sem pagamento |
| CANCELADO | Cinza | Lancamento cancelado |

### 4.3 Cancelamento de Lancamento

```
+--------------------------------------------------+
|            CANCELAR LANCAMENTO                   |
+--------------------------------------------------+
| Documento: NF-12345                             |
| Valor: R$ 1.500,00                              |
| Status atual: PENDENTE                          |
+--------------------------------------------------+
| Justificativa*:                                 |
| [Nota fiscal cancelada pelo fornecedor        ] |
| [________________________________________      ] |
+--------------------------------------------------+
| [!] ATENCAO:                                    |
| Esta acao nao pode ser desfeita.               |
| O lancamento sera marcado como CANCELADO       |
| e nao aparecera nos relatorios financeiros.    |
+--------------------------------------------------+
|        [Voltar]        [Confirmar Cancelamento] |
+--------------------------------------------------+
```

### 4.4 Filtros por Status

```
+--------------------------------------------------+
| FILTROS DE STATUS                               |
+--------------------------------------------------+
| [Todos]     - Mostra todos os lancamentos       |
| [Pendentes] - Apenas aguardando pagamento       |
| [Vencidos]  - Pendentes com data passada        |
| [Pagos]     - Ja quitados                       |
| [Cancelados]- Lancamentos cancelados            |
+--------------------------------------------------+
```

---

## Exemplos Praticos

### Exemplo 1: Compra de Material

**Cenario:** Compra de material de escritorio no valor de R$ 500,00 a vista.

```
1. Acessar: Financeiro > Contas a Pagar > + Novo
2. Preencher:
   - Empresa: Empresa Exemplo LTDA
   - Fornecedor: Papelaria ABC
   - Plano de Contas: 2.3.01 - Material de Escritorio
   - Documento: NF-456
   - Parcela: 1/1
   - Tipo: FORNECEDOR
   - Descricao: Compra de material de escritorio
   - Valor Principal: R$ 500,00
   - Data Emissao: (hoje)
   - Data Vencimento: (hoje)
3. Salvar
4. Baixar (se pago no ato)
```

### Exemplo 2: Venda Parcelada

**Cenario:** Venda de R$ 6.000,00 em 4x para cliente.

```
1. Acessar: Financeiro > Contas a Receber > + Novo Parcelado
2. Preencher:
   - Empresa: Empresa Exemplo LTDA
   - Cliente: Cliente XYZ
   - Plano de Contas: 1.1.01 - Vendas de Produtos
   - Documento: PED-789
   - Serie: 1
   - Tipo: DUPLICATA
   - Descricao: Venda de equipamento
   - Valor Total: R$ 6.000,00
   - Qtd. Parcelas: 4
   - Primeiro Vencimento: 15/07/2024
3. Verificar previa das parcelas
4. Gerar Parcelas

Resultado: 4 lancamentos de R$ 1.500,00 cada
```

### Exemplo 3: Pagamento de Imposto

**Cenario:** DAS do Simples Nacional no valor de R$ 1.200,00.

```
1. Acessar: Financeiro > Contas a Pagar > + Novo
2. Preencher:
   - Empresa: Empresa Exemplo LTDA
   - Fornecedor: Receita Federal (cadastrar se necessario)
   - Plano de Contas: 2.3.01 - Impostos e Taxas
   - Documento: DAS-062024
   - Parcela: 1/1
   - Tipo: IMPOSTO
   - Descricao: DAS Simples Nacional - Junho/2024
   - Valor Principal: R$ 1.200,00
   - Data Vencimento: 20/07/2024
3. Salvar
```

---

## Proximos Passos

Apos lancar as contas, voce pode:

1. [Registrar Baixas](./03-movimentacoes.md#baixas)
2. [Criar Movimentacoes Bancarias](./03-movimentacoes.md#movimentacoes)
3. [Gerar Relatorios](./04-relatorios.md)

