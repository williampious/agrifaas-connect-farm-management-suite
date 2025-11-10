import React, { useState, useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import type { FarmDataContextType } from '../types';
import { AccountType } from '../types';
import { Card } from './shared/Card';
import { FinancialReportFilters, FilterValue } from './shared/FinancialReportFilters';
import { formatCurrency } from '../constants';
import { ReportHeader } from './shared/ReportHeader';
import { exportToExcel, exportToCSV } from '../utils/exportUtils';

interface ExpenseByCategoryReportProps {
    farmData: FarmDataContextType;
    currency: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c', '#d0ed57', '#ffc658'];

export const ExpenseByCategoryReport: React.FC<ExpenseByCategoryReportProps> = ({ farmData, currency }) => {
    const { journalEntries, accounts, plots, seasons } = farmData;
    const [filter, setFilter] = useState<FilterValue>({ startDate: null, endDate: null, plotId: 'all', seasonId: 'all' });
    
    const accountTypeMap = useMemo(() => new Map(accounts.map(a => [a.id, a.type])), [accounts]);

    const { expenseData, totalExpenses } = useMemo(() => {
        const categoryTotals: { [key: string]: number } = {};
        
        journalEntries.forEach(entry => {
            // Filter by date
            const entryDate = new Date(entry.date);
            if (filter.startDate && entryDate < new Date(filter.startDate)) return;
            if (filter.endDate && entryDate > new Date(filter.endDate)) return;
            if (entry.currency !== currency) return;

            entry.lines.forEach(line => {
                // Filter by plot
                if (filter.plotId !== 'all' && line.plotId !== filter.plotId) return;
                // Filter by season
                if (filter.seasonId !== 'all' && line.seasonId !== filter.seasonId) return;
                
                const accountType = accountTypeMap.get(line.accountId);
                
                if (accountType === AccountType.Expense) {
                    const category = entry.category || 'Uncategorized';
                    const amount = line.type === 'debit' ? line.amount : -line.amount;
                    categoryTotals[category] = (categoryTotals[category] || 0) + amount;
                }
            });
        });
        
        const expenseData = Object.entries(categoryTotals)
            .map(([name, value]) => ({ name, value }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value);

        const totalExpenses = expenseData.reduce((sum, item) => sum + item.value, 0);
        
        return { expenseData, totalExpenses };

    }, [journalEntries, accountTypeMap, filter, currency]);

    const getExportData = () => [
        ['Category', 'Amount', '% of Total'],
        ...expenseData.map(item => [item.name, item.value, totalExpenses > 0 ? ((item.value / totalExpenses) * 100).toFixed(2) + '%' : '0.00%']),
        [],
        ['Total Expenses', totalExpenses, '100.00%']
    ];

    const handleExportExcel = () => {
        exportToExcel(getExportData(), 'Expense_By_Category', 'Expense By Category');
    };
    
    const handleExportCSV = () => {
        exportToCSV(getExportData(), 'Expense_By_Category');
    };

    return (
        <div className="space-y-6">
            <div className="no-print">
                <FinancialReportFilters onChange={setFilter} plots={plots} seasons={seasons} />
            </div>
            <div className="printable-area">
                <Card>
                    <ReportHeader
                        title="Expenses by Category"
                        filter={filter}
                        onPrint={() => window.print()}
                        onExportExcel={handleExportExcel}
                        onExportCSV={handleExportCSV}
                    />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={expenseData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={120}
                                        fill="#8884d8"
                                        dataKey="value"
                                        nameKey="name"
                                    >
                                        {expenseData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                             <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount ({currency})</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {expenseData.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="text-center py-4 text-gray-500">No expense data for the selected period.</td>
                                        </tr>
                                    )}
                                    {expenseData.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(item.value, currency)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                                {totalExpenses > 0 ? `${((item.value / totalExpenses) * 100).toFixed(1)}%` : '0.0%'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-gray-50 sticky bottom-0">
                                    <tr className="font-bold">
                                        <td className="px-6 py-4 text-sm text-gray-800">Total</td>
                                        <td className="px-6 py-4 text-sm text-right text-gray-800">{formatCurrency(totalExpenses, currency)}</td>
                                        <td className="px-6 py-4 text-sm text-right text-gray-800">{totalExpenses > 0 ? '100.0%' : '0.0%'}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
