import React, { useMemo, useState } from 'react';
import type { FarmDataContextType, Account, JournalEntry } from '../types';
import { AccountType } from '../types';
import { useFinancialCalculations } from '../hooks/useFinancialCalculations';
import { Card } from './shared/Card';
import { FinancialReportFilters, FilterValue } from './shared/FinancialReportFilters';
import { formatCurrency } from '../constants';
import { ReportHeader } from './shared/ReportHeader';
import { exportToExcel, exportToCSV } from '../utils/exportUtils';

interface TrialBalanceProps {
    farmData: FarmDataContextType;
    currency: string;
}

interface TrialBalanceRow {
    id: string;
    accountName: string;
    debit: number;
    credit: number;
}

export const TrialBalance: React.FC<TrialBalanceProps> = ({ farmData, currency }) => {
    const { accounts, journalEntries, plots, seasons } = farmData;
    const [filter, setFilter] = useState<FilterValue>({ startDate: null, endDate: null, plotId: 'all', seasonId: 'all' });
    const { accountBalances } = useFinancialCalculations(accounts, journalEntries, { ...filter, endDate: filter.endDate });

    const { rows, totalDebits, totalCredits } = useMemo(() => {
        let totalDebits = 0;
        let totalCredits = 0;

        const rows: TrialBalanceRow[] = accounts.map(account => {
            const balance = accountBalances.get(account.id) ?? 0;
            let debit = 0;
            let credit = 0;
            
            if (account.type === AccountType.Asset || account.type === AccountType.Expense) {
                if(balance >= 0) debit = balance;
                else credit = -balance;
            } 
            else {
                if(balance >= 0) credit = balance;
                else debit = -balance;
            }
            totalDebits += debit;
            totalCredits += credit;

            return { id: account.id, accountName: account.name, debit, credit };
        }).filter(row => row.debit !== 0 || row.credit !== 0)
          .sort((a,b) => a.accountName.localeCompare(b.accountName));
        
        return { rows, totalDebits, totalCredits };
    }, [accounts, accountBalances]);
    
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;
    
    const getExportData = () => [
        ['Account', 'Debit', 'Credit'],
        ...rows.map(row => [row.accountName, row.debit, row.credit]),
        [],
        ['Total', totalDebits, totalCredits]
    ];

    const handleExportExcel = () => {
        exportToExcel(getExportData(), 'Trial_Balance', 'Trial Balance');
    };

    const handleExportCSV = () => {
        exportToCSV(getExportData(), 'Trial_Balance');
    };

    return (
        <div className="space-y-6">
            <div className="no-print">
                <FinancialReportFilters onChange={setFilter} plots={plots} seasons={seasons} />
            </div>
            <div className="printable-area">
                 <Card>
                    <ReportHeader 
                        title="Trial Balance"
                        filter={filter}
                        onPrint={() => window.print()}
                        onExportExcel={handleExportExcel}
                        onExportCSV={handleExportCSV}
                    />
                    <p className="text-sm text-gray-600 mb-4 no-print">
                        This report lists the closing balance for every account for the selected period. The total debits must equal total credits for the ledger to be in balance.
                    </p>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit ({currency})</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit ({currency})</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {rows.map(row => (
                                    <tr key={row.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{row.accountName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{row.debit > 0 ? formatCurrency(row.debit, currency) : ''}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{row.credit > 0 ? formatCurrency(row.credit, currency) : ''}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr className="font-bold">
                                    <td className="px-6 py-4 text-sm text-gray-800">Totals</td>
                                    <td className={`px-6 py-4 text-sm text-right ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(totalDebits, currency)}</td>
                                    <td className={`px-6 py-4 text-sm text-right ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(totalCredits, currency)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
};
