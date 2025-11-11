import React, { useState } from 'react';
import type { FarmDataContextType, Employee, Timesheet, Account, User } from '../types';
import { Card } from './shared/Card';
import { Table } from './shared/Table';
import { Button } from './shared/Button';
import { Modal } from './shared/Modal';
import { Input } from './shared/Input';
import { TimesheetModal } from './TimesheetModal';
import { RunPayrollModal } from './RunPayrollModal';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    addEmployee: (employee: Omit<Employee, 'id'>) => void;
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose, addEmployee }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState('');
    const [payRate, setPayRate] = useState(0);
    const [contact, setContact] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name || !role || !contact || payRate <= 0) {
            alert('Please fill out all fields with valid values.');
            return;
        }
        addEmployee({ name, role, payRate, contact });
        onClose();
        // Reset form
        setName('');
        setRole('');
        setPayRate(0);
        setContact('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Employee">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="emp-name" label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} required />
                <Input id="emp-role" label="Role" type="text" value={role} onChange={e => setRole(e.target.value)} required />
                <Input id="emp-payrate" label="Pay Rate ($/hr)" type="number" value={payRate} onChange={e => setPayRate(Number(e.target.value))} required />
                <Input id="emp-contact" label="Contact (Email/Phone)" type="text" value={contact} onChange={e => setContact(e.target.value)} required />
                <div className="flex justify-end space-x-2 pt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Save Employee</Button>
                </div>
            </form>
        </Modal>
    );
};

interface HRProps {
    farmData: FarmDataContextType;
    user: User;
}

export const HR: React.FC<HRProps> = ({ farmData, user }) => {
    const { employees, timesheets, addEmployee, addTimesheet, updateTimesheet, deleteTimesheet, addJournalEntry, accounts } = farmData;
    const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
    const [isTimesheetModalOpen, setIsTimesheetModalOpen] = useState(false);
    const [editingTimesheet, setEditingTimesheet] = useState<Timesheet | null>(null);
    const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);

    const getEmployeeName = (employeeId: string) => employees.find(e => e.id === employeeId)?.name || 'N/A';
    
    const handleAddEmployee = (employeeData: Omit<Employee, 'id'>) => {
        addEmployee(employeeData, user.name);
    }

    const handleOpenAddTimesheet = () => {
        setEditingTimesheet(null);
        setIsTimesheetModalOpen(true);
    };

    const handleOpenEditTimesheet = (timesheet: Timesheet) => {
        setEditingTimesheet(timesheet);
        setIsTimesheetModalOpen(true);
    };

    const handleTimesheetSubmit = (data: Omit<Timesheet, 'id'> | Timesheet) => {
        if ('id' in data) {
            updateTimesheet(data, user.name);
        } else {
            addTimesheet(data, user.name);
        }
        setIsTimesheetModalOpen(false);
    };
    
    const handleDeleteTimesheet = (id: string) => {
        if (window.confirm('Are you sure you want to delete this timesheet entry?')) {
            deleteTimesheet(id, user.name);
        }
    };

    const employeeColumns = [
        { header: 'Name', accessor: 'name' as keyof Employee },
        { header: 'Role', accessor: 'role' as keyof Employee },
        { header: 'Pay Rate/hr', accessor: (emp: Employee) => `$${emp.payRate.toFixed(2)}` },
        { header: 'Contact', accessor: 'contact' as keyof Employee },
    ];
    
    const timesheetColumns = [
        { header: 'Employee', accessor: (ts: Timesheet) => getEmployeeName(ts.employeeId) },
        { header: 'Date', accessor: 'date' as keyof Timesheet },
        { header: 'Hours Worked', accessor: 'hoursWorked' as keyof Timesheet },
    ];

    return (
        <>
            <AddEmployeeModal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} addEmployee={handleAddEmployee} />
            <TimesheetModal 
                isOpen={isTimesheetModalOpen}
                onClose={() => setIsTimesheetModalOpen(false)}
                onSubmit={handleTimesheetSubmit}
                initialData={editingTimesheet}
                employees={employees}
            />
            <RunPayrollModal
                isOpen={isPayrollModalOpen}
                onClose={() => setIsPayrollModalOpen(false)}
                employees={employees}
                timesheets={timesheets}
                accounts={accounts}
                addJournalEntry={(entry) => addJournalEntry(entry, user.name)}
            />
            <div className="space-y-6">
                <Card title="Employee Directory">
                    <div className="flex justify-end mb-4">
                        <Button onClick={() => setIsEmployeeModalOpen(true)}>Add Employee</Button>
                    </div>
                    <Table<Employee> columns={employeeColumns} data={employees} />
                </Card>

                <Card title="Timesheet Management">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-lg font-medium">Recent Entries</h4>
                         <Button variant="secondary" onClick={handleOpenAddTimesheet}>Add Timesheet Entry</Button>
                    </div>
                    <Table<Timesheet> 
                        columns={timesheetColumns} 
                        data={[...timesheets].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())}
                        renderActions={(ts) => (
                            <div className="space-x-2">
                                <Button variant="secondary" className="!py-1 !px-2 text-sm" onClick={() => handleOpenEditTimesheet(ts)}>Edit</Button>
                                <Button variant="danger" className="!py-1 !px-2 text-sm" onClick={() => handleDeleteTimesheet(ts.id)}>Delete</Button>
                            </div>
                        )}
                    />
                </Card>

                <Card title="Payroll">
                    <div className="flex justify-between items-center">
                        <p>Run payroll for a specific period. This will calculate wages and post a journal entry.</p>
                        <Button onClick={() => setIsPayrollModalOpen(true)}>Run Payroll</Button>
                    </div>
                </Card>
            </div>
        </>
    );
};