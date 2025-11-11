import React, { useState, useEffect, useMemo } from 'react';
import type { Sale, Customer, Harvest, SaleItem } from '../types';
import { Modal } from './shared/Modal';
import { Button } from './shared/Button';
import { CURRENCIES, DEFAULT_CURRENCY, formatCurrency } from '../constants';

interface SaleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (sale: Omit<Sale, 'id' | 'journalEntryId' | 'invoiceNumber'>) => void;
    customers: Customer[];
    harvests: Harvest[];
}

const emptyItem = (): SaleItem => ({ harvestId: '', quantitySold: 0, unitPrice: 0 });

export const SaleModal: React.FC<SaleModalProps> = ({ isOpen, onClose, onSubmit, customers, harvests }) => {
    const [customerId, setCustomerId] = useState('');
    const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
    const [status, setStatus] = useState<Sale['status']>('Pending');
    const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
    const [notes, setNotes] = useState('');
    const [items, setItems] = useState<SaleItem[]>([emptyItem()]);
    
    const availableHarvests = useMemo(() => harvests.filter(h => h.quantityRemaining > 0), [harvests]);
    
    useEffect(() => {
        if (isOpen) {
            setCustomerId(customers[0]?.id || '');
            setSaleDate(new Date().toISOString().split('T')[0]);
            setStatus('Pending');
            setCurrency(DEFAULT_CURRENCY);
            setNotes('');
            setItems([emptyItem()]);
        }
    }, [isOpen, customers]);

    const handleItemChange = (index: number, field: keyof SaleItem, value: string | number) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const addItemLine = () => setItems([...items, emptyItem()]);
    const removeItemLine = (index: number) => {
        if (items.length > 1) {
            setItems(items.filter((_, i) => i !== index));
        }
    };

    const totalAmount = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.quantitySold * item.unitPrice), 0);
    }, [items]);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validItems = items.filter(i => i.harvestId && i.quantitySold > 0 && i.unitPrice >= 0);
        if (!customerId || validItems.length === 0) {
            alert('Please select a customer and add at least one valid sale item.');
            return;
        }
        onSubmit({ customerId, saleDate, status, currency, items: validItems, notes });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record New Sale" size="3xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
                        <select value={customerId} onChange={e => setCustomerId(e.target.value)} className="w-full p-2 border rounded-md bg-white text-gray-900" required>
                           {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Sale Date</label>
                        <input type="date" value={saleDate} onChange={e => setSaleDate(e.target.value)} className="w-full p-2 border rounded-md bg-white text-gray-900" required />
                    </div>
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value as Sale['status'])} className="w-full p-2 border rounded-md bg-white text-gray-900" required>
                            <option>Pending</option><option>Paid</option>
                        </select>
                    </div>
                </div>
                
                {/* Sale Items */}
                <div className="pt-4 border-t">
                    <h4 className="font-semibold text-gray-700 mb-2">Sale Items</h4>
                    <div className="space-y-2">
                        {items.map((item, index) => {
                            const selectedHarvest = availableHarvests.find(h => h.id === item.harvestId);
                            return (
                                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                                    <select value={item.harvestId} onChange={e => handleItemChange(index, 'harvestId', e.target.value)} className="col-span-5 p-2 border rounded-md bg-white text-sm">
                                        <option value="">Select harvested produce...</option>
                                        {availableHarvests.map(h => (
                                            <option key={h.id} value={h.id}>
                                                {h.crop} (Plot: {h.plotId.substring(0,4)}) - {h.quantityRemaining.toFixed(2)} {h.unit} left
                                            </option>
                                        ))}
                                    </select>
                                    <input type="number" placeholder="Qty Sold" value={item.quantitySold} onChange={e => handleItemChange(index, 'quantitySold', Number(e.target.value))} max={selectedHarvest?.quantityRemaining} className="col-span-3 p-2 border rounded-md bg-white text-sm" />
                                    <input type="number" placeholder="Unit Price" step="0.01" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', Number(e.target.value))} className="col-span-3 p-2 border rounded-md bg-white text-sm" />
                                    <button type="button" onClick={() => removeItemLine(index)} className="col-span-1 text-red-500 font-bold">&times;</button>
                                </div>
                            );
                        })}
                    </div>
                    <Button type="button" variant="secondary" onClick={addItemLine} className="mt-2 !text-xs !py-1 !px-2">Add Item</Button>
                </div>
                
                 <div className="flex justify-between items-end pt-4 border-t">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full p-2 border rounded-md bg-white text-gray-900" />
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-800">{formatCurrency(totalAmount, currency)}</p>
                    </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Record Sale</Button>
                </div>
            </form>
        </Modal>
    );
};