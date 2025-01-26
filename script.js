// Código para editar e baixar CSV

function processCSV() {
    const fileInput = document.getElementById('csvInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('Por favor, carregue um arquivo CSV.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const csvContent = e.target.result;
        const rows = csvContent.split('\n').map(row => row.split(';'));

        // Definir as colunas a serem removidas
        const columnsToRemove = [
            0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 14, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37
        ];

        // Remover a primeira linha e as colunas especificadas
        const cleanedRows = rows.slice(1).map(row => {
            return row.filter((_, index) => {
                return !columnsToRemove.includes(index); // Remover colunas pelo índice
            });
        });

        // Converter de volta para CSV
        const cleanedCSV = cleanedRows.map(row => row.join(';')).join('\n');
        
        // Chamar a função para baixar o CSV editado com o nome original
        downloadCSV(cleanedCSV, file.name);
    };
    reader.readAsText(file);
}

function downloadCSV(content, originalFileName) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    // Remover a extensão do arquivo original e adicionar ".csv" ao final
    const fileNameWithoutExtension = originalFileName.replace(/\.[^/.]+$/, "");
    link.href = url;
    link.download = `${fileNameWithoutExtension}.csv`; // Usar o nome original com a extensão .csv
    link.click();
    URL.revokeObjectURL(url);
}

// Código para editar e baixar PRN

let convertedData = [];

document.getElementById('fileInput').addEventListener('change', handleFile);

function handleFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }); // Tratar tudo como dados
        processExcelData(jsonData);
    };
    reader.readAsArrayBuffer(file);
}

function processExcelData(data) {
    // Processar todas as linhas como dados (sem headers)
    convertedData = data.flatMap(row => {
        const pis = row[0]; // Primeira coluna como PIS
        const date = row[1] ? row[1].replace(/\s[A-Z]+$/, '') : null; // Segunda coluna como Data

        // Ignorar linhas que contenham "Folga", "Feriado", etc.
        if (row.slice(2).some(cell => /Folga|Feriado|Falta|Justificado/i.test(cell))) {
            return [];
        }

        // Processar cada horário restante
        return row.slice(2).map((time, index) => {
            if (time) {
                time = time.replace(/\s*\(I\)/i, ''); // Remover "(I)" dos horários
            }
            return time ? { PIS: pis, Date: date, Time: time } : null;
        }).filter(entry => entry); // Remover entradas nulas
    });

    displayData(convertedData);
}

function displayData(data) {
    const output = document.getElementById('output');
    output.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
}

function downloadPRN() {
    if (!convertedData.length) {
        alert('No data to download. Please upload an Excel file first.');
        return;
    }

    const prnContent = [
        ...convertedData.map(row => [row.PIS, row.Date, row.Time])
    ]
        .map(e => e.join(';')) // Separar por ponto e vírgula
        .join('\r\n'); // Usar quebras de linha CRLF

    const blob = new Blob([prnContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `convertido.prn`; // Nome fixo do arquivo baixado
    link.click();
    URL.revokeObjectURL(url);
}

/* função download com nome original
function downloadPRN() {
    if (!convertedData.length) {
        alert('No data to download. Please upload an Excel file first.');
        return;
    }

    const fileInput = document.getElementById('fileInput');
    const uploadedFileName = fileInput.files[0].name.replace(/\.[^/.]+$/, ""); // Nome original do arquivo

    const prnContent = [
        ...convertedData.map(row => [row.PIS, row.Date, row.Time])
    ]
        .map(e => e.join(';')) // Separar por ponto e vírgula
        .join('\r\n'); // Usar quebras de linha CRLF

    const blob = new Blob([prnContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${uploadedFileName}.prn`; // Nome do arquivo baixado
    link.click();
    URL.revokeObjectURL(url);
}
    */
