import React from 'react';
import type { Farmer } from '../types';
import { Modal } from './shared/Modal';

interface FarmerDetailModalProps {
    farmer: Farmer;
    onClose: () => void;
}

export const FarmerDetailModal: React.FC<FarmerDetailModalProps> = ({ farmer, onClose }) => {
    return (
        <Modal isOpen={!!farmer} onClose={onClose} title="Farmer Details" size="lg">
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-800">{farmer.name}</h3>
                <div className="grid grid-cols-3 gap-x-4 gap-y-2 text-sm pt-2 border-t">
                    <div className="font-semibold text-gray-500 col-span-1">Location:</div> <div className="col-span-2">{farmer.location}</div>
                    <div className="font-semibold text-gray-500 col-span-1">Contact:</div> <div className="col-span-2">{farmer.contact}</div>
                    <div className="font-semibold text-gray-500 col-span-1">Farm Size:</div> <div className="col-span-2">{farmer.farmSize} acres</div>
                    <div className="font-semibold text-gray-500 col-span-1">Crops:</div> <div className="col-span-2">{farmer.crops.join(', ')}</div>
                </div>
                <div>
                    <h4 className="font-semibold text-gray-600">Notes:</h4>
                    <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded-md mt-1">{farmer.notes || 'No notes available.'}</p>
                </div>
            </div>
        </Modal>
    );
};
