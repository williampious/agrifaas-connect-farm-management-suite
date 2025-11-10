
import React from 'react';

interface CardProps {
    title?: string;
    children: React.ReactNode;
    className?: string;
    titleClassName?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = '', titleClassName = '' }) => {
    return (
        <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
            {title && <h3 className={`text-xl font-semibold text-gray-700 mb-4 ${titleClassName}`}>{title}</h3>}
            {children}
        </div>
    );
};
