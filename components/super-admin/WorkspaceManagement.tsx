

import React from 'react';
import type { User, Workspace, WorkspaceMember } from '../types.js';
import { Card } from '../shared/Card';
import { Table } from '../shared/Table';
import { Button } from '../shared/Button';

interface WorkspaceManagementProps {
    allWorkspaces: Workspace[];
    allUsers: User[];
    onToggleWorkspaceStatus: (workspaceId: string) => void;
    onImpersonate: (workspaceId: string) => void;
}

export const WorkspaceManagement: React.FC<WorkspaceManagementProps> = ({ allWorkspaces, allUsers, onToggleWorkspaceStatus, onImpersonate }) => {
    
    const getOwnerName = (workspace: Workspace): string => {
        const ownerEntry = Object.entries(workspace.members).find(([, member]: [string, WorkspaceMember]) => member.role === 'owner');
        if (!ownerEntry) return 'N/A';
        const owner = allUsers.find(u => u.id === ownerEntry[0]);
        return owner?.name || 'N/A';
    };

    const columns = [
        { header: 'Workspace Name', accessor: 'name' as keyof Workspace },
        { header: 'Workspace ID', accessor: 'id' as keyof Workspace },
        { header: 'Owner', accessor: (ws: Workspace) => getOwnerName(ws) },
        { 
            header: 'Status', 
            accessor: (ws: Workspace) => {
                const badgeClass = ws.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                return (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}>
                        {ws.status}
                    </span>
                );
            }
        },
        { header: 'Members', accessor: (ws: Workspace) => Object.keys(ws.members).length },
    ];

    return (
        <Card title="All Workspaces">
            <Table<Workspace>
                columns={columns}
                data={allWorkspaces}
                renderActions={(workspace) => {
                    const ownerId = Object.keys(workspace.members).find(
                        (id) => workspace.members[id].role === 'owner'
                    );
                    return (
                        <div className="flex items-center justify-end space-x-2">
                            {ownerId && (
                                <Button
                                    variant="secondary"
                                    className="!bg-blue-500 hover:!bg-blue-600 !text-white !py-1 !px-2 text-sm"
                                    onClick={() => onImpersonate(workspace.id)}
                                >
                                    Login as Owner
                                </Button>
                            )}
                            <Button
                                variant={workspace.status === 'active' ? 'danger' : 'secondary'}
                                className="!py-1 !px-2 text-sm"
                                onClick={() => onToggleWorkspaceStatus(workspace.id)}
                            >
                                {workspace.status === 'active' ? 'Suspend' : 'Reactivate'}
                            </Button>
                        </div>
                    );
                }}
            />
        </Card>
    );
};