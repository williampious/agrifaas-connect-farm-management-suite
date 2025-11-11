import React, { useState, useEffect } from 'react';
import type { Customer } from '../types';
import { Modal } from './shared/Modal';
import { Input } from './shared/Input';
import { Button } from './shared/Button';

interface CustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (customer: Omit<Customer, 'id'> | Customer) => void;
    initialData: Customer | null;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
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
            alert('Customer name is required.');
            return;
        }
        const customerData = { name, contactPerson, phone, email, address };
        if (initialData) {
            onSubmit({ ...customerData, id: initialData.id });
        } else {
            onSubmit(customerData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Customer' : 'Add New Customer'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="cust-name" label="Customer Name" value={name} onChange={e => setName(e.target.value)} required />
                <Input id="cust-contact" label="Contact Person" value={contactPerson} onChange={e => setContactPerson(e.target.value)} />
                <div className="grid grid-cols-2 gap-4">
                    <Input id="cust-phone" label="Phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
                    <Input id="cust-email" label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <Input id="cust-address" label="Address" value={address} onChange={e => setAddress(e.target.value)} />
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Customer</Button>
                </div>
            </form>
        </Modal>
    );
};