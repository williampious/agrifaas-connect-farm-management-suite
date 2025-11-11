import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Task } from '../types';
import { Card } from './shared/Card';
import { DEFAULT_CURRENCY, formatCurrency } from '../constants';

interface CostByCategoryReportProps {
    tasks: Task[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#a4de6c', '#d0ed57', '#ff7300'];

export const CostByCategoryReport: React.FC<CostByCategoryReportProps> = ({ tasks }) => {
    const chartData = useMemo(() => {
        const categoryCostMap = new Map<string, number>();
        
        tasks.forEach(task => {
            if (task.category && task.cost > 0) {
                const currentCost = categoryCostMap.get(task.category) || 0;
                categoryCostMap.set(task.category, currentCost + task.cost);
            }
        });
        
        return Array.from(categoryCostMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value);
            
    }, [tasks]);

    const totalCost = useMemo(() => chartData.reduce((sum, item) => sum + item.value, 0), [chartData]);

    return (
        <Card title={`Estimated Task Cost by Category (${DEFAULT_CURRENCY})`}>
            <p className="text-sm text-gray-600 mb-6">
                This report shows the breakdown of total estimated task costs by their assigned category, based on the current filters.
            </p>
            {chartData.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    outerRadius={120}
                                    fill="#8884d8"
                                    dataKey="value"
                                    nameKey="name"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => [formatCurrency(value, DEFAULT_CURRENCY), "Cost"]} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                     <div className="max-h-96 overflow-y-auto">
                         <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50 sticky top-0">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">% of Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {chartData.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">{formatCurrency(item.value, DEFAULT_CURRENCY)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                            {totalCost > 0 ? `${((item.value / totalCost) * 100).toFixed(1)}%` : '0.0%'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                             <tfoot className="bg-gray-50 sticky bottom-0">
                                <tr className="font-bold">
                                    <td className="px-6 py-4 text-sm text-gray-800">Total</td>
                                    <td className="px-6 py-4 text-sm text-right text-gray-800">{formatCurrency(totalCost, DEFAULT_CURRENCY)}</td>
                                    <td className="px-6 py-4 text-sm text-right text-gray-800">100.0%</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                    <p className="text-lg font-semibold">No Data to Display</p>
                    <p className="mt-1">No task data with associated costs was found for the selected filters.</p>
                </div>
            )}
        </Card>
    );
};