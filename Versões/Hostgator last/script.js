/*
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
*/

// Controle do estado do filtro
let isFiltered = false;

// Mapeamento dinâmico de PIS para nomes (será preenchido ao processar o arquivo)
let pisToNameMap = {};

// Configura a exibição do nome do arquivo carregado e limpa os resultados ao trocar de arquivo
function displayFileName(inputId, displayId) {
  const fileInput = document.getElementById(inputId);
  const fileNameDisplay = document.getElementById(displayId);
  const resultsDiv = document.getElementById('results');

  // Remove listeners antigos para evitar duplicação
  fileInput.removeEventListener('change', handleFileChange);

  // Função interna que atualiza o nome do arquivo e limpa os resultados
  function handleFileChange() {
    if (fileInput.files.length > 0) {
      fileNameDisplay.textContent = `Arquivo carregado: ${fileInput.files[0].name}`;
      resultsDiv.innerHTML = '';
      toggleFilterButton(false); // Esconde os botões de filtro
      isFiltered = false; // Redefine o estado do filtro
    } else {
      fileNameDisplay.textContent = '';
      resultsDiv.innerHTML = '';
      toggleFilterButton(false); // Esconde os botões de filtro
      isFiltered = false; // Redefine o estado do filtro
    }
  }

  // Adiciona o listener de mudança ao input
  fileInput.addEventListener('change', handleFileChange);

  // Executa imediatamente se já houver um arquivo carregado ao abrir a página
  if (fileInput.files.length > 0) {
    handleFileChange();
  }
}

// Inicializa a função de exibição do nome do arquivo
displayFileName('fileInput', 'calculatorFileName');

// Detecta o separador usado no arquivo CSV (vírgula ou ponto e vírgula)
function detectSeparator(content) {
  const firstLine = content.split('\n')[0];
  if (firstLine.includes(';')) return ';';
  if (firstLine.includes(',')) return ',';
  return ';';
}

// Extrai mapeamento de PIS para nome a partir das colunas D (nome) e G (PIS)
function buildPisToNameMap(rows) {
  const newMap = {};
  rows.forEach((row) => {
    const name = row[3] != null ? String(row[3]).trim() : null; // Coluna D: Nome do funcionário
    const pis = row[6] != null ? String(row[6]).trim() : null; // Coluna G: PIS
    if (pis && name && !newMap[pis]) {
      newMap[pis] = name;
    }
  });
  return newMap;
}

// Processa o arquivo carregado e calcula os tempos de lanche
function processFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  const loading = document.getElementById('loading');
  const resultsDiv = document.getElementById('results');

  if (!file) {
    alert('Por favor, carregue um arquivo.');
    return;
  }

  // Limpa resultados anteriores e redefine estado
  resultsDiv.innerHTML = '';
  toggleFilterButton(false);
  isFiltered = false;

  const fileNameDisplay = document.getElementById('calculatorFileName');
  fileNameDisplay.textContent = `Arquivo carregado: ${file.name}`;

  loading.style.display = 'block';
  const reader = new FileReader();

  reader.onload = function (e) {
    const content = e.target.result;

    try {
      if (file.name.toLowerCase().endsWith('.csv')) {
        const separator = detectSeparator(content);
        const rows = content.split('\n').map((row) => row.split(separator));

        // Construir mapeamento de PIS para nome
        pisToNameMap = buildPisToNameMap(rows);

        // Verifica se o mapeamento contém dados
        if (Object.keys(pisToNameMap).length === 0) {
          throw new Error('Nenhum funcionário encontrado no arquivo. Verifique as colunas de PIS e nome.');
        }

        // Remove colunas desnecessárias e prepara os dados
        const columnsToRemove = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 14, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37];
        const cleanedRows = rows.slice(1).map((row) => row.filter((_, index) => !columnsToRemove.includes(index)));

        // Converte os dados para o formato esperado
        const convertedData = cleanedRows.flatMap((row) => {
          const pis = row[0];
          const date = row[1] ? row[1].replace(/\s[A-Z]+$/, '') : null;

          if (row.slice(2).some((cell) => /Folga|Feriado|Falta|Justificado/i.test(cell))) {
            return [];
          }

          return row
            .slice(2)
            .map((time, index) => {
              if (time) {
                time = time.replace(/\s*\(I\)/i, '');
              }
              return time ? [pis, date, time] : null;
            })
            .filter((entry) => entry);
        });

        const results = calculateLunchTimes(convertedData);
        displayResults(results);
      } else if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
        const data = new Uint8Array(content);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        // Construir mapeamento de PIS para nome
        pisToNameMap = buildPisToNameMap(rows);

        // Verifica se o mapeamento contém dados
        if (Object.keys(pisToNameMap).length === 0) {
          throw new Error('Nenhum funcionário encontrado no arquivo. Verifique as colunas de PIS e nome.');
        }

        const columnsToRemove = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 14, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37];
        const cleanedRows = rows.slice(1).map((row) => row.filter((_, index) => !columnsToRemove.includes(index)));

        const convertedData = cleanedRows.flatMap((row) => {
          const pis = row[0];
          const date = row[1] ? row[1].replace(/\s[A-Z]+$/, '') : null;

          if (row.slice(2).some((cell) => /Folga|Feriado|Falta|Justificado/i.test(cell))) {
            return [];
          }

          return row
            .slice(2)
            .map((time, index) => {
              if (time) {
                time = time.toString().replace(/\s*\(I\)/i, '');
              }
              return time ? [pis, date, time] : null;
            })
            .filter((entry) => entry);
        });

        const results = calculateLunchTimes(convertedData);
        displayResults(results);
      } else if (file.name.toLowerCase().endsWith('.prn') || file.name.toLowerCase().endsWith('.txt')) {
        const rows = content.split('\n').map((row) => row.split(';'));
        pisToNameMap = {};
        const results = calculateLunchTimes(rows);
        displayResults(results);
      } else {
        alert('Formato de arquivo não suportado. Use .csv, .xls, .xlsx, .prn ou .txt.');
      }
    } catch (error) {
      console.error('Erro ao processar o arquivo:', error);
      alert(`Erro ao processar o arquivo: ${error.message}`);
      resultsDiv.innerHTML = '';
      toggleFilterButton(false);
      isFiltered = false;
      loading.style.display = 'none';
      return;
    }

    loading.style.display = 'none';
  };

  if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file);
  }
}

// Calcula os tempos de lanche com base nos horários fornecidos
function calculateLunchTimes(rows) {
  const results = {};

  rows.forEach((row) => {
    const [pis, date, time] = row;
    if (!results[pis]) {
      results[pis] = {};
    }
    if (!results[pis][date]) {
      results[pis][date] = [];
    }
    results[pis][date].push(time.trim());
  });

  const lunchTimes = {};

  for (const pis in results) {
    lunchTimes[pis] = {};
    for (const date in results[pis]) {
      const times = results[pis][date];
      if (times.length >= 7) {
        const morningLunch = calculateTimeDifference(times[2], times[1]);
        const afternoonLunch = calculateTimeDifference(times[6], times[5]);
        lunchTimes[pis][date] = { morningLunch, afternoonLunch };
      } else {
        lunchTimes[pis][date] = { morningLunch: 'Não bateu', afternoonLunch: 'Não bateu' };
      }
    }
  }

  return lunchTimes;
}

// Calcula a diferença entre dois horários no formato HH:MM
function calculateTimeDifference(time1, time2) {
  if (!time1 || !time2 || time1 === '-' || time2 === '-') {
    return 'Não bateu';
  }

  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);

  const totalMinutes1 = h1 * 60 + m1;
  const totalMinutes2 = h2 * 60 + m2;

  const difference = totalMinutes1 - totalMinutes2;
  const hours = Math.floor(difference / 60);
  const minutes = difference % 60;

  return `${hours}h ${minutes}m`;
}

// Exibe os resultados na interface em tabelas organizadas por PIS
function displayResults(results) {
  const resultsDiv = document.getElementById('results');
  resultsDiv.innerHTML = '';

  toggleFilterButton(true);

  const sortedPisList = Object.keys(results).sort((a, b) => {
    const nameA = pisToNameMap[a] || `PIS: ${a}`;
    const nameB = pisToNameMap[b] || `PIS: ${b}`;
    return nameA.localeCompare(nameB);
  });

  for (const pis of sortedPisList) {
    const name = pisToNameMap[pis] || `PIS: ${pis}`;
    const pisDiv = document.createElement('div');
    pisDiv.innerHTML = `<h3>${name}</h3>`;
    resultsDiv.appendChild(pisDiv);

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Data</th>
          <th>Lanche da Manhã</th>
          <th>Lanche da Tarde</th>
        </tr>
      </thead>
      <tbody>
      </tbody>
    `;

    const tbody = table.querySelector('tbody');

    for (const date in results[pis]) {
      const { morningLunch, afternoonLunch } = results[pis][date];
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${date}</td>
        <td class="${isLunchTooLong(morningLunch) ? 'highlight-red' : ''}">${morningLunch}</td>
        <td class="${isLunchTooLong(afternoonLunch) ? 'highlight-red' : ''}">${afternoonLunch}</td>
      `;
      tbody.appendChild(row);
    }

    pisDiv.appendChild(table);
  }
}

// Verifica se o tempo de lanche excede 15 minutos
function isLunchTooLong(lunchTime) {
  if (lunchTime === 'Não bateu') return false;

  const [hours, minutes] = lunchTime.split('h ');
  const totalMinutes = parseInt(hours) * 60 + parseInt(minutes.replace('m', ''));

  return totalMinutes > 15;
}

// Limpa os resultados exibidos e reseta a interface
function clearResults() {
  const resultsDiv = document.getElementById('results');
  const calculatorFileName = document.getElementById('calculatorFileName');
  const fileInput = document.getElementById('fileInput');

  resultsDiv.innerHTML = '';
  toggleFilterButton(false);
  calculatorFileName.textContent = '';
  isFiltered = false;
  fileInput.value = ''; // Limpa o input de arquivo
}

// Exporta os resultados para um arquivo CSV
function exportToCSV() {
  const resultsDiv = document.getElementById('results');
  const tables = resultsDiv.querySelectorAll('table');

  if (tables.length === 0) {
    alert('Nenhum resultado para exportar.');
    return;
  }

  let csvContent = 'Nome,Data,Lanche da Manhã,Lanche da Tarde\n';

  tables.forEach((table) => {
    const name = table.previousElementSibling.textContent;
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach((row) => {
      const [date, morningLunch, afternoonLunch] = row.querySelectorAll('td');
      csvContent += `"${name}",${date.textContent},${morningLunch.textContent},${afternoonLunch.textContent}\n`;
    });
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'lanches.csv';
  link.click();
  URL.revokeObjectURL(url);
}

// Alterna a visibilidade dos botões de filtro
function toggleFilterButton(show) {
  const filterButtonContainer = document.getElementById('filterButtonContainer');
  filterButtonContainer.style.display = show ? 'block' : 'none';
}

// Filtra os lanches exibidos para mostrar apenas os que excedem 15 minutos
function filterAbove15() {
  const tables = document.querySelectorAll('table');
  let hasResults = false;
  isFiltered = true;

  tables.forEach((table) => {
    const pisDiv = table.previousElementSibling;
    let hasVisibleRows = false;
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach((row) => {
      const morningCell = row.querySelector('td:nth-child(2)');
      const afternoonCell = row.querySelector('td:nth-child(3)');

      const showRow = isLunchTooLong(morningCell.textContent) || isLunchTooLong(afternoonCell.textContent);

      row.style.display = showRow ? '' : 'none';
      if (showRow) {
        hasVisibleRows = true;
        hasResults = true;
      }
    });

    pisDiv.style.display = hasVisibleRows ? '' : 'none';
    table.style.display = hasVisibleRows ? '' : 'none';
  });

  if (!hasResults) {
    alert('Nenhum lanche acima de 15 minutos encontrado.');
    clearFilter();
  }
}

// Remove o filtro e restaura a exibição de todos os resultados
function clearFilter() {
  if (!isFiltered) return;

  const tables = document.querySelectorAll('table');

  tables.forEach((table) => {
    const pisDiv = table.previousElementSibling;
    pisDiv.style.display = '';
    table.style.display = '';

    const rows = table.querySelectorAll('tbody tr');
    rows.forEach((row) => {
      row.style.display = '';
    });
  });

  isFiltered = false;
}
