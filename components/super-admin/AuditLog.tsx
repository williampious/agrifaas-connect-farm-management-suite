import React, { useState, useMemo } from 'react';
import type { AuditLogEntry } from '../../types';
import { Card } from '../shared/Card';
import { Table } from '../shared/Table';
import { Input } from '../shared/Input';

interface AuditLogProps {
    logs: AuditLogEntry[];
}

export const AuditLog: React.FC<AuditLogProps> = ({ logs }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = useMemo(() => {
        if (!searchTerm) {
            return logs;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        return logs.filter(log =>
            log.action.toLowerCase().includes(lowercasedFilter) ||
            log.details.toLowerCase().includes(lowercasedFilter) ||
            log.superAdminId.toLowerCase().includes(lowercasedFilter)
        );
    }, [logs, searchTerm]);

    const columns = [
        { 
            header: 'Timestamp', 
            accessor: (log: AuditLogEntry) => new Date(log.timestamp).toLocaleString() 
        },
        { 
            header: 'Action', 
            accessor: 'action' as keyof AuditLogEntry 
        },
        { 
            header: 'Details', 
            accessor: 'details' as keyof AuditLogEntry
        },
    ];

    return (
        <Card title="Super Admin Audit Log">
            <div className="mb-4">
                <Input 
                    id="audit-search"
                    label="Search Logs"
                    placeholder="Search by action, details..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <Table<AuditLogEntry>
                columns={columns}
                data={filteredLogs}
            />
        </Card>
    );
};