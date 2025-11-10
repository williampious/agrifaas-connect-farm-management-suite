
import React, { useState } from 'react';
import { Card } from '../shared/Card';
import { Input } from '../shared/Input';
import { Button } from '../shared/Button';

interface AuthPageProps {
    onCreateAccount: (name: string, email: string, password: string) => Promise<boolean>;
    onJoinWorkspace: (name: string, email: string, password: string, workspaceId: string) => Promise<boolean>;
    onLogin: (email: string, password: string) => Promise<boolean>;
    onGoogleLogin: (workspaceId?: string) => Promise<void>;
}

const GoogleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg viewBox="0 0 48 48" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.487-11.187-8.264l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C41.38,36.168,44,30.638,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

export const AuthPage: React.FC<AuthPageProps> = ({ onCreateAccount, onJoinWorkspace, onLogin, onGoogleLogin }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'create' | 'join'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [workspaceId, setWorkspaceId] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (activeTab === 'login') {
             if (!email || !password) {
                setError('Email and password are required.');
                return;
            }
            await onLogin(email, password);
        } else if (activeTab === 'create') {
            if (!name || !email || !password) {
                setError('All fields are required.');
                return;
            }
            await onCreateAccount(name, email, password);
        } else {
            if (!name || !email || !password || !workspaceId) {
                setError('All fields are required.');
                return;
            }
            await onJoinWorkspace(name, email, password, workspaceId);
        }
    };
    
    const handleForgotPassword = () => {
        alert('In a real application, a password reset link would be sent to your email.');
    };

    const TabButton: React.FC<{tab: 'login' | 'create' | 'join', children: React.ReactNode}> = ({ tab, children }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`w-full py-2.5 text-sm font-medium leading-5 rounded-lg
                focus:outline-none focus:ring-2 ring-offset-2 ring-offset-green-50 ring-white ring-opacity-60
                ${activeTab === tab ? 'bg-green-600 text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
        >
            {children}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
             <div className="text-center mb-6">
                 <h1 className="text-4xl font-bold text-gray-800">
                    AgriFAAS<span className="text-green-500"> Connect</span>
                 </h1>
                 <p className="text-gray-600 mt-2">The all-in-one platform for modern farm management.</p>
            </div>
            <div className="w-full max-w-md">
                <div className="flex space-x-1 rounded-xl bg-gray-100 p-1 mb-4">
                    <TabButton tab="login">Login</TabButton>
                    <TabButton tab="create">Create Account</TabButton>
                    <TabButton tab="join">Join Workspace</TabButton>
                </div>
                <Card>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h2 className="text-xl font-bold text-center text-gray-800">
                            {activeTab === 'login' && 'Login to Your Account'}
                            {activeTab === 'create' && 'Create a New Account'}
                            {activeTab === 'join' && 'Join an Existing Workspace'}
                        </h2>

                        {activeTab === 'join' && (
                             <Input id="workspaceId" label="Workspace ID" type="text" value={workspaceId} onChange={e => {
                                setWorkspaceId(e.target.value);
                                setError('');
                             }} required placeholder="Enter the ID from your invitation" />
                        )}

                        <Button type="button" variant="secondary" className="w-full !bg-white !text-gray-700 border border-gray-300 hover:!bg-gray-50 flex items-center justify-center" onClick={() => {
                            if (activeTab === 'join' && !workspaceId.trim()) {
                                setError('Please enter Workspace ID first');
                                return;
                            }
                            setError('');
                            onGoogleLogin(activeTab === 'join' ? workspaceId : undefined);
                        }}>
                            <GoogleIcon className="w-5 h-5 mr-3" />
                            Sign in with Google
                        </Button>

                         <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Or continue with
                                </span>
                            </div>
                        </div>
                        
                        {activeTab !== 'login' && (
                             <Input id="name" label="Full Name" type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="John Appleseed" />
                        )}
                        <Input id="email" label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
                        <div>
                            <Input id="password" label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
                            {activeTab === 'login' && (
                                <div className="text-right mt-1">
                                    <button type="button" onClick={handleForgotPassword} className="text-sm font-medium text-green-600 hover:text-green-500">
                                        Forgot Password?
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        {error && <p className="text-sm text-red-600">{error}</p>}

                        <Button type="submit" className="w-full">
                           {activeTab === 'login' && 'Login'}
                           {activeTab === 'create' && 'Create Account'}
                           {/* FIX: Corrected typo from active_tab to activeTab */}
                           {activeTab === 'join' && 'Join & Create Account'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
};
