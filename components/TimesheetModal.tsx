import React, { useState, useEffect } from 'react';
import type { Timesheet, Employee } from '../types';
import { Modal } from './shared/Modal';
import { Input } from './shared/Input';
import { Button } from './shared/Button';

interface TimesheetModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (timesheet: Omit<Timesheet, 'id'> | Timesheet) => void;
    initialData: Timesheet | null;
    employees: Employee[];
}

export const TimesheetModal: React.FC<TimesheetModalProps> = ({ isOpen, onClose, onSubmit, initialData, employees }) => {
    const [employeeId, setEmployeeId] = useState('');
    const [date, setDate] = useState('');
    const [hoursWorked, setHoursWorked] = useState(0);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setEmployeeId(initialData.employeeId);
                setDate(initialData.date);
                setHoursWorked(initialData.hoursWorked);
            } else {
                setEmployeeId(employees[0]?.id || '');
                setDate(new Date().toISOString().split('T')[0]);
                setHoursWorked(8);
            }
        }
    }, [initialData, isOpen, employees]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!employeeId || !date || hoursWorked <= 0) {
            alert('Please select an employee and enter a valid date and hours.');
            return;
        }
        const data = { employeeId, date, hoursWorked };
        if (initialData) {
            onSubmit({ ...data, id: initialData.id });
        } else {
            onSubmit(data);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Timesheet Entry' : 'Add Timesheet Entry'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="ts-employee" className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                    <select
                        id="ts-employee"
                        value={employeeId}
                        onChange={e => setEmployeeId(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white text-gray-900"
                        required
                    >
                        {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                </div>
                <Input id="ts-date" label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required />
                <Input id="ts-hours" label="Hours Worked" type="number" step="0.1" value={hoursWorked} onChange={e => setHoursWorked(Number(e.target.value))} required />
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Entry</Button>
                </div>
            </form>
        </Modal>
    );
};