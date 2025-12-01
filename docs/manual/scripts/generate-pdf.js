#!/usr/bin/env node

/**
 * Script para gerar PDF do Manual do Usuario
 *
 * Uso:
 *   node docs/manual/scripts/generate-pdf.js
 *
 * Requisitos:
 *   npm install -g md-to-pdf
 *   ou
 *   npx md-to-pdf docs/manual/README.md
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MANUAL_DIR = join(__dirname, '..');
const OUTPUT_DIR = join(MANUAL_DIR, 'dist');
const VERSION = process.env.npm_package_version || '1.0.0';
const DATE = new Date().toLocaleDateString('pt-BR');

// Arquivos do manual na ordem correta
const MANUAL_FILES = [
  'README.md',
  '01-cadastros.md',
  '02-lancamentos.md',
  '03-movimentacoes.md',
  '04-relatorios.md'
];

// CSS para estilizacao do PDF
const PDF_STYLES = `
<style>
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #333;
  }

  h1 {
    color: #1a365d;
    border-bottom: 2px solid #1a365d;
    padding-bottom: 10px;
    page-break-before: always;
  }

  h1:first-of-type {
    page-break-before: avoid;
  }

  h2 {
    color: #2c5282;
    margin-top: 30px;
  }

  h3 {
    color: #2b6cb0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    font-size: 10pt;
  }

  th, td {
    border: 1px solid #cbd5e0;
    padding: 8px 12px;
    text-align: left;
  }

  th {
    background-color: #edf2f7;
    font-weight: bold;
  }

  tr:nth-child(even) {
    background-color: #f7fafc;
  }

  code {
    background-color: #edf2f7;
    padding: 2px 6px;
    border-radius: 3px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 10pt;
  }

  pre {
    background-color: #1a202c;
    color: #e2e8f0;
    padding: 15px;
    border-radius: 5px;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.4;
  }

  pre code {
    background-color: transparent;
    padding: 0;
    color: inherit;
  }

  blockquote {
    border-left: 4px solid #4299e1;
    margin: 15px 0;
    padding: 10px 20px;
    background-color: #ebf8ff;
  }

  .cover-page {
    text-align: center;
    padding-top: 200px;
  }

  .cover-title {
    font-size: 32pt;
    color: #1a365d;
    margin-bottom: 20px;
  }

  .cover-subtitle {
    font-size: 18pt;
    color: #4a5568;
    margin-bottom: 40px;
  }

  .cover-version {
    font-size: 14pt;
    color: #718096;
  }

  .page-break {
    page-break-after: always;
  }

  .toc {
    page-break-after: always;
  }

  .toc h2 {
    color: #1a365d;
  }

  .toc ul {
    list-style: none;
    padding-left: 0;
  }

  .toc li {
    margin: 8px 0;
    padding-left: 20px;
  }

  .toc a {
    color: #2b6cb0;
    text-decoration: none;
  }

  @media print {
    .no-print {
      display: none;
    }
  }
</style>
`;

// Capa do documento
const COVER_PAGE = `
<div class="cover-page">
  <div class="cover-title">Manual do Usuario</div>
  <div class="cover-subtitle">Sistema Financeiro</div>
  <div class="cover-version">
    Versao ${VERSION}<br>
    ${DATE}
  </div>
</div>
<div class="page-break"></div>
`;

// Indice
const TABLE_OF_CONTENTS = `
<div class="toc">
  <h2>Indice</h2>
  <ul>
    <li><strong>1. Introducao</strong></li>
    <li><strong>2. Primeiros Passos</strong></li>
    <li><strong>3. Modulo de Cadastros</strong>
      <ul>
        <li>3.1 Cadastro de Empresas</li>
        <li>3.2 Cadastro de Pessoas</li>
        <li>3.3 Plano de Contas</li>
        <li>3.4 Contas Bancarias</li>
      </ul>
    </li>
    <li><strong>4. Modulo de Lancamentos</strong>
      <ul>
        <li>4.1 Contas a Pagar</li>
        <li>4.2 Contas a Receber</li>
        <li>4.3 Lancamentos Parcelados</li>
      </ul>
    </li>
    <li><strong>5. Modulo de Baixas e Movimentacoes</strong>
      <ul>
        <li>5.1 Registro de Baixas</li>
        <li>5.2 Movimentacoes Bancarias</li>
        <li>5.3 Conciliacao Bancaria</li>
        <li>5.4 Estornos</li>
      </ul>
    </li>
    <li><strong>6. Modulo de Relatorios</strong>
      <ul>
        <li>6.1 DRE - Demonstrativo de Resultado</li>
        <li>6.2 Fluxo de Caixa</li>
        <li>6.3 Relatorios de Contas</li>
        <li>6.4 Exportacao e Impressao</li>
      </ul>
    </li>
    <li><strong>7. Perguntas Frequentes</strong></li>
  </ul>
</div>
<div class="page-break"></div>
`;

function ensureDirectoryExists(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function readManualFiles() {
  let content = '';

  for (const file of MANUAL_FILES) {
    const filePath = join(MANUAL_DIR, file);
    if (existsSync(filePath)) {
      const fileContent = readFileSync(filePath, 'utf-8');
      content += fileContent + '\n\n---\n\n';
      console.log(`  Lido: ${file}`);
    } else {
      console.warn(`  Aviso: ${file} nao encontrado`);
    }
  }

  return content;
}

function generateCombinedMarkdown() {
  console.log('Gerando arquivo Markdown combinado...');

  const content = readManualFiles();
  const combinedPath = join(OUTPUT_DIR, 'manual-completo.md');

  // Adiciona metadados para md-to-pdf
  const metadata = `---
title: Manual do Usuario - Sistema Financeiro
author: Sistema Financeiro
date: ${DATE}
version: ${VERSION}
---

`;

  writeFileSync(combinedPath, metadata + content);
  console.log(`  Salvo: ${combinedPath}`);

  return combinedPath;
}

function generateHTMLVersion() {
  console.log('Gerando versao HTML...');

  const content = readManualFiles();
  const htmlPath = join(OUTPUT_DIR, 'manual.html');

  // Converte Markdown basico para HTML
  let html = content
    // Headers
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    // Bold e Italic
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    // Line breaks
    .replace(/\n\n/g, '</p><p>')
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    // Lists
    .replace(/^\- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)\n(<li>)/g, '$1$2');

  const fullHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Manual do Usuario - Sistema Financeiro v${VERSION}</title>
  ${PDF_STYLES}
</head>
<body>
  ${COVER_PAGE}
  ${TABLE_OF_CONTENTS}
  <p>${html}</p>
</body>
</html>`;

  writeFileSync(htmlPath, fullHTML);
  console.log(`  Salvo: ${htmlPath}`);

  return htmlPath;
}

function generatePDFWithMdToPdf(markdownPath) {
  console.log('Gerando PDF com md-to-pdf...');

  try {
    const pdfPath = join(OUTPUT_DIR, `manual-usuario-v${VERSION}.pdf`);

    // Tenta usar md-to-pdf
    execSync(`npx md-to-pdf "${markdownPath}" --dest "${pdfPath}"`, {
      stdio: 'inherit'
    });

    console.log(`  PDF gerado: ${pdfPath}`);
    return pdfPath;
  } catch (error) {
    console.log('  md-to-pdf nao disponivel, usando metodo alternativo...');
    return null;
  }
}

function main() {
  console.log('='.repeat(50));
  console.log('Geracao do Manual do Usuario - Sistema Financeiro');
  console.log(`Versao: ${VERSION}`);
  console.log(`Data: ${DATE}`);
  console.log('='.repeat(50));
  console.log('');

  // Cria diretorio de saida
  ensureDirectoryExists(OUTPUT_DIR);

  // Gera arquivos
  const markdownPath = generateCombinedMarkdown();
  const htmlPath = generateHTMLVersion();

  // Tenta gerar PDF
  const pdfPath = generatePDFWithMdToPdf(markdownPath);

  console.log('');
  console.log('='.repeat(50));
  console.log('Geracao concluida!');
  console.log('');
  console.log('Arquivos gerados:');
  console.log(`  - ${markdownPath}`);
  console.log(`  - ${htmlPath}`);
  if (pdfPath) {
    console.log(`  - ${pdfPath}`);
  } else {
    console.log('');
    console.log('Para gerar o PDF, instale md-to-pdf:');
    console.log('  npm install -g md-to-pdf');
    console.log('  ou');
    console.log('  npx md-to-pdf docs/manual/dist/manual-completo.md');
  }
  console.log('='.repeat(50));
}

main();
