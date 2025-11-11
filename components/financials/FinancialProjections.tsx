import React, { useState, useMemo } from 'react';
import { Card } from '../shared/Card';
import { AssumptionsForm } from './AssumptionsForm';
import { ProjectedStatementTable } from './ProjectedStatementTable';
import { useFinancialProjections } from '../../hooks/useFinancialProjections';
import type { FarmDataContextType, ProjectionAssumptions, Scenario, ProjectedYearData } from '../../types';
import { ProjectionsChart } from './ProjectionsChart';

interface FinancialProjectionsProps {
    farmData: FarmDataContextType;
    currency: string;
}

type StatementView = 'income' | 'balance' | 'cashflow';

// Initial state for assumptions
const createDefaultAssumptions = (): ProjectionAssumptions => {
    const base = {
        revenueGrowth: 10, cogsRatio: 60, sgaRatio: 15, depreciationRate: 10,
        interestExpense: 0, taxRate: 25, receivablesDays: 30, inventoryDays: 45,
        payablesDays: 25, capexAsPercentOfRevenue: 5, newDebt: 0, debtRepayment: 0,
        capitalInjection: 0, dividendPayoutRatio: 0,
    };
    return {
        projectionYears: 5,
        base,
        optimistic: { ...base, revenueGrowth: 15, cogsRatio: 55, sgaRatio: 14 },
        pessimistic: { ...base, revenueGrowth: 5, cogsRatio: 65, sgaRatio: 16 },
    };
};

export const FinancialProjections: React.FC<FinancialProjectionsProps> = ({ farmData, currency }) => {
    const [assumptions, setAssumptions] = useState<ProjectionAssumptions>(createDefaultAssumptions());
    const [activeScenario, setActiveScenario] = useState<Scenario>('base');
    const [activeView, setActiveView] = useState<StatementView>('income');

    const { projections } = useFinancialProjections(farmData, assumptions[activeScenario], assumptions.projectionYears);

    const statementData = useMemo(() => {
        if (!projections || projections.length === 0) return { years: [], rows: [] };
        
        const years = projections.map(p => p.year);

        switch (activeView) {
            case 'income':
                return {
                    years,
                    rows: [
                        { label: 'Revenue', values: projections.map(p => p.incomeStatement.revenue) },
                        { label: 'Cost of Sales', values: projections.map(p => p.incomeStatement.cogs) },
                        { label: 'Gross Profit', values: projections.map(p => p.incomeStatement.grossProfit), isTotal: true },
                        { label: 'SG&A', values: projections.map(p => p.incomeStatement.sga), indent: 1 },
                        { label: 'Depreciation', values: projections.map(p => p.incomeStatement.depreciation), indent: 1 },
                        { label: 'PBIT', values: projections.map(p => p.incomeStatement.pbit), isSubtotal: true },
                        { label: 'Interest', values: projections.map(p => p.incomeStatement.interest) },
                        { label: 'PBT', values: projections.map(p => p.incomeStatement.pbt), isSubtotal: true },
                        { label: 'Tax', values: projections.map(p => p.incomeStatement.tax) },
                        { label: 'PAT (Net Income)', values: projections.map(p => p.incomeStatement.pat), isTotal: true },
                        { label: 'EBITDA', values: projections.map(p => p.incomeStatement.ebitda), isSubtotal: true, isNote: true },
                    ]
                };
            case 'balance':
                return {
                    years,
                    rows: [
                        { label: 'Non-Current Assets', isHeader: true },
                        { label: 'PPE', values: projections.map(p => p.balanceSheet.ppe), indent: 1 },
                        { label: 'Accum. Dep.', values: projections.map(p => p.balanceSheet.accumulatedDepreciation), indent: 1 },
                        { label: 'NBV', values: projections.map(p => p.balanceSheet.nbv), isSubtotal: true },
                        { label: 'Current Assets', isHeader: true },
                        { label: 'Inventory', values: projections.map(p => p.balanceSheet.inventory), indent: 1 },
                        { label: 'Account Receivables', values: projections.map(p => p.balanceSheet.receivables), indent: 1 },
                        { label: 'Cash and Bank Balances', values: projections.map(p => p.balanceSheet.cash), indent: 1 },
                        { label: 'Total Current Assets', values: projections.map(p => p.balanceSheet.totalCurrentAssets), isSubtotal: true },
                        { label: 'Total Assets', values: projections.map(p => p.balanceSheet.totalAssets), isTotal: true },
                        { label: 'Equity and Liabilities', isHeader: true },
                        { label: "Owner's Capital", values: projections.map(p => p.balanceSheet.capital), indent: 1 },
                        { label: 'Income Surplus', values: projections.map(p => p.balanceSheet.incomeSurplus), indent: 1 },
                        { label: "Shareholders' Fund", values: projections.map(p => p.balanceSheet.shareholdersFund), isSubtotal: true },
                        { label: 'Non-Current Liabilities', isHeader: true, indent: 0 },
                        { label: 'Debt Financing', values: projections.map(p => p.balanceSheet.debt), indent: 1 },
                        { label: 'Current Liabilities', isHeader: true, indent: 0 },
                        { label: 'Account Payables', values: projections.map(p => p.balanceSheet.payables), indent: 1 },
                        { label: 'Total Current Liabilities', values: projections.map(p => p.balanceSheet.totalCurrentLiabilities), isSubtotal: true },
                        { label: 'Total Equity and Liabilities', values: projections.map(p => p.balanceSheet.totalEquityAndLiabilities), isTotal: true },
                    ]
                };
            case 'cashflow':
                 return {
                    years,
                    rows: [
                        { label: 'Cash flow from Operating Activities', isHeader: true },
                        { label: 'Profit before Taxation', values: projections.map(p => p.cashFlow.pbt) },
                        { label: 'Adjustment for Depreciation', values: projections.map(p => p.cashFlow.depreciation) },
                        { label: 'Operating Profit Before WC Changes', values: projections.map(p => p.cashFlow.opProfitBeforeWC), isSubtotal: true },
                        { label: 'Increase / Decrease in Inventories', values: projections.map(p => p.cashFlow.deltaInventory) },
                        { label: 'Increase / Decrease in Accounts Receivables', values: projections.map(p => p.cashFlow.deltaReceivables) },
                        { label: 'Increase / Decrease in Accounts Payable', values: projections.map(p => p.cashFlow.deltaPayables) },
                        { label: 'Cash Generated from Operations', values: projections.map(p => p.cashFlow.cashFromOps), isSubtotal: true },
                        { label: 'Tax Paid', values: projections.map(p => p.cashFlow.taxPaid) },
                        { label: 'Net Cash from Operating Activities', values: projections.map(p => p.cashFlow.netCFO), isTotal: true },
                        { label: 'Cash flow from Investing Activities', isHeader: true },
                        { label: 'Property, Plant and Equipment Purchased', values: projections.map(p => p.cashFlow.capex) },
                        { label: 'Net Cash from Investing Activities', values: projections.map(p => p.cashFlow.netCFI), isTotal: true },
                        { label: 'Cash flows from Financing Activities', isHeader: true },
                        { label: "Owner's Capital", values: projections.map(p => p.cashFlow.capitalInjected) },
                        { label: "New Debt", values: projections.map(p => p.cashFlow.newDebt) },
                        { label: 'Debt Repayment', values: projections.map(p => p.cashFlow.debtRepaid) },
                        { label: 'Dividends Paid', values: projections.map(p => p.cashFlow.dividendsPaid) },
                        { label: 'Net Cash from Financing Activities', values: projections.map(p => p.cashFlow.netCFF), isTotal: true },
                        { label: 'Net Change in Cash', values: projections.map(p => p.cashFlow.netChangeInCash), isSubtotal: true },
                        { label: 'Cash at Start of Year', values: projections.map(p => p.cashFlow.openingCash) },
                        { label: 'Cash at End of Year', values: projections.map(p => p.cashFlow.closingCash), isTotal: true },
                    ]
                };
            default:
                return { years: [], rows: [] };
        }
    }, [projections, activeView]);


    return (
        <div className="space-y-6">
            <AssumptionsForm 
                assumptions={assumptions}
                onAssumptionsChange={setAssumptions}
                activeScenario={activeScenario}
                onActiveScenarioChange={setActiveScenario}
            />
            {projections.length > 0 && (
                 <ProjectionsChart projections={projections} currency={currency} />
            )}
            <Card>
                <div className="flex justify-between items-center mb-4">
                     <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                        <button onClick={() => setActiveView('income')} className={`px-3 py-1 text-sm rounded-md ${activeView === 'income' ? 'bg-green-600 text-white' : ''}`}>Income Statement</button>
                        <button onClick={() => setActiveView('balance')} className={`px-3 py-1 text-sm rounded-md ${activeView === 'balance' ? 'bg-green-600 text-white' : ''}`}>Balance Sheet</button>
                        <button onClick={() => setActiveView('cashflow')} className={`px-3 py-1 text-sm rounded-md ${activeView === 'cashflow' ? 'bg-green-600 text-white' : ''}`}>Cash Flow</button>
                    </div>
                </div>

                <ProjectedStatementTable
                    years={statementData.years}
                    rows={statementData.rows}
                    currency={currency}
                />
            </Card>
        </div>
    );
};