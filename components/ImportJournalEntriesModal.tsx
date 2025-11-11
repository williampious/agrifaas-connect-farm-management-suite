
import React, { useState } from 'react';
import type { JournalEntry, Account } from '../types.js';
import { Modal } from './shared/Modal';
import { Button } from './shared/Button';
import Papa from 'papaparse'; // Using a library for robust CSV parsing

interface ImportJournalEntriesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (entries: Omit<JournalEntry, 'id'>[]) => void;
    accounts: Account[];
}

interface ParsedRow {
    Date: string;
    Description: string;
    Category: string;
    Currency: string;
    'Debit Account': string;
    'Debit Amount': string;
    'Credit Account': string;
    'Credit Amount': string;
}

export const ImportJournalEntriesModal: React.FC<ImportJournalEntriesModalProps> = ({ isOpen, onClose, onSubmit, accounts }) => {
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
        }
    };

    const handleProcessFile = () => {
        if (!file) {
            setError('Please select a file to import.');
            return;
        }
        setIsProcessing(true);
        
        Papa.parse<ParsedRow>(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const { data, errors } = results;
                if (errors.length) {
                    setError(`Error parsing CSV: ${errors[0].message}`);
                    setIsProcessing(false);
                    return;
                }

                try {
                    const newEntries = processParsedData(data, accounts);
                    onSubmit(newEntries);
                    onClose();
                } catch (e: any) {
                    setError(e.message);
                } finally {
                    setIsProcessing(false);
                }
            },
            error: (err) => {
                setError(`Failed to read file: ${err.message}`);
                setIsProcessing(false);
            }
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Import Journal Entries from CSV">
            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    Upload a CSV file with the following headers: <code>Date, Description, Category, Currency, Debit Account, Debit Amount, Credit Account, Credit Amount</code>.
                </p>
                <div>
                    <label htmlFor="csv-upload" className="block text-sm font-medium text-gray-700 mb-1">CSV File</label>
                    <input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={handleProcessFile} disabled={!file || isProcessing}>
                        {isProcessing ? 'Processing...' : 'Import'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};


function processParsedData(data: ParsedRow[], accounts: Account[]): Omit<JournalEntry, 'id'>[] {
    const accountMap = new Map(accounts.map(a => [`${a.name.toLowerCase()}_${a.currency.toLowerCase()}`, a.id]));
    const entries: Omit<JournalEntry, 'id'>[] = [];

    data.forEach((row, index) => {
        const debitAmount = parseFloat(row['Debit Amount']);
        const creditAmount = parseFloat(row['Credit Amount']);

        if (isNaN(debitAmount) || isNaN(creditAmount) || Math.abs(debitAmount - creditAmount) > 0.01) {
            throw new Error(`Row ${index + 2}: Debit and Credit amounts do not match or are invalid.`);
        }
        
        const currency = row.Currency?.trim();
        if (!currency) {
            throw new Error(`Row ${index + 2}: Currency is missing.`);
        }

        const debitAccountName = row['Debit Account']?.trim().toLowerCase();
        const creditAccountName = row['Credit Account']?.trim().toLowerCase();
        
        const debitAccountId = accountMap.get(`${debitAccountName}_${currency.toLowerCase()}`);
        const creditAccountId = accountMap.get(`${creditAccountName}_${currency.toLowerCase()}`);

        if (!debitAccountId) {
            throw new Error(`Row ${index + 2}: Debit account "${row['Debit Account']}" with currency "${currency}" not found.`);
        }
        if (!creditAccountId) {
            throw new Error(`Row ${index + 2}: Credit account "${row['Credit Account']}" with currency "${currency}" not found.`);
        }

        entries.push({
            date: new Date(row.Date).toISOString().split('T')[0],
            description: row.Description,
            category: row.Category,
            currency: currency,
            lines: [
                { accountId: debitAccountId, type: 'debit', amount: debitAmount },
                { accountId: creditAccountId, type: 'credit', amount: creditAmount },
            ]
        });
    });

    return entries;
}
