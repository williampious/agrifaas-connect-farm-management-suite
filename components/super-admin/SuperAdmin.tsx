import React, { useState } from 'react';
import type { User, Workspace, SuperAdminView, PlatformConfig, AuditLogEntry } from '../../types';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { WorkspaceManagement } from './WorkspaceManagement';
import { UserManagement } from './UserManagement';
import { PlatformConfiguration } from './PlatformConfiguration';
import { AuditLog } from './AuditLog';
import { Button } from '../shared/Button';

interface SuperAdminProps {
    allUsers: User[];
    allWorkspaces: Workspace[];
    platformConfig: PlatformConfig;
    auditLog: AuditLogEntry[];
    onLogout: () => void;
    onToggleWorkspaceStatus: (workspaceId: string) => void;
    onImpersonate: (workspaceId: string) => void;
    onToggleUserStatus: (userId: string) => void;
    onUpdatePlatformConfig: (newConfig: PlatformConfig) => void;
}

const SUPER_ADMIN_VIEWS: SuperAdminView[] = ['Dashboard', 'Workspaces', 'Users', 'Configuration', 'Audit Log'];

const featureIcons: Record<SuperAdminView, string> = {
    Dashboard: '📊',
    Workspaces: '🏢',
    Users: '👤',
    Configuration: '🔧',
    'Audit Log': '📜',
};

export const SuperAdmin: React.FC<SuperAdminProps> = ({ 
    allUsers, 
    allWorkspaces, 
    platformConfig,
    auditLog,
    onLogout, 
    onToggleWorkspaceStatus, 
    onImpersonate, 
    onToggleUserStatus,
    onUpdatePlatformConfig
}) => {
    const [currentView, setCurrentView] = useState<SuperAdminView>('Dashboard');

    const renderContent = () => {
        switch (currentView) {
            case 'Dashboard':
                return <SuperAdminDashboard allUsers={allUsers} allWorkspaces={allWorkspaces} />;
            case 'Workspaces':
                return <WorkspaceManagement 
                    allWorkspaces={allWorkspaces} 
                    allUsers={allUsers}
                    onToggleWorkspaceStatus={onToggleWorkspaceStatus}
                    onImpersonate={onImpersonate}
                />;
            case 'Users':
                return <UserManagement allUsers={allUsers} onToggleUserStatus={onToggleUserStatus} />;
            case 'Configuration':
                return <PlatformConfiguration 
                    platformConfig={platformConfig} 
                    onUpdateConfig={onUpdatePlatformConfig} 
                />;
            case 'Audit Log':
                return <AuditLog logs={auditLog} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            <aside className="w-64 bg-gray-800 text-white flex-shrink-0 flex-col hidden md:flex">
                <div className="h-16 flex items-center justify-center border-b border-gray-700 px-4">
                    <h2 className="text-xl font-bold">Super Admin</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {SUPER_ADMIN_VIEWS.map((view) => (
                        <button
                            key={view}
                            onClick={() => setCurrentView(view)}
                            className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-left text-sm font-medium transition-colors
                                ${currentView === view 
                                    ? 'bg-red-600 text-white shadow' 
                                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                }`}
                        >
                            <span>{featureIcons[view]}</span>
                            <span>{view}</span>
                        </button>
                    ))}
                </nav>
                <div className="p-4 border-t border-gray-700">
                    <Button variant="danger" onClick={onLogout} className="w-full">
                        Logout
                    </Button>
                </div>
            </aside>
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-4 bg-white border-b">
                    <h1 className="text-2xl font-semibold text-gray-800">{currentView}</h1>
                </header>
                <div className="flex-1 p-6 overflow-y-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};