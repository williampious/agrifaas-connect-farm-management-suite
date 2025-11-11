
import React from 'react';
import { Button } from './Button';

interface ImpersonationBannerProps {
    userName: string;
    onExit: () => void;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({ userName, onExit }) => {
    return (
        <div className="bg-yellow-400 text-yellow-900 font-semibold px-4 py-2 flex items-center justify-between text-sm z-50 w-full no-print">
            <span>
                ⚠️ You are currently viewing the application as <strong>{userName}</strong>.
            </span>
            <Button onClick={onExit} variant="secondary" className="!bg-yellow-500 hover:!bg-yellow-600 !text-yellow-900 !py-1 !px-3">
                Exit Impersonation
            </Button>
        </div>
    );
};
