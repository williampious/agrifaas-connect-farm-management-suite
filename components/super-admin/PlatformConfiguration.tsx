import React from 'react';
import type { PlatformConfig, Feature, Role } from '../../types';
import { ALL_FEATURES, ALL_ROLES } from '../../types';
import { Card } from '../shared/Card';
import { ToggleSwitch } from '../shared/ToggleSwitch';

interface PlatformConfigurationProps {
    platformConfig: PlatformConfig;
    onUpdateConfig: (newConfig: PlatformConfig) => void;
}

export const PlatformConfiguration: React.FC<PlatformConfigurationProps> = ({ platformConfig, onUpdateConfig }) => {

    const handleFeatureToggle = (feature: Feature, isEnabled: boolean) => {
        const newConfig = {
            ...platformConfig,
            featureFlags: {
                ...platformConfig.featureFlags,
                [feature]: { enabled: isEnabled },
            },
        };
        onUpdateConfig(newConfig);
    };
    
    const handleDefaultPermissionToggle = (feature: Feature, isEnabled: boolean) => {
        const newConfig = { ...platformConfig };
        newConfig.defaultPermissions[feature].enabled = isEnabled;
        onUpdateConfig(newConfig);
    };
    
    const handleDefaultRolePermissionChange = (feature: Feature, role: Role, isChecked: boolean) => {
        const newConfig = { ...platformConfig };
        const currentPermission = newConfig.defaultPermissions[feature];
        const newAllowedRoles = isChecked
            ? [...currentPermission.allowedRoles, role]
            : currentPermission.allowedRoles.filter(r => r !== role);
        
        currentPermission.allowedRoles = newAllowedRoles;
        onUpdateConfig(newConfig);
    };


    return (
        <div className="space-y-6">
            <Card title="Global Feature Flags">
                <p className="mb-4 text-sm text-gray-600">
                    These toggles control the availability of features for the entire platform. If a feature is disabled here, no user in any workspace will be able to access it, regardless of their workspace settings.
                </p>
                <div className="space-y-3">
                    {ALL_FEATURES.map(feature => {
                        const isEnabled = platformConfig.featureFlags[feature]?.enabled ?? true;
                        return (
                            <div key={feature} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                <span className="font-medium text-gray-800">{feature}</span>
                                <ToggleSwitch
                                    isEnabled={isEnabled}
                                    onToggle={(newIsEnabled) => handleFeatureToggle(feature, newIsEnabled)}
                                />
                            </div>
                        );
                    })}
                </div>
            </Card>

            <Card title="Default Workspace Permissions">
                <p className="mb-4 text-sm text-gray-600">
                    Configure the initial set of enabled features and role permissions for all <strong>newly created</strong> workspaces. This does not affect existing workspaces.
                </p>
                 <div className="space-y-4">
                    {ALL_FEATURES.map(feature => {
                        const permission = platformConfig.defaultPermissions[feature];
                        if (!permission) return null; // Should not happen with proper config merging
                        
                        return (
                            <div key={feature} className="p-4 bg-gray-50 rounded-lg border">
                                <div className="flex items-center justify-between">
                                    <span className="font-medium text-gray-800 text-lg">{feature}</span>
                                    <ToggleSwitch 
                                        isEnabled={permission.enabled}
                                        onToggle={(isEnabled) => handleDefaultPermissionToggle(feature, isEnabled)}
                                    />
                                </div>
                                <div className={`mt-3 pt-3 border-t grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 ${!permission.enabled ? 'opacity-50' : ''}`}>
                                    {ALL_ROLES.map(role => (
                                        <label key={role} className="flex items-center space-x-2 text-sm">
                                            <input 
                                                type="checkbox"
                                                className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                                                checked={permission.allowedRoles.includes(role)}
                                                onChange={(e) => handleDefaultRolePermissionChange(feature, role, e.target.checked)}
                                                disabled={!permission.enabled}
                                            />
                                            <span>{role}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    );
};
