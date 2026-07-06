import Dexie, { type Table } from 'dexie';

export interface Folder {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: number;
}

export interface VaultEntry {
  id: string;
  folderId: string; // 'none' or folder ID
  type: 'video' | 'playlist' | 'link';
  title: string;
  url: string;
  videoId?: string;
  playlistId?: string;
  thumbnailUrl?: string;
  totalUnits: number;
  completedUnits: number;
  status: 'not-started' | 'in-progress' | 'completed';
  tags: string[];
  notes: string;
  addedAt: number;
}

export interface SubItem {
  id: string;
  entryId: string;
  title: string;
  url?: string;
  thumbnailUrl?: string;
  watched: boolean;
}

class AscensionVaultDatabase extends Dexie {
  folders!: Table<Folder>;
  entries!: Table<VaultEntry>;
  subItems!: Table<SubItem>;

  constructor() {
    super('ascensionVault');
    this.version(1).stores({
      folders: 'id, name, color, icon, createdAt',
      entries: 'id, folderId, type, status, addedAt',
      subItems: 'id, entryId, watched',
    });
  }
}

export const dbVault = new AscensionVaultDatabase();
