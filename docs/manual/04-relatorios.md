# Guia Detalhado - Modulo de Relatorios

**Versao:** 1.0.0

---

## Sumario

1. [DRE - Demonstrativo de Resultado](#1-dre---demonstrativo-de-resultado)
2. [Fluxo de Caixa](#2-fluxo-de-caixa)
3. [Relatorios de Contas](#3-relatorios-de-contas)
4. [Exportacao e Impressao](#4-exportacao-e-impressao)

---

## 1. DRE - Demonstrativo de Resultado

### 1.1 O que e o DRE?

O **DRE (Demonstrativo de Resultado do Exercicio)** apresenta o resultado financeiro da empresa em um periodo, mostrando se houve **lucro** ou **prejuizo**.

```
+--------------------------------------------------+
| ESTRUTURA BASICA DO DRE                          |
+--------------------------------------------------+
|                                                  |
|   RECEITA BRUTA                                 |
|   (-) Deducoes da Receita                       |
|   (=) RECEITA LIQUIDA                           |
|   (-) Custos                                    |
|   (=) LUCRO BRUTO                               |
|   (-) Despesas Operacionais                     |
|   (=) LUCRO OPERACIONAL                         |
|   (+/-) Resultado Financeiro                    |
|   (=) LUCRO LIQUIDO                             |
|                                                  |
+--------------------------------------------------+
```

### 1.2 Acessando o DRE

```
PASSO 1: Navegacao
+--------------------------------------------------+
| MENU LATERAL                                     |
| > Relatorios                                     |
|   > DRE  <-- Clique aqui                        |
+--------------------------------------------------+

PASSO 2: Configurar parametros
+--------------------------------------------------+
|            RELATORIO DRE                         |
+--------------------------------------------------+
| FILTROS                                          |
|--------------------------------------------------|
| Empresa*:     [Empresa Exemplo LTDA__|v]        |
|               [x] Incluir filiais               |
|                                                  |
| Periodo*:                                        |
| Data Inicio:  [01/01/2024]                      |
| Data Fim:     [31/12/2024]                      |
|                                                  |
| Consolidar por:                                  |
| (x) Empresa    ( ) Filial    ( ) Total          |
|                                                  |
|               [Gerar Relatorio]                 |
+--------------------------------------------------+
```

### 1.3 Modelo de DRE Completo

```
+--------------------------------------------------+
|     DRE - DEMONSTRATIVO DE RESULTADO             |
+--------------------------------------------------+
| Empresa: Empresa Exemplo LTDA                   |
| Periodo: 01/01/2024 a 31/12/2024                |
+--------------------------------------------------+
|                                         VALOR    |
|--------------------------------------------------|
| 1. RECEITA OPERACIONAL BRUTA                    |
|    1.1 Vendas de Produtos          120.000,00   |
|    1.2 Prestacao de Servicos        30.000,00   |
|    ----------------------------------------------|
|    TOTAL RECEITA BRUTA             150.000,00   |
|                                                  |
| 2. DEDUCOES DA RECEITA                          |
|    2.1 Impostos sobre Vendas       (15.000,00)  |
|    2.2 Devolucoes                   (2.000,00)  |
|    ----------------------------------------------|
|    TOTAL DEDUCOES                  (17.000,00)  |
|                                                  |
| 3. RECEITA OPERACIONAL LIQUIDA     133.000,00   |
|    ==============================================|
|                                                  |
| 4. CUSTOS                                       |
|    4.1 CMV (Custo Mercad. Vend.)   (50.000,00)  |
|    4.2 Custo dos Servicos          (10.000,00)  |
|    ----------------------------------------------|
|    TOTAL CUSTOS                    (60.000,00)  |
|                                                  |
| 5. LUCRO BRUTO                      73.000,00   |
|    ==============================================|
|                                                  |
| 6. DESPESAS OPERACIONAIS                        |
|    6.1 Despesas Administrativas                 |
|        - Aluguel                    (12.000,00) |
|        - Energia/Agua               (3.600,00)  |
|        - Material Escritorio        (1.200,00)  |
|    6.2 Despesas com Pessoal                     |
|        - Salarios                   (24.000,00) |
|        - Encargos                   (7.200,00)  |
|        - Beneficios                 (4.000,00)  |
|    6.3 Despesas Comerciais                      |
|        - Marketing                  (3.000,00)  |
|        - Comissoes                  (5.000,00)  |
|    ----------------------------------------------|
|    TOTAL DESPESAS                  (60.000,00)  |
|                                                  |
| 7. LUCRO OPERACIONAL                13.000,00   |
|    ==============================================|
|                                                  |
| 8. RESULTADO FINANCEIRO                         |
|    8.1 Receitas Financeiras          1.500,00   |
|        - Juros Recebidos               500,00   |
|        - Rendimentos                 1.000,00   |
|    8.2 Despesas Financeiras         (3.500,00)  |
|        - Juros Pagos                (2.000,00)  |
|        - Tarifas Bancarias          (1.500,00)  |
|    ----------------------------------------------|
|    TOTAL RESULTADO FINANCEIRO       (2.000,00)  |
|                                                  |
| 9. LUCRO LIQUIDO DO EXERCICIO       11.000,00   |
|    ==============================================|
|                                                  |
+--------------------------------------------------+
|         [Exportar PDF]    [Exportar Excel]      |
+--------------------------------------------------+
```

### 1.4 Indicadores do DRE

| Indicador | Formula | Interpretacao |
|-----------|---------|---------------|
| Margem Bruta | Lucro Bruto / Receita Liquida | % de lucro sobre vendas |
| Margem Operacional | Lucro Operacional / Receita Liquida | Eficiencia operacional |
| Margem Liquida | Lucro Liquido / Receita Liquida | Rentabilidade final |

```
+--------------------------------------------------+
| INDICADORES DE DESEMPENHO                        |
+--------------------------------------------------+
| Margem Bruta:        54,9% (73.000/133.000)     |
| Margem Operacional:   9,8% (13.000/133.000)     |
| Margem Liquida:       8,3% (11.000/133.000)     |
+--------------------------------------------------+
```

### 1.5 DRE Comparativo

Compare dois periodos lado a lado:

```
+--------------------------------------------------+
|            DRE COMPARATIVO                       |
+--------------------------------------------------+
|                    | 2024      | 2023      | Var |
|--------------------|-----------|-----------|-----|
| Receita Bruta      | 150.000   | 130.000   | +15%|
| (-) Deducoes       | (17.000)  | (15.000)  | +13%|
| Receita Liquida    | 133.000   | 115.000   | +16%|
| (-) Custos         | (60.000)  | (55.000)  | +9% |
| Lucro Bruto        | 73.000    | 60.000    | +22%|
| (-) Despesas       | (60.000)  | (52.000)  | +15%|
| Lucro Operacional  | 13.000    | 8.000     | +63%|
| Resultado Financ.  | (2.000)   | (1.500)   | +33%|
| LUCRO LIQUIDO      | 11.000    | 6.500     | +69%|
+--------------------------------------------------+
```

---

## 2. Fluxo de Caixa

### 2.1 O que e Fluxo de Caixa?

O **Fluxo de Caixa** demonstra as entradas e saidas de recursos financeiros, mostrando a disponibilidade de dinheiro da empresa.

### 2.2 Diferenca entre DRE e Fluxo de Caixa

| Aspecto | DRE | Fluxo de Caixa |
|---------|-----|----------------|
| Regime | Competencia (fato gerador) | Caixa (pagamento/recebimento) |
| Foco | Resultado (lucro/prejuizo) | Liquidez (disponibilidade) |
| Vendas a prazo | Receita no momento da venda | Entrada quando recebe |
| Compras a prazo | Despesa no momento da compra | Saida quando paga |

```
+--------------------------------------------------+
| EXEMPLO: VENDA A PRAZO                           |
+--------------------------------------------------+
| Venda em 01/06 de R$ 1.000 com recebimento 01/07|
|                                                  |
| DRE de Junho:                                   |
|   Receita: +R$ 1.000 (regime competencia)       |
|                                                  |
| Fluxo de Caixa Junho:                           |
|   Entrada: R$ 0 (ainda nao recebeu)             |
|                                                  |
| Fluxo de Caixa Julho:                           |
|   Entrada: +R$ 1.000 (momento do recebimento)   |
+--------------------------------------------------+
```

### 2.3 Acessando o Fluxo de Caixa

```
+--------------------------------------------------+
|            RELATORIO FLUXO DE CAIXA              |
+--------------------------------------------------+
| FILTROS                                          |
|--------------------------------------------------|
| Empresa*:     [Empresa Exemplo LTDA__|v]        |
|                                                  |
| Periodo*:                                        |
| Data Inicio:  [01/06/2024]                      |
| Data Fim:     [30/06/2024]                      |
|                                                  |
| Visao:                                          |
| [x] Realizado    [x] Previsto                   |
|                                                  |
| Agrupar por:                                    |
| ( ) Dia    (x) Semana    ( ) Mes               |
|                                                  |
|               [Gerar Relatorio]                 |
+--------------------------------------------------+
```

### 2.4 Modelo de Fluxo de Caixa

```
+--------------------------------------------------+
|              FLUXO DE CAIXA                      |
+--------------------------------------------------+
| Empresa: Empresa Exemplo LTDA                   |
| Periodo: Junho/2024                             |
+--------------------------------------------------+
|                    |  PREVISTO  |  REALIZADO    |
|--------------------|------------|---------------|
| SALDO INICIAL      |  10.000,00 |   10.000,00   |
|                    |            |               |
| (+) ENTRADAS       |            |               |
|   Vendas a vista   |  15.000,00 |   14.500,00   |
|   Recebimentos     |  25.000,00 |   23.800,00   |
|   Outras entradas  |   2.000,00 |    2.200,00   |
|   ---------------  |----------- |---------------|
|   Total Entradas   |  42.000,00 |   40.500,00   |
|                    |            |               |
| (-) SAIDAS         |            |               |
|   Fornecedores     | (18.000,00)| (17.200,00)   |
|   Salarios         | (12.000,00)| (12.000,00)   |
|   Impostos         |  (4.000,00)|  (3.800,00)   |
|   Despesas fixas   |  (3.000,00)|  (2.950,00)   |
|   Outras saidas    |  (1.500,00)|  (1.400,00)   |
|   ---------------  |----------- |---------------|
|   Total Saidas     | (38.500,00)| (37.350,00)   |
|                    |            |               |
| SALDO FINAL        |  13.500,00 |   13.150,00   |
+--------------------------------------------------+
| Variacao: -R$ 350,00 (-2,6%)                    |
+--------------------------------------------------+
```

### 2.5 Fluxo de Caixa Diario

```
+--------------------------------------------------+
|           FLUXO DE CAIXA DIARIO                  |
+--------------------------------------------------+
| Periodo: 01/06/2024 a 07/06/2024                |
+--------------------------------------------------+
| Data  | Entradas | Saidas   | Saldo    | Acum.  |
|-------|----------|----------|----------|--------|
| 01/06 | 3.000    | (1.500)  | +1.500   | 11.500 |
| 02/06 | 0        | (800)    | (800)    | 10.700 |
| 03/06 | 5.000    | (2.000)  | +3.000   | 13.700 |
| 04/06 | 2.500    | (500)    | +2.000   | 15.700 |
| 05/06 | 0        | (12.000) | (12.000) | 3.700  |
| 06/06 | 8.000    | (1.200)  | +6.800   | 10.500 |
| 07/06 | 1.500    | (300)    | +1.200   | 11.700 |
+--------------------------------------------------+
| Saldo Inicial: R$ 10.000                        |
| Saldo Final:   R$ 11.700                        |
+--------------------------------------------------+
```

### 2.6 Grafico do Fluxo de Caixa

```
+--------------------------------------------------+
| EVOLUCAO DO SALDO                                |
+--------------------------------------------------+
|                                                  |
| 16k |                                            |
| 14k |         *                                  |
| 12k |   *         *           *                  |
| 10k | *               *   *       *   *          |
|  8k |                                            |
|  6k |                                            |
|  4k |                   *                        |
|  2k |                                            |
|   0 +------------------------------------------- |
|     01  02  03  04  05  06  07  (dias)          |
|                                                  |
| Legenda: * = Saldo do dia                       |
+--------------------------------------------------+
```

### 2.7 Indicadores do Fluxo de Caixa

| Indicador | Formula | Uso |
|-----------|---------|-----|
| Saldo Final | Inicial + Entradas - Saidas | Disponibilidade |
| Cobertura | Saldo / Media Saidas Diarias | Dias de operacao |
| Variacao | (Realizado - Previsto) / Previsto | Aderencia ao planejado |

---

## 3. Relatorios de Contas

### 3.1 Relatorio de Contas a Pagar

```
+--------------------------------------------------+
|          CONTAS A PAGAR - ANALITICO              |
+--------------------------------------------------+
| Periodo: 01/06/2024 a 30/06/2024                |
| Status: Todos                                    |
+--------------------------------------------------+
| Fornecedor    | Doc.   | Venc.  | Valor   | St. |
|---------------|--------|--------|---------|-----|
| Fornecedor A  | NF-100 | 05/06  | 800,00  | PG  |
| Fornecedor A  | NF-123 | 15/06  | 1.500,00| PG  |
| Fornecedor B  | NF-150 | 20/06  | 3.200,00| PE  |
| Fornecedor C  | NF-180 | 25/06  | 2.100,00| PE  |
| Receita Fed.  | DAS-06 | 20/06  | 1.200,00| PE  |
+--------------------------------------------------+
| RESUMO                                          |
|--------------------------------------------------|
| Total Pagos:     R$ 2.300,00    (2 titulos)    |
| Total Pendentes: R$ 6.500,00    (3 titulos)    |
| Total Vencidos:  R$ 0,00        (0 titulos)    |
| TOTAL GERAL:     R$ 8.800,00    (5 titulos)    |
+--------------------------------------------------+
```

### 3.2 Relatorio de Contas a Receber

```
+--------------------------------------------------+
|          CONTAS A RECEBER - ANALITICO            |
+--------------------------------------------------+
| Periodo: 01/06/2024 a 30/06/2024                |
| Status: Todos                                    |
+--------------------------------------------------+
| Cliente       | Doc.    | Venc.  | Valor   | St.|
|---------------|---------|--------|---------|-----|
| Cliente X     | PED-001 | 10/06  | 2.500,00| RE |
| Cliente Y     | PED-002 | 15/06  | 1.800,00| RE |
| Cliente Z     | PED-003 | 20/06  | 3.000,00| PE |
| Cliente X     | PED-004 | 25/06  | 1.500,00| PE |
+--------------------------------------------------+
| RESUMO                                          |
|--------------------------------------------------|
| Total Recebidos: R$ 4.300,00   (2 titulos)     |
| Total Pendentes: R$ 4.500,00   (2 titulos)     |
| Total Vencidos:  R$ 0,00       (0 titulos)     |
| TOTAL GERAL:     R$ 8.800,00   (4 titulos)     |
+--------------------------------------------------+
```

### 3.3 Aging (Vencimentos)

Relatorio de vencimentos por faixa:

```
+--------------------------------------------------+
|          AGING - CONTAS A RECEBER                |
+--------------------------------------------------+
| Data Base: 15/06/2024                           |
+--------------------------------------------------+
| Faixa           | Qtd | Valor     | %           |
|-----------------|-----|-----------|-------------|
| A vencer 0-30   |  5  | 12.000,00 | 40%         |
| A vencer 31-60  |  3  |  8.000,00 | 27%         |
| A vencer 61-90  |  2  |  5.000,00 | 17%         |
| A vencer >90    |  1  |  2.000,00 |  7%         |
|-----------------|-----|-----------|-------------|
| Vencido 1-30    |  1  |  1.500,00 |  5%         |
| Vencido 31-60   |  1  |  1.000,00 |  3%         |
| Vencido >60     |  0  |      0,00 |  0%         |
|-----------------|-----|-----------|-------------|
| TOTAL           | 13  | 29.500,00 | 100%        |
+--------------------------------------------------+
```

### 3.4 Relatorio por Plano de Contas

```
+--------------------------------------------------+
|      MOVIMENTACAO POR PLANO DE CONTAS            |
+--------------------------------------------------+
| Periodo: Junho/2024                             |
+--------------------------------------------------+
| Conta                        | Entradas | Saidas |
|------------------------------|----------|--------|
| 1. RECEITAS                  |          |        |
|   1.1 Receitas Operacionais  |          |        |
|       1.1.01 Vendas Produtos | 25.000   |        |
|       1.1.02 Vendas Servicos |  8.000   |        |
|   1.2 Receitas Financeiras   |          |        |
|       1.2.01 Juros Recebidos |    500   |        |
|------------------------------|----------|--------|
| 2. DESPESAS                  |          |        |
|   2.1 Despesas Operacionais  |          |        |
|       2.1.01 Aluguel         |          |  1.000 |
|       2.1.02 Energia         |          |    300 |
|   2.2 Despesas com Pessoal   |          |        |
|       2.2.01 Salarios        |          | 12.000 |
|       2.2.02 Encargos        |          |  3.600 |
|------------------------------|----------|--------|
| TOTAIS                       | 33.500   | 16.900 |
+--------------------------------------------------+
```

---

## 4. Exportacao e Impressao

### 4.1 Formatos Disponiveis

| Formato | Extensao | Uso Recomendado |
|---------|----------|-----------------|
| PDF | .pdf | Impressao, arquivo, envio |
| Excel | .xlsx | Analises, graficos |
| CSV | .csv | Integracao sistemas |

### 4.2 Exportar para PDF

```
+--------------------------------------------------+
| OPCOES DE EXPORTACAO PDF                         |
+--------------------------------------------------+
| Orientacao:                                     |
| (x) Retrato    ( ) Paisagem                     |
|                                                  |
| Tamanho:                                        |
| (x) A4    ( ) Carta    ( ) Legal               |
|                                                  |
| Incluir:                                        |
| [x] Cabecalho com logo                         |
| [x] Data de geracao                            |
| [x] Numero de paginas                          |
| [ ] Assinatura digital                         |
|                                                  |
|               [Exportar PDF]                    |
+--------------------------------------------------+
```

### 4.3 Exportar para Excel

```
+--------------------------------------------------+
| OPCOES DE EXPORTACAO EXCEL                       |
+--------------------------------------------------+
| Formato:                                        |
| (x) .xlsx (Excel 2007+)                        |
| ( ) .xls (Excel 97-2003)                       |
|                                                  |
| Incluir:                                        |
| [x] Formulas                                   |
| [x] Formatacao                                 |
| [ ] Graficos                                   |
|                                                  |
|               [Exportar Excel]                  |
+--------------------------------------------------+
```

### 4.4 Impressao Direta

```
+--------------------------------------------------+
| OPCOES DE IMPRESSAO                              |
+--------------------------------------------------+
| Impressora: [HP LaserJet Pro____________|v]     |
|                                                  |
| Copias: [1]                                     |
|                                                  |
| Paginas:                                        |
| (x) Todas    ( ) Intervalo: [__] a [__]        |
|                                                  |
| [x] Imprimir em cores                          |
| [ ] Imprimir frente e verso                    |
|                                                  |
|               [Imprimir]                        |
+--------------------------------------------------+
```

### 4.5 Agendamento de Relatorios

Configure envio automatico de relatorios:

```
+--------------------------------------------------+
| AGENDAR ENVIO DE RELATORIO                       |
+--------------------------------------------------+
| Relatorio: DRE Mensal                           |
|                                                  |
| Frequencia:                                     |
| ( ) Diario    (x) Semanal    ( ) Mensal        |
|                                                  |
| Dia/Hora:                                       |
| Segunda-feira as 08:00                          |
|                                                  |
| Destinatarios:                                  |
| [diretor@empresa.com_____________________]     |
| [contador@empresa.com____________________]     |
| [+ Adicionar]                                  |
|                                                  |
| Formato: [PDF v]                               |
|                                                  |
|               [Agendar]                         |
+--------------------------------------------------+
```

---

## Boas Praticas

### Frequencia Recomendada de Analise

| Relatorio | Frequencia | Objetivo |
|-----------|------------|----------|
| Fluxo de Caixa | Diario | Gestao de liquidez |
| Contas a Pagar/Receber | Semanal | Planejamento |
| DRE | Mensal | Resultado |
| DRE Comparativo | Trimestral | Tendencias |

### Dicas para Analise

1. **Compare periodos:** Sempre analise tendencias
2. **Investigue variacoes:** Desvios > 10% merecem atencao
3. **Antecipe problemas:** Fluxo de caixa negativo futuro
4. **Documente decisoes:** Baseie-se em dados

---

## Conclusao

Os relatorios do sistema permitem uma visao completa da saude financeira da empresa. Use-os regularmente para tomar decisoes baseadas em dados.

Para suporte adicional, consulte a equipe de TI ou entre em contato com o suporte tecnico.

