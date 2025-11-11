import React from 'react';
import { Input } from '../shared/Input';
import type { ProjectionAssumptions, Scenario, ScenarioAssumptions } from '../../types';

interface AssumptionsFormProps {
    assumptions: ProjectionAssumptions;
    onAssumptionsChange: (newAssumptions: ProjectionAssumptions) => void;
    activeScenario: Scenario;
    onActiveScenarioChange: (scenario: Scenario) => void;
}

const AssumptionInput: React.FC<{label: string, id: string, value: number, onChange: (val: number) => void, unit?: string}> = ({label, id, value, onChange, unit}) => (
    <div>
        <label htmlFor={id} className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
        <div className="flex items-center">
            <input
                id={id}
                type="number"
                step="0.1"
                value={value}
                onChange={e => onChange(Number(e.target.value))}
                className="block w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-white text-gray-900"
            />
            {unit && <span className="ml-2 text-sm text-gray-500">{unit}</span>}
        </div>
    </div>
);

export const AssumptionsForm: React.FC<AssumptionsFormProps> = ({ assumptions, onAssumptionsChange, activeScenario, onActiveScenarioChange }) => {
    
    const handleChange = (field: keyof ScenarioAssumptions, value: number) => {
        onAssumptionsChange({
            ...assumptions,
            [activeScenario]: {
                ...assumptions[activeScenario],
                [field]: value
            }
        });
    };
    
    const handleGlobalChange = (field: 'projectionYears', value: number) => {
         onAssumptionsChange({
            ...assumptions,
            [field]: value
        });
    };

    const currentData = assumptions[activeScenario];
    const scenarios: Scenario[] = ['base', 'optimistic', 'pessimistic'];

    return (
        <div className="bg-gray-50 p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-4">
                 <div className="flex space-x-1 bg-gray-200 p-1 rounded-lg">
                    {scenarios.map(sc => (
                        <button key={sc} onClick={() => onActiveScenarioChange(sc)} className={`px-4 py-1.5 text-sm font-semibold rounded-md capitalize transition-colors ${activeScenario === sc ? 'bg-green-600 text-white shadow' : 'text-gray-700 hover:bg-gray-300'}`}>
                            {sc} Case
                        </button>
                    ))}
                </div>
                 <div>
                    <AssumptionInput 
                        label="Projection Years"
                        id="projectionYears"
                        value={assumptions.projectionYears}
                        onChange={(val) => handleGlobalChange('projectionYears', val)}
                    />
                </div>
            </div>
           
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <fieldset className="border p-4 rounded-md space-y-3">
                    <legend className="text-sm font-semibold px-2">Income Statement</legend>
                    <AssumptionInput label="Revenue Growth" id="revenueGrowth" value={currentData.revenueGrowth} onChange={v => handleChange('revenueGrowth', v)} unit="%" />
                    <AssumptionInput label="Cost of Sales" id="cogsRatio" value={currentData.cogsRatio} onChange={v => handleChange('cogsRatio', v)} unit="% of Revenue" />
                    <AssumptionInput label="SG&A" id="sgaRatio" value={currentData.sgaRatio} onChange={v => handleChange('sgaRatio', v)} unit="% of Revenue" />
                    <AssumptionInput label="Depreciation" id="depreciationRate" value={currentData.depreciationRate} onChange={v => handleChange('depreciationRate', v)} unit="% of PPE" />
                    <AssumptionInput label="Interest Expense" id="interestExpense" value={currentData.interestExpense} onChange={v => handleChange('interestExpense', v)} unit="Fixed" />
                    <AssumptionInput label="Tax Rate" id="taxRate" value={currentData.taxRate} onChange={v => handleChange('taxRate', v)} unit="%" />
                </fieldset>
                <fieldset className="border p-4 rounded-md space-y-3">
                    <legend className="text-sm font-semibold px-2">Balance Sheet & WC</legend>
                    <AssumptionInput label="Receivables" id="receivablesDays" value={currentData.receivablesDays} onChange={v => handleChange('receivablesDays', v)} unit="Days" />
                    <AssumptionInput label="Inventory" id="inventoryDays" value={currentData.inventoryDays} onChange={v => handleChange('inventoryDays', v)} unit="Days" />
                    <AssumptionInput label="Payables" id="payablesDays" value={currentData.payablesDays} onChange={v => handleChange('payablesDays', v)} unit="Days" />
                    <AssumptionInput label="Capital Expenditures" id="capexAsPercentOfRevenue" value={currentData.capexAsPercentOfRevenue} onChange={v => handleChange('capexAsPercentOfRevenue', v)} unit="% of Revenue" />
                </fieldset>
                <fieldset className="border p-4 rounded-md space-y-3">
                    <legend className="text-sm font-semibold px-2">Financing & Dividends</legend>
                    <AssumptionInput label="New Debt" id="newDebt" value={currentData.newDebt} onChange={v => handleChange('newDebt', v)} unit="Amount" />
                    <AssumptionInput label="Debt Repayment" id="debtRepayment" value={currentData.debtRepayment} onChange={v => handleChange('debtRepayment', v)} unit="Amount" />
                    <AssumptionInput label="Capital Injection" id="capitalInjection" value={currentData.capitalInjection} onChange={v => handleChange('capitalInjection', v)} unit="Amount" />
                    <AssumptionInput label="Dividend Payout" id="dividendPayoutRatio" value={currentData.dividendPayoutRatio} onChange={v => handleChange('dividendPayoutRatio', v)} unit="% of PAT" />
                </fieldset>
            </div>
        </div>
    );
};