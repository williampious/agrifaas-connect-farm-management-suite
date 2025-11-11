
import React, { useState, useEffect, useCallback } from 'react';
import type { User, Workspace, PlatformConfig, AuditLogEntry, Role } from './types.js';
import { AuthPage } from './components/auth/AuthPage';
import { CreateWorkspacePage } from './components/auth/CreateWorkspacePage';
import { MainApp } from './components/MainApp';
import { SuperAdmin } from './components/super-admin/SuperAdmin';
import { seedInitialData } from './hooks/useFarmData';
import { ALL_FEATURES, ALL_ROLES } from './types.js';

// Mock data and localStorage helpers
const getStorageItem = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        return defaultValue;
    }
};

const setStorageItem = <T,>(key: string, value: T) => {
    localStorage.setItem(key, JSON.stringify(value));
};


const App: React.FC = () => {
    // STATE
    const [users, setUsers] = useState<User[]>(() => getStorageItem('users', []));
    
    // Initialize workspaces and migrate permissions for new features
    const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
        const storedWorkspaces = getStorageItem<Workspace[]>('workspaces', []);
        const defaultPermissions = Object.fromEntries(ALL_FEATURES.map(f => [f, { enabled: true, allowedRoles: [...ALL_ROLES] }])) as Workspace['permissions'];

        const updatedWorkspaces = storedWorkspaces.map(ws => ({
            ...ws,
            permissions: {
                ...defaultPermissions,
                ...ws.permissions,
            }
        }));

        // Only update storage if a migration actually happened to avoid unnecessary writes
        if (JSON.stringify(storedWorkspaces) !== JSON.stringify(updatedWorkspaces)) {
            setStorageItem('workspaces', updatedWorkspaces);
        }
        
        return updatedWorkspaces;
    });
    
    const [currentUser, setCurrentUser] = useState<User | null>(() => getStorageItem('currentUser', null));
    const [isSuperAdmin, setIsSuperAdmin] = useState<boolean>(() => getStorageItem('isSuperAdmin', false));
    const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);

    const [platformConfig, setPlatformConfig] = useState<PlatformConfig>(() => getStorageItem('platformConfig', {
        featureFlags: Object.fromEntries(ALL_FEATURES.map(f => [f, { enabled: true }])) as any,
        defaultPermissions: Object.fromEntries(ALL_FEATURES.map(f => [f, { enabled: true, allowedRoles: [...ALL_ROLES] }])) as any,
    }));
    const [auditLog, setAuditLog] = useState<AuditLogEntry[]>(() => getStorageItem('auditLog', []));

    // PERSISTENCE
    useEffect(() => setStorageItem('users', users), [users]);
    useEffect(() => setStorageItem('workspaces', workspaces), [workspaces]);
    useEffect(() => setStorageItem('currentUser', currentUser), [currentUser]);
    useEffect(() => setStorageItem('isSuperAdmin', isSuperAdmin), [isSuperAdmin]);
    useEffect(() => setStorageItem('platformConfig', platformConfig), [platformConfig]);
    useEffect(() => setStorageItem('auditLog', auditLog), [auditLog]);
    
    const addAuditLog = (action: string, details: string) => {
        const newLog: AuditLogEntry = {
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            superAdminId: 'superadmin',
            action,
            details,
        };
        setAuditLog(prev => [newLog, ...prev]);
    };

    // AUTH HANDLERS
    const handleLogin = (email: string): boolean => {
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (user && user.status === 'active') {
            const userWorkspace = workspaces.find(ws => ws.members[user.id]);
            if(userWorkspace && userWorkspace.status === 'suspended') {
                 alert('This workspace has been suspended by the platform administrator.');
                 return false;
            }
            setCurrentUser({ ...user, currentWorkspaceId: userWorkspace?.id });
            return true;
        }
        alert('User not found or account suspended.');
        return false;
    };

    const handleCreateAccount = (name: string, email: string): boolean => {
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
            alert('An account with this email already exists.');
            return false;
        }
        const newUser: User = { id: `user_${Date.now()}`, name, email, status: 'active', contact: '' };
        setUsers(prev => [...prev, newUser]);
        setCurrentUser(newUser);
        return true;
    };
    
    const handleGoogleLogin = () => {
        const googleUserEmail = 'george.washington@example.com';
        const googleUserName = 'George Washington';

        let user = users.find(u => u.email.toLowerCase() === googleUserEmail.toLowerCase());

        if (user && user.status === 'suspended') {
            alert('This account has been suspended.');
            return;
        }

        if (!user) {
            // First time signing in with Google, create a new user
            const newUser: User = {
                id: `user_${Date.now()}`,
                name: googleUserName,
                email: googleUserEmail,
                status: 'active',
                contact: '',
            };
            setUsers(prev => [...prev, newUser]);
            user = newUser;
        }
        
        const userWorkspace = workspaces.find(ws => ws.members[user!.id]);
         if(userWorkspace && userWorkspace.status === 'suspended') {
            alert('This workspace has been suspended by the platform administrator.');
            return;
        }
        setCurrentUser({ ...user, currentWorkspaceId: userWorkspace?.id });
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setIsSuperAdmin(false);
        setImpersonatedUser(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isSuperAdmin');
    };

    // WORKSPACE HANDLERS
    const handleCreateWorkspace = (workspaceName: string) => {
        if (!currentUser) return;
        const newWorkspace: Workspace = {
            id: `ws_${Date.now()}`,
            name: workspaceName,
            status: 'active',
            members: { [currentUser.id]: { role: 'owner' } },
            permissions: platformConfig.defaultPermissions,
            pendingInvitations: [],
        };
        setWorkspaces(prev => [...prev, newWorkspace]);
        setCurrentUser(prev => prev ? { ...prev, currentWorkspaceId: newWorkspace.id } : null);
        seedInitialData(newWorkspace.id);
    };
    
    const handleExportWorkspaceData = (workspaceId: string) => {
        const workspaceData: { [key: string]: any } = {};
        const prefix = `farm_data_${workspaceId}_`;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith(prefix)) {
                const dataKey = key.substring(prefix.length);
                workspaceData[dataKey] = getStorageItem(key, []);
            }
        }
        
        const workspaceDetails = workspaces.find(ws => ws.id === workspaceId);
        const fileName = `agrifaas_export_${workspaceDetails?.name.replace(/\s+/g, '_') || workspaceId}_${new Date().toISOString().split('T')[0]}.json`;

        const blob = new Blob([JSON.stringify(workspaceData, null, 2)], { type: 'application/json' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    };

    // SUPER ADMIN HANDLERS
    const handleSuperAdminLogin = () => {
        if (prompt("Enter Super Admin password:") === 'superadmin') {
            setIsSuperAdmin(true);
            setCurrentUser(null);
        } else {
            alert('Incorrect password.');
        }
    };
    
    const handleToggleWorkspaceStatus = (workspaceId: string) => {
        setWorkspaces(prev => prev.map(ws => {
            if (ws.id === workspaceId) {
                const newStatus = ws.status === 'active' ? 'suspended' : 'active';
                addAuditLog('Workspace Status Change', `Workspace ${ws.name} (${ws.id}) status changed to ${newStatus}.`);
                return { ...ws, status: newStatus };
            }
            return ws;
        }));
    };
    
    const handleImpersonate = (workspaceId: string) => {
        const workspace = workspaces.find(ws => ws.id === workspaceId);
        if (!workspace) return;
        const ownerId = Object.keys(workspace.members).find(id => workspace.members[id].role === 'owner');
        const owner = users.find(u => u.id === ownerId);
        if (owner) {
            setImpersonatedUser(owner);
            setCurrentUser({ ...owner, currentWorkspaceId: workspaceId });
            setIsSuperAdmin(false);
            addAuditLog('Impersonation Start', `Started impersonating user ${owner.name} (${owner.id}) in workspace ${workspace.name} (${workspace.id}).`);
        } else {
            alert('Could not find owner for this workspace.');
        }
    };
    
    const handleExitImpersonation = () => {
        if (impersonatedUser) {
             addAuditLog('Impersonation End', `Stopped impersonating user ${impersonatedUser.name} (${impersonatedUser.id}).`);
        }
        setImpersonatedUser(null);
        setCurrentUser(null);
        setIsSuperAdmin(true);
    };

    const handleToggleUserStatus = (userId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                const newStatus = u.status === 'active' ? 'suspended' : 'active';
                addAuditLog('User Status Change', `User ${u.name} (${u.id}) status changed to ${newStatus}.`);
                return { ...u, status: newStatus };
            }
            return u;
        }));
    };
    
     const handleUpdatePlatformConfig = (newConfig: PlatformConfig) => {
        setPlatformConfig(newConfig);
        addAuditLog('Platform Config Update', 'Global feature flags or default permissions were updated.');
    };
    
    const handleJoinWorkspace = (name: string, email: string, workspaceId: string): boolean => {
        // Find the workspace
        const workspace = workspaces.find(ws => ws.id === workspaceId);
        if (!workspace) {
            alert('Workspace not found. Please check the ID.');
            return false;
        }

        // Check if user already exists by email
        let user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        // If user exists, check if they are already in the workspace
        if (user && workspace.members[user.id]) {
            alert('You are already a member of this workspace.');
            handleLogin(email); // Log them in
            return false;
        }
        
        // If user doesn't exist, create them
        if (!user) {
            user = { id: `user_${Date.now()}`, name, email, status: 'active', contact: '' };
            setUsers(prev => [...prev, user!]);
        }
        
        // Check for a pending invitation
        const invitation = workspace.pendingInvitations?.find(inv => inv.email.toLowerCase() === email.toLowerCase());
        const role = invitation ? invitation.role : 'member'; // Default to 'member' if no invite

        // Add user to workspace and remove invitation
        setWorkspaces(prev => prev.map(ws => {
            if (ws.id === workspaceId) {
                const newMembers = { ...ws.members, [user!.id]: { role } };
                const newInvites = ws.pendingInvitations?.filter(inv => inv.email.toLowerCase() !== email.toLowerCase());
                return { ...ws, members: newMembers, pendingInvitations: newInvites };
            }
            return ws;
        }));
        
        // Log in the new user
        setCurrentUser({ ...user, currentWorkspaceId: workspaceId });
        return true;
    };
    
    const handleInviteUser = (workspaceId: string, email: string, role: Role) => {
        setWorkspaces(prev => prev.map(ws => {
            if (ws.id === workspaceId) {
                const newInvite = { email, role, invitedAt: new Date().toISOString() };
                const existingInvites = ws.pendingInvitations || [];
                // Avoid duplicate invites
                if (existingInvites.some(inv => inv.email.toLowerCase() === email.toLowerCase())) {
                    alert('This user has already been invited.');
                    return ws;
                }
                return { ...ws, pendingInvitations: [...existingInvites, newInvite] };
            }
            return ws;
        }));
    };
    
    const handleRevokeInvitation = (workspaceId: string, email: string) => {
        setWorkspaces(prev => prev.map(ws => {
            if (ws.id === workspaceId) {
                const newInvites = ws.pendingInvitations?.filter(inv => inv.email.toLowerCase() !== email.toLowerCase());
                return { ...ws, pendingInvitations: newInvites };
            }
            return ws;
        }));
    };
    
    const handleUpdateFeaturePermissions = (workspaceId: string, newPermissions: Workspace['permissions']) => {
        setWorkspaces(prev => prev.map(ws => {
            if (ws.id === workspaceId) {
                return { ...ws, permissions: newPermissions };
            }
            return ws;
        }));
    };
    
    const handleUpdateUserRole = (workspaceId: string, userId: string, role: Role) => {
        setWorkspaces(prev => prev.map(ws => {
            if (ws.id === workspaceId) {
                const newMembers = { ...ws.members };
                if (newMembers[userId]) {
                    newMembers[userId] = { ...newMembers[userId], role: role };
                }
                return { ...ws, members: newMembers };
            }
            return ws;
        }));
    };
    
    const handleUpdateUser = (updatedUser: User) => {
        setUsers(prev => prev.map(u => (u.id === updatedUser.id ? updatedUser : u)));
        if (currentUser?.id === updatedUser.id) {
            setCurrentUser(prev => (prev ? { ...prev, ...updatedUser } : null));
        }
    };


    // RENDER LOGIC
    if (isSuperAdmin && !impersonatedUser) {
        return (
            <SuperAdmin
                allUsers={users}
                allWorkspaces={workspaces}
                platformConfig={platformConfig}
                auditLog={auditLog}
                onLogout={handleLogout}
                onToggleWorkspaceStatus={handleToggleWorkspaceStatus}
                onImpersonate={handleImpersonate}
                onToggleUserStatus={handleToggleUserStatus}
                onUpdatePlatformConfig={handleUpdatePlatformConfig}
            />
        );
    }

    if (!currentUser) {
        return (
            <AuthPage
                onCreateAccount={handleCreateAccount}
                onJoinWorkspace={handleJoinWorkspace}
                onLogin={handleLogin}
                onGoogleLogin={handleGoogleLogin}
                onSuperAdminLogin={handleSuperAdminLogin}
            />
        );
    }
    
    const currentWorkspace = workspaces.find(ws => ws.id === currentUser.currentWorkspaceId);

    if (!currentWorkspace) {
        return <CreateWorkspacePage user={currentUser} onCreateWorkspace={handleCreateWorkspace} />;
    }
    
    if (currentWorkspace.status === 'suspended') {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
                <h1 className="text-3xl font-bold text-red-600">Workspace Suspended</h1>
                <p className="text-gray-700 mt-2">This workspace has been suspended by the platform administrator.</p>
                <button onClick={handleLogout} className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                    Logout
                </button>
            </div>
        );
    }


    return (
        <MainApp
            user={currentUser}
            workspace={currentWorkspace}
            allUsers={users}
            onLogout={handleLogout}
            impersonatingUser={impersonatedUser}
            onExitImpersonation={handleExitImpersonation}
            onInviteUser={handleInviteUser}
            onRevokeInvitation={handleRevokeInvitation}
            onUpdateFeaturePermissions={handleUpdateFeaturePermissions}
            onExportWorkspaceData={handleExportWorkspaceData}
            onUpdateUserRole={handleUpdateUserRole}
            onUpdateUser={handleUpdateUser}
        />
    );
};

export default App;