import React, { useState } from 'react';
import type { FarmDataContextType, Farmer, KnowledgeBaseArticle } from '../types';
import { Card } from './shared/Card';
import { Button } from './shared/Button';
import { Table } from './shared/Table';
import { FarmerModal } from './FarmerModal';
import { FarmerDetailModal } from './FarmerDetailModal';
import { KBArticleModal } from './KBArticleModal';
import { KBArticleViewModal } from './KBArticleViewModal';

export const AEO: React.FC<{ farmData: FarmDataContextType }> = ({ farmData }) => {
    const { farmers, addFarmer, updateFarmer, deleteFarmer, kbArticles, addKBArticle, updateKBArticle, deleteKBArticle } = farmData;

    const [isFarmerModalOpen, setIsFarmerModalOpen] = useState(false);
    const [editingFarmer, setEditingFarmer] = useState<Farmer | null>(null);
    const [viewingFarmer, setViewingFarmer] = useState<Farmer | null>(null);
    
    const [isKBModalOpen, setIsKBModalOpen] = useState(false);
    const [editingArticle, setEditingArticle] = useState<KnowledgeBaseArticle | null>(null);
    const [viewingArticle, setViewingArticle] = useState<KnowledgeBaseArticle | null>(null);

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
            updateFarmer(farmerData);
        } else {
            addFarmer(farmerData);
        }
        setIsFarmerModalOpen(false);
    };
    
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
            updateKBArticle(articleData);
        } else {
            addKBArticle(articleData);
        }
        setIsKBModalOpen(false);
    };


    const farmerColumns = [
        { header: 'Name', accessor: 'name' as keyof Farmer },
        { header: 'Location', accessor: 'location' as keyof Farmer },
        { header: 'Crops', accessor: (f: Farmer) => f.crops.join(', ') },
        { header: 'Farm Size (Acres)', accessor: 'farmSize' as keyof Farmer },
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
            {viewingFarmer && <FarmerDetailModal farmer={viewingFarmer} onClose={() => setViewingFarmer(null)} />}
            <KBArticleModal isOpen={isKBModalOpen} onClose={() => setIsKBModalOpen(false)} onSubmit={handleArticleSubmit} initialData={editingArticle} />
            {viewingArticle && <KBArticleViewModal article={viewingArticle} onClose={() => setViewingArticle(null)} />}

            <div className="space-y-6">
                <Card title="Farmer Directory">
                    <div className="flex justify-end mb-4">
                        <Button onClick={handleOpenAddFarmer}>Add Farmer</Button>
                    </div>
                    <Table<Farmer>
                        columns={farmerColumns}
                        data={farmers}
                        renderActions={(farmer) => (
                            <div className="space-x-2">
                                <Button variant="secondary" className="!py-1 !px-2 text-sm" onClick={() => setViewingFarmer(farmer)}>View</Button>
                                <Button variant="secondary" className="!py-1 !px-2 text-sm" onClick={() => handleOpenEditFarmer(farmer)}>Edit</Button>
                                <Button variant="danger" className="!py-1 !px-2 text-sm" onClick={() => window.confirm('Are you sure?') && deleteFarmer(farmer.id)}>Delete</Button>
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
                                <Button variant="danger" className="!py-1 !px-2 text-sm" onClick={() => window.confirm('Are you sure?') && deleteKBArticle(article.id)}>Delete</Button>
                            </div>
                        )}
                    />
                </Card>
            </div>
        </>
    );
};
