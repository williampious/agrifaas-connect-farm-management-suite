
import React, { useState, useEffect } from 'react';
import { AuthPage } from './components/auth/AuthPage';
import { CreateWorkspacePage } from './components/auth/CreateWorkspacePage';
import { MainApp } from './components/MainApp';
import type { User, Workspace, Role, Feature, FeaturePermission } from './types';
import { ALL_ROLES } from './types';
import { seedFirestoreData } from './services/seedFirestoreData';
import { useAuth } from './hooks/useAuth';
import { useFirestoreUsers } from './hooks/useFirestoreUsers';
import { signUp, signIn, signInWithGoogle, logout } from './services/authService';
import { setDocument, getDocument, queryCollection } from './services/firestoreService';

// Mock user and workspace data for demonstration purposes
const getMockUser = (email: string, name: string): User => ({ id: `user_${email}`, email, name });
const createMockWorkspace = (name: string, owner: User): Workspace => {
    const wsId = `ws_${Date.now()}`;
    return {
        id: wsId,
        name,
        members: { [owner.id]: { role: 'owner' } },
        featurePermissions: {
            'Dashboard': { enabled: true, allowedRoles: [...ALL_ROLES] },
            'Operations': { enabled: true, allowedRoles: ['owner', 'Farm Manager', 'Field Manager', 'Field Officer'] },
            'Financials': { enabled: true, allowedRoles: ['owner', 'Accountant', 'Farm Manager', 'Office Manager'] },
            'HR': { enabled: true, allowedRoles: ['owner', 'PeopleHR', 'Farm Manager', 'Office Manager'] },
            'Inventory': { enabled: true, allowedRoles: ['owner', 'Farm Manager', 'Field Manager'] },
            'Plots & Seasons': { enabled: true, allowedRoles: ['owner', 'Farm Manager', 'Field Manager'] },
            'AEO': { enabled: true, allowedRoles: ['owner', 'Agr_iEx_Off'] },
            'AI Insights': { enabled: true, allowedRoles: ['owner', 'Farm Manager'] },
            'Admin': { enabled: true, allowedRoles: ['owner'] },
        }
    };
};

const App: React.FC = () => {
    const { user: firebaseUser, loading } = useAuth();
    const allUsers = useFirestoreUsers();
    const [user, setUser] = useState<User | null>(null);
    const [workspace, setWorkspace] = useState<Workspace | null>(null);
    const [allWorkspaces, setAllWorkspaces] = useState<Workspace[]>([]);

    useEffect(() => {
        if (!firebaseUser) {
            setUser(null);
            setWorkspace(null);
            setAllWorkspaces([]);
            return;
        }
        
        const loadUserData = async () => {
            const userDoc = await getDocument('users', firebaseUser.uid);
            if (userDoc.exists()) {
                const userData = { id: firebaseUser.uid, ...userDoc.data() } as User;
                setUser(userData);
                
                const workspacesSnap = await queryCollection('workspaces', `members.${firebaseUser.uid}`, '!=', null);
                const workspaces = workspacesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workspace));
                setAllWorkspaces(workspaces);
                
                if (workspaces.length > 0) {
                    setWorkspace(workspaces[0]);
                }
            }
        };
        loadUserData();
    }, [firebaseUser]);

    const handleLogout = async () => {
        await logout();
        setUser(null);
        setWorkspace(null);
    };

    const handleCreateAccount = async (name: string, email: string, password: string) => {
        try {
            const userCredential = await signUp(email, password);
            await setDocument('users', userCredential.user.uid, { email, name });
            return true;
        } catch (error: any) {
            alert(error.message);
            return false;
        }
    };
    
    const handleJoinWorkspace = async (name: string, email: string, password: string, workspaceId: string) => {
        try {
            const userCredential = await signUp(email, password);
            await setDocument('users', userCredential.user.uid, { email, name });
            
            const wsDoc = await getDocument('workspaces', workspaceId);
            if (!wsDoc.exists()) {
                alert('Workspace not found.');
                return false;
            }
            
            const wsData = wsDoc.data() as Workspace;
            wsData.members[userCredential.user.uid] = { role: 'member' };
            await setDocument('workspaces', workspaceId, wsData);
            return true;
        } catch (error: any) {
            alert(error.message);
            return false;
        }
    };

    const handleLogin = async (email: string, password: string) => {
        try {
            await signIn(email, password);
            return true;
        } catch (error: any) {
            alert(error.message);
            return false;
        }
    };

    const handleGoogleLogin = async (workspaceId?: string) => {
        try {
            const userCredential = await signInWithGoogle();
            const userDoc = await getDocument('users', userCredential.user.uid);
            
            if (!userDoc.exists()) {
                await setDocument('users', userCredential.user.uid, {
                    email: userCredential.user.email,
                    name: userCredential.user.displayName || 'User'
                });
            }
            
            if (workspaceId) {
                const wsDoc = await getDocument('workspaces', workspaceId);
                if (!wsDoc.exists()) {
                    alert('Workspace not found.');
                    return;
                }
                
                const wsData = wsDoc.data() as Workspace;
                wsData.members[userCredential.user.uid] = { role: 'member' };
                await setDocument('workspaces', workspaceId, wsData);
            }
        } catch (error: any) {
            alert(error.message);
        }
    };


    const handleCreateWorkspace = async (workspaceName: string) => {
        if (!firebaseUser) return;
        const newWorkspace = createMockWorkspace(workspaceName, { id: firebaseUser.uid, email: firebaseUser.email!, name: user?.name || '' });
        await setDocument('workspaces', newWorkspace.id, newWorkspace);
        await seedFirestoreData(newWorkspace.id);
        setAllWorkspaces([...allWorkspaces, newWorkspace]);
        setWorkspace(newWorkspace);
    };

    const handleRemoveUserFromWorkspace = async (userId: string) => {
        if (!workspace) return;
        const newMembers = { ...workspace.members };
        delete newMembers[userId];
        const updatedWorkspace = { ...workspace, members: newMembers };
        await setDocument('workspaces', workspace.id, updatedWorkspace);
        setWorkspace(updatedWorkspace);
    };

    const handleUpdateUserRole = async (userId: string, newRole: Role) => {
        if (!workspace) return;
        const owners = Object.keys(workspace.members).filter(id => workspace.members[id].role === 'owner');
        if (owners.length === 1 && owners[0] === userId && newRole !== 'owner') {
            alert('Cannot demote the last owner of the workspace.');
            return;
        }
        const newMembers = { ...workspace.members };
        if (newMembers[userId]) {
            newMembers[userId].role = newRole;
        }
        const updatedWorkspace = { ...workspace, members: newMembers };
        await setDocument('workspaces', workspace.id, updatedWorkspace);
        setWorkspace(updatedWorkspace);
    };
    
    const handleUpdateFeaturePermissions = async (feature: Feature, newPermission: FeaturePermission) => {
        if (!workspace) return;
        const updatedWorkspace = {
            ...workspace,
            featurePermissions: {
                ...workspace.featurePermissions,
                [feature]: newPermission,
            },
        };
        await setDocument('workspaces', workspace.id, updatedWorkspace);
        setWorkspace(updatedWorkspace);
    };


    const handleDeleteWorkspace = async () => {
        if (!workspace) return;
        await handleLogout();
    };


    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    
    if (!user) {
        return <AuthPage onCreateAccount={handleCreateAccount} onJoinWorkspace={handleJoinWorkspace} onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} />;
    }
    if (!workspace) {
        return <CreateWorkspacePage user={user} onCreateWorkspace={handleCreateWorkspace} />;
    }

    return (
        <MainApp 
            user={user} 
            initialWorkspace={workspace} 
            onLogout={handleLogout} 
            allUsers={allUsers}
            onRemoveUser={handleRemoveUserFromWorkspace}
            onUpdateUserRole={handleUpdateUserRole}
            onDeleteWorkspace={handleDeleteWorkspace}
            onUpdateFeaturePermissions={handleUpdateFeaturePermissions}
        />
    );
};

export default App;
