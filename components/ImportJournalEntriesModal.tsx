
import React, { useState, useEffect } from 'react';
import type { Account, JournalEntry, JournalEntryLine, Plot, Season } from '../types';
import { Modal } from './shared/Modal';
import { Button } from './shared/Button';
import { UploadIcon } from '../constants';
import { DEFAULT_CURRENCY, formatCurrency } from '../constants';

interface ImportJournalEntriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    accounts: Account[];
    plots: Plot[];
    seasons: Season[];
    onImport: (entries: Omit<JournalEntry, 'id'>[]) => void;
}

interface ParsedRow {
    // FIX: Allow number type to accommodate `lineNumber` in `GroupedRow`.
    [key: string]: string | number;
}

// FIX: Corrected the 'GroupedRow' type to allow for a numeric `lineNumber` property.
// An interface with a string-only index signature cannot have properties of other types.
// The index signature in `ParsedRow` now includes `number` to accommodate `lineNumber`.
interface GroupedRow extends ParsedRow {
    lineNumber: number;
}


interface ValidatedEntry {
    entry: Omit<JournalEntry, 'id'>;
    status: 'valid';
}
interface InvalidEntry {
    reason: string;
    rows: GroupedRow[];
    status: 'invalid';
}

type ValidationResult = ValidatedEntry | InvalidEntry;


export const ImportJournalEntriesModal: React.FC<ImportJournalEntriesModalProps> = ({ isOpen, onClose, accounts, plots, seasons, onImport }) => {
    const [file, setFile] = useState<File | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);

    useEffect(() => {
        if (!isOpen) {
            setFile(null);
            setIsProcessing(false);
            setValidationResults([]);
        }
    }, [isOpen]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            processFile(selectedFile);
        }
    };

    const normalizeHeader = (header: string) => header.trim().toLowerCase();
    
    const getLineNumberText = (rows: GroupedRow[]): string => {
        if (!rows || rows.length === 0) {
            return '';
        }
        const lineNumbers = rows.map(r => r.lineNumber).sort((a, b) => a - b);
        if (lineNumbers.length === 1) {
            return `Line ${lineNumbers[0]}:`;
        }
        return `Lines ${lineNumbers[0]}-${lineNumbers[lineNumbers.length - 1]}:`;
    };

    const processFile = async (fileToProcess: File) => {
        setIsProcessing(true);
        setValidationResults([]);
        
        try {
            const text = await fileToProcess.text();
            const rawRows = text.split('\n').map(r => r.trim()).filter(r => r);
            if (rawRows.length < 2) {
                setValidationResults([{ status: 'invalid', reason: 'File is empty or missing headers.', rows: [] }]);
                return;
            }
            
            const rawHeaders = rawRows.shift()!.split(/,|\t/);
            const headers = rawHeaders.map(normalizeHeader);

            const requiredHeaders = ['date', 'description', 'accountname', 'debit', 'credit'];
            if (!requiredHeaders.every(h => headers.includes(h))) {
                 setValidationResults([{ status: 'invalid', reason: `File headers are missing or incorrect. Required: Date, Description, accountName, Debit, Credit`, rows: [] }]);
                return;
            }

            const parsedRows: GroupedRow[] = rawRows.map((row, index) => {
                const values = row.split(/,|\t/);
                const rowData: {[key: string]: string} = {};
                headers.forEach((header, i) => {
                    rowData[header] = values[i]?.trim() || '';
                });
                // The spread operator (...) can lose this type information, causing assignment errors.
                return Object.assign(rowData, { lineNumber: index + 2 });
            });
            
            const hasEntryId = headers.includes('entryid');
            const entryGroups: { [key: string]: GroupedRow[] } = {};
            parsedRows.forEach(row => {
                const key = hasEntryId ? String(row['entryid']) : `${String(row['date'])}|${String(row['description'])}`;
                if (!key || key === '|') return; // Skip empty rows
                if (!entryGroups[key]) entryGroups[key] = [];
                entryGroups[key].push(row);
            });
            
            const accountMap = new Map(accounts.map(a => [a.name.toLowerCase(), a.id]));
            const plotMap = new Map(plots.map(p => [p.name.toLowerCase(), p.id]));
            const seasonMap = new Map(seasons.map(s => [s.name.toLowerCase(), s.id]));
            
            const results: ValidationResult[] = [];

            for (const key in entryGroups) {
                const group = entryGroups[key];
                const firstRow = group[0];
                const date = String(firstRow['date']);
                const description = String(firstRow['description']);
                const category = firstRow['category'] ? String(firstRow['category']) : undefined;
                const currency = (String(firstRow['currency'] || '')).toUpperCase() || DEFAULT_CURRENCY;
                
                let totalDebits = 0;
                let totalCredits = 0;
                let errorReason: string | null = null;
                const lines: JournalEntryLine[] = [];

                for (const row of group) {
                    // FIX: Cast property from 'string | number' or 'unknown' to 'string' before calling .toLowerCase().
                    const accountName = (row['accountname'] as string) || '';
                    const accountId = accountMap.get(accountName.toLowerCase());
                    const account = accounts.find(a => a.id === accountId);
                    
                    if (!account) {
                        errorReason = `Account "${accountName}" not found (line ${row.lineNumber}). Please add it to the Chart of Accounts.`;
                        break;
                    }

                    if (account.currency !== currency) {
                        errorReason = `Account "${accountName}" currency (${account.currency}) does not match entry currency (${currency}) (line ${row.lineNumber}).`;
                        break;
                    }
                    
                    // FIX: Cast property from 'string | number' or 'unknown' to 'string' before calling .toLowerCase().
                    const plotName = (row['plotname'] as string) || '';
                    let plotId: string | undefined;
                    if (plotName) {
                        plotId = plotMap.get(plotName.toLowerCase());
                        if (!plotId) {
                             errorReason = `Plot "${plotName}" not found (line ${row.lineNumber}). Please add it in Plots & Seasons.`;
                             break;
                        }
                    }

                    // FIX: Cast property from 'string | number' or 'unknown' to 'string' before calling .toLowerCase().
                    const seasonName = (row['seasonname'] as string) || '';
                    let seasonId: string | undefined;
                    if(seasonName) {
                        seasonId = seasonMap.get(seasonName.toLowerCase());
                        if(!seasonId) {
                            errorReason = `Season "${seasonName}" not found (line ${row.lineNumber}). Please add it in Plots & Seasons.`;
                            break;
                        }
                    }

                    const debit = parseFloat(String(row['debit'] || '0')) || 0;
                    const credit = parseFloat(String(row['credit'] || '0')) || 0;
                    
                    if ((debit > 0 && credit > 0) || (debit === 0 && credit === 0)) {
                         errorReason = `Row must have either a Debit or a Credit value, not both or neither (line ${row.lineNumber}).`;
                         break;
                    }

                    lines.push({ 
                        accountId, 
                        type: debit > 0 ? 'debit' : 'credit', 
                        amount: debit > 0 ? debit : credit,
                        plotId,
                        seasonId,
                    });

                    totalDebits += debit;
                    totalCredits += credit;
                }

                if (errorReason) {
                    results.push({ status: 'invalid', reason: errorReason, rows: group });
                    continue;
                }

                if (Math.abs(totalDebits - totalCredits) > 0.01 || totalDebits === 0) {
                    const lineInfo = getLineNumberText(group);
                    results.push({ 
                        status: 'invalid', 
                        reason: `${lineInfo} Entry is unbalanced. Debits: ${formatCurrency(totalDebits, currency)}, Credits: ${formatCurrency(totalCredits, currency)}`, 
                        rows: group 
                    });
                    continue;
                }

                results.push({ status: 'valid', entry: { date, description, lines, category, currency } });
            }
            setValidationResults(results);

        } catch (e) {
            console.error(e);
            setValidationResults([{ status: 'invalid', reason: 'Failed to read or parse the file.', rows: [] }]);
        } finally {
            setIsProcessing(false);
        }
    };
    
    const validEntries = validationResults.filter(r => r.status === 'valid') as ValidatedEntry[];
    const invalidEntries = validationResults.filter(r => r.status === 'invalid') as InvalidEntry[];

    const handleImportClick = () => {
        const entriesToImport = validEntries.map(v => v.entry);
        onImport(entriesToImport);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import Journal Entries" size="2xl">
            <div className="space-y-4">
                <div>
                    <h4 className="font-semibold text-gray-700">Instructions:</h4>
                    <p className="text-sm text-gray-600">Upload a CSV or TXT file with the following headers:</p>
                     <ul className="text-xs text-gray-500 list-disc list-inside mt-1">
                        <li><b>Required:</b> <code className="bg-gray-200 p-1 rounded">date, description, accountName, debit, credit</code></li>
                        <li><b>Optional:</b> <code className="bg-gray-200 p-1 rounded">entryId, category, currency, plotName, seasonName</code></li>
                        <li>Values can be comma or tab separated.</li>
                        <li>Account, plot, and season names must exactly match existing records in the system.</li>
                        <li>If currency is not provided, it defaults to {DEFAULT_CURRENCY}. All accounts in an entry must match the entry's currency.</li>
                    </ul>
                </div>

                {!file ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-md appearance-none cursor-pointer hover:border-green-400 focus:outline-none">
                        <span className="flex items-center space-x-2">
                           <UploadIcon className="w-6 h-6 text-gray-600" />
                            <span className="font-medium text-gray-600">
                                Drop file or <span className="text-green-600 underline">click to browse</span>
                            </span>
                        </span>
                        <input type="file" name="file_upload" className="hidden" accept=".csv,.txt" onChange={handleFileChange} />
                    </label>
                ) : (
                     <div className="p-3 bg-gray-100 rounded-md text-sm">
                        <p><strong>File:</strong> {file.name}</p>
                        {isProcessing ? (
                             <p className="text-blue-600">Processing...</p>
                        ) : (
                            <div>
                                <p className="text-green-600"><strong>{validEntries.length}</strong> valid journal entries found.</p>
                                <p className="text-red-600"><strong>{invalidEntries.length}</strong> invalid entries found.</p>
                            </div>
                        )}
                    </div>
                )}
                
                {invalidEntries.length > 0 && (
                    <div className="max-h-40 overflow-y-auto p-2 border rounded-md bg-red-50">
                        <h4 className="font-semibold text-red-800">Errors Found:</h4>
                        {invalidEntries.map((err, index) => (
                            <div key={index} className="text-xs text-red-700 mt-1">
                                <p><strong>- {err.reason}</strong></p>
                            </div>
                        ))}
                    </div>
                )}


                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={handleImportClick} disabled={isProcessing || validEntries.length === 0}>
                        Import {validEntries.length > 0 ? validEntries.length : ''} Entries
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
