
import React from 'react';
import { Input } from './Input';

interface DateFilterProps {
    startDate: string;
    endDate: string;
    onStartDateChange: (date: string) => void;
    onEndDateChange: (date: string) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
    return (
        <div className="flex space-x-4">
            <Input 
                id="start-date"
                label="Start Date"
                type="date"
                value={startDate}
                onChange={e => onStartDateChange(e.target.value)}
            />
            <Input 
                id="end-date"
                label="End Date"
                type="date"
                value={endDate}
                onChange={e => onEndDateChange(e.target.value)}
            />
        </div>
    );
};