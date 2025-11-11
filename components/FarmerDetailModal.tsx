import React, { useState } from 'react';
import type { Farmer, Interaction, User } from '../types';
import { Modal } from './shared/Modal';
import { Button } from './shared/Button';
import { Avatar } from './shared/Avatar';

interface FarmerDetailModalProps {
    farmer: Farmer;
    onClose: () => void;
    interactions: Interaction[];
    addInteraction: (interaction: Omit<Interaction, 'id'>, actorName: string) => void;
    user: User;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode; fullWidth?: boolean }> = ({ label, value, fullWidth = false }) => (
    <div className={fullWidth ? "col-span-2" : "col-span-1"}>
        <p className="text-xs text-gray-500 font-semibold">{label}</p>
        <p className="text-sm text-gray-800">{value}</p>
    </div>
);

const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="mt-4">
        <h4 className="text-md font-bold text-gray-700 border-b pb-1 mb-2">{title}</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            {children}
        </div>
    </div>
);

type Tab = 'summary' | 'production' | 'interactions';

export const FarmerDetailModal: React.FC<FarmerDetailModalProps> = ({ farmer, onClose, interactions, addInteraction, user }) => {
    const [activeTab, setActiveTab] = useState<Tab>('summary');
    
    // Interaction form state
    const [interactionType, setInteractionType] = useState('Farm Visit');
    const [interactionNotes, setInteractionNotes] = useState('');

    const handleAddInteraction = (e: React.FormEvent) => {
        e.preventDefault();
        if(!interactionNotes.trim()) {
            alert("Please enter some notes for the interaction.");
            return;
        }
        addInteraction({
            farmerId: farmer.id,
            date: new Date().toISOString().split('T')[0],
            type: interactionType,
            notes: interactionNotes,
        }, user.name);
        setInteractionNotes('');
    };

    const TabButton: React.FC<{tab: Tab, children: React.ReactNode}> = ({ tab, children }) => (
        <button type="button" onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === tab ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
            {children}
        </button>
    );

    return (
        <Modal isOpen={!!farmer} onClose={onClose} title={`Farmer Profile: ${farmer.name}`} size="3xl">
            <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Avatar name={farmer.name} size="lg"/>
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">{farmer.name}</h3>
                        <p className="text-sm text-gray-500">{farmer.address}</p>
                        <p className="text-sm text-gray-500">Farmer ID: {farmer.id}</p>
                    </div>
                </div>
                 <div className="flex space-x-2 border-b pb-2">
                    <TabButton tab="summary">Profile Summary</TabButton>
                    <TabButton tab="production">Farm & Production</TabButton>
                    <TabButton tab="interactions">Interaction Log ({interactions.length})</TabButton>
                </div>

                {activeTab === 'summary' && (
                    <div>
                         <Section title="Personal & Contact Information">
                            <DetailItem label="Status" value={<span className={`px-2 py-0.5 text-xs font-medium rounded-full ${farmer.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{farmer.status}</span>} />
                            <DetailItem label="Contact" value={farmer.contact} />
                            <DetailItem label="Age" value={farmer.age || 'N/A'} />
                            <DetailItem label="Gender" value={farmer.gender} />
                            <DetailItem label="Education" value={farmer.educationLevel || 'N/A'} />
                            <DetailItem label="Phone Type" value={farmer.phoneType} />
                             <DetailItem label="Preferred Channel" value={farmer.preferredChannel} />
                        </Section>
                        <Section title="Financial & Market Profile">
                            <DetailItem label="Bank Account" value={farmer.hasBankAccount ? 'Yes' : 'No'} />
                            <DetailItem label="Mobile Money" value={farmer.hasMobileMoney ? 'Yes' : 'No'} />
                             <DetailItem label="Off-Farm Income" value={farmer.offFarmIncome ? 'Yes' : 'No'} />
                            <DetailItem label="Credit History" value={farmer.creditHistory} />
                             <DetailItem label="Preferred Market" value={farmer.preferredMarket || 'N/A'} fullWidth/>
                        </Section>
                    </div>
                )}
                
                {activeTab === 'production' && (
                    <div>
                        <Section title="Farm & Land Details">
                            <DetailItem label="Total Land Size" value={`${farmer.landSize} acres`} />
                            <DetailItem label="Land Tenure" value={farmer.tenure} />
                            <DetailItem label="GPS Coordinates" value={farmer.gpsCoordinates || 'N/A'} />
                            <DetailItem label="Water Sources" value={farmer.waterSource.join(', ') || 'N/A'} />
                             <DetailItem label="Field Description" value={farmer.fieldDescription || 'N/A'} fullWidth/>
                        </Section>
                        <Section title="Production Details">
                            <DetailItem label="Labor Force Size" value={farmer.laborForceSize ?? 'N/A'} />
                            <DetailItem label="Certifications" value={farmer.certifications.join(', ') || 'None'} />
                        </Section>
                         <div className="mt-4">
                            <h4 className="text-md font-bold text-gray-700 border-b pb-1 mb-2">Crop Portfolio</h4>
                            {farmer.cropPortfolio.length > 0 ? farmer.cropPortfolio.map((c, i) => (
                                <p key={i} className="text-sm"> - <strong>{c.cropName}</strong> ({c.variety}): {c.area} acres</p>
                            )) : <p className="text-sm text-gray-500">No crops listed.</p>}
                        </div>
                         <div className="mt-4">
                            <h4 className="text-md font-bold text-gray-700 border-b pb-1 mb-2">Livestock</h4>
                            {farmer.livestock.length > 0 ? farmer.livestock.map((l, i) => (
                                <p key={i} className="text-sm"> - <strong>{l.type}</strong>: {l.count} head</p>
                            )) : <p className="text-sm text-gray-500">No livestock listed.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'interactions' && (
                    <div>
                        <h4 className="text-md font-bold text-gray-700 mb-2">Log New Interaction</h4>
                        <form onSubmit={handleAddInteraction} className="p-2 bg-gray-50 rounded-lg border space-y-2">
                             <div className="grid grid-cols-3 gap-2">
                                <select value={interactionType} onChange={e => setInteractionType(e.target.value)} className="w-full text-sm p-2 border rounded-md bg-white">
                                    <option>Farm Visit</option>
                                    <option>Phone Call</option>
                                    <option>Training</option>
                                    <option>Input Supply</option>
                                </select>
                                <textarea value={interactionNotes} onChange={e => setInteractionNotes(e.target.value)} placeholder="Enter interaction notes..." rows={1} className="w-full text-sm col-span-2 p-2 border rounded-md bg-white"/>
                            </div>
                            <Button type="submit" className="!py-1 !px-3 text-sm">Add Log</Button>
                        </form>

                        <h4 className="text-md font-bold text-gray-700 mt-4 mb-2">Interaction History</h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                            {interactions.length > 0 ? interactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                                <div key={log.id} className="p-2 border rounded-md bg-white">
                                    <div className="flex justify-between items-center text-xs text-gray-500">
                                        <p className="font-semibold">{log.type}</p>
                                        <p>{new Date(log.date).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-sm text-gray-800 mt-1">{log.notes}</p>
                                </div>
                            )) : (
                                <p className="text-sm text-gray-500">No interactions logged yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};