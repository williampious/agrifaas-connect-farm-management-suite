import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { JournalEntry, JournalEntryLine, Account, Plot, Season } from '../types';
import { Modal } from './shared/Modal';
import { Input } from './shared/Input';
import { Button } from './shared/Button';
import { JOURNAL_CATEGORIES, CURRENCIES, DEFAULT_CURRENCY } from '../constants';

interface JournalEntryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (entry: Omit<JournalEntry, 'id'> | JournalEntry) => void;
    initialData: JournalEntry | null;
    accounts: Account[];
    plots: Plot[];
    seasons: Season[];
}

export const JournalEntryDialog: React.FC<JournalEntryDialogProps> = ({ isOpen, onClose, onSubmit, initialData, accounts, plots, seasons }) => {
    const [date, setDate] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState<string>(JOURNAL_CATEGORIES[0]);
    const [currency, setCurrency] = useState<string>(DEFAULT_CURRENCY);
    const [lines, setLines] = useState<JournalEntryLine[]>([]);

    // Filter accounts based on selected currency
    const availableAccounts = useMemo(() => {
        return accounts.filter(a => a.currency === currency).sort((a,b) => a.name.localeCompare(b.name));
    }, [accounts, currency]);

    const emptyLine = useCallback((): JournalEntryLine => ({
        accountId: availableAccounts[0]?.id || '',
        type: 'debit',
        amount: 0,
        plotId: null,
        seasonId: null,
    }), [availableAccounts]);


    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setDate(initialData.date);
                setDescription(initialData.description);
                setCategory(initialData.category || JOURNAL_CATEGORIES[0]);
                setCurrency(initialData.currency);
                setLines(initialData.lines);
            } else {
                setDate(new Date().toISOString().split('T')[0]);
                setDescription('');
                setCategory(JOURNAL_CATEGORIES[0]);
                setCurrency(DEFAULT_CURRENCY);
                setLines([emptyLine(), emptyLine()]);
            }
        }
    }, [initialData, isOpen, accounts, emptyLine]);

     // Re-initialize lines if currency changes on a new entry
    useEffect(() => {
        if (isOpen && !initialData) {
            setLines([emptyLine(), emptyLine()]);
        }
    }, [currency, isOpen, initialData, emptyLine]);


    const handleLineChange = (index: number, field: keyof JournalEntryLine, value: any) => {
        const newLines = [...lines];
        const line: any = { ...newLines[index] };
        
        if (field === 'amount') {
            line.amount = Number(value);
        } else if (field === 'plotId' || field === 'seasonId') {
            line[field] = value === 'none' ? null : value;
        } 
        else {
            line[field] = value;
        }
        
        newLines[index] = line;
        setLines(newLines);
    };

    const addLine = () => {
        setLines([...lines, emptyLine()]);
    };

    const removeLine = (index: number) => {
        if (lines.length > 2) {
            setLines(lines.filter((_, i) => i !== index));
        } else {
            alert('A journal entry must have at least two lines.');
        }
    };

    const { totalDebits, totalCredits, isBalanced } = useMemo(() => {
        const totals = lines.reduce((acc, line) => {
            if (line.type === 'debit') acc.debits += line.amount;
            if (line.type === 'credit') acc.credits += line.amount;
            return acc;
        }, { debits: 0, credits: 0 });

        return {
            totalDebits: totals.debits,
            totalCredits: totals.credits,
            isBalanced: Math.abs(totals.debits - totals.credits) < 0.01 && totals.debits > 0
        };
    }, [lines]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isBalanced) {
            alert('Debits and Credits must be equal and greater than zero.');
            return;
        }
        if (!description || !date) {
            alert('Please provide a date and description.');
            return;
        }
        const entryData = { date, description, lines, category, currency };
        if (initialData) {
            onSubmit({ ...entryData, id: initialData.id });
        } else {
            onSubmit(entryData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Journal Entry' : 'Create Journal Entry'} size="4xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-1"><Input id="je-date" label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} required /></div>
                    <div className="md:col-span-1">
                        <label htmlFor="je-currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select id="je-currency" value={currency} onChange={e => setCurrency(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900" disabled={!!initialData}>
                            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                         <label htmlFor="je-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select id="je-category" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900">
                             {JOURNAL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                    <div className="md:col-span-4"><Input id="je-desc" label="Description" type="text" value={description} onChange={e => setDescription(e.target.value)} required /></div>
                </div>
                
                <div className="hidden sm:grid grid-cols-12 gap-2 items-center text-xs font-medium text-gray-500 pt-2">
                    <div className="col-span-4">Account</div>
                    <div className="col-span-2">Plot</div>
                    <div className="col-span-2">Season</div>
                    <div className="col-span-1">Type</div>
                    <div className="col-span-2">Amount</div>
                    <div className="col-span-1"></div>
                </div>

                <div className="space-y-2">
                    {lines.map((line, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                            <div className="col-span-12 sm:col-span-4">
                                <label className="text-sm font-medium text-gray-700 sm:hidden">Account</label>
                                <select value={line.accountId} onChange={e => handleLineChange(index, 'accountId', e.target.value)} className="w-full text-sm px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-900">
                                    {availableAccounts.length === 0 && <option>No accounts for {currency}</option>}
                                    {availableAccounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                </select>
                            </div>
                            <div className="col-span-6 sm:col-span-2">
                                <label className="text-sm font-medium text-gray-700 sm:hidden">Plot</label>
                                <select value={line.plotId || 'none'} onChange={e => handleLineChange(index, 'plotId', e.target.value)} className="w-full text-sm px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-900">
                                    <option value="none">-- None --</option>
                                    {plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                             <div className="col-span-6 sm:col-span-2">
                                <label className="text-sm font-medium text-gray-700 sm:hidden">Season</label>
                                <select value={line.seasonId || 'none'} onChange={e => handleLineChange(index, 'seasonId', e.target.value)} className="w-full text-sm px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-900">
                                     <option value="none">-- None --</option>
                                    {seasons.map(s => <option key={s.id} value={s.id}>{`${s.name} ${s.year}`}</option>)}
                                </select>
                            </div>
                             <div className="col-span-4 sm:col-span-1">
                                <label className="text-sm font-medium text-gray-700 sm:hidden">Type</label>
                                <select value={line.type} onChange={e => handleLineChange(index, 'type', e.target.value)} className="w-full text-sm px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-900">
                                    <option value="debit">D</option>
                                    <option value="credit">C</option>
                                </select>
                            </div>
                            <div className="col-span-6 sm:col-span-2">
                                <label className="text-sm font-medium text-gray-700 sm:hidden">Amount</label>
                                <input type="number" step="0.01" placeholder="Amount" value={line.amount} onChange={e => handleLineChange(index, 'amount', e.target.value)} className="w-full text-sm px-2 py-1 border border-gray-300 rounded-md bg-white text-gray-900" />
                            </div>
                            <div className="col-span-2 sm:col-span-1 text-right">
                                <button type="button" onClick={() => removeLine(index)} className="text-red-500 hover:text-red-700 font-bold text-lg mt-4 sm:mt-0">&times;</button>
                            </div>
                        </div>
                    ))}
                </div>
                
                <Button type="button" variant="secondary" onClick={addLine} className="text-sm !py-1 !px-2">Add Line</Button>

                <div className="flex justify-between items-center bg-gray-50 p-2 rounded-md mt-4 text-sm">
                    <div>
                        <span className="font-semibold">Totals:</span>
                        <span className="ml-2">Debits: {totalDebits.toFixed(2)}</span>
                        <span className="ml-4">Credits: {totalCredits.toFixed(2)}</span>
                    </div>
                    <div className={`font-bold ${isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                        {isBalanced ? 'Balanced' : 'Unbalanced'}
                    </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit" disabled={!isBalanced || availableAccounts.length === 0}>Save Entry</Button>
                </div>
            </form>
        </Modal>
    );
};