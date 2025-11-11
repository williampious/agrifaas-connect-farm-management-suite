import React, { useState, useMemo } from 'react';
import type { Workspace, User, Role, Feature, FarmDataContextType } from '../types';
import { ALL_FEATURES, ALL_ROLES } from '../types';
import { Card } from './shared/Card';
import { Button } from './shared/Button';
import { Table } from './shared/Table';
import { InviteUserModal } from './InviteUserModal';
import { ToggleSwitch } from './shared/ToggleSwitch';
import { Input } from './shared/Input';

interface AdminProps {
    workspace: Workspace;
    workspaceUsers: User[];
    farmData: FarmDataContextType;
    onInviteUser: (workspaceId: string, email: string, role: Role) => void;
    onRevokeInvitation: (workspaceId: string, email: string) => void;
    onUpdateFeaturePermissions: (workspaceId: string, newPermissions: Workspace['permissions']) => void;
    onExportWorkspaceData: (workspaceId: string) => void;
    onUpdateUserRole: (workspaceId: string, userId: string, role: Role) => void;
}


export const Admin: React.FC<AdminProps> = ({ 
    workspace, 
    workspaceUsers, 
    farmData,
    onInviteUser,
    onRevokeInvitation,
    onUpdateFeaturePermissions,
    onExportWorkspaceData,
    onUpdateUserRole
}) => {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [adminView, setAdminView] = useState<'members' | 'permissions' | 'activity'>('members');
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<Role | 'all'>('all');

    const filteredUsers = useMemo(() => {
        return workspaceUsers.filter(user => {
            const searchMatch = searchTerm === '' ||
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            
            const roleMatch = roleFilter === 'all' || workspace.members[user.id]?.role === roleFilter;

            return searchMatch && roleMatch;
        });
    }, [workspaceUsers, searchTerm, roleFilter, workspace.members]);
    
    const handleInvite = (email: string, role: Role) => {
        onInviteUser(workspace.id, email, role);
        setIsInviteModalOpen(false);
    };

    const handlePermissionToggle = (feature: Feature, isEnabled: boolean) => {
        const newPermissions = {
            ...workspace.permissions,
            [feature]: { ...workspace.permissions[feature]!, enabled: isEnabled }
        };
        onUpdateFeaturePermissions(workspace.id, newPermissions);
    };

    const handleRolePermissionChange = (feature: Feature, role: Role, isChecked: boolean) => {
        const currentPermission = workspace.permissions[feature];
        if (!currentPermission) return;

        const newAllowedRoles = isChecked
            ? [...currentPermission.allowedRoles, role]
            : currentPermission.allowedRoles.filter(r => r !== role);
        
        const newPermissions = {
            ...workspace.permissions,
            [feature]: { ...currentPermission, allowedRoles: newAllowedRoles }
        };
        onUpdateFeaturePermissions(workspace.id, newPermissions);
    };

    const userColumns = [
        { header: 'Name', accessor: 'name' as keyof User },
        { header: 'Email', accessor: 'email' as keyof User },
        { 
            header: 'Role', 
            accessor: (user: User) => {
                const userRole = workspace.members[user.id]?.role;
                if (userRole === 'owner') {
                    return <span className="font-semibold capitalize">{userRole}</span>;
                }
                return (
                    <select
                        value={userRole || 'member'}
                        onChange={(e) => onUpdateUserRole(workspace.id, user.id, e.target.value as Role)}
                        className="block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm bg-white text-gray-900"
                    >
                        {ALL_ROLES.filter(r => r !== 'owner').map(r => (
                            <option key={r} value={r} className="capitalize">{r}</option>
                        ))}
                    </select>
                );
            }
        },
    ];
    
    const invitationColumns = [
        { header: 'Email', accessor: 'email' as keyof Workspace['pendingInvitations'][0] },
        { header: 'Role', accessor: 'role' as keyof Workspace['pendingInvitations'][0] },
        { header: 'Invited At', accessor: (inv: any) => new Date(inv.invitedAt).toLocaleString() },
    ];
    
    const AdminViewButton: React.FC<{view: 'members' | 'permissions' | 'activity', children: React.ReactNode}> = ({ view, children }) => (
        <button
            onClick={() => setAdminView(view)}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${adminView === view ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
            {children}
        </button>
    );

    return (
        <>
            <InviteUserModal 
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleInvite}
            />
            <div className="space-y-6">
                <Card>
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">Workspace Administration</h2>
                            <p className="text-gray-600">Manage your workspace settings, members, and permissions here.</p>
                        </div>
                        <div className="flex space-x-2">
                           <AdminViewButton view="members">Members</AdminViewButton>
                           <AdminViewButton view="permissions">Permissions</AdminViewButton>
                           <AdminViewButton view="activity">Activity Log</AdminViewButton>
                        </div>
                    </div>
                     <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                            <div>
                                <h4 className="font-semibold text-gray-800">Export Workspace Data</h4>
                                <p className="text-sm text-gray-500">Download a JSON file containing all data for this workspace.</p>
                            </div>
                            <Button variant="secondary" onClick={() => onExportWorkspaceData(workspace.id)}>
                                Export Data
                            </Button>
                        </div>
                    </div>
                </Card>

                {adminView === 'members' && (
                    <Card title="Workspace Members">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                           <div className="md:col-span-2">
                             <Input id="user-search" label="Search Users" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Filter by name or email..."/>
                           </div>
                           <div>
                                <label htmlFor="role-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Role</label>
                                <select id="role-filter" value={roleFilter} onChange={e => setRoleFilter(e.target.value as Role | 'all')} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm">
                                    <option value="all">All Roles</option>
                                    {ALL_ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                                </select>
                           </div>
                        </div>
                        <div className="flex justify-end mb-4">
                            <Button onClick={() => setIsInviteModalOpen(true)}>Invite User</Button>
                        </div>
                        <Table<User> columns={userColumns} data={filteredUsers} />
                        <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm border">
                            <p className="text-gray-600 mb-2">To have a new user join, invite them above or have them sign up on the 'Join Workspace' screen with the ID below.</p>
                            <div className="flex items-center">
                                <span className="font-semibold text-gray-700">Workspace ID:</span>
                                <code className="ml-2 bg-gray-200 text-gray-800 p-1 rounded font-mono">{workspace.id}</code>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(workspace.id)} 
                                    className="ml-2 text-green-600 hover:text-green-800 text-xs font-semibold uppercase focus:outline-none"
                                    title="Copy Workspace ID"
                                >
                                    (Copy)
                                </button>
                            </div>
                        </div>
                        
                        {workspace.pendingInvitations && workspace.pendingInvitations.length > 0 && (
                            <div className="mt-6">
                                <h4 className="text-lg font-semibold text-gray-700 mb-2">Pending Invitations</h4>
                                <Table<any> 
                                    columns={invitationColumns} 
                                    data={workspace.pendingInvitations} 
                                    renderActions={(inv) => (
                                        <Button variant="danger" className="!py-1 !px-2 text-sm" onClick={() => onRevokeInvitation(workspace.id, inv.email)}>
                                            Revoke
                                        </Button>
                                    )}
                                />
                            </div>
                        )}
                    </Card>
                )}
                
                {adminView === 'permissions' && (
                    <Card title="Feature Permissions">
                        <p className="text-gray-600 mb-4">
                            Enable or disable features for different roles within this workspace.
                        </p>
                        <div className="space-y-4">
                            {ALL_FEATURES.map(feature => {
                                if(feature === 'Admin') return null;
                                const permission = workspace.permissions[feature];
                                if(!permission) return null;

                                return (
                                    <div key={feature} className="p-4 bg-gray-50 rounded-lg border">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium text-gray-800 text-lg">{feature}</span>
                                            <ToggleSwitch 
                                                isEnabled={permission.enabled}
                                                onToggle={(isEnabled) => handlePermissionToggle(feature, isEnabled)}
                                            />
                                        </div>
                                        <div className={`mt-3 pt-3 border-t grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 ${!permission.enabled ? 'opacity-50' : ''}`}>
                                            {ALL_ROLES.map(role => {
                                                const isOwner = role === 'owner';
                                                return (
                                                    <label key={role} className={`flex items-center space-x-2 text-sm ${isOwner ? 'cursor-not-allowed text-gray-500' : ''}`}>
                                                        <input 
                                                            type="checkbox"
                                                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                            checked={isOwner || permission.allowedRoles.includes(role)}
                                                            onChange={(e) => handleRolePermissionChange(feature, role, e.target.checked)}
                                                            disabled={!permission.enabled || isOwner}
                                                        />
                                                        <span className="capitalize">{role}</span>
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </Card>
                )}
                
                {adminView === 'activity' && (
                    <Card title="Workspace Activity Log">
                        <p className="text-gray-600 mb-4">A log of recent activities performed in this workspace.</p>
                        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                            {farmData.activityLog.length === 0 && <p className="text-sm text-gray-500">No activities logged yet.</p>}
                            {farmData.activityLog.map(log => (
                                <div key={log.id} className="text-sm p-2 border-b">
                                    <div className="flex justify-between">
                                        <p><span className="font-semibold">{log.userName}</span> {log.action}</p>
                                        <p className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</p>
                                    </div>
                                    <p className="text-gray-600 pl-2">{log.details}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                )}
            </div>
        </>
    );
};