import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../../constants';
import { Card } from '../shared/Card';
import type { ProjectedYearData } from '../../types';

interface ProjectionsChartProps {
    projections: ProjectedYearData[];
    currency: string;
}

export const ProjectionsChart: React.FC<ProjectionsChartProps> = ({ projections, currency }) => {
    const chartData = projections.map(p => ({
        name: p.year,
        Revenue: p.incomeStatement.revenue,
        'Net Profit': p.incomeStatement.pat,
        'Operating Cash Flow': p.cashFlow.netCFO,
    }));

    return (
        <Card title="Key Metrics Projection">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => formatCurrency(value, currency)} />
                    <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
                    <Legend />
                    <Line type="monotone" dataKey="Revenue" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="Net Profit" stroke="#3b82f6" strokeWidth={2} />
                    <Line type="monotone" dataKey="Operating Cash Flow" stroke="#f97316" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};