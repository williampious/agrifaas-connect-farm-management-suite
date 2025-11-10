import React, { useState, useEffect } from 'react';
import type { Farmer } from '../types';
import { Modal } from './shared/Modal';
import { Input } from './shared/Input';
import { Button } from './shared/Button';

interface FarmerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (farmer: Omit<Farmer, 'id'> | Farmer) => void;
    initialData: Farmer | null;
}

export const FarmerModal: React.FC<FarmerModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [name, setName] = useState('');
    const [location, setLocation] = useState('');
    const [contact, setContact] = useState('');
    const [farmSize, setFarmSize] = useState(0);
    const [crops, setCrops] = useState('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setName(initialData.name);
                setLocation(initialData.location);
                setContact(initialData.contact);
                setFarmSize(initialData.farmSize);
                setCrops(initialData.crops.join(', '));
                setNotes(initialData.notes);
            } else {
                setName('');
                setLocation('');
                setContact('');
                setFarmSize(0);
                setCrops('');
                setNotes('');
            }
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const farmerData = { 
            name, 
            location, 
            contact, 
            farmSize, 
            crops: crops.split(',').map(c => c.trim()).filter(Boolean), 
            notes 
        };
        if (initialData) {
            onSubmit({ ...farmerData, id: initialData.id });
        } else {
            onSubmit(farmerData);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Farmer' : 'Add New Farmer'} size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="farmer-name" label="Full Name" value={name} onChange={e => setName(e.target.value)} required />
                <Input id="farmer-location" label="Location (Town/Region)" value={location} onChange={e => setLocation(e.target.value)} required />
                <Input id="farmer-contact" label="Contact (Phone/Email)" value={contact} onChange={e => setContact(e.target.value)} required />
                <Input id="farmer-size" label="Farm Size (Acres)" type="number" value={farmSize} onChange={e => setFarmSize(Number(e.target.value))} required />
                <Input id="farmer-crops" label="Crops (comma-separated)" value={crops} onChange={e => setCrops(e.target.value)} placeholder="e.g., Maize, Soybean, Cassava" />
                <div>
                    <label htmlFor="farmer-notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                    <textarea id="farmer-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={4} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"></textarea>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Farmer</Button>
                </div>
            </form>
        </Modal>
    );
};
