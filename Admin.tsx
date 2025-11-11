
import React, { useState } from 'react';
import type { Workspace, User, Role, Feature } from '../types';
import { ALL_FEATURES, ALL_ROLES } from '../types';
import { Card } from './shared/Card';
import { Button } from './shared/Button';
import { Table } from './shared/Table';
import { InviteUserModal } from './InviteUserModal';
import { ToggleSwitch } from './shared/ToggleSwitch';

interface AdminProps {
    workspace: Workspace;
    workspaceUsers: User[];
    onInviteUser: (workspaceId: string, email: string, role: Role) => void;
    onRevokeInvitation: (workspaceId: string, email: string) => void;
    onUpdateFeaturePermissions: (workspaceId: string, newPermissions: Workspace['permissions']) => void;
}


export const Admin: React.FC<AdminProps> = ({ 
    workspace, 
    workspaceUsers, 
    onInviteUser,
    onRevokeInvitation,
    onUpdateFeaturePermissions
}) => {
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    
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
        { header: 'Role', accessor: (user: User) => workspace.members[user.id]?.role || 'N/A' },
    ];
    
    const invitationColumns = [
        { header: 'Email', accessor: 'email' as keyof Workspace['pendingInvitations'][0] },
        { header: 'Role', accessor: 'role' as keyof Workspace['pendingInvitations'][0] },
        { header: 'Invited At', accessor: (inv: any) => new Date(inv.invitedAt).toLocaleString() },
    ];


    return (
        <>
            <InviteUserModal 
                isOpen={isInviteModalOpen}
                onClose={() => setIsInviteModalOpen(false)}
                onInvite={handleInvite}
            />
            <div className="space-y-6">
                <Card title="Workspace Administration">
                    <p className="text-gray-600">Manage your workspace settings, members, and permissions here.</p>
                </Card>

                <Card title="Workspace Members">
                     <div className="flex justify-between items-center mb-4">
                        <p className="text-gray-600">View and manage who has access to this workspace.</p>
                        <Button onClick={() => setIsInviteModalOpen(true)}>Invite User</Button>
                    </div>
                    <Table<User> columns={userColumns} data={workspaceUsers} />
                    
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
                
                 <Card title="Feature Permissions">
                    <p className="text-gray-600 mb-4">
                        Enable or disable features for different roles within this workspace.
                    </p>
                     <div className="space-y-4">
                        {ALL_FEATURES.map(feature => {
                            // Don't show 'Admin' feature in the list of toggles
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
                                            // Owner always has all permissions
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
            </div>
        </>
    );
};
