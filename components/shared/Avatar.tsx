import React from 'react';

interface AvatarProps {
    name: string;
    size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md' }) => {
    const getInitials = (name: string) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length > 1 && parts[parts.length - 1]) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        if (parts[0] && parts[0].length > 1) {
            return parts[0].substring(0, 2).toUpperCase();
        }
        return name[0]?.toUpperCase() || '?';
    };

    const sizeClasses = {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-base',
        lg: 'h-12 w-12 text-lg',
    };

    return (
        <div title={name} className={`rounded-full bg-green-600 text-white flex items-center justify-center font-bold select-none flex-shrink-0 ${sizeClasses[size]}`}>
            {getInitials(name)}
        </div>
    );
};
