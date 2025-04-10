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

// Lista de funcionários
const pisToNameMap = {
  12647941701: 'ADRIANA SILVA GERTNER',
  12835237692: 'ALESSANDRA MACHADO DO NASCIMENTO',
  13442452790: 'ALINE EMANUELA DE ALMEIDA',
  21415565971: 'BEATRIZ ALONSO CALZADO',
  20945568856: 'CARLOS BISCAIA NETO',
  21234132631: 'ELIZANDRA DE MEIRELES GUILHERME',
  4254159021: 'ERIKA KATIANE OLIVEIRA RODRIGUES',
  3924187037: 'GUILHERME DA CRUZ SANTOS',
  16244765681: 'JENNIFER DANIELLE DE JESUS',
  16271015930: 'JESSICA BITTENCOURT MORAES',
  2154541038: 'JONATAN SANTOS SOUZA',
  27090405520: 'JULIA GRAS DE OLIVEIRA ANTUNES',
  12776657503: 'JULY ANNA LOUISE GONÇALVES',
  12604362696: 'KELEN FABIANA SANTOS DO NASCIMENTO',
  3678545033: 'LUCAS ALEX DE BORBA',
  58771778004: 'MARIA HELENA DOS SANTOS RAMOS',
  6443119916: 'MARIA JANETE RITTER',
  2488909050: 'SILVANA VIDAL ALVES',
  13024990681: 'VERA LUCIA ROSA',
  16629319428: 'WATUZI MACEDO SOARES',
};

// Exibe o nome do arquivo carregado e limpa a tela ao carregar um novo arquivo
function displayFileName(inputId, displayId) {
  const fileInput = document.getElementById(inputId);
  const fileNameDisplay = document.getElementById(displayId);
  const resultsDiv = document.getElementById('results');

  // Remove qualquer listener existente para evitar duplicação
  fileInput.removeEventListener('change', handleFileChange);

  // Define a função de manipulação do evento
  function handleFileChange() {
    if (fileInput.files.length > 0) {
      fileNameDisplay.textContent = `Arquivo carregado: ${fileInput.files[0].name}`;
      resultsDiv.innerHTML = ''; // Limpa os resultados ao carregar um novo arquivo
    } else {
      fileNameDisplay.textContent = '';
    }
  }

  // Adiciona o listener ao input
  fileInput.addEventListener('change', handleFileChange);

  // Executa imediatamente caso já tenha um arquivo selecionado ao carregar a página
  if (fileInput.files.length > 0) {
    handleFileChange();
  }
}

// Chama a função para configurar o listener
displayFileName('fileInput', 'calculatorFileName');

// Função para detectar o separador do CSV
function detectSeparator(content) {
  const firstLine = content.split('\n')[0];
  if (firstLine.includes(';')) return ';';
  if (firstLine.includes(',')) return ',';
  return ';'; // Padrão caso não detecte
}

// Função principal que converte e calcula os lanches
function processFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  const loading = document.getElementById('loading');
  const resultsDiv = document.getElementById('results');

  if (!file) {
    alert('Por favor, carregue um arquivo.');
    return;
  }

  // Atualiza o nome do arquivo imediatamente antes de processar
  const fileNameDisplay = document.getElementById('calculatorFileName');
  fileNameDisplay.textContent = `Arquivo carregado: ${file.name}`;

  loading.style.display = 'block';
  const reader = new FileReader();

  reader.onload = function (e) {
    const content = e.target.result;

    try {
      // Se for .csv ou .xlsx, converte para .prn em memória
      if (file.name.toLowerCase().endsWith('.csv')) {
        const separator = detectSeparator(content);
        const rows = content.split('\n').map((row) => row.split(separator));

        // Processo de conversão para .prn (em memória)
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
                time = time.replace(/\s*\(I\)/i, '');
              }
              return time ? [pis, date, time] : null;
            })
            .filter((entry) => entry);
        });

        // Calcula os lanches com os dados convertidos
        const results = calculateLunchTimes(convertedData);
        displayResults(results);
      } else if (file.name.toLowerCase().endsWith('.xlsx')) {
        const data = new Uint8Array(content);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

        // Processo de conversão para .prn (em memória)
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

        // Calcula os lanches com os dados convertidos
        const results = calculateLunchTimes(convertedData);
        displayResults(results);
      }
      // Se for .prn ou .txt, processa diretamente
      else if (file.name.toLowerCase().endsWith('.prn') || file.name.toLowerCase().endsWith('.txt')) {
        const rows = content.split('\n').map((row) => row.split(';'));
        const results = calculateLunchTimes(rows);
        displayResults(results);
      } else {
        alert('Formato de arquivo não suportado. Use .csv, .xlsx, .prn ou .txt.');
      }
    } catch (error) {
      console.error('Erro ao processar o arquivo:', error);
      alert('Erro ao processar o arquivo. Verifique o formato e tente novamente.');
    }

    loading.style.display = 'none';
  };

  if (file.name.toLowerCase().endsWith('.xlsx')) {
    reader.readAsArrayBuffer(file);
  } else {
    reader.readAsText(file);
  }
}

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

function isLunchTooLong(lunchTime) {
  if (lunchTime === 'Não bateu') return false;

  const [hours, minutes] = lunchTime.split('h ');
  const totalMinutes = parseInt(hours) * 60 + parseInt(minutes.replace('m', ''));

  return totalMinutes > 15;
}

function clearResults() {
  const resultsDiv = document.getElementById('results');
  const calculatorFileName = document.getElementById('calculatorFileName');

  resultsDiv.innerHTML = '';
  toggleFilterButton(false);
  calculatorFileName.textContent = '';
  isFiltered = false;
}

function exportToCSV() {
  const resultsDiv = document.getElementById('results');
  const tables = resultsDiv.querySelectorAll('table');

  if (tables.length === 0) {
    alert('Nenhum resultado para exportar.');
    return;
  }

  let csvContent = 'PIS,Data,Lanche da Manhã,Lanche da Tarde\n';

  tables.forEach((table) => {
    const pis = table.previousElementSibling.textContent.replace('PIS: ', '');
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach((row) => {
      const [date, morningLunch, afternoonLunch] = row.querySelectorAll('td');
      csvContent += `${pis},${date.textContent},${morningLunch.textContent},${afternoonLunch.textContent}\n`;
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

function toggleFilterButton(show) {
  const filterButtonContainer = document.getElementById('filterButtonContainer');
  filterButtonContainer.style.display = show ? 'block' : 'none';
}

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
