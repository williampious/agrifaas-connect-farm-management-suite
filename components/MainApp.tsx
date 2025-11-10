import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { User, Workspace, Feature, Role, FeaturePermission, Task } from '../types';
import { ALL_FEATURES, TaskStatus } from '../types';
import { useFarmDataFirestore } from '../hooks/useFarmDataFirestore';
import { Sidebar } from './Sidebar';
import { Dashboard } from './Dashboard';
import { Operations } from './Operations';
import { Financials } from './Financials';
import { HR } from './HR';
import { Inventory } from './Inventory';
import { PlotsAndSeasons } from './PlotsAndSeasons';
import { AEO } from './AEO';
import { AIInsights } from './AIInsights';
import { Admin } from './Admin';
import { ProfileModal } from './ProfileModal';
import { Avatar } from './shared/Avatar';
import { TaskDetailModal } from './TaskDetailModal';

const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
};


interface MainAppProps {
    user: User;
    initialWorkspace: Workspace;
    onLogout: () => Promise<void>;
    allUsers: User[];
    onRemoveUser: (userId: string) => Promise<void>;
    onUpdateUserRole: (userId: string, newRole: Role) => Promise<void>;
    onDeleteWorkspace: () => Promise<void>;
    onUpdateFeaturePermissions: (feature: Feature, permission: FeaturePermission) => Promise<void>;
}

export const MainApp: React.FC<MainAppProps> = ({ user, initialWorkspace, onLogout, allUsers, onRemoveUser, onUpdateUserRole, onDeleteWorkspace, onUpdateFeaturePermissions }) => {
    const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace);
    const [currentView, setCurrentView] = useState<Feature>('Dashboard');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isReminderPopoverOpen, setIsReminderPopoverOpen] = useState(false);
    const reminderRef = useRef<HTMLDivElement>(null);
    
    const farmData = useFarmDataFirestore(workspace.id);
    
    useEffect(() => {
        setWorkspace(initialWorkspace);
    }, [initialWorkspace]);

    const workspaceUsers = useMemo(() => {
        return allUsers.filter(u => workspace.members[u.id]);
    }, [allUsers, workspace.members]);
    
    const currentUserRole = workspace.members[user.id]?.role;

    const enabledFeatures = useMemo(() => {
        if (!currentUserRole) return [];
        return ALL_FEATURES.filter(f => {
            const permission = workspace.featurePermissions[f];
            return permission && permission.enabled && permission.allowedRoles.includes(currentUserRole);
        });
    }, [workspace.featurePermissions, currentUserRole]);
    
    const activeReminders = useMemo(() => {
        const now = new Date();
        return farmData.tasks
            .filter(task => 
                task.reminderDate && 
                task.status !== TaskStatus.Done && 
                new Date(task.reminderDate) <= now
            )
            .sort((a, b) => new Date(b.reminderDate!).getTime() - new Date(a.reminderDate!).getTime());
    }, [farmData.tasks]);
    
    useEffect(() => {
        if (!enabledFeatures.includes(currentView)) {
            setCurrentView('Dashboard');
        }
    }, [enabledFeatures, currentView]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (reminderRef.current && !reminderRef.current.contains(event.target as Node)) {
                setIsReminderPopoverOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [reminderRef]);
    
    const handleReminderClick = (task: Task) => {
        setSelectedTask(task);
        setIsReminderPopoverOpen(false);
    };

    const renderContent = () => {
        switch (currentView) {
            case 'Dashboard':
                return <Dashboard farmData={farmData} user={user} />;
            case 'Operations':
                return <Operations farmData={farmData} user={user} workspaceUsers={workspaceUsers} onSelectTask={setSelectedTask} />;
            case 'Financials':
                return <Financials farmData={farmData} />;
            case 'HR':
                return <HR farmData={farmData} />;
            case 'Inventory':
                return <Inventory farmData={farmData} />;
            case 'Plots & Seasons':
                return <PlotsAndSeasons farmData={farmData} />;
            case 'AEO':
                return <AEO farmData={farmData} />;
            case 'AI Insights':
                return <AIInsights farmData={farmData} />;
            case 'Admin':
                return <Admin 
                    workspace={workspace} 
                    workspaceUsers={workspaceUsers} 
                    onUpdateFeaturePermissions={onUpdateFeaturePermissions} 
                    onRemoveUser={onRemoveUser} 
                    onDeleteWorkspace={onDeleteWorkspace}
                    onUpdateUserRole={onUpdateUserRole}
                    currentUser={user}
                />;
            default:
                return <Dashboard farmData={farmData} user={user} />;
        }
    };
    
    return (
        <>
            <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} user={user} onLogout={onLogout} />
            {selectedTask && (
                <TaskDetailModal 
                    task={selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdateTask={farmData.updateTask}
                    onAddTaskComment={farmData.addTaskComment}
                    allUsers={workspaceUsers}
                    allPlots={farmData.plots}
                    currentUser={user}
                />
            )}
            <div className="flex h-screen bg-gray-100 font-sans">
                <Sidebar 
                    currentView={currentView}
                    onSetView={setCurrentView}
                    features={enabledFeatures}
                    workspaceName={workspace.name}
                />
                <main className="flex-1 flex flex-col overflow-hidden">
                    <header className="flex justify-between items-center p-4 bg-white border-b">
                        <h1 className="text-2xl font-semibold text-gray-800">{currentView}</h1>
                        <div className="flex items-center space-x-4">
                             <div className="relative" ref={reminderRef}>
                                <button onClick={() => setIsReminderPopoverOpen(prev => !prev)} className="text-gray-500 hover:text-gray-700 relative">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    {activeReminders.length > 0 && (
                                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">{activeReminders.length}</span>
                                    )}
                                </button>
                                {isReminderPopoverOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-20 border">
                                        <div className="p-3 font-semibold border-b">Reminders</div>
                                        <ul className="py-1 max-h-80 overflow-y-auto">
                                            {activeReminders.length > 0 ? activeReminders.map(task => (
                                                <li key={task.id}>
                                                    <button onClick={() => handleReminderClick(task)} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                        <p className="font-medium">{task.title}</p>
                                                        <p className="text-xs text-gray-500">{formatTimeAgo(new Date(task.reminderDate!))}</p>
                                                    </button>
                                                </li>
                                            )) : (
                                                <li className="px-4 py-3 text-sm text-gray-500 text-center">No active reminders.</li>
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                             <div className="cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
                                <Avatar name={user.name} />
                            </div>
                        </div>
                    </header>
                    <div className="flex-1 p-6 overflow-y-auto">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </>
    );
}