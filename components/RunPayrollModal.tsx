import React, { useState, useMemo, useEffect } from 'react';
import type { Timesheet, Employee, Account, JournalEntry } from '../types';
import { AccountType } from '../types';
import { Modal } from './shared/Modal';
import { Input } from './shared/Input';
import { Button } from './shared/Button';
import { DEFAULT_CURRENCY, formatCurrency } from '../constants';

interface RunPayrollModalProps {
    isOpen: boolean;
    onClose: () => void;
    employees: Employee[];
    timesheets: Timesheet[];
    accounts: Account[];
    addJournalEntry: (entry: Omit<JournalEntry, 'id'>) => void;
}

interface PayrollSummary {
    employeeId: string;
    employeeName: string;
    totalHours: number;
    payRate: number;
    grossPay: number;
}

export const RunPayrollModal: React.FC<RunPayrollModalProps> = ({ isOpen, onClose, employees, timesheets, accounts, addJournalEntry }) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const todayStr = today.toISOString().split('T')[0];

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(todayStr);

    useEffect(() => {
        if(isOpen) {
            setStartDate(firstDayOfMonth);
            setEndDate(todayStr);
        }
    }, [isOpen]);

    const payrollSummary = useMemo((): PayrollSummary[] => {
        if (!startDate || !endDate) return [];

        const relevantTimesheets = timesheets.filter(ts => {
            return ts.date >= startDate && ts.date <= endDate;
        });

        const hoursByEmployee: { [key: string]: number } = {};
        relevantTimesheets.forEach(ts => {
            hoursByEmployee[ts.employeeId] = (hoursByEmployee[ts.employeeId] || 0) + ts.hoursWorked;
        });

        return employees
            .map(emp => {
                const totalHours = hoursByEmployee[emp.id] || 0;
                if (totalHours === 0) return null;
                return {
                    employeeId: emp.id,
                    employeeName: emp.name,
                    totalHours,
                    payRate: emp.payRate,
                    grossPay: totalHours * emp.payRate,
                };
            })
            .filter((s): s is PayrollSummary => s !== null);
    }, [startDate, endDate, timesheets, employees]);
    
    const totalPayrollCost = useMemo(() => {
        return payrollSummary.reduce((sum, item) => sum + item.grossPay, 0);
    }, [payrollSummary]);
    
    const handleSubmit = () => {
        if (totalPayrollCost <= 0) {
            alert('No payroll data to process for the selected period.');
            return;
        }

        const expenseAccount = accounts.find(a => a.name.toLowerCase() === 'labor wages');
        const cashAccount = accounts.find(a => a.name.toLowerCase() === 'cash at bank');

        if (!expenseAccount || !cashAccount) {
            alert('Cannot run payroll. Please ensure you have accounts named "Labor Wages" (Expense) and "Cash at Bank" (Asset) set up in your Chart of Accounts.');
            return;
        }
        
        const journalEntry: Omit<JournalEntry, 'id'> = {
            date: new Date().toISOString().split('T')[0],
            description: `Payroll for period ${startDate} to ${endDate}`,
            category: 'Salaries',
            currency: DEFAULT_CURRENCY, // Assuming default currency for payroll
            lines: [
                {
                    accountId: expenseAccount.id,
                    type: 'debit',
                    amount: totalPayrollCost
                },
                {
                    accountId: cashAccount.id,
                    type: 'credit',
                    amount: totalPayrollCost
                }
            ]
        };

        addJournalEntry(journalEntry);
        alert(`Payroll processed successfully! A journal entry for ${formatCurrency(totalPayrollCost, DEFAULT_CURRENCY)} has been posted.`);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Run Payroll" size="2xl">
            <div className="space-y-4">
                <p className="text-sm text-gray-600">Select a pay period to calculate gross pay based on logged timesheets. This will create a journal entry debiting 'Labor Wages' and crediting 'Cash at Bank'.</p>
                <div className="grid grid-cols-2 gap-4">
                    <Input id="payroll-start" label="Start Date" type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                    <Input id="payroll-end" label="End Date" type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
                
                <div className="mt-4 border rounded-lg max-h-80 overflow-y-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Hours</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Rate</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Gross Pay</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {payrollSummary.length === 0 && (
                                <tr><td colSpan={4} className="text-center py-4 text-gray-500">No timesheets found in this period.</td></tr>
                            )}
                            {payrollSummary.map(item => (
                                <tr key={item.employeeId}>
                                    <td className="px-4 py-2 text-sm font-medium text-gray-900">{item.employeeName}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500 text-right">{item.totalHours.toFixed(2)}</td>
                                    <td className="px-4 py-2 text-sm text-gray-500 text-right">{formatCurrency(item.payRate, DEFAULT_CURRENCY)}</td>
                                    <td className="px-4 py-2 text-sm text-gray-900 text-right font-semibold">{formatCurrency(item.grossPay, DEFAULT_CURRENCY)}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-gray-50 sticky bottom-0">
                            <tr className="font-bold">
                                <td colSpan={3} className="px-4 py-2 text-right text-sm text-gray-800">Total Payroll Cost</td>
                                <td className="px-4 py-2 text-right text-sm text-gray-800">{formatCurrency(totalPayrollCost, DEFAULT_CURRENCY)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="button" onClick={handleSubmit} disabled={totalPayrollCost <= 0}>
                        Confirm & Post Journal Entry
                    </Button>
                </div>
            </div>
        </Modal>
    );
};