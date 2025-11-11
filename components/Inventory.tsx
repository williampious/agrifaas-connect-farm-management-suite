
import React, { useState, useEffect, useMemo } from 'react';
import type { FarmDataContextType, InventoryItem, Supplier, User } from '../types';
import { Card } from './shared/Card';
import { Table } from './shared/Table';
import { Button } from './shared/Button';
import { Modal } from './shared/Modal';
import { Input } from './shared/Input';
import { CURRENCIES, DEFAULT_CURRENCY, formatCurrency } from '../constants';

interface InventoryItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (item: Omit<InventoryItem, 'id' | 'journalEntryId'> | InventoryItem) => void;
    initialData: InventoryItem | null;
    suppliers: Supplier[];
}

const InventoryItemModal: React.FC<InventoryItemModalProps> = ({ isOpen, onClose, onSubmit, initialData, suppliers }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState<'Seeds' | 'Fertilizer' | 'Pesticide' | 'Equipment' | 'Other'>('Other');
    const [quantity, setQuantity] = useState(0);
    const [unit, setUnit] = useState('');
    const [supplierId, setSupplierId] = useState('');
    const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
    const [costPerUnit, setCostPerUnit] = useState(0);
    const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
    const [reorderPoint, setReorderPoint] = useState<number | ''>('');
    
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setCategory(initialData.category);
                setQuantity(initialData.quantity);
                setUnit(initialData.unit);
                setSupplierId(initialData.supplierId);
                setPurchaseDate(initialData.purchaseDate);
                setCostPerUnit(initialData.costPerUnit);
                setCurrency(initialData.currency);
                setReorderPoint(initialData.reorderPoint ?? '');
            } else {
                setName('');
                setCategory('Other');
                setQuantity(0);
                setUnit('');
                setSupplierId(suppliers[0]?.id || '');
                setPurchaseDate(new Date().toISOString().split('T')[0]);
                setCostPerUnit(0);
                setCurrency(DEFAULT_CURRENCY);
                setReorderPoint('');
            }
        }
    }, [initialData, isOpen, suppliers]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !unit || quantity < 0 || costPerUnit < 0 || !supplierId) {
            alert('Please fill out all fields with valid values.');
            return;
        }
        const itemData = { 
            name, 
            category, 
            quantity, 
            unit, 
            supplierId, 
            purchaseDate, 
            costPerUnit, 
            currency,
            reorderPoint: reorderPoint === '' ? undefined : Number(reorderPoint)
        };
        
        if (initialData) {
            onSubmit({ ...initialData, ...itemData });
        } else {
            onSubmit(itemData);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Inventory Item' : 'Add New Inventory Item'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="item-name" label="Item Name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                <div>
                    <label htmlFor="item-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select id="item-category" value={category} onChange={e => setCategory(e.target.value as any)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white text-gray-900" required>
                        <option>Seeds</option>
                        <option>Fertilizer</option>
                        <option>Pesticide</option>
                        <option>Equipment</option>
                        <option>Other</option>
                    </select>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Input id="item-quantity" label="Quantity" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
                    <Input id="item-unit" label="Unit (e.g., kg, bag)" type="text" value={unit} onChange={e => setUnit(e.target.value)} required />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Input id="item-cost" label="Cost per Unit" type="number" step="0.01" value={costPerUnit} onChange={e => setCostPerUnit(Number(e.target.value))} required disabled={!!initialData} />
                    <div>
                        <label htmlFor="item-currency" className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                        <select id="item-currency" value={currency} onChange={e => setCurrency(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white text-gray-900" required disabled={!!initialData}>
                            {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                 </div>
                <div>
                    <label htmlFor="item-supplier" className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                    <select id="item-supplier" value={supplierId} onChange={e => setSupplierId(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white text-gray-900" required>
                        {suppliers.length === 0 && <option value="" disabled>Please add a supplier first</option>}
                        {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Input id="item-date" label="Purchase Date" type="date" value={purchaseDate} onChange={e => setPurchaseDate(e.target.value)} required disabled={!!initialData} />
                    <Input id="item-reorder-point" label="Reorder Point (Optional)" type="number" value={reorderPoint} onChange={e => setReorderPoint(e.target.value === '' ? '' : Number(e.target.value))} placeholder="e.g., 10" />
                 </div>
                 {initialData && <p className="text-xs text-gray-500">Cost, currency, and purchase date cannot be edited to maintain financial integrity. Please create a new item for new purchases.</p>}
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Item</Button>
                </div>
            </form>
        </Modal>
    );
};

interface InventoryProps {
    farmData: FarmDataContextType;
    user: User;
}

export const Inventory: React.FC<InventoryProps> = ({ farmData, user }) => {
    const { inventory, suppliers, addInventoryItem, updateInventoryItem, deleteInventoryItem } = farmData;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

    const supplierMap = useMemo(() => new Map(suppliers.map(s => [s.id, s.name])), [suppliers]);

    const handleOpenAddModal = () => {
        if (suppliers.length === 0) {
            alert("Please add a supplier in the 'Suppliers' module before adding an inventory item.");
            return;
        }
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item: InventoryItem) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleSubmitItem = (itemData: Omit<InventoryItem, 'id' | 'journalEntryId'> | InventoryItem) => {
        if ('id' in itemData) {
            updateInventoryItem(itemData, user.name);
        } else {
            addInventoryItem(itemData, user.name);
        }
    };
    
    const handleDeleteItem = (item: InventoryItem) => {
        if (window.confirm(`Are you sure you want to delete "${item.name}"? This action cannot be undone.`)) {
            deleteInventoryItem(item.id, user.name, item.name);
        }
    };

    const inventoryColumns = [
        { header: 'Item Name', accessor: 'name' as keyof InventoryItem },
        { header: 'Category', accessor: 'category' as keyof InventoryItem },
        { 
            header: 'Quantity', 
            accessor: (item: InventoryItem) => {
                const isLowStock = item.reorderPoint !== undefined && item.quantity <= item.reorderPoint;
                const isOutOfStock = item.quantity <= 0;

                let badge = null;
                if (isOutOfStock) {
                    badge = <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Out of Stock</span>;
                } else if (isLowStock) {
                    badge = <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Low Stock</span>;
                }
                
                return (
                    <div className="flex items-center">
                        <span>{`${item.quantity.toFixed(2)} ${item.unit}`}</span>
                        {badge}
                    </div>
                );
            } 
        },
        { header: 'Cost/Unit', accessor: (item: InventoryItem) => formatCurrency(item.costPerUnit, item.currency) },
        { header: 'Total Value', accessor: (item: InventoryItem) => formatCurrency(item.quantity * item.costPerUnit, item.currency) },
        { header: 'Supplier', accessor: (item: InventoryItem) => supplierMap.get(item.supplierId) || 'N/A' },
    ];

    return (
        <>
            <InventoryItemModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSubmit={handleSubmitItem}
                initialData={editingItem} 
                suppliers={suppliers}
            />
            <div className="space-y-6">
                <Card title="Inventory Management">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-sm text-gray-600">Track all your farm inputs. Adding an item with a cost will automatically create a transaction in your financial journal.</p>
                        <Button onClick={handleOpenAddModal}>Add Inventory Item</Button>
                    </div>
                    <Table<InventoryItem> 
                        columns={inventoryColumns} 
                        data={inventory} 
                        renderActions={(item) => (
                            <div className="space-x-2">
                                <Button variant="secondary" className="!py-1 !px-2 text-sm" onClick={() => handleOpenEditModal(item)}>Edit</Button>
                                <Button variant="danger" className="!py-1 !px-2 text-sm" onClick={() => handleDeleteItem(item)}>Delete</Button>
                            </div>
                        )}
                    />
                </Card>
            </div>
        </>
    );
};
