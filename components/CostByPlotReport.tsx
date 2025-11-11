import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Task, Plot } from '../types';
import { Card } from './shared/Card';
import { DEFAULT_CURRENCY, formatCurrency } from '../constants';

interface CostByPlotReportProps {
    tasks: Task[];
    plots: Plot[];
}

export const CostByPlotReport: React.FC<CostByPlotReportProps> = ({ tasks, plots }) => {
    const chartData = useMemo(() => {
        const plotCostMap = new Map<string, number>();
        
        tasks.forEach(task => {
            const currentCost = plotCostMap.get(task.plotId) || 0;
            plotCostMap.set(task.plotId, currentCost + task.cost);
        });
        
        const plotNameMap = new Map(plots.map(p => [p.id, p.name]));
        
        return Array.from(plotCostMap.entries())
            .map(([plotId, cost]) => ({
                name: plotNameMap.get(plotId) || `Unknown Plot`,
                cost: cost,
            }))
            .filter(item => item.name !== 'Unknown Plot' && item.cost > 0)
            .sort((a, b) => b.cost - a.cost);
            
    }, [tasks, plots]);

    return (
        <Card title={`Estimated Task Cost by Plot (${DEFAULT_CURRENCY})`}>
            <p className="text-sm text-gray-600 mb-6">
                This report shows the total estimated cost of all tasks associated with each plot, based on the current filters.
            </p>
            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart 
                        data={chartData} 
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        layout="vertical"
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value: number) => formatCurrency(value, DEFAULT_CURRENCY)} />
                        <YAxis type="category" dataKey="name" width={150} interval={0} />
                        <Tooltip formatter={(value: number) => [formatCurrency(value, DEFAULT_CURRENCY), "Cost"]} />
                        <Legend />
                        <Bar dataKey="cost" name="Total Estimated Cost" fill="#22c55e" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                    <p className="text-lg font-semibold">No Data to Display</p>
                    <p className="mt-1">No task data with associated costs was found for the selected filters.</p>
                </div>
            )}
        </Card>
    );
};
