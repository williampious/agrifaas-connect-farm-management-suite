// ROLES & PERMISSIONS
export const ALL_ROLES = ['owner', 'admin', 'manager', 'accountant', 'member'] as const;
export type Role = typeof ALL_ROLES[number];

export const ALL_FEATURES = [
    'Dashboard', 'Operations', 'Financials', 'HR', 'Inventory', 
    'Plots & Seasons', 'AEO', 'AI Insights', 'Admin', 'Suppliers',
    'Harvest & Sales', 'How To', 'FAQ'
] as const;
export type Feature = typeof ALL_FEATURES[number];

// ENUMS
export enum AccountType {
    Asset = 'Asset',
    Liability = 'Liability',
    Equity = 'Equity',
    Income = 'Income',
    Expense = 'Expense',
}

export enum TaskStatus {
    ToDo = 'To-Do',
    InProgress = 'In Progress',
    Done = 'Done',
    Blocked = 'Blocked',
}

// User & Workspace
export interface User {
    id: string;
    name: string;
    email: string;
    status: 'active' | 'suspended';
    contact?: string;
    currentWorkspaceId?: string;
}

export interface WorkspaceMember {
    role: Role;
}

export interface Workspace {
    id: string;
    name: string;
    status: 'active' | 'suspended';
    members: { [userId: string]: WorkspaceMember };
    permissions: {
        [key in Feature]?: {
            enabled: boolean;
            allowedRoles: Role[];
        }
    };
    pendingInvitations: { email: string; role: Role; invitedAt: string }[];
}

// Super Admin
export type SuperAdminView = 'Dashboard' | 'Workspaces' | 'Users' | 'Configuration' | 'Audit Log';

export interface PlatformConfig {
    featureFlags: {
        [key in Feature]?: { enabled: boolean };
    };
    defaultPermissions: Workspace['permissions'];
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    superAdminId: string;
    action: string;
    details: string;
}

// Farm Data Core Types
export interface Plot {
    id: string;
    name: string;
    crop: string;
    area: number;
    soilType: string;
}

export interface Season {
    id: string;
    name: string;
    year: number;
}

export interface InventoryConsumption {
    inventoryId: string;
    quantityUsed: number;
}

export interface Comment {
    id: string;
    authorId: string;
    createdAt: string;
    content: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    plotId: string;
    assigneeId: string;
    dueDate: string;
    status: TaskStatus;
    cost: number;
    priority: 'Low' | 'Medium' | 'High';
    category: string;
    createdAt: string;
    comments: Comment[];
    reminderDate?: string;
    inventoryConsumed?: InventoryConsumption[];
}

// Financials
export interface Account {
    id: string;
    name: string;
    type: AccountType;
    initialBalance: number;
    currency: string;
}

export interface JournalEntryLine {
    accountId: string;
    type: 'debit' | 'credit';
    amount: number;
    plotId?: string;
    seasonId?: string;
    saleId?: string;
    purchaseId?: string;
}

export interface JournalEntry {
    id: string;
    date: string;
    description: string;
    category: string;
    currency: string;
    lines: JournalEntryLine[];
}

// Financial Projections
export interface ScenarioAssumptions {
    revenueGrowth: number;
    cogsRatio: number;
    sgaRatio: number;
    depreciationRate: number;
    interestExpense: number;
    taxRate: number;
    receivablesDays: number;
    inventoryDays: number;
    payablesDays: number;
    capexAsPercentOfRevenue: number;
    newDebt: number;
    debtRepayment: number;
    capitalInjection: number;
    dividendPayoutRatio: number;
}

export interface ProjectionAssumptions {
    base: ScenarioAssumptions;
    optimistic: ScenarioAssumptions;
    pessimistic: ScenarioAssumptions;
    projectionYears: number;
}

export type Scenario = keyof Omit<ProjectionAssumptions, 'projectionYears'>;

export interface ProjectedIncomeStatement {
    revenue: number;
    cogs: number;
    grossProfit: number;
    sga: number;
    depreciation: number;
    pbit: number;
    interest: number;
    pbt: number;
    tax: number;
    pat: number;
    ebitda: number;
}
export interface ProjectedBalanceSheet {
    ppe: number;
    accumulatedDepreciation: number;
    nbv: number;
    inventory: number;
    receivables: number;
    cash: number;
    totalCurrentAssets: number;
    totalAssets: number;
    capital: number;
    incomeSurplus: number;
    shareholdersFund: number;
    debt: number;
    payables: number;
    totalCurrentLiabilities: number;
    totalEquityAndLiabilities: number;
}

export interface ProjectedCashFlow {
    pbt: number;
    depreciation: number;
    opProfitBeforeWC: number;
    deltaInventory: number;
    deltaReceivables: number;
    deltaPayables: number;
    cashFromOps: number;
    taxPaid: number;
    netCFO: number;
    capex: number;
    netCFI: number;
    capitalInjected: number;
    newDebt: number;
    debtRepaid: number;
    dividendsPaid: number;
    netCFF: number;
    netChangeInCash: number;
    openingCash: number;
    closingCash: number;
}

export interface ProjectedYearData {
    year: number;
    incomeStatement: ProjectedIncomeStatement;
    balanceSheet: ProjectedBalanceSheet;
    cashFlow: ProjectedCashFlow;
}


// HR
export interface Employee {
    id: string;
    name: string;
    role: string;
    payRate: number;
    contact: string;
}

export interface Timesheet {
    id: string;
    employeeId: string;
    date: string;
    hoursWorked: number;
}

// Inventory & Suppliers
export interface InventoryItem {
    id: string;
    name: string;
    category: 'Seeds' | 'Fertilizer' | 'Pesticide' | 'Equipment' | 'Other';
    quantity: number;
    unit: string;
    supplierId: string;
    purchaseDate: string;
    costPerUnit: number;
    currency: string;
    journalEntryId?: string; // To link to the purchase transaction
    reorderPoint?: number;
}

export interface Supplier {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
}

// Harvest & Sales
export interface Harvest {
    id: string;
    plotId: string;
    crop: string;
    quantity: number;
    unit: string;
    harvestDate: string;
    storageLocation: string;
    notes: string;
    quantityRemaining: number;
}

export interface SaleItem {
    harvestId: string;
    quantitySold: number;
    unitPrice: number;
}

export interface Sale {
    id: string;
    customerId: string;
    saleDate: string;
    invoiceNumber: string;
    items: SaleItem[];
    status: 'Pending' | 'Paid' | 'Overdue';
    currency: string;
    notes: string;
    journalEntryId: string;
}

export interface Customer {
    id: string;
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
}


// AEO (Agricultural Extension Officer)
export const ALL_FARMER_STATUSES = ['Active', 'Inactive', 'Verified'] as const;
export type FarmerStatus = typeof ALL_FARMER_STATUSES[number];

export const ALL_GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;
export type Gender = typeof ALL_GENDERS[number];

export const ALL_PHONE_TYPES = ['None', 'Feature Phone', 'Smartphone'] as const;
export type PhoneType = typeof ALL_PHONE_TYPES[number];

export const ALL_COMM_CHANNELS = ['In-Person', 'Phone Call', 'SMS', 'WhatsApp'] as const;
export type CommunicationChannel = typeof ALL_COMM_CHANNELS[number];

export const ALL_TENURE_TYPES = ['Owner', 'Lease', 'Communal', 'Family'] as const;
export type TenureType = typeof ALL_TENURE_TYPES[number];

export const ALL_WATER_SOURCES = ['Rain-fed', 'Irrigation', 'Borehole', 'River'] as const;
export type WaterSource = typeof ALL_WATER_SOURCES[number];

export const ALL_CREDIT_HISTORIES = ['None', 'Good', 'Fair', 'Poor'] as const;
export type CreditHistory = typeof ALL_CREDIT_HISTORIES[number];

export interface CropPortfolioItem {
    cropName: string;
    area: number;
    variety: string;
}

export interface LivestockItem {
    type: string;
    count: number;
}

export interface EquipmentItem {
    name: string;
    owned: boolean;
}

export interface Farmer {
    id: string;
    name: string;
    photoUrl: string;
    contact: string;
    address: string;
    age: number | null;
    gender: Gender;
    educationLevel: string;
    phoneType: PhoneType;
    preferredChannel: CommunicationChannel;
    status: FarmerStatus;
    activationDate: string;
    lastActivityDate: string;
    gpsCoordinates: string;
    fieldDescription: string;
    landSize: number;
    tenure: TenureType;
    waterSource: WaterSource[];
    cropPortfolio: CropPortfolioItem[];
    livestock: LivestockItem[];
    equipment: EquipmentItem[];
    laborForceSize: number | null;
    certifications: string[];
    hasBankAccount: boolean;
    hasMobileMoney: boolean;
    creditHistory: CreditHistory;
    preferredMarket: string;
    offFarmIncome: boolean;
    notes: string;
}

export interface KnowledgeBaseArticle {
    id: string;
    title: string;
    category: string;
    content: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface Interaction {
    id: string;
    farmerId: string;
    date: string;
    type: string;
    notes: string;
}

// Workspace Activity Log
export interface WorkspaceActivityLogEntry {
    id: string;
    timestamp: string;
    userName: string;
    action: string;
    details: string;
}

// Data Context
export interface FarmDataContextType {
    // Data
    plots: Plot[];
    seasons: Season[];
    tasks: Task[];
    accounts: Account[];
    journalEntries: JournalEntry[];
    employees: Employee[];
    timesheets: Timesheet[];
    inventory: InventoryItem[];
    suppliers: Supplier[];
    harvests: Harvest[];
    sales: Sale[];
    customers: Customer[];
    farmers: Farmer[];
    kbArticles: KnowledgeBaseArticle[];
    interactions: Interaction[];
    activityLog: WorkspaceActivityLogEntry[];

    // Mutators
    addPlot: (plot: Omit<Plot, 'id'>, actorName: string) => void;
    updatePlot: (plot: Plot, actorName: string) => void;
    deletePlot: (plotId: string, actorName: string, plotName: string) => void;
    addSeason: (season: Omit<Season, 'id'>, actorName: string) => void;
    updateSeason: (season: Season, actorName: string) => void;
    deleteSeason: (seasonId: string, actorName: string, seasonName: string) => void;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'comments'>, actorName: string) => void;
    updateTask: (task: Task, actorName: string) => void;
    addTaskComment: (taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>, actorName: string) => void;
    addAccount: (account: Omit<Account, 'id'>, actorName: string) => void;
    updateAccount: (account: Account, actorName: string) => void;
    deleteAccount: (accountId: string, actorName: string, accountName: string) => void;
    addJournalEntry: (entry: Omit<JournalEntry, 'id'>, actorName: string) => void;
    updateJournalEntry: (entry: JournalEntry, actorName: string) => void;
    deleteJournalEntry: (entryId: string, actorName: string) => void;
    addMultipleJournalEntries: (entries: Omit<JournalEntry, 'id'>[], actorName: string) => void;
    addEmployee: (employee: Omit<Employee, 'id'>, actorName: string) => void;
    addTimesheet: (timesheet: Omit<Timesheet, 'id'>, actorName: string) => void;
    updateTimesheet: (timesheet: Timesheet, actorName: string) => void;
    deleteTimesheet: (timesheetId: string, actorName: string) => void;
    addInventoryItem: (item: Omit<InventoryItem, 'id' | 'journalEntryId'>, actorName: string) => void;
    updateInventoryItem: (item: InventoryItem, actorName: string) => void;
    deleteInventoryItem: (itemId: string, actorName: string, itemName: string) => void;
    addSupplier: (supplier: Omit<Supplier, 'id'>, actorName: string) => void;
    updateSupplier: (supplier: Supplier, actorName: string) => void;
    deleteSupplier: (supplierId: string, actorName: string, supplierName: string) => void;
    addHarvest: (harvest: Omit<Harvest, 'id' | 'quantityRemaining'>, actorName: string) => void;
    addSale: (sale: Omit<Sale, 'id' | 'journalEntryId' | 'invoiceNumber'>, actorName: string) => void;
    addCustomer: (customer: Omit<Customer, 'id'>, actorName: string) => void;
    updateCustomer: (customer: Customer, actorName: string) => void;
    deleteCustomer: (customerId: string, actorName: string, customerName: string) => void;
    addFarmer: (farmer: Omit<Farmer, 'id'>, actorName: string) => void;
    updateFarmer: (farmer: Farmer, actorName: string) => void;
    deleteFarmer: (farmerId: string, actorName: string, farmerName: string) => void;
    addInteraction: (interaction: Omit<Interaction, 'id'>, actorName: string) => void;
    addKBArticle: (article: Omit<KnowledgeBaseArticle, 'id' | 'createdAt' | 'updatedAt'>, actorName: string) => void;
    updateKBArticle: (article: KnowledgeBaseArticle, actorName: string) => void;
    deleteKBArticle: (articleId: string, actorName: string, articleTitle: string) => void;
}