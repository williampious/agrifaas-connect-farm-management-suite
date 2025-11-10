import React from 'react';
import { Button } from './Button';
import type { FilterValue } from './FinancialReportFilters';

interface ReportHeaderProps {
    title: string;
    filter: FilterValue;
    onPrint: () => void;
    onExportExcel: () => void;
    onExportCSV: () => void;
}

const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
}

export const ReportHeader: React.FC<ReportHeaderProps> = ({ title, filter, onPrint, onExportExcel, onExportCSV }) => {

    const getPeriodText = () => {
        if (!filter.startDate && !filter.endDate) {
            return "For All Time";
        }
        if (filter.startDate && filter.endDate) {
            return `For the period from ${formatDate(filter.startDate)} to ${formatDate(filter.endDate)}`;
        }
        if (filter.endDate) {
            return `As of ${formatDate(filter.endDate)}`;
        }
        return `From ${formatDate(filter.startDate)}`;
    };

    return (
        <div className="mb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-sm font-semibold text-gray-500">AgriFAAS Connect</h2>
                    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                    <p className="text-xs text-gray-500">{getPeriodText()}</p>
                </div>
                <div className="flex flex-wrap justify-end gap-2 no-print">
                    <Button variant="secondary" onClick={onPrint}>Print</Button>
                    <Button variant="secondary" onClick={onExportExcel}>Export to Excel</Button>
                    <Button variant="secondary" onClick={onExportCSV}>Export to CSV</Button>
                </div>
            </div>
            <hr className="my-3"/>
        </div>
    );
};
