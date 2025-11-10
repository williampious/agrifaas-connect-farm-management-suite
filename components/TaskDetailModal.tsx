import React, { useState, useEffect } from 'react';
import type { Task, User, Plot, Comment } from '../types';
import { TaskStatus } from '../types';
import { Modal } from './shared/Modal';
import { Button } from './shared/Button';
import { Avatar } from './shared/Avatar';

interface TaskDetailModalProps {
    task: Task;
    onClose: () => void;
    onUpdateTask: (task: Task) => void;
    onAddTaskComment: (taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
    allUsers: User[];
    allPlots: Plot[];
    currentUser: User;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
    task,
    onClose,
    onUpdateTask,
    onAddTaskComment,
    allUsers,
    allPlots,
    currentUser
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editedTask, setEditedTask] = useState(task);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        setEditedTask(task);
        setIsEditing(false);
    }, [task]);

    const assignee = allUsers.find(u => u.id === task.assigneeId);
    const plot = allPlots.find(p => p.id === task.plotId);

    const handleUpdate = () => {
        onUpdateTask(editedTask);
        setIsEditing(false);
    };
    
    const handleAddComment = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim()) {
            onAddTaskComment(task.id, { authorId: currentUser.id, content: newComment.trim() });
            setNewComment('');
        }
    };
    
    return (
        <Modal isOpen={!!task} onClose={onClose} title={isEditing ? 'Edit Task' : task.title} size="2xl">
            {isEditing ? (
                <div className="space-y-4">
                    {/* Simplified Edit Form */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input value={editedTask.title} onChange={e => setEditedTask({...editedTask, title: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select value={editedTask.status} onChange={e => setEditedTask({...editedTask, status: e.target.value as TaskStatus})} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900">
                             {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={editedTask.description} rows={4} onChange={e => setEditedTask({...editedTask, description: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900" />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                        <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button onClick={handleUpdate}>Save Changes</Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-start">
                         <p className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{task.category}</p>
                         <Button variant="secondary" className="!py-1 !px-2 text-sm" onClick={() => setIsEditing(true)}>Edit</Button>
                    </div>
                    <p className="text-gray-700 whitespace-pre-wrap">{task.description || 'No description provided.'}</p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-4 border-t">
                        <div><strong className="font-semibold text-gray-600 block">Assignee:</strong> {assignee?.name || 'Unassigned'}</div>
                        <div><strong className="font-semibold text-gray-600 block">Plot:</strong> {plot?.name || 'N/A'}</div>
                        <div><strong className="font-semibold text-gray-600 block">Due Date:</strong> {task.dueDate}</div>
                        <div><strong className="font-semibold text-gray-600 block">Status:</strong> {task.status}</div>
                        <div><strong className="font-semibold text-gray-600 block">Priority:</strong> {task.priority}</div>
                        <div><strong className="font-semibold text-gray-600 block">Est. Cost:</strong> ${task.cost.toLocaleString()}</div>
                        {task.reminderDate && (
                            <div className="col-span-2"><strong className="font-semibold text-gray-600 block">Reminder:</strong> {new Date(task.reminderDate).toLocaleString()}</div>
                        )}
                    </div>
                    
                    {/* Comments Section */}
                    <div className="pt-4 border-t">
                        <h4 className="font-semibold text-lg mb-2">Comments</h4>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                            {task.comments.map(comment => {
                                const author = allUsers.find(u => u.id === comment.authorId);
                                return (
                                <div key={comment.id} className="flex items-start space-x-3">
                                    <div className="flex-shrink-0"><Avatar name={author?.name || 'Unknown'} size="sm" /></div>
                                    <div className="flex-1 bg-gray-50 p-2 rounded-lg">
                                        <p className="font-semibold text-sm">{author?.name}</p>
                                        <p className="text-sm text-gray-800">{comment.content}</p>
                                        <p className="text-xs text-gray-400 mt-1 text-right">{new Date(comment.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                );
                            })}
                            {task.comments.length === 0 && <p className="text-sm text-gray-500">No comments yet.</p>}
                        </div>
                         <form onSubmit={handleAddComment} className="mt-4 flex space-x-2">
                            <input 
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                            <Button type="submit">Send</Button>
                        </form>
                    </div>
                </div>
            )}
        </Modal>
    );
};