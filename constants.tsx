import React from 'react';

export const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={1.5} 
        stroke="currentColor" 
        {...props}
    >
        <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" 
        />
    </svg>
);

export const CURRENCIES = ['GHS', 'USD', 'EUR', 'NGN', 'GBP'];
export const DEFAULT_CURRENCY = 'GHS';

export const TASK_CATEGORIES = [
    // Project & Resource Management
    'Planning & Scheduling',
    'Resource Allocation',
    'Budgeting & Finance',
    'Compliance & Risk',
    'Personnel Management',
    // Land Preparation & Planting
    'Land Preparation',
    'Procurement of Inputs',
    'Sowing/Planting',
    'Irrigation Setup',
    // Crop/Livestock Management (Execution)
    'Water Management',
    'Nutrient Management',
    'Pest & Disease Control',
    'Livestock Care',
    'Equipment Maintenance',
    'Quality Assurance',
    // Monitoring, Recording & Control
    'Progress Tracking',
    'Data Collection & Analysis',
    'Record Keeping',
    'Change Management',
    // Harvesting & Post-Harvest Sales
    'Harvesting Operations',
    'Post-Harvest Handling',
    'Storage Management',
    'Marketing & Sales',
    'Post-Project Review'
].sort();

export const JOURNAL_CATEGORIES = [
  'Admin Expenses',
  'Bank Charges',
  'Bonuses & Benefits',
  'Building Maintenance',
  'Communication Tools',
  'Computers & Printers',
  'Electricity',
  'Farm Equipment',
  'Farm Sales',
  'Farm Tools',
  'Farm-In-Put',
  'Fees and Charges',
  'Fertilizer',
  'Food ProSG-Machine',
  'Furniture',
  'Harvest Expenses',
  'Insurance',
  'Internet',
  'IT Systems & Software',
  'Legal Fees',
  'Maintenance & Cleaning',
  'Office Space',
  'Recruitment',
  'Rent',
  'Salaries',
  'Seed-Cassava Stick',
  'Seed-Maize',
  'Security Systems',
  'Stationery',
  'Taxes',
  'TNT-Farm-WorkDay',
  'Training',
  'Transportation',
  'Travel/Farm Visit',
  'Utilities',
  'Water',
  'Weedicide',
  'Other',
].sort();

// Helper for formatting currency
export const formatCurrency = (value: number, currency: string) => {
    // Use a try-catch for unsupported currencies, fallback to code.
    try {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    } catch (e) {
        return `${currency} ${value.toFixed(2)}`;
    }
};