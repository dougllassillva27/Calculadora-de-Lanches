<!--
MIT License

Copyright (c) 2025 Douglas Silva

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
-->

<?php
include_once $_SERVER['DOCUMENT_ROOT'] . '/inc/versao.php';
$base = '/Calculadora-de-Lanches'; // ajuste para o caminho visível no navegador
?>

<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Calculadora de Lanches" />
    <meta name="keywords" content="converter, .csv, lanche, horas, ponto" />
    <meta name="author" content="Douglas Silva" />
    <title>Calculadora de Lanches</title>
    <link rel="icon" type="image/x-icon" href="favicon.ico?v=1" />
    <link rel="stylesheet" href="<?= versao("$base/styles.css") ?>">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" />
    <script src="https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.0/xlsx.full.min.js"></script>
  </head>
  <body>
    <div class="container">
      <!-- Seção da Calculadora de Lanches -->
      <div class="calculator-section">
        <h1>Calculadora de Lanches</h1>
        <div class="upload-section">
          <label for="fileInput" class="custom-file-upload">
            <i class="fas fa-upload"></i>
            Escolher Arquivo
          </label>
          <input type="file" id="fileInput" accept=".prn, .txt, .csv, .xlsx" />
          <button onclick="processFile()">
            <i class="fas fa-play"></i>
            Calcular Lanches
          </button>
        </div>
        <p id="calculatorFileName" class="file-name"></p>
        <div id="filterButtonContainer" style="display: none; text-align: center; margin: 10px 0">
          <button onclick="filterAbove15()" class="btn-filter">
            <i class="fas fa-filter"></i>
            Filtrar acima de 15min
          </button>
          <button onclick="clearFilter()" class="btn-clear-filter" style="margin-left: 10px">
            <i class="fas fa-times"></i>
            Limpar filtro
          </button>
        </div>
        <div id="loading" class="loading" style="display: none">
          <i class="fas fa-spinner fa-spin"></i>
          Processando...
        </div>
        <br />
        <div id="results" class="results"></div>
        <div class="actions">
          <button onclick="clearResults()" class="btn-clear">
            <i class="fas fa-trash"></i>
            Limpar Resultados
          </button>
          <button onclick="exportToCSV()" class="btn-export">
            <i class="fas fa-file-export"></i>
            Exportar para CSV
          </button>
        </div>
      </div>
      <footer id="footer">
        <p>
          Desenvolvido por
          <a href="https://www.linkedin.com/in/dougllassillva27/" target="_blank">Douglas Silva</a>
        </p>
      </footer>
    </div>
    <script src="<?= versao("$base/script.js") ?>"></script>
  </body>
</html>