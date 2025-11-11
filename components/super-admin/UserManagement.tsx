import React from 'react';
import type { User } from '../../types';
import { Card } from '../shared/Card';
import { Table } from '../shared/Table';
import { Button } from '../shared/Button';

interface UserManagementProps {
    allUsers: User[];
    onToggleUserStatus: (userId: string) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ allUsers, onToggleUserStatus }) => {
    const userColumns = [
        { header: 'Name', accessor: 'name' as keyof User },
        { header: 'Email', accessor: 'email' as keyof User },
        { 
            header: 'Status', 
            accessor: (user: User) => {
                const badgeClass = user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                return (
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}>
                        {user.status}
                    </span>
                );
            }
        },
        { header: 'User ID', accessor: 'id' as keyof User },
    ];

    return (
        <Card title="All Users">
            <Table<User>
                columns={userColumns}
                data={allUsers}
                renderActions={(user) => (
                    <Button
                        variant={user.status === 'active' ? 'danger' : 'secondary'}
                        className="!py-1 !px-2 text-sm"
                        onClick={() => onToggleUserStatus(user.id)}
                    >
                        {user.status === 'active' ? 'Suspend' : 'Reactivate'}
                    </Button>
                )}
            />
        </Card>
    );
};