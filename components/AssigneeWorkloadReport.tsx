import React, { useMemo } from 'react';
import type { Task, User } from '../types';
import { TaskStatus } from '../types';
import { Card } from './shared/Card';
import { Table } from './shared/Table';
import { Avatar } from './shared/Avatar';
import { DEFAULT_CURRENCY, formatCurrency } from '../constants';

interface AssigneeWorkloadReportProps {
    tasks: Task[];
    workspaceUsers: User[];
}

export const AssigneeWorkloadReport: React.FC<AssigneeWorkloadReportProps> = ({ tasks, workspaceUsers }) => {
    const reportData = useMemo(() => {
        return workspaceUsers.map(user => {
            const userTasks = tasks.filter(t => t.assigneeId === user.id);

            const openTasks = userTasks.filter(t => 
                t.status === TaskStatus.ToDo || 
                t.status === TaskStatus.InProgress ||
                t.status === TaskStatus.Blocked
            );

            const completedTasks = userTasks.filter(t => t.status === TaskStatus.Done);

            const overdueTasks = openTasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== TaskStatus.Done);
            
            const costOfOpenTasks = openTasks.reduce((sum, task) => sum + task.cost, 0);

            return {
                id: user.id,
                user,
                openTasksCount: openTasks.length,
                completedTasksCount: completedTasks.length,
                overdueTasksCount: overdueTasks.length,
                costOfOpenTasks
            };
        }).sort((a, b) => b.openTasksCount - a.openTasksCount);
    }, [tasks, workspaceUsers]);

    type ReportRowData = (typeof reportData)[0];

    const columns = [
        { 
            header: 'Assignee', 
            accessor: (item: ReportRowData) => (
                <div className="flex items-center space-x-3">
                    <Avatar name={item.user.name} size="sm" />
                    <span className="font-medium">{item.user.name}</span>
                </div>
            )
        },
        { header: 'Open Tasks', accessor: 'openTasksCount' as keyof ReportRowData },
        { header: 'Completed Tasks', accessor: 'completedTasksCount' as keyof ReportRowData },
        { 
            header: 'Overdue Tasks', 
            accessor: (item: ReportRowData) => (
                <span className={item.overdueTasksCount > 0 ? 'text-red-600 font-semibold' : ''}>
                    {item.overdueTasksCount}
                </span>
            )
        },
        { 
            header: `Cost of Open Tasks (${DEFAULT_CURRENCY})`, 
            accessor: (item: ReportRowData) => formatCurrency(item.costOfOpenTasks, DEFAULT_CURRENCY) 
        },
    ];

    return (
        <Card title="Assignee Workload Report">
             <p className="text-sm text-gray-600 mb-6">
                This report summarizes task distribution and status for each assignee based on the current filters. It helps in assessing workload and identifying potential bottlenecks.
            </p>
            {reportData.length > 0 ? (
                <Table<ReportRowData>
                    columns={columns}
                    data={reportData}
                />
            ) : (
                <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-lg">
                    <p className="text-lg font-semibold">No Data to Display</p>
                    <p className="mt-1">No tasks assigned to users were found for the selected filters.</p>
                </div>
            )}
        </Card>
    );
};