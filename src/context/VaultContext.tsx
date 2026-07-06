import React, { createContext, useContext, useState, useEffect } from 'react';
import { dbVault } from '../db/vaultDb';
import type { Folder, VaultEntry, SubItem } from '../db/vaultDb';

interface VaultContextType {
  folders: Folder[];
  entries: VaultEntry[];
  subItems: SubItem[];
  addFolder: (name: string, color: string, icon: string) => Promise<void>;
  updateFolder: (id: string, name: string, color: string, icon: string) => Promise<void>;
  deleteFolder: (id: string) => Promise<void>;
  addEntry: (entry: Omit<VaultEntry, 'id' | 'addedAt' | 'completedUnits'>, subItemsData?: Omit<SubItem, 'id' | 'entryId'>[]) => Promise<void>;
  updateEntry: (id: string, entryData: Partial<VaultEntry>, subItemsData?: SubItem[]) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  toggleSubItemWatched: (subItemId: string) => Promise<void>;
  exportVault: () => Promise<void>;
  importVault: (jsonString: string) => Promise<boolean>;
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [entries, setEntries] = useState<VaultEntry[]>([]);
  const [subItems, setSubItems] = useState<SubItem[]>([]);

  // Hydrate all tables on mount
  const refreshData = async () => {
    try {
      const f = await dbVault.folders.toArray();
      const e = await dbVault.entries.toArray();
      const s = await dbVault.subItems.toArray();

      setFolders(f.sort((a, b) => b.createdAt - a.createdAt));
      setEntries(e.sort((a, b) => b.addedAt - a.addedAt));
      setSubItems(s);
    } catch (err) {
      console.error('Failed to load vault database', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addFolder = async (name: string, color: string, icon: string) => {
    const newFolder: Folder = {
      id: Math.random().toString(36).substring(2, 9),
      name,
      color,
      icon,
      createdAt: Date.now(),
    };
    await dbVault.folders.add(newFolder);
    await refreshData();
  };

  const updateFolder = async (id: string, name: string, color: string, icon: string) => {
    await dbVault.folders.update(id, { name, color, icon });
    await refreshData();
  };

  const deleteFolder = async (id: string) => {
    // Delete folder
    await dbVault.folders.delete(id);
    // Unassign entries matching this folder
    const matching = await dbVault.entries.where('folderId').equals(id).toArray();
    for (const entry of matching) {
      await dbVault.entries.update(entry.id, { folderId: 'none' });
    }
    await refreshData();
  };

  const addEntry = async (
    entry: Omit<VaultEntry, 'id' | 'addedAt' | 'completedUnits'>,
    subItemsData?: Omit<SubItem, 'id' | 'entryId'>[]
  ) => {
    const entryId = Math.random().toString(36).substring(2, 9);
    
    // Add subItems if type is playlist
    let computedCompleted = 0;
    let computedTotal = entry.totalUnits;

    if (entry.type === 'playlist' && subItemsData && subItemsData.length > 0) {
      computedTotal = subItemsData.length;
      computedCompleted = subItemsData.filter(s => s.watched).length;
      
      const newSubItems: SubItem[] = subItemsData.map(sub => ({
        ...sub,
        id: Math.random().toString(36).substring(2, 9),
        entryId,
      }));
      await dbVault.subItems.bulkAdd(newSubItems);
    } else {
      // For video/link
      computedCompleted = entry.status === 'completed' ? entry.totalUnits : 0;
    }

    const newEntry: VaultEntry = {
      ...entry,
      id: entryId,
      totalUnits: computedTotal,
      completedUnits: computedCompleted,
      addedAt: Date.now(),
    };

    await dbVault.entries.add(newEntry);
    await refreshData();
  };

  const updateEntry = async (id: string, entryData: Partial<VaultEntry>, subItemsData?: SubItem[]) => {
    const existing = await dbVault.entries.get(id);
    if (!existing) return;

    let computedTotal = entryData.totalUnits ?? existing.totalUnits;
    let computedCompleted = entryData.completedUnits ?? existing.completedUnits;
    let computedStatus = entryData.status ?? existing.status;

    if ((entryData.type === 'playlist' || existing.type === 'playlist') && subItemsData) {
      // Sync subItems
      // 1. Delete old subitems for this entry
      await dbVault.subItems.where('entryId').equals(id).delete();
      // 2. Add new subitems
      const syncedSubItems = subItemsData.map(s => {
        if (!s.id || s.id.startsWith('temp_')) {
          return { ...s, id: Math.random().toString(36).substring(2, 9), entryId: id };
        }
        return s;
      });
      if (syncedSubItems.length > 0) {
        await dbVault.subItems.bulkAdd(syncedSubItems);
        computedTotal = syncedSubItems.length;
        computedCompleted = syncedSubItems.filter(s => s.watched).length;
        // Automatically determine status from completion
        if (computedCompleted === computedTotal && computedTotal > 0) {
          computedStatus = 'completed';
        } else if (computedCompleted > 0 && computedCompleted < computedTotal) {
          computedStatus = 'in-progress';
        } else {
          computedStatus = 'not-started';
        }
      }
    } else {
      // Adjust completed units based on direct status changes for link/video
      if (entryData.status && entryData.status !== existing.status) {
        computedCompleted = entryData.status === 'completed' ? computedTotal : 0;
      }
    }

    await dbVault.entries.update(id, {
      ...entryData,
      totalUnits: computedTotal,
      completedUnits: computedCompleted,
      status: computedStatus,
    });

    await refreshData();
  };

  const deleteEntry = async (id: string) => {
    await dbVault.entries.delete(id);
    await dbVault.subItems.where('entryId').equals(id).delete();
    await refreshData();
  };

  const toggleSubItemWatched = async (subItemId: string) => {
    const sub = await dbVault.subItems.get(subItemId);
    if (!sub) return;

    const newWatched = !sub.watched;
    await dbVault.subItems.update(subItemId, { watched: newWatched });

    // Recalculate completed units on parent entry
    const entry = await dbVault.entries.get(sub.entryId);
    if (entry) {
      const sibs = await dbVault.subItems.where('entryId').equals(sub.entryId).toArray();
      const completed = sibs.filter(s => s.watched).length;
      const total = sibs.length;
      
      let status = entry.status;
      if (completed === total && total > 0) {
        status = 'completed';
      } else if (completed > 0 && completed < total) {
        status = 'in-progress';
      } else {
        status = 'not-started';
      }

      await dbVault.entries.update(sub.entryId, {
        completedUnits: completed,
        totalUnits: total,
        status,
      });
    }

    await refreshData();
  };

  const exportVault = async () => {
    try {
      const f = await dbVault.folders.toArray();
      const e = await dbVault.entries.toArray();
      const s = await dbVault.subItems.toArray();

      const data = JSON.stringify({ folders: f, entries: e, subItems: s }, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ascension_course_vault_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export vault', err);
    }
  };

  const importVault = async (jsonString: string): Promise<boolean> => {
    try {
      const parsed = JSON.parse(jsonString);
      if (
        Array.isArray(parsed.folders) &&
        Array.isArray(parsed.entries) &&
        Array.isArray(parsed.subItems)
      ) {
        // Clear current databases
        await dbVault.folders.clear();
        await dbVault.entries.clear();
        await dbVault.subItems.clear();

        // Populate database
        await dbVault.folders.bulkAdd(parsed.folders);
        await dbVault.entries.bulkAdd(parsed.entries);
        await dbVault.subItems.bulkAdd(parsed.subItems);

        await refreshData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to import vault', err);
      return false;
    }
  };

  return (
    <VaultContext.Provider
      value={{
        folders,
        entries,
        subItems,
        addFolder,
        updateFolder,
        deleteFolder,
        addEntry,
        updateEntry,
        deleteEntry,
        toggleSubItemWatched,
        exportVault,
        importVault,
      }}
    >
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
};
