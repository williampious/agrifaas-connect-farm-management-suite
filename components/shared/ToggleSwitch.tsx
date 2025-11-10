import React from 'react';

interface ToggleSwitchProps {
    isEnabled: boolean;
    onToggle: (isEnabled: boolean) => void;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ isEnabled, onToggle }) => {
    const handleChange = () => {
        onToggle(!isEnabled);
    };

    return (
        <label className="flex items-center cursor-pointer">
            <div className="relative">
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={isEnabled}
                    onChange={handleChange}
                />
                <div className={`block w-14 h-8 rounded-full transition-colors ${isEnabled ? 'bg-green-600' : 'bg-gray-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${isEnabled ? 'transform translate-x-6' : ''}`}></div>
            </div>
        </label>
    );
};