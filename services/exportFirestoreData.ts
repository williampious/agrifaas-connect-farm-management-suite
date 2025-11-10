import { db } from '../config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export const exportFirestoreData = async (workspaceId: string, workspaceName: string) => {
  const collections = ['plots', 'seasons', 'tasks', 'accounts', 'journalEntries', 'employees', 'timesheets', 'inventory', 'farmers', 'kbArticles', 'interactions'];
  
  const data: any = { workspace: { id: workspaceId, name: workspaceName } };
  
  await Promise.all(collections.map(async (collName) => {
    const snapshot = await getDocs(collection(db, `workspaces/${workspaceId}/${collName}`));
    data[collName] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }));

  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `agrifaas_export_${workspaceName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
