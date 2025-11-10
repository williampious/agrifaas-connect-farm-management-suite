import React, { useState } from 'react';
import type { FarmDataContextType } from '../types';
import { useFinancialCalculations } from '../hooks/useFinancialCalculations';
import { Card } from './shared/Card';
import { FinancialReportFilters, FilterValue } from './shared/FinancialReportFilters';
import { formatCurrency } from '../constants';
import { ReportHeader } from './shared/ReportHeader';
import { exportToExcel, exportToCSV } from '../utils/exportUtils';

interface IncomeStatementProps {
    farmData: FarmDataContextType;
    currency: string;
}

const ReportRow: React.FC<{ label: string, value: number, currency: string, isSubtotal?: boolean, isTotal?: boolean }> = ({ label, value, currency, isSubtotal = false, isTotal = false }) => (
    <div className={`flex justify-between py-2 ${isSubtotal ? 'border-t' : ''} ${isTotal ? 'font-bold' : ''}`}>
        <span className={isSubtotal || isTotal ? 'pl-4' : ''}>{label}</span>
        <span>{formatCurrency(value, currency)}</span>
    </div>
);

export const IncomeStatement: React.FC<IncomeStatementProps> = ({ farmData, currency }) => {
    const { accounts, journalEntries, plots, seasons } = farmData;
    const [filter, setFilter] = useState<FilterValue>({ startDate: null, endDate: null, plotId: 'all', seasonId: 'all' });
    const { 
        netIncome, 
        incomeAccounts, 
        expenseAccounts, 
        totalIncome, 
        totalExpenses 
    } = useFinancialCalculations(accounts, journalEntries, filter);
    
    const handleExportExcel = () => {
        const dataForExport = [
            ['Income Statement'],
            [],
            ['Revenue'],
            ...incomeAccounts.map(acc => [acc.name, acc.balance]),
            ['Total Revenue', totalIncome],
            [],
            ['Expenses'],
            ...expenseAccounts.map(acc => [acc.name, acc.balance]),
            ['Total Expenses', totalExpenses],
            [],
            ['Net Income', netIncome],
        ];
        exportToExcel(dataForExport, 'Income_Statement', 'Income Statement');
    };

    const handleExportCSV = () => {
        const dataForExport = [
            ['Category', 'Account', 'Amount'],
            ...incomeAccounts.map(acc => ['Revenue', acc.name, acc.balance]),
            ['Revenue', 'Total Revenue', totalIncome],
            ...expenseAccounts.map(acc => ['Expense', acc.name, acc.balance]),
            ['Expense', 'Total Expenses', totalExpenses],
            ['', 'Net Income', netIncome],
        ];
        exportToCSV(dataForExport, 'Income_Statement');
    };

    return (
        <div className="space-y-6">
            <div className="no-print">
                <FinancialReportFilters onChange={setFilter} plots={plots} seasons={seasons} />
            </div>
            <div className="printable-area">
                <Card>
                    <ReportHeader
                        title="Income Statement (Profit & Loss)"
                        filter={filter}
                        onPrint={() => window.print()}
                        onExportExcel={handleExportExcel}
                        onExportCSV={handleExportCSV}
                    />
                    <p className="text-sm text-gray-600 mb-4 no-print">
                        This report shows the farm's financial performance over the selected period by summarizing revenues and expenses.
                    </p>
                    <div className="max-w-2xl mx-auto">
                        <div className="text-lg font-semibold border-b pb-2 mb-2">Revenue</div>
                        {incomeAccounts.map(acc => <ReportRow key={acc.name} label={acc.name} value={acc.balance} currency={currency} />)}
                        <ReportRow label="Total Revenue" value={totalIncome} currency={currency} isSubtotal isTotal />
                        
                        <div className="text-lg font-semibold border-b pb-2 mb-2 mt-6">Expenses</div>
                        {expenseAccounts.map(acc => <ReportRow key={acc.name} label={acc.name} value={acc.balance} currency={currency} />)}
                        <ReportRow label="Total Expenses" value={totalExpenses} currency={currency} isSubtotal isTotal />

                        <div className={`flex justify-between py-3 mt-4 text-lg font-bold border-t-2 ${netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                            <span>Net Income</span>
                            <span>{formatCurrency(netIncome, currency)}</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
