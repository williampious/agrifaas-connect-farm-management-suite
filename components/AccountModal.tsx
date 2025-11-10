import React, { useState, useEffect } from 'react';
import type { Account } from '../types';
import { AccountType } from '../types';
import { Modal } from './shared/Modal';
import { Input } from './shared/Input';
import { Button } from './shared/Button';
import { CURRENCIES, DEFAULT_CURRENCY } from '../constants';

interface AccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (account: Omit<Account, 'id'> | Account) => void;
    initialData: Account | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [type, setType] = useState<AccountType>(AccountType.Asset);
    const [initialBalance, setInitialBalance] = useState(0);
    const [currency, setCurrency] = useState(DEFAULT_CURRENCY);

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setType(initialData.type);
            setInitialBalance(initialData.initialBalance);
            setCurrency(initialData.currency);
        } else {
            setName('');
            setType(AccountType.Asset);
            setInitialBalance(0);
            setCurrency(DEFAULT_CURRENCY);
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            alert('Please provide an account name.');
            return;
        }
        const accountData = { name, type, initialBalance, currency };
        if (initialData) {
            onSubmit({ ...accountData, id: initialData.id });
        } else {
            onSubmit(accountData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Account' : 'Add New Account'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="acc-name" label="Account Name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                <div>
                    <label htmlFor="acc-type" className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                    <select
                        id="acc-type"
                        value={type}
                        onChange={e => setType(e.target.value as AccountType)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white text-gray-900"
                        required
                    >
                        {Object.values(AccountType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="acc-currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                        id="acc-currency"
                        value={currency}
                        onChange={e => setCurrency(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white text-gray-900"
                        required
                    >
                        {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
                <Input id="acc-balance" label="Initial Balance" type="number" step="0.01" value={initialBalance} onChange={e => setInitialBalance(Number(e.target.value))} required />
                 <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Account</Button>
                </div>
            </form>
        </Modal>
    );
};