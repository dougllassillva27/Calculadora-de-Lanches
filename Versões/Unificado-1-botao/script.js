function processFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

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
            rows = content.split('\n').map(row => row.split(';'));
        } else {
            const data = new Uint8Array(content);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
        }

        // Processar arquivo: remover colunas
        const columnsToRemove = [
            0, 1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 14, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37
        ];

        const cleanedRows = rows.slice(1).map(row =>
            row.filter((_, index) => !columnsToRemove.includes(index))
        );

        // Converter os dados para PRN
        const convertedData = cleanedRows.flatMap(row => {
            const pis = row[0];
            const date = row[1] ? row[1].replace(/\s[A-Z]+$/, '') : null;

            if (row.slice(2).some(cell => /Folga|Feriado|Falta|Justificado/i.test(cell))) {
                return [];
            }

            return row.slice(2).map((time, index) => {
                if (time) {
                    time = time.replace(/\s*\(I\)/i, '');
                }
                return time ? { PIS: pis, Date: date, Time: time } : null;
            }).filter(entry => entry);
        });

        // Preparar conteúdo do PRN
        const prnContent = convertedData.map(row => [row.PIS, row.Date, row.Time].join(';')).join('\r\n');

        // Baixar arquivo PRN
        downloadPRN(prnContent);
    };

    if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
    } else {
        reader.readAsArrayBuffer(file);
    }
}

function downloadPRN(content) {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `convertido.prn`;
    link.click();
    URL.revokeObjectURL(url);
}
