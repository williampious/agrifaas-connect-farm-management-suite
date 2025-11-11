import React, { useState, useEffect } from 'react';
import type { Farmer, CropPortfolioItem, LivestockItem, EquipmentItem, WaterSource } from '../types';
import { 
    ALL_FARMER_STATUSES, ALL_COMM_CHANNELS, ALL_PHONE_TYPES, ALL_TENURE_TYPES, 
    ALL_WATER_SOURCES, ALL_GENDERS, ALL_CREDIT_HISTORIES 
} from '../types';
import { Modal } from './shared/Modal';
import { Input } from './shared/Input';
import { Button } from './shared/Button';

interface FarmerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (farmer: Omit<Farmer, 'id'> | Farmer) => void;
    initialData: Farmer | null;
}

const emptyFarmer = (): Omit<Farmer, 'id'> => ({
    name: '', photoUrl: '', contact: '', address: '', age: null, gender: 'Prefer not to say', educationLevel: '',
    phoneType: 'None', preferredChannel: 'In-Person', status: 'Active', activationDate: new Date().toISOString().split('T')[0],
    lastActivityDate: new Date().toISOString().split('T')[0], gpsCoordinates: '', fieldDescription: '',
    landSize: 0, tenure: 'Owner', waterSource: [], cropPortfolio: [], livestock: [], equipment: [],
    laborForceSize: null, certifications: [], hasBankAccount: false, hasMobileMoney: false,
    creditHistory: 'None', preferredMarket: '', offFarmIncome: false, notes: ''
});

type Tab = 'personal' | 'farm' | 'production' | 'financial';

export const FarmerModal: React.FC<FarmerModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [farmerData, setFarmerData] = useState<Omit<Farmer, 'id'>>(emptyFarmer());
    const [activeTab, setActiveTab] = useState<Tab>('personal');

    useEffect(() => {
        if (isOpen) {
            setFarmerData(initialData ? { ...emptyFarmer(), ...initialData } : emptyFarmer());
            setActiveTab('personal');
        }
    }, [initialData, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
             setFarmerData(prev => ({...prev, [name]: checked}));
        } else if (type === 'number') {
            setFarmerData(prev => ({ ...prev, [name]: value === '' ? null : Number(value) }));
        }
        else {
            setFarmerData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleWaterSourceChange = (source: WaterSource) => {
        const newSources = farmerData.waterSource.includes(source)
            ? farmerData.waterSource.filter(s => s !== source)
            : [...farmerData.waterSource, source];
        setFarmerData(prev => ({...prev, waterSource: newSources }));
    };

    const handleArrayChange = <T,>(field: keyof Omit<Farmer, 'id'>, index: number, subField: keyof T, value: any) => {
        const newArray = [...(farmerData[field] as T[])];
        (newArray[index] as any)[subField] = value;
        setFarmerData(prev => ({ ...prev, [field]: newArray }));
    };

    const addArrayItem = (field: 'cropPortfolio' | 'livestock' | 'equipment') => {
        let newItem;
        if (field === 'cropPortfolio') newItem = { cropName: '', area: 0, variety: '' };
        if (field === 'livestock') newItem = { type: '', count: 0 };
        if (field === 'equipment') newItem = { name: '', owned: true };
        
        setFarmerData(prev => ({...prev, [field]: [...prev[field], newItem]}));
    };
    
    const removeArrayItem = (field: keyof Omit<Farmer, 'id'>, index: number) => {
        const newArray = (farmerData[field] as any[]).filter((_, i) => i !== index);
        setFarmerData(prev => ({...prev, [field]: newArray}));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalData = {
            ...farmerData,
            certifications: Array.isArray(farmerData.certifications) ? farmerData.certifications : String(farmerData.certifications).split(',').map(c => c.trim()).filter(Boolean),
        }
        if (initialData) {
            onSubmit({ ...finalData, id: initialData.id });
        } else {
            onSubmit(finalData);
        }
    };
    
    const TabButton: React.FC<{tab: Tab, children: React.ReactNode}> = ({ tab, children }) => (
        <button type="button" onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tab ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            {children}
        </button>
    );

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Farmer' : 'Add New Farmer'} size="3xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex space-x-2 border-b pb-2">
                    <TabButton tab="personal">Personal & Contact</TabButton>
                    <TabButton tab="farm">Farm & Location</TabButton>
                    <TabButton tab="production">Production</TabButton>
                    <TabButton tab="financial">Financial</TabButton>
                </div>
                
                {activeTab === 'personal' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input id="name" name="name" label="Full Name" value={farmerData.name} onChange={handleChange} required />
                        <Input id="contact" name="contact" label="Contact (Phone/Email)" value={farmerData.contact} onChange={handleChange} required />
                        <div className="md:col-span-2"><Input id="address" name="address" label="Address" value={farmerData.address} onChange={handleChange} required /></div>
                        <Input id="age" name="age" label="Age" type="number" value={farmerData.age ?? ''} onChange={handleChange} />
                        <Input id="educationLevel" name="educationLevel" label="Education Level" value={farmerData.educationLevel} onChange={handleChange} />
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Gender</label><select name="gender" value={farmerData.gender} onChange={handleChange} className="w-full p-2 border rounded-md bg-white">{ALL_GENDERS.map(g => <option key={g}>{g}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Phone Type</label><select name="phoneType" value={farmerData.phoneType} onChange={handleChange} className="w-full p-2 border rounded-md bg-white">{ALL_PHONE_TYPES.map(p => <option key={p}>{p}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Preferred Channel</label><select name="preferredChannel" value={farmerData.preferredChannel} onChange={handleChange} className="w-full p-2 border rounded-md bg-white">{ALL_COMM_CHANNELS.map(c => <option key={c}>{c}</option>)}</select></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select name="status" value={farmerData.status} onChange={handleChange} className="w-full p-2 border rounded-md bg-white">{ALL_FARMER_STATUSES.map(s => <option key={s}>{s}</option>)}</select></div>
                    </div>
                )}

                {activeTab === 'farm' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Input id="landSize" name="landSize" label="Total Land Size (Acres)" type="number" value={farmerData.landSize} onChange={handleChange} required />
                         <Input id="gpsCoordinates" name="gpsCoordinates" label="GPS Coordinates" value={farmerData.gpsCoordinates} onChange={handleChange} placeholder="e.g., 5.6037, -0.1870" />
                         <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Field Description</label><textarea name="fieldDescription" value={farmerData.fieldDescription} onChange={handleChange} rows={3} className="w-full p-2 border rounded-md bg-white"/></div>
                         <div><label className="block text-sm font-medium text-gray-700 mb-1">Land Tenure</label><select name="tenure" value={farmerData.tenure} onChange={handleChange} className="w-full p-2 border rounded-md bg-white">{ALL_TENURE_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                         <div><label className="block text-sm font-medium text-gray-700 mb-1">Water Sources</label><div className="flex flex-wrap gap-2 p-2 border rounded-md bg-white">{ALL_WATER_SOURCES.map(s => <label key={s} className="flex items-center space-x-2"><input type="checkbox" checked={farmerData.waterSource.includes(s)} onChange={() => handleWaterSourceChange(s)} /><span>{s}</span></label>)}</div></div>
                    </div>
                )}
                
                {activeTab === 'production' && (
                    <div className="space-y-4">
                        {/* Crop Portfolio */}
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Crop Portfolio</h4>
                            {farmerData.cropPortfolio.map((crop, index) => (
                                <div key={index} className="grid grid-cols-4 gap-2 items-center mb-2">
                                    <input placeholder="Crop Name" value={crop.cropName} onChange={e => handleArrayChange('cropPortfolio', index, 'cropName', e.target.value)} className="col-span-1 p-2 border rounded-md bg-white"/>
                                    <input placeholder="Variety" value={crop.variety} onChange={e => handleArrayChange('cropPortfolio', index, 'variety', e.target.value)} className="col-span-1 p-2 border rounded-md bg-white"/>
                                    <input placeholder="Area (acres)" type="number" value={crop.area} onChange={e => handleArrayChange('cropPortfolio', index, 'area', Number(e.target.value))} className="col-span-1 p-2 border rounded-md bg-white"/>
                                    <Button type="button" variant="danger" onClick={() => removeArrayItem('cropPortfolio', index)} className="!py-1 !px-2 text-sm">Remove</Button>
                                </div>
                            ))}
                            <Button type="button" variant="secondary" onClick={() => addArrayItem('cropPortfolio')} className="!py-1 !px-2 text-sm">Add Crop</Button>
                        </div>
                        <hr/>
                        {/* Livestock */}
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-2">Livestock</h4>
                            {farmerData.livestock.map((item, index) => (
                                <div key={index} className="grid grid-cols-3 gap-2 items-center mb-2">
                                    <input placeholder="Livestock Type" value={item.type} onChange={e => handleArrayChange('livestock', index, 'type', e.target.value)} className="col-span-1 p-2 border rounded-md bg-white"/>
                                    <input placeholder="Count" type="number" value={item.count} onChange={e => handleArrayChange('livestock', index, 'count', Number(e.target.value))} className="col-span-1 p-2 border rounded-md bg-white"/>
                                    <Button type="button" variant="danger" onClick={() => removeArrayItem('livestock', index)} className="!py-1 !px-2 text-sm">Remove</Button>
                                </div>
                            ))}
                             <Button type="button" variant="secondary" onClick={() => addArrayItem('livestock')} className="!py-1 !px-2 text-sm">Add Livestock</Button>
                        </div>
                        <hr/>
                         {/* Other production fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <Input id="laborForceSize" name="laborForceSize" label="Labor Force Size" type="number" value={farmerData.laborForceSize ?? ''} onChange={handleChange} />
                             <Input id="certifications" name="certifications" label="Certifications (comma-separated)" value={Array.isArray(farmerData.certifications) ? farmerData.certifications.join(', ') : farmerData.certifications} onChange={handleChange} />
                          </div>
                    </div>
                )}
                
                {activeTab === 'financial' && (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2"><Input id="preferredMarket" name="preferredMarket" label="Preferred Market/Buyer" value={farmerData.preferredMarket} onChange={handleChange} /></div>
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Credit History</label><select name="creditHistory" value={farmerData.creditHistory} onChange={handleChange} className="w-full p-2 border rounded-md bg-white">{ALL_CREDIT_HISTORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                        <div className="space-y-2 p-2 border rounded-md">
                             <label className="flex items-center space-x-2"><input type="checkbox" name="hasBankAccount" checked={farmerData.hasBankAccount} onChange={handleChange} /><span>Has Bank Account</span></label>
                             <label className="flex items-center space-x-2"><input type="checkbox" name="hasMobileMoney" checked={farmerData.hasMobileMoney} onChange={handleChange} /><span>Has Mobile Money</span></label>
                             <label className="flex items-center space-x-2"><input type="checkbox" name="offFarmIncome" checked={farmerData.offFarmIncome} onChange={handleChange} /><span>Has Off-Farm Income</span></label>
                        </div>
                         <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Notes</label><textarea name="notes" value={farmerData.notes} onChange={handleChange} rows={4} className="w-full p-2 border rounded-md bg-white"/></div>
                     </div>
                )}
                

                <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Farmer</Button>
                </div>
            </form>
        </Modal>
    );
};