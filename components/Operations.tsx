import React, { useState, useMemo, useEffect } from 'react';
import type { FarmDataContextType, Task, User, Plot, Season } from '../types';
import { TaskStatus } from '../types';
import { Button } from './shared/Button';
import { Modal } from './shared/Modal';
import { Input } from './shared/Input';
import { TASK_CATEGORIES } from '../constants';

// AddTaskModal component
interface AddTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'comments'>) => void;
    users: User[];
    plots: Plot[];
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onSubmit, users, plots }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [plotId, setPlotId] = useState('');
    const [assigneeId, setAssigneeId] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [status, setStatus] = useState(TaskStatus.ToDo);
    const [cost, setCost] = useState(0);
    const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
    const [category, setCategory] = useState(TASK_CATEGORIES[0]);
    const [reminderDate, setReminderDate] = useState('');

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setDescription('');
            setPlotId(plots[0]?.id || '');
            setAssigneeId(users[0]?.id || '');
            setDueDate(new Date().toISOString().split('T')[0]);
            setStatus(TaskStatus.ToDo);
            setCost(0);
            setPriority('Medium');
            setCategory(TASK_CATEGORIES[0]);
            setReminderDate('');
        }
    }, [isOpen, plots, users]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !plotId || !assigneeId || !dueDate) {
            alert('Please fill in all required fields.');
            return;
        }
        onSubmit({ title, description, plotId, assigneeId, dueDate, status, cost, priority, category, reminderDate: reminderDate || null });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Task" size="xl">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input id="add-title" label="Title" value={title} onChange={e => setTitle(e.target.value)} required />
                <div>
                    <label htmlFor="add-desc" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea id="add-desc" value={description} onChange={e => setDescription(e.target.value)} rows={3} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input id="add-duedate" label="Due Date" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                    <Input id="add-cost" label="Estimated Cost" type="number" value={cost} onChange={e => setCost(Number(e.target.value))} />
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input id="add-reminderdate" label="Reminder Date & Time" type="datetime-local" value={reminderDate} onChange={e => setReminderDate(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="add-priority" className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select id="add-priority" value={priority} onChange={e => setPriority(e.target.value as any)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" required>
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="add-status" className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select id="add-status" value={status} onChange={e => setStatus(e.target.value as TaskStatus)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" required>
                            {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="add-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select id="add-category" value={category} onChange={e => setCategory(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" required>
                            {TASK_CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="add-assignee" className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                        <select id="add-assignee" value={assigneeId} onChange={e => setAssigneeId(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" required>
                           {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="add-plot" className="block text-sm font-medium text-gray-700 mb-1">Plot</label>
                        <select id="add-plot" value={plotId} onChange={e => setPlotId(e.target.value)} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm" required>
                           {plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Create Task</Button>
                </div>
            </form>
        </Modal>
    );
};


// Operations component
interface OperationsProps {
    farmData: FarmDataContextType;
    user: User;
    workspaceUsers: User[];
    onSelectTask: (task: Task) => void;
}

const statusColors: Record<TaskStatus, string> = {
    [TaskStatus.ToDo]: 'border-t-gray-400',
    [TaskStatus.InProgress]: 'border-t-blue-500',
    [TaskStatus.Blocked]: 'border-t-red-500',
    [TaskStatus.Done]: 'border-t-green-500',
};

const priorityColors: Record<'Low' | 'Medium' | 'High', string> = {
    'Low': 'bg-gray-200 text-gray-800',
    'Medium': 'bg-yellow-200 text-yellow-800',
    'High': 'bg-red-200 text-red-800',
}

const TaskCard: React.FC<{ task: Task, onClick: () => void, users: User[], plots: Plot[] }> = ({ task, onClick, users, plots }) => {
    const assignee = users.find(u => u.id === task.assigneeId);
    const plot = plots.find(p => p.id === task.plotId);
    const isOverdue = new Date(task.dueDate) < new Date() && task.status !== TaskStatus.Done;

    return (
        <div 
            onClick={onClick}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
            className={`bg-white rounded-md shadow-sm p-3 cursor-pointer hover:shadow-lg transition-shadow border-t-4 ${statusColors[task.status]}`}
        >
            <div className="flex justify-between items-start">
                 <h4 className="font-semibold text-gray-800 flex-1 pr-2">{task.title}</h4>
                 <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${priorityColors[task.priority]}`}>{task.priority}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1 truncate">Plot: {plot?.name || 'N/A'}</p>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                <p className={`text-xs font-medium ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>Due: {task.dueDate}</p>
                <p className="text-xs text-gray-500">To: {assignee?.name.split(' ')[0] || 'N/A'}</p>
            </div>
        </div>
    );
};

export const Operations: React.FC<OperationsProps> = ({ farmData, user, workspaceUsers, onSelectTask }) => {
    const { tasks, plots, seasons, addTask, updateTask } = farmData;
    const [viewMode, setViewMode] = useState<'Board' | 'Grouped'>('Board');
    const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
    
    // Filters
    const [selectedPlot, setSelectedPlot] = useState<string>('all');
    const [selectedSeason, setSelectedSeason] = useState<string>('all');
    
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            const plotMatch = selectedPlot === 'all' || task.plotId === selectedPlot;
            const seasonMatch = true; // Placeholder for future season filtering logic
            return plotMatch && seasonMatch;
        });
    }, [tasks, selectedPlot, selectedSeason]);


    const tasksByStatus = useMemo(() => {
        return filteredTasks.reduce((acc, task) => {
            if (!acc[task.status]) {
                acc[task.status] = [];
            }
            acc[task.status].push(task);
            return acc;
        }, {} as Record<TaskStatus, Task[]>);
    }, [filteredTasks]);

    const tasksByPlot = useMemo(() => {
        return filteredTasks.reduce((acc, task) => {
            const plotName = plots.find(p => p.id === task.plotId)?.name || 'Unassigned';
            if (!acc[plotName]) {
                acc[plotName] = [];
            }
            acc[plotName].push(task);
            return acc;
        }, {} as Record<string, Task[]>);
    }, [filteredTasks, plots]);


    const handleAddTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'comments'>) => {
        addTask(taskData);
        setIsAddTaskModalOpen(false);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, newStatus: TaskStatus) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("taskId");
        const taskToUpdate = tasks.find(t => t.id === taskId);
        if (taskToUpdate && taskToUpdate.status !== newStatus) {
            updateTask({ ...taskToUpdate, status: newStatus });
        }
    };
    
    const renderGroupedView = () => (
        <div className="space-y-6">
            {/* FIX: Add type annotation to map parameters to resolve 'unknown' type for plotTasks. */}
            {Object.entries(tasksByPlot).sort(([plotA], [plotB]) => plotA.localeCompare(plotB)).map(([plotName, plotTasks]: [string, Task[]]) => {
                const statusCounts = plotTasks.reduce((acc, task) => {
                    acc[task.status] = (acc[task.status] || 0) + 1;
                    return acc;
                }, {} as Record<TaskStatus, number>);
                
                return (
                    <div key={plotName} className="bg-white rounded-lg shadow-md p-4">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="text-lg font-semibold text-gray-800">{plotName}</h3>
                            <div className="flex items-center space-x-4 text-sm">
                                <span><span className="font-bold">{plotTasks.length}</span> Total Tasks</span>
                                <span className="text-gray-500">To-Do: {statusCounts[TaskStatus.ToDo] || 0}</span>
                                <span className="text-blue-500">In Progress: {statusCounts[TaskStatus.InProgress] || 0}</span>
                                <span className="text-green-500">Done: {statusCounts[TaskStatus.Done] || 0}</span>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {plotTasks.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(task => (
                                 <TaskCard key={task.id} task={task} onClick={() => onSelectTask(task)} users={workspaceUsers} plots={plots} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
    
    const renderBoardView = () => (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.values(TaskStatus).map(status => (
                <div 
                    key={status} 
                    className="bg-gray-100 rounded-lg p-4"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, status)}
                >
                    <h3 className="font-semibold text-gray-700 mb-4 pb-2 border-b-2">{status} ({tasksByStatus[status]?.length || 0})</h3>
                    <div className="space-y-3 h-[65vh] overflow-y-auto pr-2">
                        {(tasksByStatus[status] || []).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).map(task => (
                            <TaskCard key={task.id} task={task} onClick={() => onSelectTask(task)} users={workspaceUsers} plots={plots} />
                        ))}
                        {(!tasksByStatus[status] || tasksByStatus[status].length === 0) && <p className="text-sm text-gray-500 text-center pt-10">Drop tasks here</p>}
                    </div>
                </div>
            ))}
        </div>
    );


    return (
        <>
            <AddTaskModal 
                isOpen={isAddTaskModalOpen}
                onClose={() => setIsAddTaskModalOpen(false)}
                onSubmit={handleAddTask}
                users={workspaceUsers}
                plots={plots}
            />

            <div className="space-y-6">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex items-center space-x-2 bg-gray-200 p-1 rounded-lg">
                        <Button variant={viewMode === 'Board' ? 'primary' : 'secondary'} className={`!text-sm !py-1 !px-3 ${viewMode !== 'Board' && '!bg-white !text-gray-700'}`} onClick={() => setViewMode('Board')}>Board</Button>
                        <Button variant={viewMode === 'Grouped' ? 'primary' : 'secondary'} className={`!text-sm !py-1 !px-3 ${viewMode !== 'Grouped' && '!bg-white !text-gray-700'}`} onClick={() => setViewMode('Grouped')}>Grouped</Button>
                    </div>

                    <div className="flex items-center space-x-4 flex-wrap">
                         <div>
                            <label htmlFor="plot-filter" className="text-sm font-medium text-gray-700 mr-2">Plot:</label>
                            <select id="plot-filter" value={selectedPlot} onChange={e => setSelectedPlot(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                                <option value="all">All Plots</option>
                                {plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="season-filter" className="text-sm font-medium text-gray-700 mr-2">Season:</label>
                             <select id="season-filter" value={selectedSeason} onChange={e => setSelectedSeason(e.target.value)} className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm bg-white text-sm focus:outline-none focus:ring-green-500 focus:border-green-500">
                                <option value="all">All Seasons</option>
                                {seasons.map(s => <option key={s.id} value={s.id}>{`${s.name} ${s.year}`}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <Button onClick={() => setIsAddTaskModalOpen(true)}>Add Task</Button>
                </div>
                {viewMode === 'Board' ? renderBoardView() : renderGroupedView()}
            </div>
        </>
    );
};