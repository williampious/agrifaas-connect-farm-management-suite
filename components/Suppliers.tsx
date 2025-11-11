import React, { useState, useMemo, useEffect } from 'react';
import type { FarmDataContextType, Supplier, User, InventoryItem } from '../types';
import { Card } from './shared/Card';
import { Table } from './shared/Table';
import { Button } from './shared/Button';
import { Modal } from './shared/Modal';
import { Input } from './shared/Input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../constants';

// SupplierModal for Add/Edit
interface SupplierModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (supplier: Omit<Supplier, 'id'> | Supplier) => void;
    initialData: Supplier | null;
}

const SupplierModal: React.FC<SupplierModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [address, setAddress] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setContactPerson(initialData.contactPerson);
                setPhone(initialData.phone);
                setEmail(initialData.email);
                setAddress(initialData.address);
            } else {
                setName('');
                setContactPerson('');
                setPhone('');
                setEmail('');
                setAddress('');
            }
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) {
            alert('Supplier name is required.');
            return;
        }
        const supplierData = { name, contactPerson, phone, email, address };
        if (initialData) {
            onSubmit({ ...supplierData, id: initialData.id });
        } else {
            onSubmit(supplierData);
        }
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Supplier' : 'Add New Supplier'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="sup-name" label="Supplier Name" value={name} onChange={e => setName(e.target.value)} required />
                <Input id="sup-contact" label="Contact Person" value={contactPerson} onChange={e => setContactPerson(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                    <Input id="sup-phone" label="Phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                    <Input id="sup-email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <Input id="sup-address" label="Address" value={address} onChange={e => setAddress(e.target.value)} />
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Supplier</Button>
                </div>
            </form>
        </Modal>
    );
};


// Purchases by Supplier Report Component
const PurchasesBySupplierReport: React.FC<{ inventory: InventoryItem[], suppliers: Supplier[] }> = ({ inventory, suppliers }) => {
    const reportData = useMemo(() => {
        const supplierMap = new Map(suppliers.map(s => [s.id, s.name]));
        const purchaseMap = new Map<string, number>();

        inventory.forEach(item => {
            const totalValue = item.costPerUnit * item.quantity;
            const currentTotal = purchaseMap.get(item.supplierId) || 0;
            purchaseMap.set(item.supplierId, currentTotal + totalValue);
        });

        return Array.from(purchaseMap.entries())
            .map(([supplierId, totalPurchaseValue]) => ({
                name: supplierMap.get(supplierId) || 'Unknown Supplier',
                value: totalPurchaseValue,
                currency: inventory.find(i => i.supplierId === supplierId)?.currency || '',
            }))
            .filter(item => item.value > 0)
            .sort((a, b) => b.value - a.value);

    }, [inventory, suppliers]);

    return (
        <Card title="Total Purchase Value by Supplier">
            <p className="text-sm text-gray-600 mb-6">This chart shows the total value of all items purchased from each supplier.</p>
            {reportData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={reportData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tickFormatter={(value: number) => formatCurrency(value, reportData[0]?.currency || 'USD')} />
                        <YAxis type="category" dataKey="name" width={150} interval={0} />
                        <Tooltip formatter={(value: number, name, props) => [formatCurrency(value, props.payload.currency), "Total Value"]} />
                        <Legend />
                        <Bar dataKey="value" name="Total Purchase Value" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                 <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                    <p className="text-lg font-semibold">No Purchase Data</p>
                    <p className="mt-1">No inventory items with cost and supplier information found.</p>
                </div>
            )}
        </Card>
    );
};


// Main Suppliers Component
export const Suppliers: React.FC<{ farmData: FarmDataContextType, user: User }> = ({ farmData, user }) => {
    const { suppliers, inventory, addSupplier, updateSupplier, deleteSupplier } = farmData;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
    const [view, setView] = useState<'directory' | 'reports'>('directory');

    const handleOpenAddModal = () => {
        setEditingSupplier(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (supplier: Supplier) => {
        setEditingSupplier(supplier);
        setIsModalOpen(true);
    };

    const handleSubmitSupplier = (supplierData: Omit<Supplier, 'id'> | Supplier) => {
        if ('id' in supplierData) {
            updateSupplier(supplierData, user.name);
        } else {
            addSupplier(supplierData, user.name);
        }
    };
    
    const handleDeleteSupplier = (supplier: Supplier) => {
        const isSupplierInUse = inventory.some(item => item.supplierId === supplier.id);
        if (isSupplierInUse) {
            alert(`Cannot delete "${supplier.name}" as it is linked to one or more inventory items. Please reassign those items first.`);
            return;
        }
        if (window.confirm(`Are you sure you want to delete "${supplier.name}"? This action cannot be undone.`)) {
            deleteSupplier(supplier.id, user.name, supplier.name);
        }
    };

    const supplierColumns = [
        { header: 'Name', accessor: 'name' as keyof Supplier },
        { header: 'Contact Person', accessor: 'contactPerson' as keyof Supplier },
        { header: 'Phone', accessor: 'phone' as keyof Supplier },
        { header: 'Email', accessor: 'email' as keyof Supplier },
    ];

    return (
        <>
            <SupplierModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmitSupplier}
                initialData={editingSupplier}
            />
            <div className="space-y-6">
                <div className="bg-white p-2 rounded-lg shadow-sm flex space-x-2">
                    <button
                        onClick={() => setView('directory')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'directory' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Supplier Directory
                    </button>
                    <button
                        onClick={() => setView('reports')}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${view === 'reports' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        Reports
                    </button>
                </div>

                {view === 'directory' && (
                    <Card title="Supplier Directory">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-600">Manage your list of vendors and suppliers.</p>
                            <Button onClick={handleOpenAddModal}>Add Supplier</Button>
                        </div>
                        <Table<Supplier>
                            columns={supplierColumns}
                            data={suppliers}
                            renderActions={(supplier) => (
                                <div className="space-x-2">
                                    <Button variant="secondary" className="!py-1 !px-2 text-sm" onClick={() => handleOpenEditModal(supplier)}>Edit</Button>
                                    <Button variant="danger" className="!py-1 !px-2 text-sm" onClick={() => handleDeleteSupplier(supplier)}>Delete</Button>
                                </div>
                            )}
                        />
                    </Card>
                )}

                {view === 'reports' && (
                    <PurchasesBySupplierReport inventory={inventory} suppliers={suppliers} />
                )}
            </div>
        </>
    );
};
