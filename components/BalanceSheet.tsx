import React, { useMemo, useState } from 'react';
import type { FarmDataContextType } from '../types';
import { AccountType } from '../types';
import { useFinancialCalculations } from '../hooks/useFinancialCalculations';
import { Card } from './shared/Card';
import { FinancialReportFilters, FilterValue } from './shared/FinancialReportFilters';
import { formatCurrency } from '../constants';
import { ReportHeader } from './shared/ReportHeader';
import { exportToExcel, exportToCSV } from '../utils/exportUtils';


interface BalanceSheetProps {
    farmData: FarmDataContextType;
    currency: string;
}

const ReportSection: React.FC<{ title: string, accounts: { name: string, balance: number }[], total: number, currency: string }> = ({ title, accounts, total, currency }) => (
    <div>
        <h3 className="text-lg font-semibold border-b pb-2 mb-2">{title}</h3>
        {accounts.map(acc => (
            <div key={acc.name} className="flex justify-between py-1 text-sm">
                <span>{acc.name}</span>
                <span>{formatCurrency(acc.balance, currency)}</span>
            </div>
        ))}
        <div className="flex justify-between py-2 text-sm font-bold border-t">
            <span>Total {title}</span>
            <span>{formatCurrency(total, currency)}</span>
        </div>
    </div>
);

export const BalanceSheet: React.FC<BalanceSheetProps> = ({ farmData, currency }) => {
    const { accounts, journalEntries, plots, seasons } = farmData;
    const [filter, setFilter] = useState<FilterValue>({ startDate: null, endDate: null, plotId: 'all', seasonId: 'all' });
    const { accountBalances, netIncome } = useFinancialCalculations(accounts, journalEntries, filter);

    const {
        assetAccounts,
        liabilityAccounts,
        equityAccounts,
        totalAssets,
        totalLiabilities,
        totalEquity,
    } = useMemo(() => {
        const assets: { name: string, balance: number }[] = [];
        const liabilities: { name: string, balance: number }[] = [];
        const equity: { name: string, balance: number }[] = [];

        let totAssets = 0, totLiabilities = 0, totEquity = 0;

        accounts.forEach(account => {
            const balance = accountBalances.get(account.id) ?? 0;
            if (Math.abs(balance) < 0.01 && account.type !== AccountType.Equity) return;

            switch (account.type) {
                case AccountType.Asset:
                    assets.push({ name: account.name, balance });
                    totAssets += balance;
                    break;
                case AccountType.Liability:
                    liabilities.push({ name: account.name, balance });
                    totLiabilities += balance;
                    break;
                case AccountType.Equity:
                    equity.push({ name: account.name, balance });
                    totEquity += balance;
                    break;
            }
        });
        
        const currentPeriodEarnings = { name: `Retained Earnings (Period)`, balance: netIncome };
        if (Math.abs(netIncome) > 0.01 || filter.startDate || filter.endDate) {
            equity.push(currentPeriodEarnings);
        }
        totEquity += netIncome;


        return {
            assetAccounts: assets,
            liabilityAccounts: liabilities,
            equityAccounts: equity,
            totalAssets: totAssets,
            totalLiabilities: totLiabilities,
            totalEquity: totEquity,
        };
    }, [accounts, accountBalances, netIncome, filter]);

    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;
    const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

    const handleExportExcel = () => {
         const dataForExport = [
            ['Balance Sheet'], [],
            ['Assets', 'Amount'],
            ...assetAccounts.map(acc => [acc.name, acc.balance]),
            ['Total Assets', totalAssets],
            [],
            ['Liabilities', 'Amount'],
            ...liabilityAccounts.map(acc => [acc.name, acc.balance]),
            ['Total Liabilities', totalLiabilities],
            [],
            ['Equity', 'Amount'],
            ...equityAccounts.map(acc => [acc.name, acc.balance]),
            ['Total Equity', totalEquity],
            [],
            ['Total Liabilities & Equity', totalLiabilitiesAndEquity]
        ];
        exportToExcel(dataForExport, 'Balance_Sheet', 'Balance Sheet');
    }
    
    const handleExportCSV = () => {
        const dataForExport = [
            ['Category', 'Account', 'Amount'],
            ...assetAccounts.map(acc => ['Assets', acc.name, acc.balance]),
            ['Assets', 'Total Assets', totalAssets],
            ...liabilityAccounts.map(acc => ['Liabilities', acc.name, acc.balance]),
            ['Liabilities', 'Total Liabilities', totalLiabilities],
            ...equityAccounts.map(acc => ['Equity', acc.name, acc.balance]),
            ['Equity', 'Total Equity', totalEquity],
            ['', 'Total Liabilities & Equity', totalLiabilitiesAndEquity]
        ];
        exportToCSV(dataForExport, 'Balance_Sheet');
    };

    return (
        <div className="space-y-6">
            <div className="no-print">
                <FinancialReportFilters onChange={setFilter} plots={plots} seasons={seasons} />
            </div>
             <div className="printable-area">
                <Card>
                    <ReportHeader 
                        title="Balance Sheet"
                        filter={filter}
                        onPrint={() => window.print()}
                        onExportExcel={handleExportExcel}
                        onExportCSV={handleExportCSV}
                    />
                    <p className="text-sm text-gray-600 mb-4 no-print">
                        This report provides a snapshot of the farm's financial position as of the selected end date, proving the equation: Assets = Liabilities + Equity.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <ReportSection title="Assets" accounts={assetAccounts} total={totalAssets} currency={currency} />
                        <div className="space-y-6">
                            <ReportSection title="Liabilities" accounts={liabilityAccounts} total={totalLiabilities} currency={currency} />
                            <ReportSection title="Equity" accounts={equityAccounts} total={totalEquity} currency={currency} />
                            
                            <div className="flex justify-between py-2 text-sm font-bold border-t">
                                <span>Total Liabilities & Equity</span>
                                <span>{formatCurrency(totalLiabilitiesAndEquity, currency)}</span>
                            </div>
                        </div>
                    </div>
                    <div className={`mt-6 pt-3 border-t-2 text-center font-bold text-lg ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                        {isBalanced ? 'The balance sheet is balanced.' : 'Warning: The balance sheet is not balanced.'}
                    </div>
                </Card>
            </div>
        </div>
    );
};
