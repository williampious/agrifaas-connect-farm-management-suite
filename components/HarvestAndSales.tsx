import React, { useState, useMemo } from 'react';
import type { FarmDataContextType, User, Harvest, Sale, Customer, Plot } from '../types';
import { Card } from './shared/Card';
import { Table } from './shared/Table';
import { Button } from './shared/Button';
import { CustomerModal } from './CustomerModal';
import { HarvestModal } from './HarvestModal';
import { SaleModal } from './SaleModal';
import { formatCurrency } from '../constants';

// Main Component
export const HarvestAndSales: React.FC<{ farmData: FarmDataContextType, user: User }> = ({ farmData, user }) => {
    const { 
        harvests, sales, customers, plots, accounts,
        addHarvest, addSale, addCustomer, updateCustomer, deleteCustomer 
    } = farmData;
    
    const [view, setView] = useState<'harvests' | 'sales' | 'customers'>('harvests');
    
    // Modal states
    const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isHarvestModalOpen, setHarvestModalOpen] = useState(false);
    const [isSaleModalOpen, setSaleModalOpen] = useState(false);

    const plotMap = useMemo(() => new Map(plots.map(p => [p.id, p.name])), [plots]);
    const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c.name])), [customers]);
    
    // Customer handlers
    const handleOpenAddCustomer = () => { setEditingCustomer(null); setCustomerModalOpen(true); };
    const handleOpenEditCustomer = (customer: Customer) => { setEditingCustomer(customer); setCustomerModalOpen(true); };
    const handleSubmitCustomer = (customerData: Omit<Customer, 'id'> | Customer) => {
        if ('id' in customerData) updateCustomer(customerData, user.name);
        else addCustomer(customerData, user.name);
        setCustomerModalOpen(false);
    };
    const handleDeleteCustomerClick = (customer: Customer) => {
        if (sales.some(s => s.customerId === customer.id)) {
            alert('Cannot delete customer with existing sales.');
            return;
        }
        if (window.confirm(`Delete ${customer.name}?`)) {
            deleteCustomer(customer.id, user.name, customer.name);
        }
    };
    
    const customerColumns = [
        { header: 'Name', accessor: 'name' as keyof Customer },
        { header: 'Contact Person', accessor: 'contactPerson' as keyof Customer },
        { header: 'Phone', accessor: 'phone' as keyof Customer },
        { header: 'Email', accessor: 'email' as keyof Customer },
    ];

    // Harvest handlers
    const handleSubmitHarvest = (harvestData: Omit<Harvest, 'id' | 'quantityRemaining'>) => {
        addHarvest(harvestData, user.name);
        setHarvestModalOpen(false);
    };

    const harvestColumns = [
        { header: 'Date', accessor: 'harvestDate' as keyof Harvest },
        { header: 'Plot', accessor: (h: Harvest) => plotMap.get(h.plotId) || 'N/A' },
        { header: 'Crop', accessor: 'crop' as keyof Harvest },
        { header: 'Total Qty', accessor: (h: Harvest) => `${h.quantity.toFixed(2)} ${h.unit}` },
        { header: 'Qty Remaining', accessor: (h: Harvest) => `${h.quantityRemaining.toFixed(2)} ${h.unit}` },
        { header: 'Storage', accessor: 'storageLocation' as keyof Harvest },
    ];
    
    // Sale handlers
    const handleSubmitSale = (saleData: Omit<Sale, 'id' | 'journalEntryId' | 'invoiceNumber'>) => {
        addSale(saleData, user.name);
        setSaleModalOpen(false);
    };

    const saleColumns = [
        { header: 'Date', accessor: 'saleDate' as keyof Sale },
        { header: 'Invoice #', accessor: 'invoiceNumber' as keyof Sale },
        { header: 'Customer', accessor: (s: Sale) => customerMap.get(s.customerId) || 'N/A' },
        { header: 'Total', accessor: (s: Sale) => {
            const total = s.items.reduce((sum, i) => sum + (i.quantitySold * i.unitPrice), 0);
            return formatCurrency(total, s.currency);
        }},
        { header: 'Status', accessor: (s: Sale) => {
            const colors: Record<Sale['status'], string> = {
                'Pending': 'bg-yellow-100 text-yellow-800', 'Paid': 'bg-green-100 text-green-800', 'Overdue': 'bg-red-100 text-red-800'
            };
            return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[s.status]}`}>{s.status}</span>;
        }},
    ];


    return (
        <>
            <CustomerModal isOpen={isCustomerModalOpen} onClose={() => setCustomerModalOpen(false)} onSubmit={handleSubmitCustomer} initialData={editingCustomer} />
            <HarvestModal isOpen={isHarvestModalOpen} onClose={() => setHarvestModalOpen(false)} onSubmit={handleSubmitHarvest} plots={plots} />
            <SaleModal isOpen={isSaleModalOpen} onClose={() => setSaleModalOpen(false)} onSubmit={handleSubmitSale} customers={customers} harvests={harvests} />
            
            <div className="space-y-6">
                <div className="bg-white p-2 rounded-lg shadow-sm flex space-x-2">
                    {(['harvests', 'sales', 'customers'] as const).map(v => (
                        <button key={v} onClick={() => setView(v)} className={`px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors ${view === v ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                            {v}
                        </button>
                    ))}
                </div>

                {view === 'harvests' && (
                    <Card title="Harvest Log">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-600">Record of all harvested produce from your plots.</p>
                            <Button onClick={() => setHarvestModalOpen(true)}>Log New Harvest</Button>
                        </div>
                        <Table<Harvest> columns={harvestColumns} data={harvests} />
                    </Card>
                )}
                
                {view === 'sales' && (
                     <Card title="Sales Ledger">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-600">Track all sales. Recording a sale automatically updates harvest stock and posts revenue to your journal.</p>
                            <Button onClick={() => setSaleModalOpen(true)} disabled={customers.length === 0 || harvests.length === 0}>
                                {customers.length === 0 ? "Add a Customer First" : harvests.length === 0 ? "Log a Harvest First" : "Record New Sale"}
                            </Button>
                        </div>
                        <Table<Sale> columns={saleColumns} data={sales} />
                    </Card>
                )}
                
                {view === 'customers' && (
                    <Card title="Customer Directory">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-600">Manage your list of buyers and customers.</p>
                            <Button onClick={handleOpenAddCustomer}>Add Customer</Button>
                        </div>
                        <Table<Customer> 
                            columns={customerColumns} 
                            data={customers}
                            renderActions={(customer) => (
                                <div className="space-x-2">
                                    <Button variant="secondary" className="!py-1 !px-2 text-sm" onClick={() => handleOpenEditCustomer(customer)}>Edit</Button>
                                    <Button variant="danger" className="!py-1 !px-2 text-sm" onClick={() => handleDeleteCustomerClick(customer)}>Delete</Button>
                                </div>
                            )}
                        />
                    </Card>
                )}
            </div>
        </>
    );
};