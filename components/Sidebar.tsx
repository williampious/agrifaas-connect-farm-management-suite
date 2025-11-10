import React from 'react';
import type { Feature } from '../types';

interface SidebarProps {
    currentView: Feature;
    onSetView: (view: Feature) => void;
    features: Feature[];
    workspaceName: string;
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
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onSetView, features, workspaceName }) => {
    return (
        <aside className="w-64 bg-white flex-shrink-0 flex-col border-r hidden md:flex">
            <div className="h-16 flex items-center justify-center border-b px-4">
                <h2 className="text-xl font-bold text-gray-800 truncate">
                    {workspaceName}
                </h2>
            </div>
            <nav className="flex-1 p-4 space-y-2">
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
