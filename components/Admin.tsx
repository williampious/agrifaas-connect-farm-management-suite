
import React, { useState } from 'react';
import type { Workspace, User, Feature, Role, FeaturePermission } from '../types';
import { ALL_FEATURES, ALL_ROLES } from '../types';
import { Card } from './shared/Card';
import { Table } from './shared/Table';
import { Button } from './shared/Button';
import { ToggleSwitch } from './shared/ToggleSwitch';
import { exportFirestoreData } from '../services/exportFirestoreData';

interface AdminProps {
    workspace: Workspace;
    workspaceUsers: User[];
    onUpdateFeaturePermissions: (feature: Feature, permission: FeaturePermission) => Promise<void>;
    onRemoveUser: (userId: string) => Promise<void>;
    onDeleteWorkspace: () => Promise<void>;
    onUpdateUserRole: (userId: string, newRole: Role) => Promise<void>;
    currentUser: User;
}

const CopyIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
  </svg>
);


export const Admin: React.FC<AdminProps> = ({ workspace, workspaceUsers, onUpdateFeaturePermissions, onRemoveUser, onDeleteWorkspace, onUpdateUserRole, currentUser }) => {
    const [copySuccess, setCopySuccess] = useState('');

    const handleCopyId = () => {
        navigator.clipboard.writeText(workspace.id).then(() => {
            setCopySuccess('Copied!');
            setTimeout(() => setCopySuccess(''), 2000);
        }, () => {
            setCopySuccess('Failed to copy');
             setTimeout(() => setCopySuccess(''), 2000);
        });
    };

    const handleRemoveUser = (userId: string) => {
        const userToRemove = workspaceUsers.find(u => u.id === userId);
        if (userToRemove && window.confirm(`Are you sure you want to remove ${userToRemove.name} from the workspace?`)) {
            onRemoveUser(userId);
        }
    };

    const handleExportData = async () => {
        await exportFirestoreData(workspace.id, workspace.name);
    };

    const handleDeleteWorkspaceClick = () => {
        const confirmation = prompt(`This action is permanent and cannot be undone. It will delete all data associated with this workspace.\n\nPlease type "${workspace.name}" to confirm.`);
        if (confirmation === workspace.name) {
            if (window.confirm("FINAL CONFIRMATION: Are you absolutely sure you want to delete this workspace?")) {
                onDeleteWorkspace();
            }
        } else if (confirmation !== null) {
            alert("The name you entered did not match. Deletion cancelled.");
        }
    };

    const handleRolePermissionChange = (feature: Feature, role: Role, checked: boolean) => {
        const currentPermission = workspace.featurePermissions[feature];
        const newAllowedRoles = checked
            ? [...currentPermission.allowedRoles, role]
            : currentPermission.allowedRoles.filter(r => r !== role);
        
        onUpdateFeaturePermissions(feature, { ...currentPermission, allowedRoles: newAllowedRoles });
    };

    const currentUserRole = workspace.members[currentUser.id]?.role;
    const userColumns = [
        { header: 'Name', accessor: 'name' as keyof User },
        { header: 'Email', accessor: 'email' as keyof User },
        { 
            header: 'Role', 
            accessor: (user: User) => {
                const userRole = workspace.members[user.id]?.role;

                if (currentUserRole !== 'owner') {
                    return <span className="capitalize">{userRole}</span>;
                }

                return (
                    <select
                        value={userRole}
                        onChange={(e) => onUpdateUserRole(user.id, e.target.value as Role)}
                        className="block w-full max-w-[150px] px-2 py-1 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                        aria-label={`Role for ${user.name}`}
                    >
                       {ALL_ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                       ))}
                    </select>
                );
            } 
        },
    ];
    
    return (
        <div className="space-y-6">
             <Card title="Workspace Settings">
                <p className="mb-2 text-gray-600">
                    To invite a new member, share the Workspace ID below. They can use it on the 'Join Workspace' screen.
                </p>
                <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-md">
                    <span className="font-mono text-sm text-gray-700 flex-1 break-all">{workspace.id}</span>
                    <Button variant="secondary" onClick={handleCopyId} className="!py-1 !px-2 text-sm flex-shrink-0">
                        <CopyIcon className="w-4 h-4 mr-1 inline"/>
                        {copySuccess || 'Copy ID'}
                    </Button>
                </div>
            </Card>

            <Card title="User Management">
                 <Table<User>
                    columns={userColumns}
                    data={workspaceUsers}
                    renderActions={(user) => {
                        const userRole = workspace.members[user.id]?.role;
                        
                        if (currentUserRole !== 'owner' || user.id === currentUser.id || userRole === 'owner') {
                            return null;
                        }
                        return (
                           <Button variant="danger" className="!py-1 !px-2 text-sm" onClick={() => handleRemoveUser(user.id)}>
                               Remove
                           </Button>
                        );
                    }}
                />
            </Card>

            <Card title="Feature Management">
                <p className="mb-4 text-gray-600">
                    Enable modules for the workspace, then select which roles can access them.
                </p>
                <div className="space-y-4">
                    {ALL_FEATURES.map(feature => {
                        const permission = workspace.featurePermissions[feature];
                        return (
                            <div key={feature} className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-800 text-lg">{feature}</span>
                                    <ToggleSwitch 
                                        isEnabled={permission.enabled}
                                        onToggle={(isEnabled) => onUpdateFeaturePermissions(feature, { ...permission, enabled: isEnabled })}
                                    />
                                </div>
                                <div className={`mt-3 pt-3 border-t grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 ${!permission.enabled ? 'opacity-50' : ''}`}>
                                    {ALL_ROLES.map(role => (
                                        <label key={role} className="flex items-center space-x-2 text-sm">
                                            <input 
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                checked={permission.allowedRoles.includes(role)}
                                                onChange={(e) => handleRolePermissionChange(feature, role, e.target.checked)}
                                                disabled={!permission.enabled}
                                            />
                                            <span>{role}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
            
            <Card title="Workspace Data" className="border-blue-500 border-2">
                 <p className="mb-4 text-gray-600">
                    Export a full backup of all your workspace data, including plots, financials, tasks, and more, into a single JSON file.
                </p>
                <Button variant="secondary" onClick={handleExportData}>Export All Data as JSON</Button>
            </Card>

             <Card title="🚨 Danger Zone" className="border-red-500 border-2">
                 <div className="flex justify-between items-center">
                    <div>
                        <h4 className="font-semibold text-red-700">Delete this workspace</h4>
                        <p className="text-sm text-gray-600">Once you delete a workspace, there is no going back. Please be certain.</p>
                    </div>
                    <Button variant="danger" onClick={handleDeleteWorkspaceClick}>Delete Workspace</Button>
                 </div>
            </Card>
        </div>
    );
};
