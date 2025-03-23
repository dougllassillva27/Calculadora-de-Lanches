// Função para exibir o nome do arquivo carregado
function displayFileName(inputId, displayId) {
  const fileInput = document.getElementById(inputId);
  const fileNameDisplay = document.getElementById(displayId);

  fileInput.addEventListener('change', function () {
    if (fileInput.files.length > 0) {
      fileNameDisplay.textContent = `Arquivo carregado: ${fileInput.files[0].name}`;
    } else {
      fileNameDisplay.textContent = '';
    }
  });
}

// Exibir o nome do arquivo na seção de conversão
displayFileName('converterFileInput', 'converterFileName');

// Exibir o nome do arquivo na seção da calculadora de lanches
displayFileName('fileInput', 'calculatorFileName');

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

// Funções da Calculadora de Lanches (mantidas do código anterior)
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
  resultsDiv.innerHTML = '';

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
        // Se faltarem batidas, marca como "Não bateu"
        lunchTimes[pis][date] = { morningLunch: 'Não bateu', afternoonLunch: 'Não bateu' };
      }
    }
  }

  return lunchTimes;
}

function calculateTimeDifference(time1, time2) {
  if (!time1 || !time2) {
    return 'Não bateu'; // Se alguma batida estiver faltando
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

  for (const pis in results) {
    const pisDiv = document.createElement('div');
    pisDiv.innerHTML = `<h3>PIS: ${pis}</h3>`;
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
  resultsDiv.innerHTML = '';
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
