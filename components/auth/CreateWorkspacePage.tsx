import React, { useState } from 'react';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';
import { User } from '../../types';

interface CreateWorkspacePageProps {
    user: User;
    onCreateWorkspace: (workspaceName: string) => void;
}

export const CreateWorkspacePage: React.FC<CreateWorkspacePageProps> = ({ user, onCreateWorkspace }) => {
    const [workspaceName, setWorkspaceName] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (workspaceName.trim()) {
            onCreateWorkspace(workspaceName.trim());
        }
    };
    
    return (
         <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
             <div className="text-center mb-6">
                 <h1 className="text-4xl font-bold text-gray-800">
                    Welcome to AgriFAAS<span className="text-green-500"> Connect</span>, {user.name}!
                 </h1>
                 <p className="text-gray-600 mt-2">Just one more step to get started.</p>
            </div>
            <div className="w-full max-w-md">
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h2 className="text-xl font-bold text-center text-gray-800">
                            Create Your Workspace
                        </h2>
                        <p className="text-sm text-center text-gray-600">
                            Your workspace is where you'll manage your farm and collaborate with your team.
                        </p>
                        <Input 
                            id="workspaceName" 
                            label="Workspace Name" 
                            type="text" 
                            value={workspaceName} 
                            onChange={e => setWorkspaceName(e.target.value)} 
                            required 
                            placeholder="e.g., Sunrise Farms" 
                        />
                        <Button type="submit" className="w-full">
                            Create Workspace
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};
