
import React, { useState, useMemo } from 'react';
import type { FarmDataContextType, User, Account, JournalEntry } from '../types.js';
import { Card } from './shared/Card';
import { Table } from './shared/Table';
import { Button } from './shared/Button';
import { AccountModal } from './AccountModal';
import { JournalEntryDialog } from './JournalEntryDialog';
import { ImportJournalEntriesModal } from './ImportJournalEntriesModal';
import { TrialBalance } from './TrialBalance';
import { IncomeStatement } from './IncomeStatement';
import { BalanceSheet } from './BalanceSheet';
import { ProfitabilityReport } from './ProfitabilityReport';
import { ExpenseByCategoryReport } from './ExpenseByCategoryReport';
import { DEFAULT_CURRENCY, formatCurrency } from '../constants';
import { exportToCSV } from '../utils/exportUtils';
import { FinancialProjections } from './financials/FinancialProjections';


interface FinancialsProps {
    farmData: FarmDataContextType;
    user: User;
}

type FinancialView = 'journal' | 'accounts' | 'income' | 'balance' | 'trial' | 'profitability' | 'expense_category' | 'projections';

const ViewButton: React.FC<{
    current: FinancialView;
    view: FinancialView;
    onClick: (view: FinancialView) => void;
    children: React.ReactNode;
}> = ({ current, view, onClick, children }) => (
    <button
        onClick={() => onClick(view)}
        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            current === view ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'
        }`}
    >
        {children}
    </button>
);


export const Financials: React.FC<FinancialsProps> = ({ farmData, user }) => {
    const { 
        accounts, journalEntries, plots, seasons,
        addAccount, updateAccount, deleteAccount, 
        addJournalEntry, updateJournalEntry, deleteJournalEntry, addMultipleJournalEntries 
    } = farmData;

    const [view, setView] = useState<FinancialView>('journal');
    
    // Currency filter state
    const [selectedCurrency, setSelectedCurrency] = useState(DEFAULT_CURRENCY);
    
    // Modal states
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false);
    const [editingJournalEntry, setEditingJournalEntry] = useState<JournalEntry | null>(null);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    const filteredAccounts = useMemo(() => accounts.filter(a => a.currency === selectedCurrency), [accounts, selectedCurrency]);
    const filteredJournalEntries = useMemo(() => journalEntries.filter(j => j.currency === selectedCurrency), [journalEntries, selectedCurrency]);

    const accountMap = useMemo(() => new Map(accounts.map(a => [a.id, a.name])), [accounts]);

    // Handlers for Accounts
    const handleAddAccount = (accountData: Omit<Account, 'id'>) => addAccount(accountData, user.name);
    const handleUpdateAccount = (accountData: Account) => updateAccount(accountData, user.name);
    const handleOpenAddAccount = () => { setEditingAccount(null); setIsAccountModalOpen(true); };
    const handleOpenEditAccount = (account: Account) => { setEditingAccount(account); setIsAccountModalOpen(true); };
    const handleDeleteAccountClick = (account: Account) => {
        if (journalEntries.some(je => je.lines.some(line => line.accountId === account.id))) {
            alert("Cannot delete account with existing journal entries.");
            return;
        }
        if (window.confirm(`Delete ${account.name}?`)) deleteAccount(account.id, user.name, account.name);
    };

    // Handlers for Journal Entries
    const handleSubmitJournalEntry = (entryData: Omit<JournalEntry, 'id'> | JournalEntry) => {
        if ('id' in entryData) updateJournalEntry(entryData, user.name);
        else addJournalEntry(entryData, user.name);
        setIsJournalModalOpen(false);
    };
    const handleOpenAddJournal = () => { setEditingJournalEntry(null); setIsJournalModalOpen(true); };
    
    const handleImportEntries = (entries: Omit<JournalEntry, 'id'>[]) => {
        addMultipleJournalEntries(entries, user.name);
        setIsImportModalOpen(false);
    };

    const handleExportJournal = () => {
        const dataToExport = [
            ['Date', 'Description', 'Category', 'Currency', 'Account', 'Type', 'Amount', 'Plot', 'Season'],
            ...filteredJournalEntries.flatMap(je =>
                je.lines.map(line => [
                    je.date,
                    je.description,
                    je.category,
                    je.currency,
                    accountMap.get(line.accountId) || 'N/A',
                    line.type,
                    line.amount,
                    plots.find(p => p.id === line.plotId)?.name || '',
                    seasons.find(s => s.id === line.seasonId)?.name || '',
                ])
            )
        ];
        exportToCSV(dataToExport, 'General_Journal');
    };

    const accountColumns = [
        { header: 'Name', accessor: 'name' as keyof Account },
        { header: 'Type', accessor: 'type' as keyof Account },
        { header: 'Balance', accessor: (acc: Account) => formatCurrency(acc.initialBalance, acc.currency) },
    ];

    const journalColumns = [
        { header: 'Date', accessor: 'date' as keyof JournalEntry },
        { header: 'Description', accessor: 'description' as keyof JournalEntry },
        { header: 'Category', accessor: 'category' as keyof JournalEntry },
        {
            header: 'Amount',
            accessor: (je: JournalEntry) => {
                const debit = je.lines.find(l => l.type === 'debit')?.amount || 0;
                return formatCurrency(debit, je.currency);
            },
        },
    ];

    return (
        <>
            <AccountModal isOpen={isAccountModalOpen} onClose={() => setIsAccountModalOpen(false)} onSubmit={editingAccount ? handleUpdateAccount : handleAddAccount} initialData={editingAccount} />
            <JournalEntryDialog isOpen={isJournalModalOpen} onClose={() => setIsJournalModalOpen(false)} onSubmit={handleSubmitJournalEntry} initialData={editingJournalEntry} accounts={accounts} plots={plots} seasons={seasons} />
            <ImportJournalEntriesModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onSubmit={handleImportEntries} accounts={accounts} />

            <div className="space-y-6">
                <Card>
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <div className="flex flex-wrap gap-1 bg-gray-100 p-1 rounded-lg">
                            <ViewButton current={view} view="journal" onClick={setView}>General Journal</ViewButton>
                            <ViewButton current={view} view="accounts" onClick={setView}>Chart of Accounts</ViewButton>
                            <ViewButton current={view} view="income" onClick={setView}>Income Statement</ViewButton>
                            <ViewButton current={view} view="balance" onClick={setView}>Balance Sheet</ViewButton>
                            <ViewButton current={view} view="trial" onClick={setView}>Trial Balance</ViewButton>
                            <ViewButton current={view} view="profitability" onClick={setView}>Plot Profitability</ViewButton>
                            <ViewButton current={view} view="expense_category" onClick={setView}>Expense by Category</ViewButton>
                             <ViewButton current={view} view="projections" onClick={setView}>Projections</ViewButton>
                        </div>
                    </div>
                </Card>

                {view === 'journal' && (
                    <Card title={`General Journal (${selectedCurrency})`}>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-600">All financial transactions are recorded here.</p>
                            <div className="flex items-center gap-2">
                                <Button variant="secondary" onClick={handleExportJournal}>Export CSV</Button>
                                <Button variant="secondary" onClick={() => setIsImportModalOpen(true)}>Import CSV</Button>
                                <Button onClick={handleOpenAddJournal}>New Entry</Button>
                            </div>
                        </div>
                        <Table<JournalEntry> columns={journalColumns} data={filteredJournalEntries} />
                    </Card>
                )}
                {view === 'accounts' && (
                    <Card title={`Chart of Accounts (${selectedCurrency})`}>
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-600">The foundation of your financial records.</p>
                            <Button onClick={handleOpenAddAccount}>New Account</Button>
                        </div>
                         <Table<Account>
                            columns={accountColumns}
                            data={filteredAccounts}
                            renderActions={(acc) => (
                                <div className="space-x-2">
                                    <Button variant="secondary" className="!py-1 !px-2 text-sm" onClick={() => handleOpenEditAccount(acc)}>Edit</Button>
                                    <Button variant="danger" className="!py-1 !px-2 text-sm" onClick={() => handleDeleteAccountClick(acc)}>Delete</Button>
                                </div>
                            )}
                        />
                    </Card>
                )}
                {view === 'income' && <IncomeStatement farmData={farmData} currency={selectedCurrency} />}
                {view === 'balance' && <BalanceSheet farmData={farmData} currency={selectedCurrency} />}
                {view === 'trial' && <TrialBalance farmData={farmData} currency={selectedCurrency} />}
                {view === 'profitability' && <ProfitabilityReport farmData={farmData} currency={selectedCurrency} />}
                {view === 'expense_category' && <ExpenseByCategoryReport farmData={farmData} currency={selectedCurrency} />}
                {view === 'projections' && <FinancialProjections farmData={farmData} currency={selectedCurrency} />}
            </div>
        </>
    );
};
