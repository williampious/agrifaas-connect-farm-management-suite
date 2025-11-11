import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { Modal } from './shared/Modal';
import { Button } from './shared/Button';
import { Avatar } from './shared/Avatar';
import { Input } from './shared/Input';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onLogout: () => void;
    onUpdateUser: (user: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onLogout, onUpdateUser }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user.name);
    const [contact, setContact] = useState(user.contact || '');

    useEffect(() => {
        if (isOpen) {
            setName(user.name);
            setContact(user.contact || '');
            setIsEditing(false); // Reset edit state on open
        }
    }, [isOpen, user]);

    const handleSave = () => {
        if (!name.trim()) {
            alert('Name cannot be empty.');
            return;
        }
        onUpdateUser({ ...user, name: name.trim(), contact: contact.trim() });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setName(user.name);
        setContact(user.contact || '');
        setIsEditing(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Profile' : 'My Profile'} size="sm">
            <div className="flex flex-col items-center space-y-4 py-4">
                <Avatar name={name} size="lg" />

                {isEditing ? (
                    <div className="w-full space-y-4">
                        <Input 
                            id="profile-name"
                            label="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                         <Input 
                            id="profile-email"
                            label="Email Address"
                            value={user.email}
                            disabled
                        />
                         <Input 
                            id="profile-contact"
                            label="Contact (Phone)"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            placeholder="Optional"
                        />
                        <div className="flex justify-end space-x-2 pt-4">
                            <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
                            <Button onClick={handleSave}>Save Changes</Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-gray-800">{user.name}</h3>
                            <p className="text-gray-500">{user.email}</p>
                            {user.contact && <p className="text-sm text-gray-500 mt-1">{user.contact}</p>}
                        </div>
                        <div className="pt-4 w-full space-y-2">
                             <Button variant="secondary" onClick={() => setIsEditing(true)} className="w-full !bg-gray-200 !text-gray-800 hover:!bg-gray-300">
                                Edit Profile
                            </Button>
                            <Button variant="danger" onClick={onLogout} className="w-full">
                                Logout
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </Modal>
    );
};