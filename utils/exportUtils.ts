import * as XLSX from 'xlsx';

/**
 * Exports an array of arrays to an Excel file.
 * @param data - The data to export, with the first row typically being headers.
 * @param fileName - The desired file name without the extension (e.g., 'Income_Statement').
 * @param sheetName - The name for the worksheet within the Excel file.
 */
export const exportToExcel = (data: any[][], fileName: string, sheetName: string): void => {
    try {
        // Create a new workbook
        const workbook = XLSX.utils.book_new();
        
        // Convert the array of arrays to a worksheet
        const worksheet = XLSX.utils.aoa_to_sheet(data);

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        // Generate and trigger the download of the Excel file
        XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);

    } catch (error) {
        console.error("Error exporting to Excel:", error);
        alert("An error occurred while trying to export the data to Excel.");
    }
};

/**
 * Exports an array of arrays to a CSV file.
 * @param data - The data to export, with the first row typically being headers.
 * @param fileName - The desired file name without the extension (e.g., 'General_Journal').
 */
export const exportToCSV = (data: any[][], fileName: string): void => {
    try {
        const escapeCell = (cell: any): string => {
            const cellStr = String(cell ?? '');
            // If the cell contains a comma, quote, or newline, wrap it in double quotes.
            if (/[",\n]/.test(cellStr)) {
                // Escape double quotes by doubling them.
                return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
        };
        
        const csvContent = data.map(row => row.map(escapeCell).join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    } catch (error) {
        console.error("Error exporting to CSV:", error);
        alert("An error occurred while trying to export the data to CSV.");
    }
};
