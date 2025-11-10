import React from 'react';
import { formatCurrency } from '../../constants';

interface StatCardProps {
    title: string;
    value: number;
    color: string;
    currency: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, color, currency }) => (
    <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="text-sm text-gray-500">{title}</h4>
        <p className={`text-2xl font-bold ${color}`}>
             {formatCurrency(value, currency)}
        </p>
    </div>
);
