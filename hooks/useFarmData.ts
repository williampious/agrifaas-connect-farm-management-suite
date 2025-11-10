import { useState, useEffect, useCallback } from 'react';
// Fix: Import AccountType enum to be used as a value.
import { AccountType } from '../types';
import type { 
    Plot, Season, Task, Account, JournalEntry, Employee, 
    Timesheet, InventoryItem, Farmer, KnowledgeBaseArticle, 
    FarmDataContextType, Comment, Interaction
} from '../types';

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
    
    // FIX: Use AccountType enum instead of string literals
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
    const [farmers, setFarmers] = useState<Farmer[]>(() => getStorageData(`${baseKey}_farmers`, []));
    const [kbArticles, setKbArticles] = useState<KnowledgeBaseArticle[]>(() => getStorageData(`${baseKey}_kbArticles`, []));
    // FIX: Add missing interactions state
    const [interactions, setInteractions] = useState<Interaction[]>(() => getStorageData(`${baseKey}_interactions`, []));


    // Persist state changes to localStorage
    useEffect(() => setStorageData(`${baseKey}_plots`, plots), [plots, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_seasons`, seasons), [seasons, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_tasks`, tasks), [tasks, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_accounts`, accounts), [accounts, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_journalEntries`, journalEntries), [journalEntries, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_employees`, employees), [employees, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_timesheets`, timesheets), [timesheets, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_inventory`, inventory), [inventory, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_farmers`, farmers), [farmers, baseKey]);
    useEffect(() => setStorageData(`${baseKey}_kbArticles`, kbArticles), [kbArticles, baseKey]);
    // FIX: Persist interactions state
    useEffect(() => setStorageData(`${baseKey}_interactions`, interactions), [interactions, baseKey]);


    // Define mutator functions
    const addPlot = useCallback((plot: Omit<Plot, 'id'>) => {
        setPlots(prev => [...prev, { ...plot, id: `plot_${Date.now()}` }]);
    }, []);
    const updatePlot = useCallback((updatedPlot: Plot) => {
        setPlots(prev => prev.map(p => p.id === updatedPlot.id ? updatedPlot : p));
    }, []);
    const deletePlot = useCallback((plotId: string) => {
        setPlots(prev => prev.filter(p => p.id !== plotId));
    }, []);
    
    // Season mutators
    const addSeason = useCallback((season: Omit<Season, 'id'>) => {
        setSeasons(prev => [...prev, { ...season, id: `season_${Date.now()}` }]);
    }, []);
    const updateSeason = useCallback((updatedSeason: Season) => {
        setSeasons(prev => prev.map(s => s.id === updatedSeason.id ? updatedSeason : s));
    }, []);
    const deleteSeason = useCallback((seasonId: string) => {
        setSeasons(prev => prev.filter(s => s.id !== seasonId));
    }, []);
    
    // Task mutators
    const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'comments'>) => {
        const newTask: Task = {
            ...task,
            id: `task_${Date.now()}`,
            createdAt: new Date().toISOString(),
            comments: [],
        };
        setTasks(prev => [...prev, newTask]);
    }, []);
    const updateTask = useCallback((updatedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    }, []);
    const addTaskComment = useCallback((taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => {
        const newComment: Comment = {
            ...comment,
            id: `comment_${Date.now()}`,
            createdAt: new Date().toISOString(),
        };
        setTasks(prev => prev.map(t => 
            t.id === taskId 
                ? { ...t, comments: [...t.comments, newComment] } 
                : t
        ));
    }, []);
    
    // Account mutators
    const addAccount = useCallback((account: Omit<Account, 'id'>) => {
        setAccounts(prev => [...prev, { ...account, id: `acc_${Date.now()}` }]);
    }, []);
    const updateAccount = useCallback((updatedAccount: Account) => {
        setAccounts(prev => prev.map(a => a.id === updatedAccount.id ? updatedAccount : a));
    }, []);
    const deleteAccount = useCallback((accountId: string) => {
        setAccounts(prev => prev.filter(a => a.id !== accountId));
    }, []);

    // Journal Entry mutators
    const addJournalEntry = useCallback((entry: Omit<JournalEntry, 'id'>) => {
        setJournalEntries(prev => [{ ...entry, id: `je_${Date.now()}` }, ...prev]);
    }, []);
    const updateJournalEntry = useCallback((updatedEntry: JournalEntry) => {
        setJournalEntries(prev => prev.map(je => je.id === updatedEntry.id ? updatedEntry : je));
    }, []);
    const deleteJournalEntry = useCallback((entryId: string) => {
        setJournalEntries(prev => prev.filter(je => je.id !== entryId));
    }, []);
    const addMultipleJournalEntries = useCallback((entries: Omit<JournalEntry, 'id'>[]) => {
        const newEntries = entries.map((entry, index) => ({...entry, id: `je_${Date.now()}_${index}`}));
        setJournalEntries(prev => [...newEntries, ...prev]);
    }, []);
    
    // HR mutators
    const addEmployee = useCallback((employee: Omit<Employee, 'id'>) => {
        setEmployees(prev => [...prev, { ...employee, id: `emp_${Date.now()}` }]);
    }, []);

    const addTimesheet = useCallback((timesheet: Omit<Timesheet, 'id'>) => {
        setTimesheets(prev => [...prev, { ...timesheet, id: `ts_${Date.now()}` }]);
    }, []);
    const updateTimesheet = useCallback((updatedTimesheet: Timesheet) => {
        setTimesheets(prev => prev.map(ts => ts.id === updatedTimesheet.id ? updatedTimesheet : ts));
    }, []);
    const deleteTimesheet = useCallback((timesheetId: string) => {
        setTimesheets(prev => prev.filter(ts => ts.id !== timesheetId));
    }, []);

    // Inventory mutators
    const addInventoryItem = useCallback((item: Omit<InventoryItem, 'id'>) => {
        setInventory(prev => [...prev, { ...item, id: `inv_${Date.now()}` }]);
    }, []);
    
    // AEO Farmer mutators
    const addFarmer = useCallback((farmer: Omit<Farmer, 'id'>) => {
        setFarmers(prev => [...prev, { ...farmer, id: `farmer_${Date.now()}` }]);
    }, []);
    const updateFarmer = useCallback((updatedFarmer: Farmer) => {
        setFarmers(prev => prev.map(f => f.id === updatedFarmer.id ? updatedFarmer : f));
    }, []);
    const deleteFarmer = useCallback((farmerId: string) => {
        setFarmers(prev => prev.filter(f => f.id !== farmerId));
    }, []);

    // AEO Interaction mutators
    // FIX: Implement missing addInteraction mutator
    const addInteraction = useCallback((interaction: Omit<Interaction, 'id'>) => {
        setInteractions(prev => [...prev, { ...interaction, id: `interaction_${Date.now()}` }]);
    }, []);


    // AEO KB Article mutators
    const addKBArticle = useCallback((article: Omit<KnowledgeBaseArticle, 'id' | 'createdAt' | 'updatedAt'>) => {
        const now = new Date().toISOString();
        const newArticle: KnowledgeBaseArticle = {
            ...article,
            id: `kb_${Date.now()}`,
            createdAt: now,
            updatedAt: now,
        };
        setKbArticles(prev => [...prev, newArticle]);
    }, []);
    const updateKBArticle = useCallback((updatedArticle: KnowledgeBaseArticle) => {
        const now = new Date().toISOString();
        setKbArticles(prev => prev.map(a => a.id === updatedArticle.id ? { ...updatedArticle, updatedAt: now } : a));
    }, []);
    const deleteKBArticle = useCallback((articleId: string) => {
        setKbArticles(prev => prev.filter(a => a.id !== articleId));
    }, []);


    // FIX: Add missing interactions and addInteraction to the return object
    return {
        plots, seasons, tasks, accounts, journalEntries, employees, timesheets, inventory, farmers, kbArticles, interactions,
        addPlot, updatePlot, deletePlot,
        addSeason, updateSeason, deleteSeason,
        addTask, updateTask, addTaskComment,
        addAccount, updateAccount, deleteAccount,
        addJournalEntry, updateJournalEntry, deleteJournalEntry, addMultipleJournalEntries,
        addEmployee,
        addTimesheet, updateTimesheet, deleteTimesheet,
        addInventoryItem,
        addFarmer, updateFarmer, deleteFarmer,
        addInteraction,
        addKBArticle, updateKBArticle, deleteKBArticle,
    };
};