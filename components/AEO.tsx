

import React, { useState, useMemo } from 'react';
// FIX: Correct import path for types
import type { FarmDataContextType, Farmer, KnowledgeBaseArticle, User } from '../types.js';
import { ALL_FARMER_STATUSES } from '../types.js';
import { Card } from './shared/Card';
import { Button } from './shared/Button';
import { Table } from './shared/Table';
import { Input } from './shared/Input';
import { FarmerModal } from './FarmerModal';
import { FarmerDetailModal } from './FarmerDetailModal';
import { KBArticleModal } from './KBArticleModal';
import { KBArticleViewModal } from './KBArticleViewModal';
import { exportToCSV } from '../utils/exportUtils';

export const AEO: React.FC<{ farmData: FarmDataContextType, user: User }> = ({ farmData, user }) => {
    const { 
        farmers, addFarmer, updateFarmer, deleteFarmer, 
        kbArticles, addKBArticle, updateKBArticle, deleteKBArticle,
        interactions, addInteraction
    } = farmData;

    const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);
    const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
    const [viewingFarmer, setViewingFarmer] = useState<Farmer | null>(null);
    
    const [isKBModalOpen, setIsKBModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<KnowledgeBaseArticle | null>(null);
    const [viewingArticle, setViewingArticle] = useState<KnowledgeBaseArticle | null>(null);

    // Farmer filtering state
    const [filters, setFilters] = useState({
        location: '',
        crop: '',
        status: 'all',
        minSize: '',
        maxSize: '',
    });

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const resetFilters = () => {
        setFilters({ location: '', crop: '', status: 'all', minSize: '', maxSize: '' });
    };

    const filteredFarmers = useMemo(() => {
        return farmers.filter(farmer => {
            if (filters.location && !farmer.address.toLowerCase().includes(filters.location.toLowerCase())) return false;
            if (filters.crop && !farmer.cropPortfolio.some(c => c.cropName.toLowerCase().includes(filters.crop.toLowerCase()))) return false;
            if (filters.status !== 'all' && farmer.status !== filters.status) return false;
            const min = parseFloat(filters.minSize);
            const max = parseFloat(filters.maxSize);
            if (!isNaN(min) && farmer.landSize < min) return false;
            if (!isNaN(max) && farmer.landSize > max) return false;
            return true;
        });
    }, [farmers, filters]);


    const handleOpenAddFarmer = () => {
        setEditingFarmer(null);
        setIsFarmerModalOpen(true);
    };
    
    const handleOpenEditFarmer = (farmer: Farmer) => {
        setEditingFarmer(farmer);
        setIsFarmerModalOpen(true);
    };

    const handleFarmerSubmit = (farmerData: Omit<Farmer, 'id'> | Farmer) => {
        if ('id' in farmerData) {
            updateFarmer(farmerData, user.name);
        } else {
            addFarmer(farmerData, user.name);
        }
        setIsFarmerModalOpen(false);
    };

    const handleDeleteFarmer = (farmer: Farmer) => {
        if (window.confirm('Are you sure?')) {
            deleteFarmer(farmer.id, user.name, farmer.name);
        }
    }
    
    const handleOpenAddArticle = () => {
        setEditingArticle(null);
        setIsKBModalOpen(true);
    };
    
    const handleOpenEditArticle = (article: KnowledgeBaseArticle) => {
        setEditingArticle(article);
        setIsKBModalOpen(true);
    };
    
    const handleArticleSubmit = (articleData: Omit<KnowledgeBaseArticle, 'id' | 'createdAt' | 'updatedAt'> | KnowledgeBaseArticle) => {
        if ('id' in articleData) {
            updateKBArticle(articleData, user.name);
        } else {
            addKBArticle(articleData, user.name);
        }
        setIsKBModalOpen(false);
    };

    const handleDeleteArticle = (article: KnowledgeBaseArticle) => {
        if (window.confirm('Are you sure?')) {
            deleteKBArticle(article.id, user.name, article.title);
        }
    }

    const handleExportFarmers = () => {
        const dataToExport = filteredFarmers.map(f => ({
            ID: f.id,
            Name: f.name,
            Status: f.status,
            Contact: f.contact,
            Address: f.address,
            GPS: f.gpsCoordinates,
            LandSize_Acres: f.landSize,
            Tenure: f.tenure,
            WaterSources: f.waterSource.join('; '),
            Crops: f.cropPortfolio.map(c => `${c.cropName} (${c.area} acres, ${c.variety})`).join('; '),
            Livestock: f.livestock.map(l => `${l.type} (x${l.count})`).join('; '),
            Equipment: f.equipment.map(e => `${e.name} (${e.owned ? 'Owned' : 'Leased'})`).join('; '),
            Certifications: f.certifications.join('; '),
            HasBankAccount: f.hasBankAccount,
            HasMobileMoney: f.hasMobileMoney,
            CreditHistory: f.creditHistory,
            PreferredMarket: f.preferredMarket,
        }));

        if (dataToExport.length === 0) {
            alert("No farmers to export.");
            return;
        }

        const headers = Object.keys(dataToExport[0]);
        const rows = dataToExport.map(row => headers.map(header => row[header as keyof typeof row]));
        
        exportToCSV([headers, ...rows], 'Farmer_Directory_Export');
    };


    const farmerColumns = [
        { header: 'Unique ID', accessor: 'id' as keyof Farmer },
        { header: 'Name', accessor: 'name' as keyof Farmer },
        { header: 'Address', accessor: 'address' as keyof Farmer },
        { 
            header: 'Status', 
            accessor: (f: Farmer) => {
                const colors: Record<Farmer['status'], string> = {
                    'Active': 'bg-green-100 text-green-800',
                    'Inactive': 'bg-gray-100 text-gray-800',
                    'Verified': 'bg-blue-100 text-blue-800',
                };
                return <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colors[f.status]}`}>{f.status}</span>
            }
        },
    ];
    
    const articleColumns = [
        { header: 'Title', accessor: 'title' as keyof KnowledgeBaseArticle },
        { header: 'Category', accessor: 'category' as keyof KnowledgeBaseArticle },
        { header: 'Tags', accessor: (a: KnowledgeBaseArticle) => a.tags.join(', ') },
        { header: 'Last Updated', accessor: (a: KnowledgeBaseArticle) => new Date(a.updatedAt).toLocaleDateString() },
    ];

    return (
        <>
            <FarmerModal isOpen={isFarmerModalOpen} onClose={() => setIsFarmerModalOpen(false)} onSubmit={handleFarmerSubmit} initialData={editingFarmer} />
            {viewingFarmer && <FarmerDetailModal 
                farmer={viewingFarmer} 
                onClose={() => setViewingFarmer(null)}
                interactions={interactions.filter(i => i.farmerId === viewingFarmer.id)}
                addInteraction={(interaction) => addInteraction(interaction, user.name)}
                user={user}
            />}
            <KBArticleModal isOpen={isKBModalOpen} onClose={() => setIsKBModalOpen(false)} onSubmit={handleArticleSubmit} initialData={editingArticle} />
            {viewingArticle && <KBArticleViewModal article={viewingArticle} onClose={() => setViewingArticle(null)} />}

            <div className="space-y-6">
                <Card title="Farmer Directory">
                    <div className="p-4 bg-gray-50 rounded-lg border mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-end">
                            <Input id="location" label="Location" name="location" value={filters.location} onChange={handleFilterChange} placeholder="Search address..."/>
                            <Input id="crop" label="Crop" name="crop" value={filters.crop} onChange={handleFilterChange} placeholder="e.g., Maize"/>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" value={filters.status} onChange={handleFilterChange} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                                    <option value="all">All Statuses</option>
                                    {ALL_FARMER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                </select>
                             </div>
                             <div className="grid grid-cols-2 gap-2">
                                <Input id="minSize" label="Min Size" name="minSize" type="number" value={filters.minSize} onChange={handleFilterChange} placeholder="Acres"/>
                                <Input id="maxSize" label="Max Size" name="maxSize" type="number" value={filters.maxSize} onChange={handleFilterChange} placeholder="Acres"/>
                             </div>
                             <Button variant="secondary" onClick={resetFilters}>Reset Filters</Button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 mb-4">
                        <Button variant="secondary" onClick={handleExportFarmers}>Export to CSV</Button>
                        <Button onClick={handleOpenAddFarmer}>Add Farmer</Button>
                    </div>
                    <Table<Farmer>
                        columns={farmerColumns}
                        data={filteredFarmers}
                        renderActions={(farmer) => (
                            <div className="space-x-2">
                                <Button variant="secondary" className="!py-1 !px-2 text-sm" onClick={() => setViewingFarmer(farmer)}>View</Button>
                                <Button variant="secondary" className="!py-1 !px-2 text-sm" onClick={() => handleOpenEditFarmer(farmer)}>Edit</Button>
                                <Button variant="danger" className="!py-1 !px-2 text-sm" onClick={() => handleDeleteFarmer(farmer)}>Delete</Button>
                            </div>
                        )}
                    />
                </Card>

                <Card title="Knowledge Base">
                     <div className="flex justify-end mb-4">
                        <Button onClick={handleOpenAddArticle}>New Article</Button>
                    </div>
                    <Table<KnowledgeBaseArticle>
                        columns={articleColumns}
                        data={kbArticles}
                        renderActions={(article) => (
                             <div className="space-x-2">
                                <Button variant="secondary" className="!py-1 !px-2 text-sm" onClick={() => setViewingArticle(article)}>View</Button>
                                <Button variant="secondary" className="!py-1 !px-2 text-sm" onClick={() => handleOpenEditArticle(article)}>Edit</Button>
                                <Button variant="danger" className="!py-1 !px-2 text-sm" onClick={() => handleDeleteArticle(article)}>Delete</Button>
                            </div>
                        )}
                    />
                </Card>
            </div>
        </>
    );
};