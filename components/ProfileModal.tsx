import React from 'react';
import type { User } from '../types';
import { Modal } from './shared/Modal';
import { Button } from './shared/Button';
import { Avatar } from './shared/Avatar';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onLogout }) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="My Profile" size="sm">
            <div className="flex flex-col items-center space-y-4 py-4">
                <Avatar name={user.name} size="lg" />
                <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                    <p className="text-gray-500">{user.email}</p>
                </div>
                <div className="pt-4 w-full">
                    <Button variant="danger" onClick={onLogout} className="w-full">
                        Logout
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
