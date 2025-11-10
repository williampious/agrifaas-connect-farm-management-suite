import React, { useMemo } from 'react';
import type { FarmDataContextType, Task, User } from '../types';
import { TaskStatus, AccountType } from '../types';
import { Card } from './shared/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DEFAULT_CURRENCY, formatCurrency } from '../constants';

interface DashboardProps {
    farmData: Omit<FarmDataContextType, 'addTask' | 'updateTask' | 'addEmployee' | 'addTransaction' | 'addInventoryItem'>;
    user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ farmData, user }) => {
    const { tasks, plots, journalEntries, accounts } = farmData;

    const taskSummary = useMemo(() => {
        return tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
        }, {} as Record<TaskStatus, number>);
    }, [tasks]);

    const financialSummary = useMemo(() => {
        const defaultCurrencyAccounts = accounts.filter(a => a.currency === DEFAULT_CURRENCY);
        const accountTypeMap = new Map(defaultCurrencyAccounts.map(a => [a.id, a.type]));

        return journalEntries
            .filter(je => je.currency === DEFAULT_CURRENCY)
            .reduce((acc, entry) => {
                entry.lines.forEach(line => {
                    const type = accountTypeMap.get(line.accountId);
                    if (type === AccountType.Income) {
                        acc.income += line.type === 'credit' ? line.amount : -line.amount;
                    } else if (type === AccountType.Expense) {
                        acc.expenses += line.type === 'debit' ? line.amount : -line.amount;
                    }
                });
                return acc;
            }, { income: 0, expenses: 0 });
    }, [journalEntries, accounts]);
    
    const profit = financialSummary.income - financialSummary.expenses;

    const chartData = useMemo(() => {
         const defaultCurrencyAccounts = accounts.filter(a => a.currency === DEFAULT_CURRENCY);
        const accountTypeMap = new Map(defaultCurrencyAccounts.map(a => [a.id, a.type]));

        const plotData = plots.reduce((acc, plot) => {
            acc[plot.id] = { name: plot.name, income: 0, expenses: 0 };
            return acc;
        }, {} as Record<string, { name: string; income: number; expenses: number }>);
        
        journalEntries
            .filter(je => je.currency === DEFAULT_CURRENCY)
            .forEach(entry => {
                entry.lines.forEach(line => {
                    if (line.plotId && plotData[line.plotId]) {
                        const type = accountTypeMap.get(line.accountId);
                        if (type === AccountType.Income) {
                             plotData[line.plotId].income += line.type === 'credit' ? line.amount : -line.amount;
                        } else if (type === AccountType.Expense) {
                             plotData[line.plotId].expenses += line.type === 'debit' ? line.amount : -line.amount;
                        }
                    }
                });
        });

        return Object.values(plotData);
    }, [plots, journalEntries, accounts]);


    return (
        <div className="space-y-6">
             <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800">Welcome back, {user.name}!</h2>
                <p className="text-gray-600">Here's a snapshot of your farm's performance.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Task Status" className="col-span-1 md:col-span-2 lg:col-span-1">
                    <ul className="space-y-2">
                        <li className="flex justify-between items-center"><span className="text-gray-600">To-Do</span> <span className="font-bold text-blue-500">{taskSummary[TaskStatus.ToDo] || 0}</span></li>
                        <li className="flex justify-between items-center"><span className="text-gray-600">In Progress</span> <span className="font-bold text-yellow-500">{taskSummary[TaskStatus.InProgress] || 0}</span></li>
                        <li className="flex justify-between items-center"><span className="text-gray-600">Done</span> <span className="font-bold text-green-500">{taskSummary[TaskStatus.Done] || 0}</span></li>
                    </ul>
                </Card>
                <Card title={`Financial Overview (${DEFAULT_CURRENCY})`} className="col-span-1 md:col-span-2 lg:col-span-2">
                     <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-sm text-gray-500">Total Revenue</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(financialSummary.income, DEFAULT_CURRENCY)}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Expenses</p>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(financialSummary.expenses, DEFAULT_CURRENCY)}</p>
                        </div>
                         <div>
                            <p className="text-sm text-gray-500">Net Profit</p>
                            <p className={`text-2xl font-bold ${profit >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                {formatCurrency(profit, DEFAULT_CURRENCY)}
                            </p>
                        </div>
                    </div>
                </Card>
                 <Card title="Quick Links" className="col-span-1">
                    <ul className="space-y-2">
                        <li><a href="#" className="text-green-600 hover:underline">Add New Task</a></li>
                        <li><a href="#" className="text-green-600 hover:underline">Log Expense</a></li>
                        <li><a href="#" className="text-green-600 hover:underline">View Inventory</a></li>
                    </ul>
                </Card>
                <Card title={`Profitability by Plot (${DEFAULT_CURRENCY})`} className="col-span-1 md:col-span-2 lg:col-span-4">
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value: number) => formatCurrency(value, DEFAULT_CURRENCY)} />
                            <Tooltip formatter={(value: number) => formatCurrency(value, DEFAULT_CURRENCY)} />
                            <Legend />
                            <Bar dataKey="income" fill="#22c55e" name="Revenue" />
                            <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};