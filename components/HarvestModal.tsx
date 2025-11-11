import React, { useState, useEffect } from 'react';
import type { Harvest, Plot } from '../types';
import { Modal } from './shared/Modal';
import { Input } from './shared/Input';
import { Button } from './shared/Button';

interface HarvestModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (harvest: Omit<Harvest, 'id' | 'quantityRemaining'>) => void;
    plots: Plot[];
}

export const HarvestModal: React.FC<HarvestModalProps> = ({ isOpen, onClose, onSubmit, plots }) => {
    const [plotId, setPlotId] = useState('');
    const [crop, setCrop] = useState('');
    const [quantity, setQuantity] = useState(0);
    const [unit, setUnit] = useState('kg');
    const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
    const [storageLocation, setStorageLocation] = useState('');
    const [notes, setNotes] = useState('');
    
    useEffect(() => {
        if(isOpen) {
            const selectedPlot = plots.find(p => p.id === plotId);
            setCrop(selectedPlot?.crop || '');
        } else {
             setPlotId(plots[0]?.id || '');
             setCrop(plots[0]?.crop || '');
             setQuantity(0);
             setUnit('kg');
             setHarvestDate(new Date().toISOString().split('T')[0]);
             setStorageLocation('');
             setNotes('');
        }
    }, [isOpen, plotId, plots]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!plotId || quantity <= 0 || !unit || !harvestDate) {
            alert('Please fill out all required fields.');
            return;
        }
        onSubmit({ plotId, crop, quantity, unit, harvestDate, storageLocation, notes });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Log New Harvest">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="harvest-plot" className="block text-sm font-medium text-gray-700 mb-1">Plot</label>
                        <select id="harvest-plot" value={plotId} onChange={e => setPlotId(e.target.value)} className="w-full p-2 border rounded-md bg-white text-gray-900" required>
                            <option value="" disabled>Select a plot</option>
                            {plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <Input id="harvest-crop" label="Crop" value={crop} onChange={e => setCrop(e.target.value)} required />
                </div>
                 <div className="grid grid-cols-2 gap-4">
                    <Input id="harvest-qty" label="Quantity" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} required />
                    <Input id="harvest-unit" label="Unit (e.g., kg, tonnes, bags)" value={unit} onChange={e => setUnit(e.target.value)} required />
                </div>
                <Input id="harvest-date" label="Harvest Date" type="date" value={harvestDate} onChange={e => setHarvestDate(e.target.value)} required />
                <Input id="harvest-storage" label="Storage Location" value={storageLocation} onChange={e => setStorageLocation(e.target.value)} />
                <div>
                     <label htmlFor="harvest-notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                     <textarea id="harvest-notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full p-2 border rounded-md bg-white text-gray-900"/>
                </div>
                 <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Log Harvest</Button>
                </div>
            </form>
        </Modal>
    );
};