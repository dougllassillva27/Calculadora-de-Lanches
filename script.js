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

// Função para exibir o nome do arquivo carregado e limpar a tela ao carregar um novo arquivo
function displayFileName(inputId, displayId) {
  const fileInput = document.getElementById(inputId);
  const fileNameDisplay = document.getElementById(displayId);
  const resultsDiv = document.getElementById('results'); // Elemento que exibe os resultados

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) {
      fileNameDisplay.textContent = `Arquivo carregado: ${fileInput.files[0].name}`;
      // Limpa a tela ao carregar um novo arquivo
      resultsDiv.innerHTML = '';
    } else {
      fileNameDisplay.textContent = '';
    }
  });
}

// Exibir o nome do arquivo na seção da calculadora de lanches
displayFileName('fileInput', 'calculatorFileName');

// Exibir o nome do arquivo na seção de conversão de arquivos
displayFileName('converterFileInput', 'converterFileName');

// Função de conversão de arquivos
function convertFile() {
  const fileInput = document.getElementById('converterFileInput');
  const file = fileInput.files[0];
  const fileNameDisplay = document.getElementById('converterFileName'); // Elemento que exibe o nome do arquivo

  if (!file) {
    alert('Por favor, carregue um arquivo.');
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    const content = e.target.result;
    let rows;

    // Verificar se é CSV ou Excel
    if (file.name.endsWith('.csv')) {
      rows = content.split('\n').map((row) => row.split(';'));
    } else {
      const data = new Uint8Array(content);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    }

    // Processar arquivo: remover colunas
    const columnsToRemove = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 14, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37];

    const cleanedRows = rows.slice(1).map((row) => row.filter((_, index) => !columnsToRemove.includes(index)));

    // Converter os dados para PRN
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
          return time ? { PIS: pis, Date: date, Time: time } : null;
        })
        .filter((entry) => entry);
    });

    // Preparar conteúdo do PRN
    const prnContent = convertedData.map((row) => [row.PIS, row.Date, row.Time].join(';')).join('\r\n');

    // Baixar arquivo PRN
    const fileName = file.name.replace(/\.[^/.]+$/, '') + '.prn'; // Remove a extensão original e adiciona .prn
    downloadPRN(prnContent, fileName);

    // Limpar o nome do arquivo exibido após o download
    fileNameDisplay.textContent = '';
  };

  if (file.name.endsWith('.csv')) {
    reader.readAsText(file);
  } else {
    reader.readAsArrayBuffer(file);
  }
}

// Função para baixar o arquivo PRN
function downloadPRN(content, fileName) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName; // Usa o nome do arquivo fornecido
  link.click();
  URL.revokeObjectURL(url);
}

// Função de processamento de arquivo para a calculadora de lanches
function processFile() {
  const fileInput = document.getElementById('fileInput');
  const file = fileInput.files[0];
  const loading = document.getElementById('loading');
  const resultsDiv = document.getElementById('results');

  if (!file) {
    alert('Por favor, carregue um arquivo.');
    return;
  }

  // Mostra o ícone de carregamento
  loading.style.display = 'block';

  const reader = new FileReader();

  reader.onload = function (e) {
    const content = e.target.result;

    // Verifica se o arquivo é .prn ou .txt
    if (file.name.endsWith('.prn') || file.name.endsWith('.txt')) {
      const rows = content.split('\n').map((row) => row.split(';')); // Divide as linhas e colunas por ";"
      const results = calculateLunchTimes(rows);
      displayResults(results);
    } else {
      alert('Formato de arquivo não suportado. Por favor, carregue um arquivo .prn ou .txt.');
    }

    // Esconde o ícone de carregamento
    loading.style.display = 'none';
  };

  reader.readAsText(file);
}

function calculateLunchTimes(rows) {
  const results = {};

  // Agrupa as batidas por PIS e data
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

  // Calcula os lanches para cada PIS e data
  for (const pis in results) {
    lunchTimes[pis] = {};
    for (const date in results[pis]) {
      const times = results[pis][date];
      if (times.length >= 7) {
        const morningLunch = calculateTimeDifference(times[2], times[1]);
        const afternoonLunch = calculateTimeDifference(times[6], times[5]);
        lunchTimes[pis][date] = { morningLunch, afternoonLunch };
      } else {
        // Se faltarem batidas, marca como "Não bateu"
        lunchTimes[pis][date] = { morningLunch: 'Não bateu', afternoonLunch: 'Não bateu' };
      }
    }
  }

  return lunchTimes;
}

function calculateTimeDifference(time1, time2) {
  // Verifica se algum dos tempos é '-' ou está vazio
  if (!time1 || !time2 || time1 === '-' || time2 === '-') {
    return 'Não bateu'; // Retorna "Não bateu" se algum dos tempos estiver faltando ou for '-'
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

  // Ordena os PISs alfabeticamente com base no nome
  const sortedPisList = Object.keys(results).sort((a, b) => {
    const nameA = pisToNameMap[a] || `PIS: ${a}`;
    const nameB = pisToNameMap[b] || `PIS: ${b}`;
    return nameA.localeCompare(nameB); // Ordenação alfabética dos nomes
  });

  // Itera sobre os PISs já ordenados
  for (const pis of sortedPisList) {
    const name = pisToNameMap[pis] || `PIS: ${pis}`; // Usa o nome se existir, caso contrário, exibe o PIS
    const pisDiv = document.createElement('div');
    pisDiv.innerHTML = `<h3>${name}</h3>`; // Exibe o nome do funcionário
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
  if (lunchTime === 'Não bateu') return false; // Ignora se não bateu

  const [hours, minutes] = lunchTime.split('h ');
  const totalMinutes = parseInt(hours) * 60 + parseInt(minutes.replace('m', ''));

  return totalMinutes > 15; // Retorna true se o lanche for maior que 15 minutos
}

function clearResults() {
  const resultsDiv = document.getElementById('results');
  const calculatorFileName = document.getElementById('calculatorFileName');
  const converterFileName = document.getElementById('converterFileName');

  // Limpa os resultados da tabela
  resultsDiv.innerHTML = '';

  // Limpa o nome do arquivo exibido na seção da calculadora de lanches
  calculatorFileName.textContent = '';

  // Limpa o nome do arquivo exibido na seção de conversão de arquivos
  converterFileName.textContent = '';
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
