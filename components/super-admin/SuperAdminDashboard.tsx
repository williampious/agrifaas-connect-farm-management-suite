
import React, { useMemo } from 'react';
import type { User, Workspace, InventoryItem, Sale, Task, WorkspaceMember } from '../../types';
import { Card } from '../shared/Card';
import { Table } from '../shared/Table';
import { formatCurrency, DEFAULT_CURRENCY } from '../../constants';

// Helper to get data from localStorage, isolated for this component
const getStorageItem = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        // Suppress console errors in case of malformed data for a single workspace
        return defaultValue;
    }
};

const StatCard: React.FC<{ title: string; value: string | number; icon: string; description?: string }> = ({ title, value, icon, description }) => (
    <Card className="flex items-start p-6">
        <div className="text-3xl mr-4 bg-gray-100 p-3 rounded-lg text-gray-700">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
    </Card>
);

const getOwnerName = (workspace: Workspace, users: User[]): string => {
    const ownerEntry = Object.entries(workspace.members).find(([, member]: [string, WorkspaceMember]) => member.role === 'owner');
    if (!ownerEntry) return 'N/A';
    const owner = users.find(u => u.id === ownerEntry[0]);
    return owner?.name || 'N/A';
};

interface SuperAdminDashboardProps {
    allUsers: User[];
    allWorkspaces: Workspace[];
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ allUsers, allWorkspaces }) => {
    
    const platformStats = useMemo(() => {
        let totalInventoryValue = 0;
        let totalSalesRevenue = 0;
        let totalTasks = 0;
        const activeWorkspaces = allWorkspaces.filter(ws => ws.status === 'active').length;

        for (const workspace of allWorkspaces) {
            const inventory = getStorageItem<InventoryItem[]>(`farm_data_${workspace.id}_inventory`, []);
            const sales = getStorageItem<Sale[]>(`farm_data_${workspace.id}_sales`, []);
            const tasks = getStorageItem<Task[]>(`farm_data_${workspace.id}_tasks`, []);

            totalInventoryValue += inventory.reduce((sum, item) => sum + (item.quantity * item.costPerUnit), 0);
            totalSalesRevenue += sales.reduce((sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + (item.quantitySold * item.unitPrice), 0), 0);
            totalTasks += tasks.length;
        }

        return {
            totalUsers: allUsers.length,
            totalWorkspaces: allWorkspaces.length,
            activeWorkspaces,
            suspendedWorkspaces: allWorkspaces.length - activeWorkspaces,
            totalInventoryValue,
            totalSalesRevenue,
            totalTasks,
        };
    }, [allUsers, allWorkspaces]);
    
    const recentWorkspaces = useMemo(() => {
        return [...allWorkspaces]
            .sort((a, b) => {
                const idA = parseInt(a.id.split('_')[1] || '0');
                const idB = parseInt(b.id.split('_')[1] || '0');
                return idB - idA;
            })
            .slice(0, 5);
    }, [allWorkspaces]);

    const recentWorkspacesColumns = [
        { header: 'Workspace Name', accessor: 'name' as keyof Workspace },
        { header: 'Owner', accessor: (ws: Workspace) => getOwnerName(ws, allUsers) },
        { header: 'Created On', accessor: (ws: Workspace) => new Date(parseInt(ws.id.split('_')[1])).toLocaleDateString() },
    ];

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Platform Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Users" 
                    value={platformStats.totalUsers} 
                    icon="👤" 
                />
                <StatCard 
                    title="Workspaces" 
                    value={platformStats.totalWorkspaces} 
                    icon="🏢"
                    description={`${platformStats.activeWorkspaces} Active / ${platformStats.suspendedWorkspaces} Suspended`}
                />
                 <StatCard 
                    title="Total Tasks Logged" 
                    value={platformStats.totalTasks.toLocaleString()} 
                    icon="🛠️"
                />
                <StatCard 
                    title="Platform Inventory Value" 
                    value={formatCurrency(platformStats.totalInventoryValue, DEFAULT_CURRENCY)} 
                    icon="📦"
                />
                 <StatCard 
                    title="Platform Sales Revenue" 
                    value={formatCurrency(platformStats.totalSalesRevenue, DEFAULT_CURRENCY)} 
                    icon="📈"
                    description="Across all workspaces"
                />
            </div>
             <Card title="Recent Workspaces">
                <Table<Workspace>
                    columns={recentWorkspacesColumns}
                    data={recentWorkspaces}
                />
            </Card>
        </div>
    );
};
