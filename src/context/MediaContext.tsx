import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../db/mediaDb';

interface MediaContextType {
  bgUrl: string | null;
  bgType: string | null;
  avatarUrl: string | null;
  rankIconUrl: string | null;
  uploadAsset: (kind: 'background' | 'avatar' | 'rankIcon', file: File) => Promise<void>;
  clearAsset: (kind: 'background' | 'avatar' | 'rankIcon') => Promise<void>;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const MediaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bgUrl, setBgUrl] = useState<string | null>(null);
  const [bgType, setBgType] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [rankIconUrl, setRankIconUrl] = useState<string | null>(null);

  // Load from Dexie on mount
  useEffect(() => {
    const activeUrls: string[] = [];

    const loadAssets = async () => {
      try {
        const assets = await db.assets.toArray();
        assets.forEach((asset) => {
          const url = URL.createObjectURL(asset.blob);
          activeUrls.push(url);

          if (asset.kind === 'background') {
            setBgUrl(url);
            setBgType(asset.mimeType);
          } else if (asset.kind === 'avatar') {
            setAvatarUrl(url);
          } else if (asset.kind === 'rankIcon') {
            setRankIconUrl(url);
          }
        });
      } catch (e) {
        console.error('Failed to load media assets from Dexie', e);
      }
    };

    loadAssets();

    // Revoke object URLs on unmount
    return () => {
      activeUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const uploadAsset = async (kind: 'background' | 'avatar' | 'rankIcon', file: File) => {
    // Save to Dexie
    await db.assets.put({
      id: kind,
      kind,
      mimeType: file.type,
      blob: file,
      createdAt: Date.now(),
    });

    // Create URL for instant preview
    const url = URL.createObjectURL(file);

    // Revoke old URL from state first
    if (kind === 'background') {
      if (bgUrl) URL.revokeObjectURL(bgUrl);
      setBgUrl(url);
      setBgType(file.type);
    } else if (kind === 'avatar') {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
      setAvatarUrl(url);
    } else if (kind === 'rankIcon') {
      if (rankIconUrl) URL.revokeObjectURL(rankIconUrl);
      setRankIconUrl(url);
    }
  };

  const clearAsset = async (kind: 'background' | 'avatar' | 'rankIcon') => {
    // Delete from Dexie
    await db.assets.delete(kind);

    // Reset state & revoke URL
    if (kind === 'background') {
      if (bgUrl) URL.revokeObjectURL(bgUrl);
      setBgUrl(null);
      setBgType(null);
    } else if (kind === 'avatar') {
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
      setAvatarUrl(null);
    } else if (kind === 'rankIcon') {
      if (rankIconUrl) URL.revokeObjectURL(rankIconUrl);
      setRankIconUrl(null);
    }
  };

  return (
    <MediaContext.Provider
      value={{
        bgUrl,
        bgType,
        avatarUrl,
        rankIconUrl,
        uploadAsset,
        clearAsset,
      }}
    >
      {children}
    </MediaContext.Provider>
  );
};

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (!context) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};
