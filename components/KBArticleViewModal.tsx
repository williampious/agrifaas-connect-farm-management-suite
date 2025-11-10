import React from 'react';
import type { KnowledgeBaseArticle } from '../types';
import { Modal } from './shared/Modal';

interface KBArticleViewModalProps {
    article: KnowledgeBaseArticle;
    onClose: () => void;
}

export const KBArticleViewModal: React.FC<KBArticleViewModalProps> = ({ article, onClose }) => {
    // Simple markdown-like renderer for now
    const renderContent = (content: string) => {
        return content.split('\n').map((line, index) => {
            if (line.startsWith('# ')) return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.substring(2)}</h1>;
            if (line.startsWith('## ')) return <h2 key={index} className="text-xl font-bold mt-3 mb-1">{line.substring(3)}</h2>;
            if (line.startsWith('### ')) return <h3 key={index} className="text-lg font-semibold mt-2">{line.substring(4)}</h3>;
            if (line.startsWith('* ')) return <li key={index} className="ml-6 list-disc">{line.substring(2)}</li>;
            if (line.trim() === '') return <br key={index} />;
            return <p key={index} className="mb-2">{line}</p>;
        });
    };

    return (
        <Modal isOpen={!!article} onClose={onClose} title={article.title} size="3xl">
            <div className="prose max-w-none">
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4 border-b pb-2">
                    <span><strong>Category:</strong> {article.category}</span>
                    <span><strong>Last Updated:</strong> {new Date(article.updatedAt).toLocaleDateString()}</span>
                </div>
                <div>{renderContent(article.content)}</div>
                 {article.tags.length > 0 && (
                    <div className="mt-6 pt-4 border-t">
                        <strong>Tags:</strong>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {article.tags.map(tag => (
                                <span key={tag} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full">{tag}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
};
