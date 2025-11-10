import React, { useState, useMemo } from 'react';
import type { FarmDataContextType } from '../types';
import { AccountType } from '../types';
import { Card } from './shared/Card';
import { FinancialReportFilters, FilterValue } from './shared/FinancialReportFilters';
import { StatCard } from './shared/StatCard';

interface ProfitabilityReportProps {
    farmData: FarmDataContextType;
    currency: string;
}

export const ProfitabilityReport: React.FC<ProfitabilityReportProps> = ({ farmData, currency }) => {
    const { journalEntries, accounts, plots, seasons } = farmData;
    const [filter, setFilter] = useState<FilterValue>({ startDate: null, endDate: null, plotId: 'all', seasonId: 'all' });
    
    const accountTypeMap = useMemo(() => new Map(accounts.map(a => [a.id, a.type])), [accounts]);

    const { totalRevenue, totalExpenses, netProfit } = useMemo(() => {
        let revenue = 0;
        let expenses = 0;
        
        journalEntries.forEach(entry => {
            // Filter by date
            const entryDate = new Date(entry.date);
            if (filter.startDate && entryDate < new Date(filter.startDate)) return;
            if (filter.endDate && entryDate > new Date(filter.endDate)) return;

            entry.lines.forEach(line => {
                // Filter by plot
                if (filter.plotId !== 'all' && line.plotId !== filter.plotId) {
                    return;
                }
                // Filter by season
                if (filter.seasonId !== 'all' && line.seasonId !== filter.seasonId) {
                    return;
                }
                
                const accountType = accountTypeMap.get(line.accountId);
                
                if (accountType === AccountType.Income) {
                    revenue += line.type === 'credit' ? line.amount : -line.amount;
                } else if (accountType === AccountType.Expense) {
                    expenses += line.type === 'debit' ? line.amount : -line.amount;
                }
            });
        });
        
        return {
            totalRevenue: revenue,
            totalExpenses: expenses,
            netProfit: revenue - expenses,
        };

    }, [journalEntries, accountTypeMap, filter]);

    return (
        <>
            <FinancialReportFilters onChange={setFilter} plots={plots} seasons={seasons} />
            <Card title={`Profitability by Plot/Season (${currency})`}>
                <p className="text-sm text-gray-600 mb-4">
                   Filter to see the financial performance of specific parts of your operation. This report uses journal entry line items tagged with plots and seasons.
                </p>
                {/* Results */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <StatCard title="Total Revenue" value={totalRevenue} color="text-green-600" currency={currency}/>
                    <StatCard title="Total Expenses" value={totalExpenses} color="text-red-600" currency={currency}/>
                    <StatCard 
                        title="Net Profit / Loss" 
                        value={netProfit} 
                        color={netProfit >= 0 ? 'text-blue-600' : 'text-red-600'}
                        currency={currency}
                    />
                </div>
            </Card>
        </>
    );
};