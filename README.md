# Conversor de Arquivos e Calculadora de Lanches

![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)

Uma aplicação web que converte arquivos de ponto (.csv, .xlsx) para formato .prn e calcula tempos de lanche a partir de registros de ponto.

## Funcionalidades

### Conversor de Arquivos

- Converte arquivos .csv ou .xlsx para formato .prn
- Remove colunas desnecessárias automaticamente
- Filtra registros de folga/feriado

### Calculadora de Lanches

- Processa arquivos .prn ou .txt
- Calcula tempo de lanche da manhã e tarde
- Identifica lanches com mais de 15 minutos (destaque em vermelho)
- Filtra por lanches acima de 15 minutos
- Exporta resultados para CSV

## Tecnologias Utilizadas

- HTML5
- CSS3 (com design responsivo)
- JavaScript (ES6)
- Biblioteca SheetJS (xlsx)

## Como Usar

1. **Conversor de Arquivos**:

   - Selecione um arquivo .csv ou .xlsx
   - Clique em "Converter e Baixar"
   - O arquivo convertido (.prn) será baixado automaticamente

2. **Calculadora de Lanches**:
   - Selecione um arquivo .prn ou .txt
   - Clique em "Calcular lanches"
   - Visualize os resultados na tabela
   - Use os filtros ou exporte para CSV se necessário

## Pré-requisitos

- Navegador moderno (Chrome, Firefox, Edge)
- Arquivos de entrada no formato correto

## Instalação

Nenhuma instalação necessária. Basta abrir o arquivo `index.html` em qualquer navegador.

## Capturas de Tela

_(Adicione screenshots da aplicação aqui)_

## Estrutura do Projeto
