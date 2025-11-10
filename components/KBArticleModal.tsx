import React, { useState, useEffect } from 'react';
import type { KnowledgeBaseArticle } from '../types';
import { Modal } from './shared/Modal';
import { Input } from './shared/Input';
import { Button } from './shared/Button';

interface KBArticleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (article: Omit<KnowledgeBaseArticle, 'id' | 'createdAt' | 'updatedAt'> | KnowledgeBaseArticle) => void;
    initialData: KnowledgeBaseArticle | null;
}

export const KBArticleModal: React.FC<KBArticleModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setTitle(initialData.title);
                setCategory(initialData.category);
                setContent(initialData.content);
                setTags(initialData.tags.join(', '));
            } else {
                setTitle('');
                setCategory('');
                setContent('');
                setTags('');
            }
        }
    }, [initialData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const articleData = {
            title,
            category,
            content,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        };
        if (initialData) {
            onSubmit({ ...initialData, ...articleData });
        } else {
            onSubmit(articleData);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Article' : 'New Knowledge Base Article'} size="3xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="kb-title" label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
                <div className="grid grid-cols-2 gap-4">
                    <Input id="kb-category" label="Category" value={category} onChange={e => setCategory(e.target.value)} required placeholder="e.g., Pest Control, Soil Health" />
                    <Input id="kb-tags" label="Tags (comma-separated)" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g., maize, fall armyworm" />
                </div>
                <div>
                    <label htmlFor="kb-content" className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown supported)</label>
                    <textarea id="kb-content" value={content} onChange={e => setContent(e.target.value)} rows={12} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"></textarea>
                </div>
                 <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Article</Button>
                </div>
            </form>
        </Modal>
    );
};
