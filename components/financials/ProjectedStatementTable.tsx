import React from 'react';
import { formatCurrency } from '../../constants';

interface Row {
    label: string;
    values?: number[];
    isHeader?: boolean;
    isSubtotal?: boolean;
    isTotal?: boolean;
    isNote?: boolean;
    indent?: number;
}

interface ProjectedStatementTableProps {
    years: number[];
    rows: Row[];
    currency: string;
}

export const ProjectedStatementTable: React.FC<ProjectedStatementTableProps> = ({ years, rows, currency }) => {
    if (years.length === 0) {
        return <p className="text-gray-500 text-center py-8">Enter assumptions and generate a projection to see results.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Line Item</th>
                        {years.map(year => (
                            <th key={year} className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Year {year}</th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {rows.map((row, index) => {
                        if (row.isHeader) {
                             return (
                                <tr key={index} className="bg-gray-100">
                                    <td colSpan={years.length + 1} className="px-6 py-2 text-sm font-semibold text-gray-700">
                                        {row.label}
                                    </td>
                                </tr>
                            );
                        }
                        
                        const rowClasses = [
                            row.isTotal ? 'font-bold bg-gray-50' : '',
                            row.isSubtotal ? 'font-semibold' : '',
                            row.isNote ? 'italic text-gray-500' : '',
                        ].join(' ');

                        return (
                            <tr key={index} className={rowClasses}>
                                <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-800" style={{ paddingLeft: `${1.5 + (row.indent || 0) * 1}rem` }}>
                                    {row.label}
                                </td>
                                {row.values?.map((value, vIndex) => (
                                     <td key={vIndex} className="px-6 py-3 whitespace-nowrap text-sm text-gray-600 text-right">
                                        {formatCurrency(value, currency)}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};