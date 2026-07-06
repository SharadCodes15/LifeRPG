import React, { useState, useRef } from 'react';
import { useMedia } from '../context/MediaContext';
import { SystemPanel } from './SystemPanel';

export const MediaVault: React.FC = () => {
  const { bgUrl, bgType, avatarUrl, rankIconUrl, uploadAsset, clearAsset } = useMedia();

  const [dragOverKind, setDragOverKind] = useState<'background' | 'avatar' | 'rankIcon' | null>(null);

  const bgInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const rankInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent, kind: 'background' | 'avatar' | 'rankIcon') => {
    e.preventDefault();
    setDragOverKind(kind);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverKind(null);
  };

  const handleDrop = async (e: React.DragEvent, kind: 'background' | 'avatar' | 'rankIcon') => {
    e.preventDefault();
    setDragOverKind(null);
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      // Verify type
      if (kind === 'background') {
        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) return;
      } else {
        if (!file.type.startsWith('image/')) return;
      }
      await uploadAsset(kind, file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, kind: 'background' | 'avatar' | 'rankIcon') => {
    const files = e.target.files;
    if (files && files[0]) {
      await uploadAsset(kind, files[0]);
    }
  };

  return (
    <SystemPanel glow={false} className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-accent/15 pb-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="text-accent text-lg">📁</span>
          <h2 className="font-display font-bold text-sm tracking-wider text-textmain">
            MEDIA ARCHIVE VAULT
          </h2>
        </div>
        <span className="text-[8px] font-mono text-accent uppercase tracking-widest px-2 py-0.5 border border-accent/35 rounded bg-accent/5">
          Local Binary Blob SQL Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Slot 1: Background */}
        <div
          onDragOver={(e) => handleDragOver(e, 'background')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'background')}
          className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[160px] text-center transition-all relative overflow-hidden ${
            dragOverKind === 'background'
              ? 'border-accent bg-accent/5 scale-[0.99]'
              : bgUrl
              ? 'border-accent/15'
              : 'border-textdim/20 hover:border-accent/30'
          }`}
        >
          {bgUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-between gap-3">
              {/* Preview */}
              <div className="w-full h-24 rounded border border-panel2 overflow-hidden bg-panel relative flex items-center justify-center">
                {bgType?.startsWith('video/') ? (
                  <video src={bgUrl} muted className="w-full h-full object-cover" />
                ) : (
                  <img src={bgUrl} alt="Background Preview" className="w-full h-full object-cover" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-white font-mono uppercase font-bold tracking-wider">Active Backdrop</span>
                </div>
              </div>
              <div className="flex items-center justify-between w-full border-t border-accent/5 pt-2">
                <span className="text-[9px] font-mono text-textdim/60 truncate max-w-[120px]">Backdrop Loaded</span>
                <button
                  onClick={() => clearAsset('background')}
                  className="text-[9px] font-mono text-danger hover:text-danger/80 cursor-pointer"
                >
                  Clear Backdrop
                </button>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center py-4 select-none">
              <input
                ref={bgInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={(e) => handleFileChange(e, 'background')}
                className="hidden"
              />
              <span className="text-2xl mb-1">🖼</span>
              <span className="text-xs text-textmain font-bold">App Background</span>
              <span className="text-[9px] text-textdim mt-1 font-mono uppercase tracking-wide">Image/GIF/Video (Drag or Click)</span>
            </label>
          )}
        </div>

        {/* Slot 2: Avatar */}
        <div
          onDragOver={(e) => handleDragOver(e, 'avatar')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'avatar')}
          className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[160px] text-center transition-all relative overflow-hidden ${
            dragOverKind === 'avatar'
              ? 'border-accent bg-accent/5 scale-[0.99]'
              : avatarUrl
              ? 'border-accent/15'
              : 'border-textdim/20 hover:border-accent/30'
          }`}
        >
          {avatarUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-between gap-3">
              {/* Circular Preview */}
              <div className="w-16 h-16 rounded-full border-2 border-accent overflow-hidden relative flex items-center justify-center">
                <img src={avatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-center justify-between w-full border-t border-accent/5 pt-2">
                <span className="text-[9px] font-mono text-textdim/60">Avatar Active</span>
                <button
                  onClick={() => clearAsset('avatar')}
                  className="text-[9px] font-mono text-danger hover:text-danger/80 cursor-pointer"
                >
                  Clear Avatar
                </button>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center py-4 select-none">
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'avatar')}
                className="hidden"
              />
              <span className="text-2xl mb-1">👤</span>
              <span className="text-xs text-textmain font-bold">Hunter Avatar</span>
              <span className="text-[9px] text-textdim mt-1 font-mono uppercase tracking-wide">Image file (Drag or Click)</span>
            </label>
          )}
        </div>

        {/* Slot 3: Rank Icon */}
        <div
          onDragOver={(e) => handleDragOver(e, 'rankIcon')}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, 'rankIcon')}
          className={`border-2 border-dashed rounded-lg p-4 flex flex-col items-center justify-center min-h-[160px] text-center transition-all relative overflow-hidden ${
            dragOverKind === 'rankIcon'
              ? 'border-accent bg-accent/5 scale-[0.99]'
              : rankIconUrl
              ? 'border-accent/15'
              : 'border-textdim/20 hover:border-accent/30'
          }`}
        >
          {rankIconUrl ? (
            <div className="w-full h-full flex flex-col items-center justify-between gap-3">
              {/* Preview */}
              <div className="w-10 h-10 border border-accent/35 rounded overflow-hidden relative flex items-center justify-center bg-panel">
                <img src={rankIconUrl} alt="Rank Icon Preview" className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center justify-between w-full border-t border-accent/5 pt-2">
                <span className="text-[9px] font-mono text-textdim/60">Rank Badge Icon</span>
                <button
                  onClick={() => clearAsset('rankIcon')}
                  className="text-[9px] font-mono text-danger hover:text-danger/80 cursor-pointer"
                >
                  Clear Badge
                </button>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center py-4 select-none">
              <input
                ref={rankInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'rankIcon')}
                className="hidden"
              />
              <span className="text-2xl mb-1">🏅</span>
              <span className="text-xs text-textmain font-bold">Custom Rank Badge</span>
              <span className="text-[9px] text-textdim mt-1 font-mono uppercase tracking-wide">Image file (Drag or Click)</span>
            </label>
          )}
        </div>
      </div>
    </SystemPanel>
  );
};

export default MediaVault;
