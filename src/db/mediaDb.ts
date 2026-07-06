import Dexie, { type Table } from 'dexie';

export interface MediaAsset {
  id: string; // 'background' | 'avatar' | 'rankIcon'
  kind: 'background' | 'avatar' | 'rankIcon';
  mimeType: string;
  blob: Blob;
  createdAt: number;
}

class AscensionMediaDatabase extends Dexie {
  assets!: Table<MediaAsset>;

  constructor() {
    super('ascensionMedia');
    this.version(1).stores({
      assets: 'id, kind, mimeType, createdAt'
    });
  }
}

export const db = new AscensionMediaDatabase();
