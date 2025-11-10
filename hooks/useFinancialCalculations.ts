import { useMemo } from 'react';
import { Account, JournalEntry, AccountType } from '../types';

export interface FinancialFilter {
    startDate?: string | null;
    endDate?: string | null;
    plotId?: string | null;
    seasonId?: string | null;
}

/**
 * A custom hook to perform core financial calculations based on the chart of accounts and journal entries, with date filtering.
 * @param accounts - Array of all accounts from the chart of accounts.
 * @param allJournalEntries - Array of all journal entries.
 * @param filter - An object with optional startDate, endDate, plotId, and seasonId.
 * @returns An object containing calculated financial data for the specified period.
 */
export const useFinancialCalculations = (
    accounts: Account[],
    allJournalEntries: JournalEntry[],
    { startDate, endDate, plotId, seasonId }: FinancialFilter
) => {
    const accountTypeMap = useMemo(() => new Map(accounts.map(a => [a.id, a.type])), [accounts]);
    
    /**
     * Calculates the final balance for every account up to a certain date (endDate).
     * This is used for point-in-time reports like the Balance Sheet and Trial Balance.
     */
    const accountBalances = useMemo(() => {
        const balances = new Map<string, number>();

        accounts.forEach(account => {
            balances.set(account.id, account.initialBalance);
        });
        
        const relevantEntries = allJournalEntries.filter(entry => {
            if (!endDate) return true; // Include all if no end date
            return new Date(entry.date) <= new Date(endDate);
        });

        relevantEntries.forEach(entry => {
            entry.lines.forEach(line => {
                // Apply Plot/Season filters if they exist
                if (plotId && plotId !== 'all' && line.plotId !== plotId) return;
                if (seasonId && seasonId !== 'all' && line.seasonId !== seasonId) return;
                
                const account = accountTypeMap.get(line.accountId);
                if (!account) return;

                const currentBalance = balances.get(line.accountId) ?? 0;
                let change = line.amount;
                
                if (account === AccountType.Asset || account === AccountType.Expense) {
                    if (line.type === 'credit') change = -change;
                } else { // Liability, Equity, Income
                    if (line.type === 'debit') change = -change;
                }
                balances.set(line.accountId, currentBalance + change);
            });
        });
        return balances;
    }, [accounts, allJournalEntries, endDate, plotId, seasonId, accountTypeMap]);

    /**
     * Calculates financial performance (income, expenses, net income) for a specific period.
     * This is used for reports like the Income Statement. It does NOT use initial balances.
     */
    const { totalIncome, totalExpenses, netIncome, incomeAccounts, expenseAccounts } = useMemo(() => {
        const periodEntries = allJournalEntries.filter(entry => {
            const entryDate = new Date(entry.date);
            if (startDate && entryDate < new Date(startDate)) return false;
            if (endDate && entryDate > new Date(endDate)) return false;
            return true;
        });
        
        const periodBalances = new Map<string, number>();
        accounts.forEach(acc => periodBalances.set(acc.id, 0));

        periodEntries.forEach(entry => {
             entry.lines.forEach(line => {
                // Apply Plot/Season filters if they exist
                if (plotId && plotId !== 'all' && line.plotId !== plotId) return;
                if (seasonId && seasonId !== 'all' && line.seasonId !== seasonId) return;
                
                const account = accountTypeMap.get(line.accountId);
                if (!account) return;

                const currentBalance = periodBalances.get(line.accountId) ?? 0;
                let change = line.amount;
                
                 if (account === AccountType.Income) {
                    periodBalances.set(line.accountId, currentBalance + (line.type === 'credit' ? change : -change));
                 } else if (account === AccountType.Expense) {
                    periodBalances.set(line.accountId, currentBalance + (line.type === 'debit' ? change : -change));
                 }
             });
        });

        let totalInc = 0;
        let totalExp = 0;
        const incAccounts: { name: string, balance: number }[] = [];
        const expAccounts: { name: string, balance: number }[] = [];

        accounts.forEach(account => {
            const balance = periodBalances.get(account.id) ?? 0;
            if (Math.abs(balance) < 0.01) return;

            if (account.type === AccountType.Income) {
                incAccounts.push({ name: account.name, balance });
                totalInc += balance;
            } else if (account.type === AccountType.Expense) {
                expAccounts.push({ name: account.name, balance });
                totalExp += balance;
            }
        });

        return {
            totalIncome: totalInc,
            totalExpenses: totalExp,
            netIncome: totalInc - totalExp,
            incomeAccounts: incAccounts,
            expenseAccounts: expAccounts
        };
    }, [accounts, allJournalEntries, startDate, endDate, plotId, seasonId, accountTypeMap]);

    return { accountBalances, netIncome, totalIncome, totalExpenses, incomeAccounts, expenseAccounts };
};