import React, { useState } from 'react';
import type { Task } from '../types';

interface OperationalCalendarProps {
    tasks: Task[];
    onSelectTask: (task: Task) => void;
}

const priorityColors: Record<'Low' | 'Medium' | 'High', { bg: string; text: string; border: string }> = {
    'High': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-l-4 border-red-500' },
    'Medium': { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-l-4 border-yellow-500' },
    'Low': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-l-4 border-gray-400' },
};

export const OperationalCalendar: React.FC<OperationalCalendarProps> = ({ tasks, onSelectTask }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from the Sunday of the first week
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on the Saturday of the last week

    const days = [];
    let day = new Date(startDate);
    while (day <= endDate) {
        days.push(new Date(day));
        day.setDate(day.getDate() + 1);
    }

    const tasksByDate = tasks.reduce((acc, task) => {
        const dateKey = task.dueDate;
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(task);
        return acc;
    }, {} as Record<string, Task[]>);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    const isToday = (date: Date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
               date.getMonth() === today.getMonth() &&
               date.getFullYear() === today.getFullYear();
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100">&lt;</button>
                    <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100">&gt;</button>
                    <button onClick={handleToday} className="px-3 py-1 text-sm border rounded hover:bg-gray-100">Today</button>
                </div>
                <h2 className="text-xl font-bold text-gray-800">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
            </div>
            <div className="grid grid-cols-7 gap-px bg-gray-200 border-l border-t border-gray-200">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-semibold text-xs py-2 bg-gray-50 text-gray-600">{day}</div>
                ))}
                {days.map(date => {
                    const dateKey = date.toISOString().split('T')[0];
                    const tasksForDay = tasksByDate[dateKey] || [];
                    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                    
                    return (
                        <div key={date.toString()} className={`p-2 bg-white min-h-[120px] border-r border-b border-gray-200 ${!isCurrentMonth ? 'bg-gray-50' : ''}`}>
                            <div className={`flex justify-center items-center h-6 w-6 rounded-full text-xs ${isToday(date) ? 'bg-green-600 text-white font-bold' : ''}`}>
                                {date.getDate()}
                            </div>
                            <div className="mt-1 space-y-1 overflow-y-auto max-h-[80px]">
                                {tasksForDay.map(task => (
                                    <div 
                                        key={task.id}
                                        onClick={() => onSelectTask(task)}
                                        className={`p-1 rounded text-xs cursor-pointer ${priorityColors[task.priority].bg} ${priorityColors[task.priority].text} ${priorityColors[task.priority].border}`}
                                    >
                                        <p className="font-semibold truncate">{task.title}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};