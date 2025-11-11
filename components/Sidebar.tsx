import React from 'react';
import type { Feature } from '../types';

interface SidebarProps {
    currentView: Feature;
    onSetView: (view: Feature) => void;
    features: Feature[];
    workspaceName: string;
    isOpen: boolean;
    onClose: () => void;
}

const featureIcons: Record<Feature, string> = {
    Dashboard: '🏠',
    Operations: '🛠️',
    Financials: '💰',
    HR: '👥',
    Inventory: '📦',
    'Plots & Seasons': '🌱',
    AEO: '🧑‍🌾',
    'AI Insights': '💡',
    Admin: '⚙️',
    Suppliers: '🚚',
    'Harvest & Sales': '📈',
    'How To': '📖',
    'FAQ': '❓',
};

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);


export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSetView, features, workspaceName, isOpen, onClose }) => {
    return (
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white flex-shrink-0 flex flex-col border-r transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-16 flex items-center justify-between border-b px-4 flex-shrink-0">
                <h2 className="text-xl font-bold text-gray-800 truncate">
                    {workspaceName}
                </h2>
                 <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-800">
                     <span className="sr-only">Close sidebar</span>
                     <XIcon className="h-6 w-6" />
                </button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {features.map((feature) => (
                    <button
                        key={feature}
                        onClick={() => onSetView(feature)}
                        className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-left text-sm font-medium transition-colors
                            ${currentView === feature 
                                ? 'bg-green-600 text-white shadow' 
                                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                    >
                        <span>{featureIcons[feature]}</span>
                        <span>{feature}</span>
                    </button>
                ))}
            </nav>
        </aside>
    );
};