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

// Lista de funcionários (mapeamento de PIS para nomes)
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

// Configura a exibição do nome do arquivo carregado e limpa os resultados ao trocar de arquivo
function displayFileName(inputId, displayId) {
  const fileInput = document.getElementById(inputId); // Elemento de input de arquivo
  const fileNameDisplay = document.getElementById(displayId); // Elemento onde o nome do arquivo será exibido
  const resultsDiv = document.getElementById('results'); // Div de resultados

  // Remove listeners antigos para evitar duplicação
  fileInput.removeEventListener('change', handleFileChange);

  // Função interna que atualiza o nome do arquivo e limpa os resultados
  function handleFileChange() {
    if (fileInput.files.length > 0) {
      fileNameDisplay.textContent = `Arquivo carregado: ${fileInput.files[0].name}`; // Exibe o nome do arquivo
      resultsDiv.innerHTML = ''; // Limpa os resultados ao carregar um novo arquivo
    } else {
      fileNameDisplay.textContent = ''; // Limpa o nome se não houver arquivo
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
  const firstLine = content.split('\n')[0]; // Pega a primeira linha do arquivo
  if (firstLine.includes(';')) return ';'; // Retorna ponto e vírgula se encontrado
  if (firstLine.includes(',')) return ','; // Retorna vírgula se encontrada
  return ';'; // Retorna ponto e vírgula como padrão
}

// Processa o arquivo carregado e calcula os tempos de lanche
function processFile() {
  const fileInput = document.getElementById('fileInput'); // Input de arquivo
  const file = fileInput.files[0]; // Primeiro arquivo selecionado
  const loading = document.getElementById('loading'); // Indicador de carregamento
  const resultsDiv = document.getElementById('results'); // Div para exibir resultados

  if (!file) {
    alert('Por favor, carregue um arquivo.'); // Alerta se nenhum arquivo for selecionado
    return;
  }

  // Atualiza o nome do arquivo antes de processar
  const fileNameDisplay = document.getElementById('calculatorFileName');
  fileNameDisplay.textContent = `Arquivo carregado: ${file.name}`;

  loading.style.display = 'block'; // Exibe o indicador de carregamento
  const reader = new FileReader(); // Cria um leitor de arquivos

  // Função chamada quando o arquivo é lido
  reader.onload = function (e) {
    const content = e.target.result; // Conteúdo do arquivo lido

    try {
      // Processa arquivos .csv
      if (file.name.toLowerCase().endsWith('.csv')) {
        const separator = detectSeparator(content); // Detecta o separador
        const rows = content.split('\n').map((row) => row.split(separator)); // Divide o conteúdo em linhas e colunas

        // Remove colunas desnecessárias e prepara os dados
        const columnsToRemove = [0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 14, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37];
        const cleanedRows = rows.slice(1).map((row) => row.filter((_, index) => !columnsToRemove.includes(index)));

        // Converte os dados para o formato esperado
        const convertedData = cleanedRows.flatMap((row) => {
          const pis = row[0]; // PIS do funcionário
          const date = row[1] ? row[1].replace(/\s[A-Z]+$/, '') : null; // Data, removendo texto extra

          // Ignora linhas com folga, feriado, falta ou justificado
          if (row.slice(2).some((cell) => /Folga|Feriado|Falta|Justificado/i.test(cell))) {
            return [];
          }

          // Mapeia os horários válidos
          return row
            .slice(2)
            .map((time, index) => {
              if (time) {
                time = time.replace(/\s*\(I\)/i, ''); // Remove "(I)" dos horários
              }
              return time ? [pis, date, time] : null; // Retorna array com PIS, data e horário
            })
            .filter((entry) => entry); // Filtra entradas nulas
        });

        // Calcula e exibe os tempos de lanche
        const results = calculateLunchTimes(convertedData);
        displayResults(results);
      }
      // Processa arquivos .xlsx
      else if (file.name.toLowerCase().endsWith('.xlsx')) {
        const data = new Uint8Array(content); // Converte o conteúdo para array de bytes
        const workbook = XLSX.read(data, { type: 'array' }); // Lê o arquivo Excel
        const sheetName = workbook.SheetNames[0]; // Pega a primeira planilha
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }); // Converte para array

        // Remove colunas desnecessárias
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
                time = time.toString().replace(/\s*\(I\)/i, '');
              }
              return time ? [pis, date, time] : null;
            })
            .filter((entry) => entry);
        });

        // Calcula e exibe os tempos de lanche
        const results = calculateLunchTimes(convertedData);
        displayResults(results);
      }
      // Processa arquivos .prn ou .txt
      else if (file.name.toLowerCase().endsWith('.prn') || file.name.toLowerCase().endsWith('.txt')) {
        const rows = content.split('\n').map((row) => row.split(';')); // Divide em linhas e colunas
        const results = calculateLunchTimes(rows); // Calcula os tempos
        displayResults(results); // Exibe os resultados
      } else {
        alert('Formato de arquivo não suportado. Use .csv, .xlsx, .prn ou .txt.'); // Alerta para formatos inválidos
      }
    } catch (error) {
      console.error('Erro ao processar o arquivo:', error); // Loga o erro no console
      alert('Erro ao processar o arquivo. Verifique o formato e tente novamente.'); // Alerta o usuário
    }

    loading.style.display = 'none'; // Esconde o indicador de carregamento
  };

  // Lê o arquivo no formato apropriado
  if (file.name.toLowerCase().endsWith('.xlsx')) {
    reader.readAsArrayBuffer(file); // Lê como array de bytes para .xlsx
  } else {
    reader.readAsText(file); // Lê como texto para outros formatos
  }
}

// Calcula os tempos de lanche com base nos horários fornecidos
function calculateLunchTimes(rows) {
  const results = {}; // Objeto para armazenar os horários por PIS e data

  // Organiza os dados por PIS e data
  rows.forEach((row) => {
    const [pis, date, time] = row;
    if (!results[pis]) {
      results[pis] = {};
    }
    if (!results[pis][date]) {
      results[pis][date] = [];
    }
    results[pis][date].push(time.trim()); // Adiciona o horário à lista
  });

  const lunchTimes = {}; // Objeto para os tempos de lanche calculados

  // Calcula os tempos de lanche para cada PIS e data
  for (const pis in results) {
    lunchTimes[pis] = {};
    for (const date in results[pis]) {
      const times = results[pis][date];
      if (times.length >= 7) {
        // Verifica se há pelo menos 7 horários (entrada, saída, etc.)
        const morningLunch = calculateTimeDifference(times[2], times[1]); // Calcula lanche da manhã
        const afternoonLunch = calculateTimeDifference(times[6], times[5]); // Calcula lanche da tarde
        lunchTimes[pis][date] = { morningLunch, afternoonLunch };
      } else {
        lunchTimes[pis][date] = { morningLunch: 'Não bateu', afternoonLunch: 'Não bateu' }; // Marca como "Não bateu" se faltarem horários
      }
    }
  }

  return lunchTimes; // Retorna os tempos calculados
}

// Calcula a diferença entre dois horários no formato HH:MM
function calculateTimeDifference(time1, time2) {
  if (!time1 || !time2 || time1 === '-' || time2 === '-') {
    return 'Não bateu'; // Retorna "Não bateu" se os horários forem inválidos
  }

  const [h1, m1] = time1.split(':').map(Number); // Divide o primeiro horário em horas e minutos
  const [h2, m2] = time2.split(':').map(Number); // Divide o segundo horário em horas e minutos

  const totalMinutes1 = h1 * 60 + m1; // Converte o primeiro horário para minutos
  const totalMinutes2 = h2 * 60 + m2; // Converte o segundo horário para minutos

  const difference = totalMinutes1 - totalMinutes2; // Calcula a diferença em minutos
  const hours = Math.floor(difference / 60); // Converte para horas
  const minutes = difference % 60; // Calcula os minutos restantes

  return `${hours}h ${minutes}m`; // Retorna no formato "Xh Ym"
}

// Exibe os resultados na interface em tabelas organizadas por PIS
function displayResults(results) {
  const resultsDiv = document.getElementById('results'); // Div onde os resultados serão exibidos
  resultsDiv.innerHTML = ''; // Limpa os resultados anteriores

  toggleFilterButton(true); // Exibe os botões de filtro

  // Ordena os PIS alfabeticamente pelo nome ou número
  const sortedPisList = Object.keys(results).sort((a, b) => {
    const nameA = pisToNameMap[a] || `PIS: ${a}`;
    const nameB = pisToNameMap[b] || `PIS: ${b}`;
    return nameA.localeCompare(nameB);
  });

  // Cria uma tabela para cada PIS
  for (const pis of sortedPisList) {
    const name = pisToNameMap[pis] || `PIS: ${pis}`; // Nome ou PIS como fallback
    const pisDiv = document.createElement('div');
    pisDiv.innerHTML = `<h3>${name}</h3>`; // Adiciona o título com o nome
    resultsDiv.appendChild(pisDiv);

    const table = document.createElement('table'); // Cria a tabela
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

    const tbody = table.querySelector('tbody'); // Corpo da tabela

    // Adiciona uma linha para cada data
    for (const date in results[pis]) {
      const { morningLunch, afternoonLunch } = results[pis][date];
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${date}</td>
        <td class="${isLunchTooLong(morningLunch) ? 'highlight-red' : ''}">${morningLunch}</td>
        <td class="${isLunchTooLong(afternoonLunch) ? 'highlight-red' : ''}">${afternoonLunch}</td>
      `; // Destaca em vermelho se o lanche for maior que 15 minutos
      tbody.appendChild(row);
    }

    pisDiv.appendChild(table); // Adiciona a tabela ao div do PIS
  }
}

// Verifica se o tempo de lanche excede 15 minutos
function isLunchTooLong(lunchTime) {
  if (lunchTime === 'Não bateu') return false; // Não destaca se não bateu

  const [hours, minutes] = lunchTime.split('h '); // Divide em horas e minutos
  const totalMinutes = parseInt(hours) * 60 + parseInt(minutes.replace('m', '')); // Calcula o total em minutos

  return totalMinutes > 15; // Retorna true se maior que 15 minutos
}

// Limpa os resultados exibidos e reseta a interface
function clearResults() {
  const resultsDiv = document.getElementById('results'); // Div de resultados
  const calculatorFileName = document.getElementById('calculatorFileName'); // Nome do arquivo

  resultsDiv.innerHTML = ''; // Limpa os resultados
  toggleFilterButton(false); // Esconde os botões de filtro
  calculatorFileName.textContent = ''; // Limpa o nome do arquivo
  isFiltered = false; // Reseta o estado do filtro
}

// Exporta os resultados para um arquivo CSV
function exportToCSV() {
  const resultsDiv = document.getElementById('results'); // Div de resultados
  const tables = resultsDiv.querySelectorAll('table'); // Todas as tabelas exibidas

  if (tables.length === 0) {
    alert('Nenhum resultado para exportar.'); // Alerta se não houver resultados
    return;
  }

  let csvContent = 'PIS,Data,Lanche da Manhã,Lanche da Tarde\n'; // Cabeçalho do CSV

  // Itera sobre as tabelas e linhas para construir o conteúdo do CSV
  tables.forEach((table) => {
    const pis = table.previousElementSibling.textContent.replace('PIS: ', ''); // Pega o PIS/nome
    const rows = table.querySelectorAll('tbody tr');

    rows.forEach((row) => {
      const [date, morningLunch, afternoonLunch] = row.querySelectorAll('td');
      csvContent += `${pis},${date.textContent},${morningLunch.textContent},${afternoonLunch.textContent}\n`; // Adiciona a linha ao CSV
    });
  });

  // Cria e faz o download do arquivo CSV
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'lanches.csv'; // Nome do arquivo baixado
  link.click();
  URL.revokeObjectURL(url); // Libera a URL criada
}

// Alterna a visibilidade dos botões de filtro
function toggleFilterButton(show) {
  const filterButtonContainer = document.getElementById('filterButtonContainer'); // Container dos botões de filtro
  filterButtonContainer.style.display = show ? 'block' : 'none'; // Exibe ou esconde conforme o parâmetro
}

// Filtra os lanches exibidos para mostrar apenas os que excedem 15 minutos
function filterAbove15() {
  const tables = document.querySelectorAll('table'); // Todas as tabelas exibidas
  let hasResults = false; // Flag para verificar se há resultados filtrados
  isFiltered = true; // Marca que o filtro está ativo

  tables.forEach((table) => {
    const pisDiv = table.previousElementSibling; // Div do PIS/nome
    let hasVisibleRows = false; // Flag para verificar se há linhas visíveis
    const rows = table.querySelectorAll('tbody tr'); // Linhas da tabela

    rows.forEach((row) => {
      const morningCell = row.querySelector('td:nth-child(2)'); // Célula do lanche da manhã
      const afternoonCell = row.querySelector('td:nth-child(3)'); // Célula do lanche da tarde

      const showRow = isLunchTooLong(morningCell.textContent) || isLunchTooLong(afternoonCell.textContent); // Verifica se algum lanche excede 15 minutos

      row.style.display = showRow ? '' : 'none'; // Mostra ou esconde a linha
      if (showRow) {
        hasVisibleRows = true;
        hasResults = true;
      }
    });

    // Mostra ou esconde a tabela e o título com base nas linhas visíveis
    pisDiv.style.display = hasVisibleRows ? '' : 'none';
    table.style.display = hasVisibleRows ? '' : 'none';
  });

  if (!hasResults) {
    alert('Nenhum lanche acima de 15 minutos encontrado.'); // Alerta se não houver resultados
    clearFilter(); // Limpa o filtro
  }
}

// Remove o filtro e restaura a exibição de todos os resultados
function clearFilter() {
  if (!isFiltered) return; // Sai se o filtro não estiver ativo

  const tables = document.querySelectorAll('table'); // Todas as tabelas exibidas

  tables.forEach((table) => {
    const pisDiv = table.previousElementSibling; // Div do PIS/nome
    pisDiv.style.display = ''; // Restaura a visibilidade do título
    table.style.display = ''; // Restaura a visibilidade da tabela

    const rows = table.querySelectorAll('tbody tr'); // Linhas da tabela
    rows.forEach((row) => {
      row.style.display = ''; // Restaura a visibilidade de todas as linhas
    });
  });

  isFiltered = false; // Reseta o estado do filtro
}
