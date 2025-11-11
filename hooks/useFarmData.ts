

import { useState, useEffect, useCallback } from 'react';
// FIX: Correct import path for types
import { AccountType, TaskStatus } from '../types.js';
import type { 
    Plot, Season, Task, Account, JournalEntry, Employee, 
    Timesheet, InventoryItem, Farmer, KnowledgeBaseArticle, 
    FarmDataContextType, Comment, Interaction, WorkspaceActivityLogEntry,
    JournalEntryLine, Supplier, Harvest, Sale, Customer
} from '../types.js';

// Helper to get data from localStorage
const getStorageData = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage for key "${key}":`, error);
        return defaultValue;
    }
};

// Helper to set data to localStorage
const setStorageData = <T,>(key: string, value: T) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage for key "${key}":`, error);
    }
};

// Seed initial data for a new workspace
export const seedInitialData = (workspaceId: string) => {
    const baseKey = `farm_data_${workspaceId}`;
    if (localStorage.getItem(`${baseKey}_plots`)) {
        // Data already exists
        return;
    }
    
    const initialAccounts: Omit<Account, 'id'>[] = [
        { name: 'Cash at Bank', type: AccountType.Asset, initialBalance: 50000, currency: 'GHS' },
        { name: 'Accounts Receivable', type: AccountType.Asset, initialBalance: 0, currency: 'GHS' },
        { name: 'Farm Equipment', type: AccountType.Asset, initialBalance: 25000, currency: 'GHS' },
        { name: 'Land', type: AccountType.Asset, initialBalance: 100000, currency: 'GHS' },
        { name: 'Accounts Payable', type: AccountType.Liability, initialBalance: 5000, currency: 'GHS' },
        { name: 'Owner\'s Equity', type: AccountType.Equity, initialBalance: 170000, currency: 'GHS' },
        { name: 'Crop Sales', type: AccountType.Income, initialBalance: 0, currency: 'GHS' },
        { name: 'Seed Costs', type: AccountType.Expense, initialBalance: 0, currency: 'GHS' },
        { name: 'Fertilizer Costs', type: AccountType.Expense, initialBalance: 0, currency: 'GHS' },
        { name: 'Labor Wages', type: AccountType.Expense, initialBalance: 0, currency: 'GHS' },
    ];
    const accounts = initialAccounts.map((acc, i) => ({ ...acc, id: `acc_${Date.now()}_${i}` }));
    setStorageData(`${baseKey}_accounts`, accounts);
    
    // Seed Plots
    const initialPlots: Omit<Plot, 'id'>[] = [
        { name: 'North Field', crop: 'Maize', area: 50, soilType: 'Loam' },
        { name: 'West Valley', crop: 'Soybean', area: 75, soilType: 'Clay Loam' },
    ];
    const plots = initialPlots.map((p, i) => ({ ...p, id: `plot_${Date.now()}_${i}` }));
    setStorageData(`${baseKey}_plots`, plots);

    // Seed Seasons
    const currentYear = new Date().getFullYear();
    const initialSeasons: Omit<Season, 'id'>[] = [
        { name: 'Main Season', year: currentYear },
        { name: 'Minor Season', year: currentYear },
    ];
    const seasons = initialSeasons.map((s, i) => ({ ...s, id: `season_${Date.now()}_${i}` }));
    setStorageData(`${baseKey}_seasons`, seasons);

    // Seed Employees
    const initialEmployees: Omit<Employee, 'id'>[] = [
        { name: 'Kofi Mensah', role: 'Farm Manager', payRate: 25, contact: 'kofi@farm.com' },
        { name: 'Ama Serwaa', role: 'Field Hand', payRate: 15, contact: 'ama@farm.com' },
    ];
    const employees = initialEmployees.map((e, i) => ({...e, id: `emp_${Date.now()}_${i}`}));
    setStorageData(`${baseKey}_employees`, employees);

    // Seed Timesheets
    if (employees.length > 0) {
        const today = new Date();
        const initialTimesheets: Omit<Timesheet, 'id'>[] = [
            { employeeId: employees[0].id, date: new Date(today.setDate(today.getDate() - 3)).toISOString().split('T')[0], hoursWorked: 8 },
            { employeeId: employees[1].id, date: new Date(today.setDate(today.getDate() - 2)).toISOString().split('T')[0], hoursWorked: 7.5 },
        ];
        const timesheets = initialTimesheets.map((ts, i) => ({...ts, id: `ts_${Date.now()}_${i}`}));
        setStorageData(`${baseKey}_timesheets`, timesheets);
    }
};


export const useFarmData = (workspaceId: string): FarmDataContextType => {
    const baseKey = `farm_data_${workspaceId}`;
    
    // Define state for each data type
    const [plots, setPlots] = useState<Plot[]>(() => getStorageData(`${baseKey}_plots`, []));
    const [seasons, setSeasons] = useState<Season[]>(() => getStorageData(`${baseKey}_seasons`, []));
    const [tasks, setTasks] = useState<Task[]>(() => getStorageData(`${baseKey}_tasks`, []));
    const [accounts, setAccounts] = useState<Account[]>(() => getStorageData(`${baseKey}_accounts`, []));
    const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => getStorageData(`${baseKey}_journalEntries`, []));
    const [employees, setEmployees] = useState<Employee[]>(() => getStorageData(`${baseKey}_employees`, []));
    const [timesheets, setTimesheets] = useState<Timesheet[]>(() => getStorageData(`${baseKey}_timesheets`, []));
    const [inventory, setInventory] = useState<InventoryItem[]>(() => getStorageData(`${baseKey}_inventory`, []));
    const [suppliers, setSuppliers] = useState<Supplier[]>(() => getStorageData(`${baseKey}_suppliers`, []));
    const [harvests, setHarvests] = useState<Harvest[]>(() => getStorageData(`${baseKey}_harvests`, []));
    const [sales, setSales] = useState<Sale[]>(() => getStorageData(`${baseKey}_sales`, []));
    const [customers, setCustomers] = useState<Customer[]>(() => getStorageData(`${baseKey}_customers`, []));
    const [farmers, setFarmers] = useState<Farmer[]>(() => getStorageData(`${baseKey}_farmers`, []));
    const [kbArticles, setKbArticles] = useState<KnowledgeBaseArticle[]>(() => getStorageData(`${baseKey}_kbArticles`, []));
    const [interactions, setInteractions] = useState<Interaction[]>(() => getStorageData(`${baseKey}_interactions`, []));
    const [activityLog, setActivityLog] = useState<WorkspaceActivityLogEntry[]>(() => getStorageData(`${baseKey}_activityLog`, []));


    // Persist state changes to localStorage
    useEffect(() => setStorageData(`${baseKey}_plots`, plots), [plots, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_seasons`, seasons), [seasons, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_tasks`, tasks), [tasks, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_accounts`, accounts), [accounts, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_journalEntries`, journalEntries), [journalEntries, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_employees`, employees), [employees, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_timesheets`, timesheets), [timesheets, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_inventory`, inventory), [inventory, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_suppliers`, suppliers), [suppliers, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_harvests`, harvests), [harvests, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_sales`, sales), [sales, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_customers`, customers), [customers, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_farmers`, farmers), [farmers, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_kbArticles`, kbArticles), [kbArticles, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_interactions`, interactions), [interactions, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_activityLog`, activityLog), [activityLog, baseKey]);

    const logActivity = useCallback((userName: string, action: string, details: string) => {
        const newLogEntry: WorkspaceActivityLogEntry = {
            id: `log_${Date.now()}`,
            timestamp: new Date().toISOString(),
            userName,
            action,
            details,
        };
        setActivityLog(prev => [newLogEntry, ...prev].slice(0, 200)); // Keep last 200 logs
    }, []);

    // Define mutator functions
    const addPlot = useCallback((plot: Omit<Plot, 'id'>, actorName: string) => {
        setPlots(prev => [...prev, { ...plot, id: `plot_${Date.now()}` }]);
        logActivity(actorName, 'Create Plot', `Created plot: "${plot.name}"`);
    }, [logActivity]);
    const updatePlot = useCallback((updatedPlot: Plot, actorName: string) => {
        setPlots(prev => prev.map(p => p.id === updatedPlot.id ? updatedPlot : p));
        logActivity(actorName, 'Update Plot', `Updated plot: "${updatedPlot.name}"`);
    }, [logActivity]);
    const deletePlot = useCallback((plotId: string, actorName: string, plotName: string) => {
        setPlots(prev => prev.filter(p => p.id !== plotId));
        logActivity(actorName, 'Delete Plot', `Deleted plot: "${plotName}"`);
    }, [logActivity]);
    
    // Season mutators
    const addSeason = useCallback((season: Omit<Season, 'id'>, actorName: string) => {
        setSeasons(prev => [...prev, { ...season, id: `season_${Date.now()}` }]);
        logActivity(actorName, 'Create Season', `Created season: "${season.name} ${season.year}"`);
    }, [logActivity]);
    const updateSeason = useCallback((updatedSeason: Season, actorName: string) => {
        setSeasons(prev => prev.map(s => s.id === updatedSeason.id ? updatedSeason : s));
        logActivity(actorName, 'Update Season', `Updated season: "${updatedSeason.name} ${updatedSeason.year}"`);
    }, [logActivity]);
    const deleteSeason = useCallback((seasonId: string, actorName: string, seasonName: string) => {
        setSeasons(prev => prev.filter(s => s.id !== seasonId));
        logActivity(actorName, 'Delete Season', `Deleted season: "${seasonName}"`);
    }, [logActivity]);
    
    // Account mutators
    const addAccount = useCallback((account: Omit<Account, 'id'>, actorName: string) => {
        setAccounts(prev => [...prev, { ...account, id: `acc_${Date.now()}` }]);
        logActivity(actorName, 'Create Account', `Created account: "${account.name}"`);
    }, [logActivity]);
    const updateAccount = useCallback((updatedAccount: Account, actorName: string) => {
        setAccounts(prev => prev.map(a => a.id === updatedAccount.id ? updatedAccount : a));
        logActivity(actorName, 'Update Account', `Updated account: "${updatedAccount.name}"`);
    }, [logActivity]);
    const deleteAccount = useCallback((accountId: string, actorName: string, accountName: string) => {
        setAccounts(prev => prev.filter(a => a.id !== accountId));
        logActivity(actorName, 'Delete Account', `Deleted account: "${accountName}"`);
    }, [logActivity]);

    // Journal Entry mutators
    const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id'>, actorName: string) => {
        setJournalEntries(prev => [{ ...entry, id: `je_${Date.now()}` }, ...prev]);
        logActivity(actorName, 'Create Journal Entry', `Posted journal entry: "${entry.description}"`);
    }, [logActivity]);
    const updateJournalEntry = useCallback((updatedEntry: JournalEntry, actorName: string) => {
        setJournalEntries(prev => prev.map(je => je.id === updatedEntry.id ? updatedEntry : je));
        logActivity(actorName, 'Update Journal Entry', `Updated journal entry: "${updatedEntry.description}"`);
    }, [logActivity]);
    const deleteJournalEntry = useCallback((entryId: string, actorName: string) => {
        setJournalEntries(prev => prev.filter(je => je.id !== entryId));
        logActivity(actorName, 'Delete Journal Entry', `Deleted journal entry ID: ${entryId}`);
    }, [logActivity]);
    const addMultipleJournalEntries = useCallback((entries: Omit<JournalEntry, 'id'>[], actorName: string) => {
        const newEntries = entries.map((entry, index) => ({...entry, id: `je_${Date.now()}_${index}`}));
        setJournalEntries(prev => [...newEntries, ...prev]);
        logActivity(actorName, 'Import Journal Entries', `Imported ${entries.length} journal entries.`);
    }, [logActivity]);

    // Task mutators
    const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'comments'>, actorName: string) => {
        const newTask: Task = {
            ...task,
            id: `task_${Date.now()}`,
            createdAt: new Date().toISOString(),
            comments: [],
        };
        setTasks(prev => [...prev, newTask]);
        logActivity(actorName, 'Create Task', `Created task: "${task.title}"`);
    }, [logActivity]);
    
    const updateTask = useCallback((updatedTask: Task, actorName: string) => {
        const originalTask = tasks.find(t => t.id === updatedTask.id);
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        logActivity(actorName, 'Update Task', `Updated task "${updatedTask.title}" to status ${updatedTask.status}`);
    
        if (
            originalTask?.status !== TaskStatus.Done &&
            updatedTask.status === TaskStatus.Done &&
            updatedTask.inventoryConsumed?.length
        ) {
            const inventoryUpdates = new Map<string, number>();
            const costEntriesByCurrency = new Map<string, { expense: Map<string, number>, inventory: Map<string, number> }>();
            let newAccountsToAdd: Account[] = [];
    
            for (const consumption of updatedTask.inventoryConsumed) {
                const item = inventory.find(i => i.id === consumption.inventoryId);
                if (!item) continue;
                
                const quantityToUse = Math.min(item.quantity, consumption.quantityUsed);
                if (quantityToUse <= 0) continue;
    
                inventoryUpdates.set(item.id, (inventoryUpdates.get(item.id) || 0) + quantityToUse);
    
                const cost = quantityToUse * item.costPerUnit;
                const currency = item.currency;
    
                if (!costEntriesByCurrency.has(currency)) {
                    costEntriesByCurrency.set(currency, { expense: new Map(), inventory: new Map() });
                }
                const currencyGroup = costEntriesByCurrency.get(currency)!;
    
                const expenseAccountName = `${item.category} Costs`;
                let expenseAccount = [...accounts, ...newAccountsToAdd].find(a => a.name === expenseAccountName && a.currency === currency);
                if (!expenseAccount) {
                    const newAcc = { id: `acc_${Date.now()}_${Math.random()}`, name: expenseAccountName, type: AccountType.Expense, initialBalance: 0, currency };
                    newAccountsToAdd.push(newAcc);
                    expenseAccount = newAcc;
                }
    
                const invAccountName = `Inventory - ${item.category}`;
                const invAccount = accounts.find(a => a.name === invAccountName && a.currency === currency);
                if (!invAccount) {
                    console.error(`Inventory asset account "${invAccountName}" not found for currency ${currency}.`);
                    continue;
                }
    
                currencyGroup.expense.set(expenseAccount.id, (currencyGroup.expense.get(expenseAccount.id) || 0) + cost);
                currencyGroup.inventory.set(invAccount.id, (currencyGroup.inventory.get(invAccount.id) || 0) + cost);
            }
            
            // Add any newly created expense accounts
            if (newAccountsToAdd.length > 0) {
                setAccounts(prev => [...prev, ...newAccountsToAdd]);
            }

            // Create journal entries for each currency
            const newJournalEntries: Omit<JournalEntry, 'id'>[] = [];
            for (const [currency, { expense, inventory: inventoryMap }] of costEntriesByCurrency.entries()) {
                const jeLines: JournalEntryLine[] = [];
                let totalCost = 0;

                for (const [accountId, amount] of expense.entries()) {
                    jeLines.push({ accountId, type: 'debit', amount, plotId: updatedTask.plotId });
                    totalCost += amount;
                }
                for (const [accountId, amount] of inventoryMap.entries()) {
                    jeLines.push({ accountId, type: 'credit', amount, plotId: updatedTask.plotId });
                }

                if (totalCost > 0) {
                     newJournalEntries.push({
                        date: new Date().toISOString().split('T')[0],
                        description: `Material consumption for task: "${updatedTask.title}"`,
                        category: updatedTask.category,
                        currency: currency,
                        lines: jeLines,
                    });
                }
            }

            // Update inventory quantities
            setInventory(prev => {
                return prev.map(item => {
                    if (inventoryUpdates.has(item.id)) {
                        const quantityUsed = inventoryUpdates.get(item.id)!;
                        return { ...item, quantity: item.quantity - quantityUsed };
                    }
                    return item;
                });
            });

            // Add new journal entries
            if (newJournalEntries.length > 0) {
                addMultipleJournalEntries(newJournalEntries, actorName);
            }
        }
    }, [tasks, inventory, accounts, logActivity, addMultipleJournalEntries]);
    
    const addTaskComment = useCallback((taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>, actorName: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id === taskId) {
                const newComment: Comment = {
                    ...comment,
                    id: `comment_${Date.now()}`,
                    createdAt: new Date().toISOString()
                };
                return { ...t, comments: [...t.comments, newComment] };
            }
            return t;
        }));
        logActivity(actorName, 'Add Comment', `Added comment to task ${taskId}`);
    }, [logActivity]);

    const addEmployee = useCallback((employee: Omit<Employee, 'id'>, actorName: string) => {
        setEmployees(prev => [...prev, { ...employee, id: `emp_${Date.now()}` }]);
        logActivity(actorName, 'Add Employee', `Added employee: "${employee.name}"`);
    }, [logActivity]);

    const addTimesheet = useCallback((timesheet: Omit<Timesheet, 'id'>, actorName: string) => {
        setTimesheets(prev => [...prev, { ...timesheet, id: `ts_${Date.now()}` }]);
        logActivity(actorName, 'Add Timesheet', `Added timesheet for ${timesheet.employeeId} on ${timesheet.date}`);
    }, [logActivity]);

    const updateTimesheet = useCallback((timesheet: Timesheet, actorName: string) => {
        setTimesheets(prev => prev.map(ts => ts.id === timesheet.id ? timesheet : ts));
        logActivity(actorName, 'Update Timesheet', `Updated timesheet for ${timesheet.employeeId}`);
    }, [logActivity]);

    const deleteTimesheet = useCallback((timesheetId: string, actorName: string) => {
        setTimesheets(prev => prev.filter(ts => ts.id !== timesheetId));
        logActivity(actorName, 'Delete Timesheet', `Deleted timesheet ${timesheetId}`);
    }, [logActivity]);

    const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id' | 'journalEntryId'>, actorName: string) => {
        setInventory(prev => [...prev, { ...item, id: `inv_${Date.now()}` }]);
        logActivity(actorName, 'Add Inventory Item', `Added item: "${item.name}"`);
    }, [logActivity]);
    
    const updateInventoryItem = useCallback((item: InventoryItem, actorName: string) => {
        setInventory(prev => prev.map(i => i.id === item.id ? item : i));
        logActivity(actorName, 'Update Inventory Item', `Updated item: "${item.name}"`);
    }, [logActivity]);

    const deleteInventoryItem = useCallback((itemId: string, actorName: string, itemName: string) => {
        setInventory(prev => prev.filter(i => i.id !== itemId));
        logActivity(actorName, 'Delete Inventory Item', `Deleted item: "${itemName}"`);
    }, [logActivity]);

    const addSupplier = useCallback((supplier: Omit<Supplier, 'id'>, actorName: string) => {
        setSuppliers(prev => [...prev, { ...supplier, id: `sup_${Date.now()}` }]);
        logActivity(actorName, 'Add Supplier', `Added supplier: "${supplier.name}"`);
    }, [logActivity]);

    const updateSupplier = useCallback((supplier: Supplier, actorName: string) => {
        setSuppliers(prev => prev.map(s => s.id === supplier.id ? supplier : s));
        logActivity(actorName, 'Update Supplier', `Updated supplier: "${supplier.name}"`);
    }, [logActivity]);

    const deleteSupplier = useCallback((supplierId: string, actorName: string, supplierName: string) => {
        setSuppliers(prev => prev.filter(s => s.id !== supplierId));
        logActivity(actorName, 'Delete Supplier', `Deleted supplier: "${supplierName}"`);
    }, [logActivity]);

    const addHarvest = useCallback((harvest: Omit<Harvest, 'id' | 'quantityRemaining'>, actorName: string) => {
        const newHarvest: Harvest = {
            ...harvest,
            id: `harv_${Date.now()}`,
            quantityRemaining: harvest.quantity,
        };
        setHarvests(prev => [...prev, newHarvest]);
        logActivity(actorName, 'Log Harvest', `Logged harvest of ${harvest.quantity} ${harvest.unit} of ${harvest.crop}`);
    }, [logActivity]);

    const addSale = useCallback((sale: Omit<Sale, 'id' | 'journalEntryId' | 'invoiceNumber'>, actorName: string) => {
        const customer = customers.find(c => c.id === sale.customerId);
        if (!customer) {
            alert('Customer not found.');
            return;
        }

        const receivableAccount = accounts.find(a => a.name === 'Accounts Receivable' && a.currency === sale.currency);
        const salesAccount = accounts.find(a => a.name === 'Crop Sales' && a.currency === sale.currency);

        if (!receivableAccount || !salesAccount) {
            alert(`Financial accounts missing for currency ${sale.currency}. Please ensure 'Accounts Receivable' and 'Crop Sales' exist.`);
            return;
        }
        
        const totalSaleAmount = sale.items.reduce((sum, item) => sum + (item.quantitySold * item.unitPrice), 0);
        const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
        const saleId = `sale_${Date.now()}`;
        const journalEntryId = `je_${Date.now() + 1}`;
        
        const newSale: Sale = {
            ...sale,
            id: saleId,
            invoiceNumber,
            journalEntryId,
        };

        const newJournalEntry: JournalEntry = {
            id: journalEntryId,
            date: sale.saleDate,
            description: `Sale to ${customer.name} - Invoice ${invoiceNumber}`,
            category: 'Farm Sales',
            currency: sale.currency,
            lines: [
                { accountId: receivableAccount.id, type: 'debit', amount: totalSaleAmount, saleId: saleId },
                { accountId: salesAccount.id, type: 'credit', amount: totalSaleAmount, saleId: saleId },
            ]
        };

        // Update harvest quantities
        const updatedHarvests = [...harvests];
        sale.items.forEach(item => {
            const harvestIndex = updatedHarvests.findIndex(h => h.id === item.harvestId);
            if (harvestIndex !== -1) {
                updatedHarvests[harvestIndex].quantityRemaining -= item.quantitySold;
            }
        });

        setSales(prev => [newSale, ...prev]);
        setJournalEntries(prev => [newJournalEntry, ...prev]);
        setHarvests(updatedHarvests);
        logActivity(actorName, 'Create Sale', `Created sale ${invoiceNumber} to ${customer.name} for ${totalSaleAmount} ${sale.currency}`);
    }, [accounts, customers, harvests, logActivity]);

    const addCustomer = useCallback((customer: Omit<Customer, 'id'>, actorName: string) => {
        const newCustomer: Customer = { ...customer, id: `cust_${Date.now()}` };
        setCustomers(prev => [...prev, newCustomer]);
        logActivity(actorName, 'Add Customer', `Added customer: ${customer.name}`);
    }, [logActivity]);

    const updateCustomer = useCallback((customer: Customer, actorName: string) => {
        setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
        logActivity(actorName, 'Update Customer', `Updated customer: ${customer.name}`);
    }, [logActivity]);

    const deleteCustomer = useCallback((customerId: string, actorName: string, customerName: string) => {
        setCustomers(prev => prev.filter(c => c.id !== customerId));
        logActivity(actorName, 'Delete Customer', `Deleted customer: ${customerName}`);
    }, [logActivity]);
    
    const addFarmer = useCallback((farmer: Omit<Farmer, 'id'>, actorName: string) => {
        setFarmers(prev => [...prev, { ...farmer, id: `farmer_${Date.now()}` }]);
        logActivity(actorName, 'Add Farmer', `Added farmer: "${farmer.name}"`);
    }, [logActivity]);

    const updateFarmer = useCallback((farmer: Farmer, actorName: string) => {
        setFarmers(prev => prev.map(f => f.id === farmer.id ? farmer : f));
        logActivity(actorName, 'Update Farmer', `Updated farmer: "${farmer.name}"`);
    }, [logActivity]);

    const deleteFarmer = useCallback((farmerId: string, actorName: string, farmerName: string) => {
        setFarmers(prev => prev.filter(f => f.id !== farmerId));
        logActivity(actorName, 'Delete Farmer', `Deleted farmer: "${farmerName}"`);
    }, [logActivity]);

    const addInteraction = useCallback((interaction: Omit<Interaction, 'id'>, actorName: string) => {
        setInteractions(prev => [...prev, { ...interaction, id: `int_${Date.now()}` }]);
        logActivity(actorName, 'Add Interaction', `Added interaction for farmer ${interaction.farmerId}`);
    }, [logActivity]);

    const addKBArticle = useCallback((article: Omit<KnowledgeBaseArticle, 'id' | 'createdAt' | 'updatedAt'>, actorName: string) => {
        const now = new Date().toISOString();
        setKbArticles(prev => [...prev, { ...article, id: `kb_${Date.now()}`, createdAt: now, updatedAt: now }]);
        logActivity(actorName, 'Add KB Article', `Added article: "${article.title}"`);
    }, [logActivity]);

    const updateKBArticle = useCallback((article: KnowledgeBaseArticle, actorName: string) => {
        setKbArticles(prev => prev.map(a => a.id === article.id ? { ...article, updatedAt: new Date().toISOString() } : a));
        logActivity(actorName, 'Update KB Article', `Updated article: "${article.title}"`);
    }, [logActivity]);

    const deleteKBArticle = useCallback((articleId: string, actorName: string, articleTitle: string) => {
        setKbArticles(prev => prev.filter(a => a.id !== articleId));
        logActivity(actorName, 'Delete KB Article', `Deleted article: "${articleTitle}"`);
    }, [logActivity]);

    return {
        plots, seasons, tasks, accounts, journalEntries, employees, timesheets, inventory, suppliers, harvests, sales, customers, farmers, kbArticles, interactions, activityLog,
        addPlot, updatePlot, deletePlot,
        addSeason, updateSeason, deleteSeason,
        addTask, updateTask, addTaskComment,
        addAccount, updateAccount, deleteAccount,
        addJournalEntry, updateJournalEntry, deleteJournalEntry, addMultipleJournalEntries,
        addEmployee, addTimesheet, updateTimesheet, deleteTimesheet,
        addInventoryItem, updateInventoryItem, deleteInventoryItem,
        addSupplier, updateSupplier, deleteSupplier,
        addHarvest, addSale, addCustomer, updateCustomer, deleteCustomer,
        addFarmer, updateFarmer, deleteFarmer,
        addInteraction,
        addKBArticle, updateKBArticle, deleteKBArticle,
    };
};