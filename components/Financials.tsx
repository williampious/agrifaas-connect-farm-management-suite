import React, { useState } from 'react';
import type { FarmDataContextType, Account, JournalEntry } from '../types';
import { Card } from './shared/Card';
import { Table } from './shared/Table';
import { Button } from './shared/Button';
import { AccountModal } from './AccountModal';
import { JournalEntryDialog } from './JournalEntryDialog';
import { ImportJournalEntriesModal } from './ImportJournalEntriesModal';
import { DEFAULT_CURRENCY, formatCurrency } from '../constants';
import { IncomeStatement } from './IncomeStatement';
import { BalanceSheet } from './BalanceSheet';
import { TrialBalance } from './TrialBalance';
import { ProfitabilityReport } from './ProfitabilityReport';
import { ExpenseByCategoryReport } from './ExpenseByCategoryReport';
import { exportToExcel, exportToCSV } from '../utils/exportUtils';

type FinancialView = 'Journal' | 'Accounts' | 'Income Statement' | 'Balance Sheet' | 'Trial Balance' | 'Profitability' | 'Expense Report';

const financialViews: FinancialView[] = ['Journal', 'Accounts', 'Income Statement', 'Balance Sheet', 'Trial Balance', 'Profitability', 'Expense Report'];

export const Financials: React.FC<{ farmData: FarmDataContextType }> = ({ farmData }) => {
    const { 
        accounts, 
        journalEntries, 
        plots, 
        seasons,
        addAccount,
        updateAccount,
        deleteAccount,
        addJournalEntry,
        updateJournalEntry,
        deleteJournalEntry,
        addMultipleJournalEntries,
    } = farmData;

    const [currentView, setCurrentView] = useState<FinancialView>('Journal');
    
    // Modals state
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
    const [editingJournalEntry, setEditingJournalEntry] = useState<JournalEntry | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Handlers for Account Modal
    const handleOpenAddAccount = () => {
        setEditingAccount(null);
        setIsAccountModalOpen(true);
    };
    const handleOpenEditAccount = (account: Account) => {
        setEditingAccount(account);
        setIsAccountModalOpen(true);
    };
    const handleSubmitAccount = (accountData: Omit<Account, 'id'> | Account) => {
        if ('id' in accountData) {
            updateAccount(accountData);
        } else {
            addAccount(accountData);
        }
        setIsAccountModalOpen(false);
    };
    const handleDeleteAccountClick = (accountId: string) => {
        if (window.confirm('Are you sure you want to delete this account? This may affect existing journal entries.')) {
            deleteAccount(accountId);
        }
    };

    // Handlers for Journal Entry Modal
    const handleOpenAddJournalEntry = () => {
        setEditingJournalEntry(null);
        setIsJournalModalOpen(true);
    };
    const handleOpenEditJournalEntry = (entry: JournalEntry) => {
        setEditingJournalEntry(entry);
        setIsJournalModalOpen(true);
    };
    const handleSubmitJournalEntry = (entryData: Omit<JournalEntry, 'id'> | JournalEntry) => {
        if ('id' in entryData) {
            updateJournalEntry(entryData);
        } else {
            addJournalEntry(entryData);
        }
        setIsJournalModalOpen(false);
    };
    const handleDeleteJournalEntryClick = (entryId: string) => {
        if (window.confirm('Are you sure you want to delete this journal entry?')) {
            deleteJournalEntry(entryId);
        }
    };

    const handleImportEntries = (entries: Omit<JournalEntry, 'id'>[]) => {
        addMultipleJournalEntries(entries);
        setIsImportModalOpen(false);
        alert(`${entries.length} entries imported successfully!`);
    };

    const getJournalExportData = () => {
        const accountMap = new Map(accounts.map(a => [a.id, a.name]));
        const plotMap = new Map(plots.map(p => [p.id, p.name]));
        const seasonMap = new Map(seasons.map(s => [s.id, `${s.name} ${s.year}`]));

        const dataForExport = journalEntries.flatMap(entry => 
            entry.lines.map(line => [
                entry.id,
                entry.date,
                entry.description,
                entry.category || '',
                entry.currency,
                accountMap.get(line.accountId) || 'Unknown Account',
                line.plotId ? plotMap.get(line.plotId) || 'Unknown Plot' : '',
                line.seasonId ? seasonMap.get(line.seasonId) || 'Unknown Season' : '',
                line.type === 'debit' ? line.amount : 0,
                line.type === 'credit' ? line.amount : 0,
            ])
        );
        
        const headers = ['Entry ID', 'Date', 'Description', 'Category', 'Currency', 'Account', 'Plot', 'Season', 'Debit', 'Credit'];
        return [headers, ...dataForExport];
    }

    const handleExportJournal = () => {
        const exportData = getJournalExportData();
        exportToExcel(exportData, 'General_Journal', 'General Journal');
    };

    const handleExportJournalCSV = () => {
        const exportData = getJournalExportData();
        exportToCSV(exportData, 'General_Journal');
    };

    const handlePrint = () => {
        window.print();
    };

    const accountColumns = [
        { header: 'Name', accessor: 'name' as keyof Account },
        { header: 'Type', accessor: 'type' as keyof Account },
        { header: 'Currency', accessor: 'currency' as keyof Account },
        { header: 'Initial Balance', accessor: (acc: Account) => formatCurrency(acc.initialBalance, acc.currency) },
    ];

    const journalColumns = [
        { header: 'Date', accessor: 'date' as keyof JournalEntry },
        { header: 'Description', accessor: 'description' as keyof JournalEntry },
        { header: 'Category', accessor: 'category' as keyof JournalEntry },
        { header: 'Debits', accessor: (je: JournalEntry) => {
            const debits = je.lines.filter(l => l.type === 'debit').reduce((sum, l) => sum + l.amount, 0);
            return formatCurrency(debits, je.currency);
        }},
        { header: 'Credits', accessor: (je: JournalEntry) => {
            const credits = je.lines.filter(l => l.type === 'credit').reduce((sum, l) => sum + l.amount, 0);
            return formatCurrency(credits, je.currency);
        }},
    ];

    const renderCurrentView = () => {
        switch (currentView) {
            case 'Journal':
                return (
                    <div className="printable-area">
                        <Card>
                             <div className="mb-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className="text-sm font-semibold text-gray-500">AgriFAAS Connect</h2>
                                        <h1 className="text-2xl font-bold text-gray-800">General Journal</h1>
                                        <p className="text-xs text-gray-500">A chronological record of all financial transactions.</p>
                                    </div>
                                    <div className="flex flex-wrap justify-end gap-2 no-print">
                                        <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>Import Entries</Button>
                                        <Button onClick={handleOpenAddJournalEntry}>New Journal Entry</Button>
                                        <Button variant="secondary" onClick={handlePrint}>Print</Button>
                                        <Button variant="secondary" onClick={handleExportJournal}>Export to Excel</Button>
                                        <Button variant="secondary" onClick={handleExportJournalCSV}>Export to CSV</Button>
                                    </div>
                                </div>
                                <hr className="my-3"/>
                            </div>
                            <Table<JournalEntry>
                                columns={journalColumns}
                                data={journalEntries}
                                renderActions={(entry) => (
                                    <div className="space-x-2">
                                        <Button variant="secondary" className="text-sm !py-1 !px-2" onClick={() => handleOpenEditJournalEntry(entry)}>Edit</Button>
                                        <Button variant="danger" className="text-sm !py-1 !px-2" onClick={() => handleDeleteJournalEntryClick(entry.id)}>Delete</Button>
                                    </div>
                                )}
                            />
                        </Card>
                    </div>
                );
            case 'Accounts':
                return (
                    <Card title="Chart of Accounts">
                        <div className="flex justify-end mb-4">
                            <Button onClick={handleOpenAddAccount}>New Account</Button>
                        </div>
                        <Table<Account>
                            columns={accountColumns}
                            data={[...accounts].sort((a,b) => a.name.localeCompare(b.name))}
                            renderActions={(account) => (
                                <div className="space-x-2">
                                    <Button variant="secondary" className="text-sm !py-1 !px-2" onClick={() => handleOpenEditAccount(account)}>Edit</Button>
                                    <Button variant="danger" className="text-sm !py-1 !px-2" onClick={() => handleDeleteAccountClick(account.id)}>Delete</Button>
                                </div>
                            )}
                        />
                    </Card>
                );
            case 'Income Statement':
                return <IncomeStatement farmData={farmData} currency={DEFAULT_CURRENCY} />;
            case 'Balance Sheet':
                return <BalanceSheet farmData={farmData} currency={DEFAULT_CURRENCY} />;
            case 'Trial Balance':
                return <TrialBalance farmData={farmData} currency={DEFAULT_CURRENCY} />;
            case 'Profitability':
                return <ProfitabilityReport farmData={farmData} currency={DEFAULT_CURRENCY} />;
            case 'Expense Report':
                return <ExpenseByCategoryReport farmData={farmData} currency={DEFAULT_CURRENCY} />;
            default:
                return null;
        }
    };

    return (
        <>
            <AccountModal
                isOpen={isAccountModalOpen}
                onClose={() => setIsAccountModalOpen(false)}
                onSubmit={handleSubmitAccount}
                initialData={editingAccount}
            />
            <JournalEntryDialog
                isOpen={isJournalModalOpen}
                onClose={() => setIsJournalModalOpen(false)}
                onSubmit={handleSubmitJournalEntry}
                initialData={editingJournalEntry}
                accounts={accounts}
                plots={plots}
                seasons={seasons}
            />
            <ImportJournalEntriesModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                accounts={accounts}
                plots={plots}
                seasons={seasons}
                onImport={handleImportEntries}
            />
            <div className="space-y-6">
                <div className="bg-white p-2 rounded-lg shadow-sm no-print">
                    <div className="flex space-x-1 flex-wrap">
                        {financialViews.map(view => (
                            <button
                                key={view}
                                onClick={() => setCurrentView(view)}
                                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 my-1 ${
                                    currentView === view
                                        ? 'bg-green-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-200'
                                }`}
                            >
                                {view}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    {renderCurrentView()}
                </div>
            </div>
        </>
    );
};
