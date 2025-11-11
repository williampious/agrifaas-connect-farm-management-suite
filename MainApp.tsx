

import React, { useState, useMemo } from 'react';
import type { User, Workspace, Feature, Task, Role } from '../types';
import { useFarmData } from '../hooks/useFarmData';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { Operations } from './Operations';
import { Financials } from './Financials';
import { HR } from './HR';
import { Inventory } from './Inventory';
import { AEO } from './AEO';
import { AIInsights } from './AIInsights';
import { Admin } from './Admin';
import { PlotsAndSeasons } from './PlotsAndSeasons';
import { TaskDetailModal } from './TaskDetailModal';
import { ProfileModal } from './ProfileModal';
import { Avatar } from './shared/Avatar';
import { ImpersonationBanner } from './shared/ImpersonationBanner';


interface MainAppProps {
    user: User;
    workspace: Workspace;
    allUsers: User[];
    onLogout: () => void;
    impersonatingUser: User | null;
    onExitImpersonation: () => void;
    onInviteUser: (workspaceId: string, email: string, role: Role) => void;
    onRevokeInvitation: (workspaceId: string, email: string) => void;
    onUpdateFeaturePermissions: (workspaceId: string, newPermissions: Workspace['permissions']) => void;
}

export const MainApp: React.FC<MainAppProps> = ({ 
    user, 
    workspace, 
    allUsers, 
    onLogout, 
    impersonatingUser, 
    onExitImpersonation,
    onInviteUser,
    onRevokeInvitation,
    onUpdateFeaturePermissions,
}) => {
    const [currentView, setCurrentView] = useState<Feature>('Dashboard');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    
    const farmData = useFarmData(workspace.id);

    const workspaceUsers = useMemo(() => {
        const memberIds = Object.keys(workspace.members);
        return allUsers.filter(u => memberIds.includes(u.id));
    }, [workspace.members, allUsers]);
    
    // FIX: Change invalid fallback role 'viewer' to a valid role 'member'.
    const currentUserRole = workspace.members[user.id]?.role || 'member';

    const enabledFeatures = useMemo(() => {
        return (Object.keys(workspace.permissions) as Feature[]).filter(
            f => workspace.permissions[f]?.enabled && workspace.permissions[f]?.allowedRoles.includes(currentUserRole)
        );
    }, [workspace.permissions, currentUserRole]);


    const renderContent = () => {
        if (!enabledFeatures.includes(currentView)) {
            return (
                 <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="text-2xl font-bold text-gray-700">Access Denied</h2>
                    <p className="text-gray-500 mt-2">You do not have permission to view the "{currentView}" feature.</p>
                </div>
            );
        }
        
        switch (currentView) {
            case 'Dashboard':
                return <Dashboard farmData={farmData} user={user} />;
            case 'Operations':
                return <Operations farmData={farmData} user={user} workspaceUsers={workspaceUsers} onSelectTask={setSelectedTask} />;
            case 'Financials':
                return <Financials farmData={farmData} user={user} />;
            case 'HR':
                return <HR farmData={farmData} user={user} />;
            case 'Inventory':
                return <Inventory farmData={farmData} user={user} />;
            case 'Plots & Seasons':
                return <PlotsAndSeasons farmData={farmData} user={user} />;
            case 'AEO':
                return <AEO farmData={farmData} user={user} />;
            // FIX: Correct typo from 'AIInsights' to 'AI Insights'
            case 'AI Insights':
                return <AIInsights farmData={farmData} />;
            case 'Admin':
                return <Admin 
                    workspace={workspace}
                    workspaceUsers={workspaceUsers}
                    onInviteUser={onInviteUser}
                    onRevokeInvitation={onRevokeInvitation}
                    onUpdateFeaturePermissions={onUpdateFeaturePermissions}
                />;
            default:
                return <div>Select a feature</div>;
        }
    };

    return (
        <>
            {selectedTask && (
                <TaskDetailModal 
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdateTask={(task) => farmData.updateTask(task, user.name)}
                    onAddTaskComment={(taskId, comment) => farmData.addTaskComment(taskId, comment, user.name)}
                    allUsers={workspaceUsers}
                    allPlots={farmData.plots}
                    currentUser={user}
                />
            )}
            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user} onLogout={onLogout} />

            <div className="flex h-screen bg-gray-100 font-sans">
                <Sidebar
                    currentView={currentView}
                    onSetView={setCurrentView}
                    features={enabledFeatures}
                    workspaceName={workspace.name}
                />
                <main className="flex-1 flex flex-col overflow-hidden">
                    {impersonatingUser && <ImpersonationBanner userName={impersonatingUser.name} onExit={onExitImpersonation} />}
                    <header className="flex justify-between items-center p-4 bg-white border-b">
                         <h1 className="text-2xl font-semibold text-gray-800">{currentView}</h1>
                         <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center space-x-2">
                             <span className="hidden sm:inline text-right">
                                 <span className="font-semibold text-gray-700">{user.name}</span>
                                 <span className="block text-xs text-gray-500 capitalize">{currentUserRole}</span>
                             </span>
                             <Avatar name={user.name} />
                         </button>
                    </header>
                    <div className="flex-1 p-6 overflow-y-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </>
    );
};