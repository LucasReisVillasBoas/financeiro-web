# Guia Detalhado - Baixas e Movimentacoes Bancarias

**Versao:** 1.0.0

---

## Sumario

1. [Registro de Baixas](#1-registro-de-baixas)
2. [Movimentacoes Bancarias](#2-movimentacoes-bancarias)
3. [Conciliacao Bancaria](#3-conciliacao-bancaria)
4. [Estornos](#4-estornos)

---

## 1. Registro de Baixas

### 1.1 O que e uma Baixa?

A **baixa** e o registro de que uma conta foi efetivamente paga (contas a pagar) ou recebida (contas a receber). E o momento em que o dinheiro sai ou entra na empresa.

```
+--------------------------------------------------+
|              FLUXO DA BAIXA                      |
+--------------------------------------------------+
|                                                  |
|  CONTA PENDENTE                                 |
|       |                                          |
|       v                                          |
|  +----------------+                              |
|  | REGISTRAR      |                              |
|  | BAIXA          |                              |
|  +----------------+                              |
|       |                                          |
|       v                                          |
|  CONTA QUITADA  +  MOVIMENTACAO BANCARIA        |
|                    (opcional)                    |
|                                                  |
+--------------------------------------------------+
```

### 1.2 Baixar Conta a Pagar

#### Passo a Passo

```
PASSO 1: Localizar a conta
+--------------------------------------------------+
| CONTAS A PAGAR                                  |
| Filtros: Status [Pendentes v]                   |
+--------------------------------------------------+
| Doc.    | Fornecedor  | Venc.     | Valor  | Acao|
|---------|-------------|-----------|--------|-----|
| NF-123  | Fornec. A   | 15/06/24  | 1.500  | [$] |
|                                              ^    |
|                                              |    |
|                        Clique no icone $ ----+    |
+--------------------------------------------------+

PASSO 2: Preencher dados da baixa
+--------------------------------------------------+
|              REGISTRAR BAIXA                     |
+--------------------------------------------------+
| INFORMACOES DO TITULO                           |
|--------------------------------------------------|
| Documento:      NF-123                          |
| Fornecedor:     Fornecedor A                    |
| Valor Original: R$ 1.500,00                     |
| Vencimento:     15/06/2024                      |
+--------------------------------------------------+
| DADOS DO PAGAMENTO                               |
|--------------------------------------------------|
| Data Pagamento*:  [15/06/2024_______]           |
| Valor Pago*:      [R$ 1.500,00______]           |
| Conta Bancaria*:  [BB - CC 12345-6__|v]         |
+--------------------------------------------------+
| ACRESCIMOS / DESCONTOS                           |
|--------------------------------------------------|
| Juros:            [R$ 0,00__________]           |
| Multa:            [R$ 0,00__________]           |
| Desconto:         [R$ 0,00__________]           |
|--------------------------------------------------|
| VALOR LIQUIDO:      R$ 1.500,00                 |
+--------------------------------------------------+
| OBSERVACOES                                      |
|--------------------------------------------------|
| [_________________________________________]     |
+--------------------------------------------------+
|        [Cancelar]       [Confirmar Baixa]       |
+--------------------------------------------------+
```

### 1.3 Baixar Conta a Receber

O processo e similar ao de contas a pagar:

```
+--------------------------------------------------+
|              REGISTRAR RECEBIMENTO               |
+--------------------------------------------------+
| INFORMACOES DO TITULO                           |
|--------------------------------------------------|
| Documento:      PED-5678                        |
| Cliente:        Cliente XYZ                     |
| Valor Original: R$ 1.000,00                     |
| Vencimento:     15/08/2024                      |
+--------------------------------------------------+
| DADOS DO RECEBIMENTO                             |
|--------------------------------------------------|
| Data Recebimento*: [15/08/2024______]           |
| Valor Recebido*:   [R$ 1.000,00_____]           |
| Conta Bancaria*:   [BB - CC 12345-6_|v]         |
+--------------------------------------------------+
| ACRESCIMOS / DESCONTOS                           |
|--------------------------------------------------|
| Juros Recebidos:  [R$ 0,00__________]           |
| Multa Recebida:   [R$ 0,00__________]           |
| Desconto Conces.: [R$ 0,00__________]           |
|--------------------------------------------------|
| VALOR LIQUIDO:      R$ 1.000,00                 |
+--------------------------------------------------+
|        [Cancelar]       [Confirmar Recebimento] |
+--------------------------------------------------+
```

### 1.4 Baixa com Juros e Multa

Quando o pagamento ocorre apos o vencimento:

```
+--------------------------------------------------+
| EXEMPLO: PAGAMENTO COM ATRASO                    |
+--------------------------------------------------+
| Valor Original:   R$ 1.000,00                   |
| Vencimento:       01/06/2024                    |
| Data Pagamento:   15/06/2024 (14 dias atraso)   |
|--------------------------------------------------|
| Juros (1% a.m.):  R$ 4,67                       |
| Multa (2%):       R$ 20,00                      |
|--------------------------------------------------|
| VALOR TOTAL PAGO: R$ 1.024,67                   |
+--------------------------------------------------+

No formulario:
| Valor Pago*:      [R$ 1.024,67______]           |
| Juros:            [R$ 4,67__________]           |
| Multa:            [R$ 20,00_________]           |
```

### 1.5 Baixa com Desconto

Quando e concedido desconto para pagamento antecipado:

```
+--------------------------------------------------+
| EXEMPLO: PAGAMENTO COM DESCONTO                  |
+--------------------------------------------------+
| Valor Original:   R$ 1.000,00                   |
| Vencimento:       30/06/2024                    |
| Data Pagamento:   15/06/2024 (15 dias antecip.) |
|--------------------------------------------------|
| Desconto (2%):    R$ 20,00                      |
|--------------------------------------------------|
| VALOR TOTAL PAGO: R$ 980,00                     |
+--------------------------------------------------+

No formulario:
| Valor Pago*:      [R$ 980,00________]           |
| Desconto:         [R$ 20,00_________]           |
```

### 1.6 Baixa Parcial

Quando o cliente paga apenas parte do valor:

```
+--------------------------------------------------+
| [!] ATENCAO: BAIXA PARCIAL                      |
+--------------------------------------------------+
| Valor Original:   R$ 1.000,00                   |
| Valor Recebido:   R$ 600,00                     |
| Saldo Restante:   R$ 400,00                     |
+--------------------------------------------------+
| Opcoes:                                         |
| ( ) Dar baixa total com desconto de R$ 400,00  |
| (x) Dar baixa parcial - manter saldo pendente  |
+--------------------------------------------------+

Resultado: 2 lancamentos
- 1 RECEBIDO (R$ 600,00)
- 1 PENDENTE (R$ 400,00)
```

---

## 2. Movimentacoes Bancarias

### 2.1 Visao Geral

As **movimentacoes bancarias** registram todas as entradas e saidas nas contas bancarias da empresa.

### 2.2 Tipos de Movimentacao

```
+--------------------------------------------------+
| TIPOS DE MOVIMENTACAO                            |
+--------------------------------------------------+
|                                                  |
| ENTRADA (+)                 SAIDA (-)           |
| - Depositos                 - Pagamentos         |
| - Recebimentos              - Transferencias     |
| - Transferencias            - Tarifas            |
| - Creditos                  - Debitos            |
| - Rendimentos               - Saques             |
|                                                  |
+--------------------------------------------------+
```

### 2.3 Criar Movimentacao Manual

```
+--------------------------------------------------+
|            NOVA MOVIMENTACAO BANCARIA            |
+--------------------------------------------------+
| DADOS DA MOVIMENTACAO                            |
|--------------------------------------------------|
| Conta Bancaria*: [BB - CC 12345-6_______|v]     |
|                                                  |
| Tipo*:          ( ) Entrada    (x) Saida        |
|                                                  |
| Data*:          [15/06/2024_____________]       |
|                                                  |
| Valor*:         [R$ 1.500,00____________]       |
|                                                  |
| Descricao*:     [Pagamento NF-123 - Forn. A]    |
|                                                  |
| Categoria*:     [Fornecedores___________|v]     |
|                 - Fornecedores                   |
|                 - Vendas                         |
|                 - Salarios                       |
|                 - Impostos                       |
|                 - Tarifas Bancarias              |
|                 - Outros                         |
+--------------------------------------------------+
|        [Cancelar]          [Salvar]             |
+--------------------------------------------------+
```

### 2.4 Categorias de Movimentacao

| Categoria | Tipo Comum | Exemplos |
|-----------|------------|----------|
| Fornecedores | Saida | Pagamento de NFs |
| Vendas | Entrada | Recebimento de clientes |
| Salarios | Saida | Folha de pagamento |
| Impostos | Saida | DAS, ICMS, ISS |
| Tarifas | Saida | TED, DOC, manutencao |
| Depositos | Entrada | Depositos em especie |
| Transferencias | Ambos | Movimentacao entre contas |

### 2.5 Listagem de Movimentacoes

```
+--------------------------------------------------+
| MOVIMENTACOES BANCARIAS                 [+ Nova] |
+--------------------------------------------------+
| Conta: [BB - CC 12345-6______|v]                |
| Periodo: [01/06/2024] a [30/06/2024]           |
+--------------------------------------------------+
| Data       | Tipo | Descricao         | Valor   |
|------------|------|-------------------|---------|
| 01/06/2024 | E    | Deposito inicial  | +10.000 |
| 05/06/2024 | S    | Pag. NF-100       | -800    |
| 10/06/2024 | E    | Rec. PED-001      | +2.500  |
| 15/06/2024 | S    | Pag. NF-123       | -1.500  |
| 20/06/2024 | S    | Tarifa TED        | -15     |
+--------------------------------------------------+
| SALDO INICIAL:  R$ 0,00                         |
| (+) ENTRADAS:   R$ 12.500,00                    |
| (-) SAIDAS:     R$ 2.315,00                     |
| SALDO FINAL:    R$ 10.185,00                    |
+--------------------------------------------------+
| Legenda: E=Entrada  S=Saida  [v]=Conciliado     |
+--------------------------------------------------+
```

### 2.6 Movimentacao Automatica (Baixas)

Ao registrar uma baixa com conta bancaria, a movimentacao pode ser criada automaticamente:

```
+--------------------------------------------------+
| REGISTRAR BAIXA                                  |
+--------------------------------------------------+
| ...                                              |
| Conta Bancaria*: [BB - CC 12345-6__|v]          |
|                                                  |
| [x] Criar movimentacao bancaria automaticamente |
|                                                  |
+--------------------------------------------------+
```

---

## 3. Conciliacao Bancaria

### 3.1 O que e Conciliacao?

A **conciliacao bancaria** e o processo de comparar as movimentacoes registradas no sistema com o extrato bancario real.

```
+--------------------------------------------------+
|              PROCESSO DE CONCILIACAO             |
+--------------------------------------------------+
|                                                  |
|  SISTEMA                    EXTRATO BANCO       |
|  +--------+                 +--------+          |
|  | Mov. A |   <-- Match --> | Mov. A |          |
|  | Mov. B |   <-- Match --> | Mov. B |          |
|  | Mov. C |   <-- ??? --    |        |          |
|  |        |   --- ??? -->   | Mov. D |          |
|  +--------+                 +--------+          |
|                                                  |
| Mov. C: Esta no sistema mas nao no banco        |
| Mov. D: Esta no banco mas nao no sistema        |
|                                                  |
+--------------------------------------------------+
```

### 3.2 Tela de Conciliacao

```
+--------------------------------------------------+
|            CONCILIACAO BANCARIA                  |
+--------------------------------------------------+
| Conta: BB - CC 12345-6                          |
| Periodo: 01/06/2024 a 30/06/2024                |
+--------------------------------------------------+
| SALDO EXTRATO BANCO:    R$ 10.185,00            |
| SALDO SISTEMA:          R$ 10.185,00            |
| DIFERENCA:              R$ 0,00  [OK]           |
+--------------------------------------------------+
| MOVIMENTACOES PENDENTES DE CONCILIACAO          |
|--------------------------------------------------|
| [ ] | Data       | Desc.           | Valor      |
|-----|------------|-----------------|------------|
| [x] | 01/06/2024 | Dep. inicial    | +10.000,00 |
| [x] | 05/06/2024 | Pag. NF-100     | -800,00    |
| [x] | 10/06/2024 | Rec. PED-001    | +2.500,00  |
| [ ] | 15/06/2024 | Pag. NF-123     | -1.500,00  |
| [x] | 20/06/2024 | Tarifa TED      | -15,00     |
+--------------------------------------------------+
| Selecionadas: 4 movimentacoes                   |
| Valor: R$ 11.685,00                             |
+--------------------------------------------------+
|    [Conciliar Selecionadas]    [Desconciliar]   |
+--------------------------------------------------+
```

### 3.3 Passos da Conciliacao

```
PASSO 1: Obter extrato bancario
+--------------------------------------------------+
| Acesse o internet banking e exporte o extrato   |
| do periodo desejado.                            |
+--------------------------------------------------+

PASSO 2: Acessar conciliacao no sistema
+--------------------------------------------------+
| Menu > Financeiro > Movimentacoes Bancarias     |
| Selecione a conta e clique em [Conciliar]       |
+--------------------------------------------------+

PASSO 3: Comparar e marcar
+--------------------------------------------------+
| Para cada item do extrato:                      |
| 1. Localize a movimentacao correspondente       |
| 2. Marque a checkbox                            |
| 3. Repita para todos os itens                   |
+--------------------------------------------------+

PASSO 4: Confirmar conciliacao
+--------------------------------------------------+
| Clique em [Conciliar Selecionadas]              |
| As movimentacoes serao marcadas como OK         |
+--------------------------------------------------+
```

### 3.4 Tratando Diferencas

#### Movimentacao no sistema que nao esta no banco

```
Possiveis causas:
- Cheque ainda nao compensado
- TED/DOC agendado
- Erro de lancamento

Acoes:
- Aguardar compensacao
- Verificar data da movimentacao
- Excluir se for erro
```

#### Movimentacao no banco que nao esta no sistema

```
Possiveis causas:
- Tarifa bancaria nao lancada
- Debito automatico
- Lancamento esquecido

Acoes:
- Criar movimentacao no sistema
- Vincular a conta a pagar existente
```

### 3.5 Indicadores de Conciliacao

```
+--------------------------------------------------+
| RESUMO DA CONCILIACAO                            |
+--------------------------------------------------+
| Total de movimentacoes:        50               |
| Conciliadas:                   45 (90%)         |
| Pendentes:                     5  (10%)         |
|--------------------------------------------------|
| [|||||||||||||||||||||||||||||||||||       ]    |
|                                          90%     |
+--------------------------------------------------+
```

---

## 4. Estornos

### 4.1 Quando Estornar?

O **estorno** reverte uma baixa ja registrada. Use quando:
- Pagamento/recebimento registrado por engano
- Cheque devolvido
- Valor incorreto
- Necessidade de correcao

### 4.2 Estornar Baixa de Conta a Pagar

```
+--------------------------------------------------+
|              ESTORNAR BAIXA                      |
+--------------------------------------------------+
| INFORMACOES DA CONTA                            |
|--------------------------------------------------|
| Documento:      NF-123                          |
| Fornecedor:     Fornecedor A                    |
| Valor Pago:     R$ 1.500,00                     |
| Data Pagamento: 15/06/2024                      |
| Status Atual:   PAGO                            |
+--------------------------------------------------+
| [!] ATENCAO:                                    |
|                                                  |
| Ao estornar esta baixa:                         |
| - O status voltara para PENDENTE                |
| - A movimentacao bancaria sera removida         |
| - Voce podera editar e registrar nova baixa     |
|                                                  |
+--------------------------------------------------+
| Motivo do Estorno*:                             |
| [Pagamento registrado com valor incorreto     ] |
+--------------------------------------------------+
|        [Cancelar]        [Confirmar Estorno]    |
+--------------------------------------------------+
```

### 4.3 Fluxo do Estorno

```
+--------------------------------------------------+
|              FLUXO DE ESTORNO                    |
+--------------------------------------------------+
|                                                  |
|  CONTA PAGA                                     |
|       |                                          |
|       v                                          |
|  +----------------+                              |
|  | ESTORNAR       |                              |
|  +----------------+                              |
|       |                                          |
|       v                                          |
|  CONTA PENDENTE  +  Movimentacao Removida       |
|       |                                          |
|       v                                          |
|  +----------------+                              |
|  | EDITAR (opc.)  |                              |
|  +----------------+                              |
|       |                                          |
|       v                                          |
|  +----------------+                              |
|  | NOVA BAIXA     |                              |
|  +----------------+                              |
|                                                  |
+--------------------------------------------------+
```

### 4.4 Estorno vs Cancelamento

| Acao | Quando Usar | Resultado |
|------|-------------|-----------|
| **Estorno** | Baixa incorreta | Volta para PENDENTE |
| **Cancelamento** | Lancamento indevido | Status CANCELADO |

```
+--------------------------------------------------+
| DIFERENCA ENTRE ESTORNO E CANCELAMENTO          |
+--------------------------------------------------+
|                                                  |
| ESTORNO:                                        |
| PAGO --> PENDENTE --> pode ser baixado novamente|
|                                                  |
| CANCELAMENTO:                                   |
| PENDENTE --> CANCELADO --> fim do ciclo         |
|                                                  |
+--------------------------------------------------+
```

---

## Exemplos Praticos

### Exemplo 1: Pagar Fornecedor com Desconto

```
Cenario:
- NF-200 de R$ 2.000,00
- Vencimento: 30/06/2024
- Pagamento: 15/06/2024 (antecipado)
- Desconto: 3%

Passos:
1. Localizar NF-200 em Contas a Pagar
2. Clicar em [$] Baixar
3. Preencher:
   - Data Pagamento: 15/06/2024
   - Valor Pago: R$ 1.940,00
   - Desconto: R$ 60,00
4. Confirmar Baixa
```

### Exemplo 2: Receber Cliente com Juros

```
Cenario:
- PED-100 de R$ 1.000,00
- Vencimento: 01/06/2024
- Recebimento: 15/06/2024 (atrasado)
- Juros: 1% ao mes = R$ 5,00
- Multa: 2% = R$ 20,00

Passos:
1. Localizar PED-100 em Contas a Receber
2. Clicar em [$] Receber
3. Preencher:
   - Data Recebimento: 15/06/2024
   - Valor Recebido: R$ 1.025,00
   - Juros Recebidos: R$ 5,00
   - Multa Recebida: R$ 20,00
4. Confirmar Recebimento
```

### Exemplo 3: Conciliar Extrato Mensal

```
Cenario:
- Extrato de junho/2024
- 50 movimentacoes no periodo

Passos:
1. Exportar extrato do internet banking (PDF ou OFX)
2. Acessar Movimentacoes Bancarias
3. Selecionar conta e periodo
4. Clicar em [Conciliar]
5. Para cada linha do extrato:
   - Localizar no sistema
   - Marcar checkbox se conferir
6. Movimentacoes faltantes:
   - Criar manualmente (tarifas, etc)
7. Clicar em [Conciliar Selecionadas]
8. Verificar saldo final = saldo extrato
```

---

## Proximos Passos

Apos dominar baixas e movimentacoes, voce pode:

1. [Gerar Relatorio DRE](./04-relatorios.md#dre)
2. [Gerar Fluxo de Caixa](./04-relatorios.md#fluxo-de-caixa)
3. [Analisar Resultados](./04-relatorios.md#analise)

