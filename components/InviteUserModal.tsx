
import React, { useState } from 'react';
import { Modal } from './shared/Modal';
import { Input } from './shared/Input';
import { Button } from './shared/Button';
import type { Role } from '../types';
import { ALL_ROLES } from '../types';

interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (email: string, role: Role) => void;
}

export const InviteUserModal: React.FC<InviteUserModalProps> = ({ isOpen, onClose, onInvite }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>('member');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (email && role) {
            onInvite(email, role);
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invite New User">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input 
                    id="invite-email"
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    placeholder="teammate@example.com"
                />
                <div>
                    <label htmlFor="invite-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                        id="invite-role"
                        value={role}
                        onChange={e => setRole(e.target.value as Role)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    >
                        {ALL_ROLES.map(r => (
                            <option key={r} value={r} className="capitalize">{r}</option>
                        ))}
                    </select>
                </div>
                 <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button type="submit">Send Invitation</Button>
                </div>
            </form>
        </Modal>
    );
};
