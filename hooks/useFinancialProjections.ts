import { useMemo } from 'react';
// FIX: Import ProjectedBalanceSheet type to fix 'Cannot find name' errors.
import type { FarmDataContextType, ScenarioAssumptions, ProjectedYearData, ProjectedBalanceSheet } from '../types.js';
import { AccountType } from '../types.js';

interface BaseYearData {
    revenue: number; cogs: number; sga: number;
    ppe: number; accumDep: number; inventory: number; receivables: number; cash: number;
    payables: number; debt: number; capital: number; incomeSurplus: number;
}

const getBaseYearData = (farmData: FarmDataContextType): BaseYearData => {
    const { accounts, journalEntries, inventory: inventoryItems } = farmData;
    const accountBalances = new Map<string, number>();
    accounts.forEach(acc => accountBalances.set(acc.id, acc.initialBalance));

    journalEntries.forEach(entry => {
        entry.lines.forEach(line => {
            const accType = accounts.find(a => a.id === line.accountId)?.type;
            const currentBalance = accountBalances.get(line.accountId) || 0;
            let change = line.amount;
            if (accType === AccountType.Asset || accType === AccountType.Expense) {
                if (line.type === 'credit') change = -change;
            } else {
                if (line.type === 'debit') change = -change;
            }
            accountBalances.set(line.accountId, currentBalance + change);
        });
    });
    
    // Get historical Revenue and COGS for last 12 months
    let revenue = 0, cogs = 0, sga = 0;
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    journalEntries.filter(je => new Date(je.date) >= oneYearAgo).forEach(entry => {
        entry.lines.forEach(line => {
            const acc = accounts.find(a => a.id === line.accountId);
            if (acc?.type === AccountType.Income) {
                revenue += line.type === 'credit' ? line.amount : -line.amount;
            } else if (acc?.type === AccountType.Expense) {
                 if (acc.name.toLowerCase().includes('cost') || acc.name.toLowerCase().includes('seed') || acc.name.toLowerCase().includes('fertilizer')) {
                     cogs += line.type === 'debit' ? line.amount : -line.amount;
                 } else {
                     sga += line.type === 'debit' ? line.amount : -line.amount;
                 }
            }
        });
    });

    const findBalance = (name: string) => accounts.find(a => a.name.toLowerCase() === name.toLowerCase()) ? accountBalances.get(accounts.find(a => a.name.toLowerCase() === name.toLowerCase())!.id) || 0 : 0;
    
    const ppe = findBalance('farm equipment') + findBalance('land');
    const inventoryValue = inventoryItems.reduce((sum, item) => sum + item.quantity * item.costPerUnit, 0);

    return {
        revenue: revenue || 100000,
        cogs: cogs || 60000,
        sga: sga || 15000,
        ppe: ppe || 125000,
        accumDep: 0, // Simplified: not tracked historically
        inventory: inventoryValue || 5000,
        receivables: findBalance('accounts receivable'),
        cash: findBalance('cash at bank'),
        payables: findBalance('accounts payable'),
        debt: 0, // Simplified
        capital: findBalance("owner's equity"),
        incomeSurplus: 0 // Simplified
    };
};

export const useFinancialProjections = (
    farmData: FarmDataContextType,
    assumptions: ScenarioAssumptions,
    projectionYears: number
): { projections: ProjectedYearData[] } => {
    
    const baseYear = useMemo(() => getBaseYearData(farmData), [farmData]);

    const projections = useMemo(() => {
        if (!projectionYears || projectionYears <= 0) return [];
        
        const results: ProjectedYearData[] = [];
        let prevYearData: BaseYearData | ProjectedBalanceSheet = { ...baseYear, incomeSurplus: baseYear.capital + baseYear.incomeSurplus };

        for (let i = 1; i <= projectionYears; i++) {
            const prevBS = 'totalAssets' in prevYearData ? prevYearData as ProjectedBalanceSheet : null;
            const prevRevenue = results.length > 0 ? results[results.length-1].incomeStatement.revenue : baseYear.revenue;
            const prevPPE = prevBS ? prevBS.nbv : baseYear.ppe;
            const prevAccumDep = prevBS ? prevBS.accumulatedDepreciation : baseYear.accumDep;
            const prevDebt = prevBS ? prevBS.debt : baseYear.debt;
            const prevShareholdersFund = prevBS ? prevBS.shareholdersFund : baseYear.capital + baseYear.incomeSurplus;
            const prevCash = prevBS ? prevBS.cash : baseYear.cash;
            const prevInventory = prevBS ? prevBS.inventory : baseYear.inventory;
            const prevReceivables = prevBS ? prevBS.receivables : baseYear.receivables;
            const prevPayables = prevBS ? prevBS.payables : baseYear.payables;

            // --- Income Statement ---
            const revenue = prevRevenue * (1 + assumptions.revenueGrowth / 100);
            const cogs = revenue * (assumptions.cogsRatio / 100);
            const grossProfit = revenue - cogs;
            const sga = revenue * (assumptions.sgaRatio / 100);
            const depreciation = prevPPE * (assumptions.depreciationRate / 100);
            const pbit = grossProfit - sga - depreciation;
            const interest = assumptions.interestExpense;
            const pbt = pbit - interest;
            const tax = pbt > 0 ? pbt * (assumptions.taxRate / 100) : 0;
            const pat = pbt - tax;
            const ebitda = pbit + depreciation;
            
            // --- Cash Flow ---
            const capex = revenue * (assumptions.capexAsPercentOfRevenue / 100);
            const dividendsPaid = pat > 0 ? pat * (assumptions.dividendPayoutRatio / 100) : 0;
            
            // WC Changes
            const currentReceivables = (assumptions.receivablesDays / 365) * revenue;
            const currentInventory = (assumptions.inventoryDays / 365) * cogs;
            const currentPayables = (assumptions.payablesDays / 365) * cogs;

            const deltaReceivables = -(currentReceivables - prevReceivables);
            const deltaInventory = -(currentInventory - prevInventory);
            const deltaPayables = currentPayables - prevPayables;
            
            const opProfitBeforeWC = pbt + depreciation;
            const cashFromOps = opProfitBeforeWC + deltaInventory + deltaReceivables + deltaPayables;
            const netCFO = cashFromOps - tax;
            const netCFI = -capex;
            const netCFF = assumptions.capitalInjection + assumptions.newDebt - assumptions.debtRepayment - dividendsPaid;
            const netChangeInCash = netCFO + netCFI + netCFF;
            const closingCash = prevCash + netChangeInCash;

            // --- Balance Sheet ---
            const ppe = prevPPE + capex;
            const accumulatedDepreciation = prevAccumDep + depreciation;
            const nbv = ppe - accumulatedDepreciation;
            const totalCurrentAssets = currentInventory + currentReceivables + closingCash;
            const totalAssets = nbv + totalCurrentAssets;
            const debt = prevDebt + assumptions.newDebt - assumptions.debtRepayment;
            const totalCurrentLiabilities = currentPayables;
            const incomeSurplus = (prevBS ? prevBS.incomeSurplus : baseYear.incomeSurplus) + pat - dividendsPaid;
            const capital = (prevBS ? prevBS.capital : baseYear.capital) + assumptions.capitalInjection;
            const shareholdersFund = capital + incomeSurplus;
            const totalEquityAndLiabilities = shareholdersFund + debt + totalCurrentLiabilities;
            
            const currentYearData: ProjectedYearData = {
                year: new Date().getFullYear() + i,
                incomeStatement: { revenue, cogs, grossProfit, sga, depreciation, pbit, interest, pbt, tax, pat, ebitda },
                cashFlow: { 
                    pbt, depreciation, opProfitBeforeWC, deltaInventory, deltaReceivables, deltaPayables, cashFromOps, taxPaid: -tax, netCFO,
                    capex: -capex, netCFI, capitalInjected: assumptions.capitalInjection, newDebt: assumptions.newDebt, debtRepaid: -assumptions.debtRepayment,
                    dividendsPaid: -dividendsPaid, netCFF, netChangeInCash, openingCash: prevCash, closingCash
                },
                balanceSheet: {
                    ppe, accumulatedDepreciation, nbv, inventory: currentInventory, receivables: currentReceivables, cash: closingCash,
                    totalCurrentAssets, totalAssets, capital, incomeSurplus, shareholdersFund, debt, payables: currentPayables,
                    totalCurrentLiabilities, totalEquityAndLiabilities
                }
            };
            results.push(currentYearData);
            prevYearData = currentYearData.balanceSheet;
        }

        return results;

    }, [farmData, assumptions, projectionYears, baseYear]);

    return { projections };
};