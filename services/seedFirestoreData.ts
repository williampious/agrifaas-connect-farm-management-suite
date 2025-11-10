import { db } from '../config/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { AccountType } from '../types';

export const seedFirestoreData = async (workspaceId: string) => {
  const checkDoc = await getDoc(doc(db, `workspaces/${workspaceId}/accounts`, 'seeded'));
  if (checkDoc.exists()) return;

  const accounts = [
    { name: 'Cash at Bank', type: AccountType.Asset, initialBalance: 50000, currency: 'GHS' },
    { name: 'Accounts Receivable', type: AccountType.Asset, initialBalance: 0, currency: 'GHS' },
    { name: 'Farm Equipment', type: AccountType.Asset, initialBalance: 25000, currency: 'GHS' },
    { name: 'Land', type: AccountType.Asset, initialBalance: 100000, currency: 'GHS' },
    { name: 'Accounts Payable', type: AccountType.Liability, initialBalance: 5000, currency: 'GHS' },
    { name: "Owner's Equity", type: AccountType.Equity, initialBalance: 170000, currency: 'GHS' },
    { name: 'Crop Sales', type: AccountType.Income, initialBalance: 0, currency: 'GHS' },
    { name: 'Seed Costs', type: AccountType.Expense, initialBalance: 0, currency: 'GHS' },
    { name: 'Fertilizer Costs', type: AccountType.Expense, initialBalance: 0, currency: 'GHS' },
    { name: 'Labor Wages', type: AccountType.Expense, initialBalance: 0, currency: 'GHS' }
  ];

  const plots = [
    { name: 'North Field', crop: 'Maize', area: 50, soilType: 'Loam' },
    { name: 'West Valley', crop: 'Soybean', area: 75, soilType: 'Clay Loam' }
  ];

  const currentYear = new Date().getFullYear();
  const seasons = [
    { name: 'Main Season', year: currentYear },
    { name: 'Minor Season', year: currentYear }
  ];

  const employees = [
    { name: 'Kofi Mensah', role: 'Farm Manager', payRate: 25, contact: 'kofi@farm.com' },
    { name: 'Ama Serwaa', role: 'Field Hand', payRate: 15, contact: 'ama@farm.com' }
  ];

  await Promise.all([
    ...accounts.map((acc, i) => setDoc(doc(db, `workspaces/${workspaceId}/accounts`, `acc_${i}`), acc)),
    ...plots.map((plot, i) => setDoc(doc(db, `workspaces/${workspaceId}/plots`, `plot_${i}`), plot)),
    ...seasons.map((season, i) => setDoc(doc(db, `workspaces/${workspaceId}/seasons`, `season_${i}`), season)),
    ...employees.map((emp, i) => setDoc(doc(db, `workspaces/${workspaceId}/employees`, `emp_${i}`), emp)),
    setDoc(doc(db, `workspaces/${workspaceId}/accounts`, 'seeded'), { seeded: true })
  ]);
};
