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
