import React, { useState } from 'react';
import { useVault } from '../context/VaultContext';
import type { Folder, VaultEntry, SubItem } from '../db/vaultDb';
import { SystemPanel } from './SystemPanel';

// Helper URL parsers
const getYoutubeVideoId = (url: string): string | null => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const getYoutubePlaylistId = (url: string): string | null => {
  const match = url.match(/[?&]list=([^#\&\?]+)/);
  return match ? match[1] : null;
};

export const CourseVault: React.FC = () => {
  const {
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
  } = useVault();

  // Search & Filter state
  const [selectedFolderId, setSelectedFolderId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'progress' | 'alpha'>('recent');

  // Active player/modal state
  const [activeEntry, setActiveEntry] = useState<VaultEntry | null>(null);

  // Forms states
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [folderName, setFolderName] = useState('');
  const [folderColor, setFolderColor] = useState('#6e8efb');
  const [folderIcon, setFolderIcon] = useState('📚');

  const [showEntryModal, setShowEntryModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<VaultEntry | null>(null);

  // Entry Form values
  const [entryTitle, setEntryTitle] = useState('');
  const [entryUrl, setEntryUrl] = useState('');
  const [entryType, setEntryType] = useState<'video' | 'playlist' | 'link'>('link');
  const [entryThumbnail, setEntryThumbnail] = useState('');
  const [entryTotalUnits, setEntryTotalUnits] = useState(1);
  const [entryTags, setEntryTags] = useState('');
  const [entryNotes, setEntryNotes] = useState('');
  const [entryFolderId, setEntryFolderId] = useState('none');

  // Playlist sub-items builder state
  interface TempSubItem {
    id: string;
    title: string;
    url?: string;
    watched: boolean;
  }
  const [tempSubItems, setTempSubItems] = useState<TempSubItem[]>([]);

  // File import ref
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // --- oEmbed Fetch Metadata ---
  const handleUrlBlur = async () => {
    if (!entryUrl.trim()) return;

    const videoId = getYoutubeVideoId(entryUrl);
    const playlistId = getYoutubePlaylistId(entryUrl);

    // Auto-derive type
    if (playlistId) {
      setEntryType('playlist');
    } else if (videoId) {
      setEntryType('video');
    }

    // Auto-derive thumbnail
    let derivedThumb = '';
    if (videoId) {
      derivedThumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      if (!entryThumbnail) setEntryThumbnail(derivedThumb);
    }

    // Try keyless noembed oEmbed proxy
    try {
      const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(entryUrl)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.title && !entryTitle) {
          setEntryTitle(data.title);
        }
        if (data.thumbnail_url && !entryThumbnail) {
          setEntryThumbnail(data.thumbnail_url);
        }
      }
    } catch (e) {
      // Fail silently
    }
  };

  // --- Folder Actions ---
  const handleFolderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderName.trim()) return;

    if (editingFolder) {
      await updateFolder(editingFolder.id, folderName, folderColor, folderIcon);
    } else {
      await addFolder(folderName, folderColor, folderIcon);
    }

    // Reset folder form
    setFolderName('');
    setFolderColor('#6e8efb');
    setFolderIcon('📚');
    setEditingFolder(null);
    setShowAddFolderModal(false);
  };

  const cancelForm = () => {
    setShowAddFolderModal(false);
    setEditingFolder(null);
    setFolderName('');
    setFolderIcon('📚');
    setFolderColor('#6e8efb');
  };

  const handleEditFolderStart = (folder: Folder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setFolderColor(folder.color);
    setFolderIcon(folder.icon);
    setShowAddFolderModal(true);
  };

  // --- Entry Form Actions ---
  const openAddEntry = () => {
    setEditingEntry(null);
    setEntryTitle('');
    setEntryUrl('');
    setEntryType('link');
    setEntryThumbnail('');
    setEntryTotalUnits(1);
    setEntryTags('');
    setEntryNotes('');
    setEntryFolderId(selectedFolderId !== 'all' ? selectedFolderId : 'none');
    setTempSubItems([]);
    setShowEntryModal(true);
  };

  const openEditEntry = (entry: VaultEntry) => {
    setEditingEntry(entry);
    setEntryTitle(entry.title);
    setEntryUrl(entry.url);
    setEntryType(entry.type);
    setEntryThumbnail(entry.thumbnailUrl || '');
    setEntryTotalUnits(entry.totalUnits);
    setEntryTags(entry.tags.join(', '));
    setEntryNotes(entry.notes);
    setEntryFolderId(entry.folderId);

    // Hydrate subItems for this entry
    const siblingSubItems = subItems.filter((s) => s.entryId === entry.id);
    setTempSubItems(
      siblingSubItems.map((s) => ({
        id: s.id,
        title: s.title,
        url: s.url,
        watched: s.watched,
      }))
    );

    setShowEntryModal(true);
  };

  const handleEntrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryTitle.trim() || !entryUrl.trim()) return;

    const videoId = getYoutubeVideoId(entryUrl) || undefined;
    const playlistId = getYoutubePlaylistId(entryUrl) || undefined;

    const tagsArr = entryTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '');

    const entryData = {
      folderId: entryFolderId,
      type: entryType,
      title: entryTitle,
      url: entryUrl,
      videoId,
      playlistId,
      thumbnailUrl: entryThumbnail || undefined,
      totalUnits: entryType === 'playlist' ? tempSubItems.length : entryTotalUnits,
      status: (editingEntry ? editingEntry.status : 'not-started') as any,
      tags: tagsArr,
      notes: entryNotes,
    };

    if (editingEntry) {
      const subItemsPayload: SubItem[] = tempSubItems.map((sub) => ({
        id: sub.id,
        entryId: editingEntry.id,
        title: sub.title,
        url: sub.url,
        watched: sub.watched,
      }));
      await updateEntry(editingEntry.id, entryData, subItemsPayload);
    } else {
      const subItemsPayload = tempSubItems.map((sub) => ({
        title: sub.title,
        url: sub.url,
        watched: sub.watched,
      }));
      await addEntry(entryData, subItemsPayload);
    }

    setShowEntryModal(false);
    setEditingEntry(null);
  };

  const addSubItemRow = () => {
    setTempSubItems((prev) => [
      ...prev,
      {
        id: 'temp_' + Math.random().toString(36).substring(2, 9),
        title: `Lesson ${prev.length + 1}`,
        watched: false,
      },
    ]);
  };

  const updateSubItemRow = (id: string, field: string, val: any) => {
    setTempSubItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const removeSubItemRow = (id: string) => {
    setTempSubItems((prev) => prev.filter((item) => item.id !== id));
  };

  // --- Database Backups ---
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImportChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const text = event.target?.result as string;
        const success = await importVault(text);
        if (success) {
          alert('Course Vault imported successfully!');
        } else {
          alert('Import failed. Invalid file format.');
        }
      };
      reader.readAsText(files[0]);
    }
  };

  // --- Filtering & Sorting Core ---
  const getFilteredEntries = () => {
    let list = [...entries];

    // 1. Folder filter
    if (selectedFolderId !== 'all') {
      list = list.filter((e) => e.folderId === selectedFolderId);
    }

    // 2. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 3. Sorting
    if (sortBy === 'recent') {
      list.sort((a, b) => b.addedAt - a.addedAt);
    } else if (sortBy === 'alpha') {
      list.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'progress') {
      list.sort((a, b) => {
        const pctA = a.totalUnits > 0 ? a.completedUnits / a.totalUnits : 0;
        const pctB = b.totalUnits > 0 ? b.completedUnits / b.totalUnits : 0;
        return pctB - pctA;
      });
    }

    return list;
  };

  const allFiltered = getFilteredEntries();
  const inProgressPinned = entries.filter((e) => e.status === 'in-progress');

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner and CRUD actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-panel2 pb-4 mb-2">
        <div>
          <h2 className="font-display font-bold text-2xl tracking-widest bg-gradient-to-r from-accent via-accent2 to-accent bg-clip-text text-transparent uppercase select-none">
            COURSE VAULT
          </h2>
          <p className="text-xs text-textdim mt-1 font-mono uppercase">
            Curate tutorials, save play courses, and track learning archives
          </p>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImportChange}
            className="hidden"
          />
          <button
            onClick={handleImportClick}
            className="text-[10px] font-mono border border-textdim/20 text-textdim hover:text-textmain px-3 py-1.5 rounded uppercase tracking-wider font-semibold cursor-pointer transition-colors"
          >
            Import Backup
          </button>
          <button
            onClick={exportVault}
            className="text-[10px] font-mono border border-textdim/20 text-textdim hover:text-textmain px-3 py-1.5 rounded uppercase tracking-wider font-semibold cursor-pointer transition-colors"
          >
            Export Backup
          </button>
          <button
            onClick={openAddEntry}
            className="text-[10px] font-mono bg-accent/15 border border-accent/40 hover:bg-accent/25 text-accent px-4 py-1.5 rounded uppercase tracking-wider font-bold cursor-pointer active:scale-95 transition-all duration-300"
          >
            ✚ Add Course
          </button>
        </div>
      </div>

      {/* Folders Management Bar */}
      <div className="flex items-center flex-wrap gap-2 pb-2">
        <button
          onClick={() => setSelectedFolderId('all')}
          className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider cursor-pointer border transition-all duration-300 ${
            selectedFolderId === 'all'
              ? 'bg-accent/15 border-accent text-accent'
              : 'border-accent/10 text-textdim hover:text-textmain'
          }`}
        >
          📂 All Sectors
        </button>

        {folders.map((folder) => {
          const isActive = selectedFolderId === folder.id;
          return (
            <div key={folder.id} className="flex items-center gap-1 group/folder select-none">
              <button
                onClick={() => setSelectedFolderId(folder.id)}
                className={`px-3 py-1.5 rounded-full font-mono text-[10px] uppercase font-bold tracking-wider cursor-pointer border transition-all duration-300 flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-accent/15 border-accent text-accent'
                    : 'border-accent/10 text-textdim hover:text-textmain'
                }`}
                style={{ borderColor: isActive ? folder.color : undefined, color: isActive ? folder.color : undefined }}
              >
                <span>{folder.icon}</span>
                <span>{folder.name}</span>
              </button>

              {/* Folder inline controls */}
              <div className="hidden group-hover/folder:flex items-center gap-1">
                <button
                  onClick={() => handleEditFolderStart(folder)}
                  className="text-[8px] font-mono text-textdim hover:text-accent cursor-pointer"
                  title="Rename"
                >
                  ✎
                </button>
                <button
                  onClick={() => deleteFolder(folder.id)}
                  className="text-[8px] font-mono text-textdim hover:text-danger cursor-pointer"
                  title="Delete"
                >
                  ✖
                </button>
              </div>
            </div>
          );
        })}

        <button
          onClick={() => {
            setEditingFolder(null);
            setFolderName('');
            setFolderIcon('📚');
            setFolderColor('#6e8efb');
            setShowAddFolderModal(true);
          }}
          className="px-2.5 py-1.5 border border-dashed border-accent2/25 text-accent2 rounded-full font-mono text-[9px] uppercase font-bold tracking-wider cursor-pointer transition-all duration-300 hover:border-accent2/50"
        >
          ✚ Sector
        </button>
      </div>

      {/* Filter and Sort bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-panel/30 border border-panel2 p-3.5 rounded-lg">
        {/* Search */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by course title or tags..."
          className="w-full sm:max-w-xs bg-bg border border-accent/20 rounded px-3 py-1.5 text-xs text-textmain focus:outline-none focus:border-accent font-sans"
        />

        {/* Sort controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <label className="text-[9px] font-mono text-textdim uppercase tracking-wider">Sort Matrix</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-bg border border-accent/20 rounded px-3 py-1 text-xs text-textmain font-mono focus:outline-none focus:border-accent cursor-pointer"
          >
            <option value="recent">Recently Added</option>
            <option value="progress">Learning Progress</option>
            <option value="alpha">Alphabetical</option>
          </select>
        </div>
      </div>

      {/* Pinned active trials (in-progress courses) */}
      {inProgressPinned.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-display font-bold text-xs tracking-widest text-accent uppercase select-none">
            ⚡ ACTIVE TRIALS (IN PROGRESS)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-accent/5 border border-accent/15 p-5 rounded-lg">
            {inProgressPinned.map((entry) => {
              const pct = entry.totalUnits > 0 ? Math.round((entry.completedUnits / entry.totalUnits) * 100) : 0;

              return (
                <div
                  key={entry.id}
                  onClick={() => setActiveEntry(entry)}
                  className="bg-panel border border-accent/25 hover:border-accent/40 rounded-lg p-4 flex flex-col sm:flex-row gap-4 items-center cursor-pointer transition-all duration-300 relative group/pinned shadow"
                >
                  {/* Thumbnail */}
                  <div className="w-full sm:w-32 h-20 rounded overflow-hidden bg-panel2 border border-accent/10 relative shrink-0">
                    {entry.thumbnailUrl ? (
                      <img src={entry.thumbnailUrl} alt={entry.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-accent text-lg">💡</div>
                    )}
                    <div className="absolute top-1 left-1 bg-accent2 text-panel text-[8px] font-mono font-bold px-1.5 py-0.5 rounded select-none uppercase tracking-wide">
                      {entry.type}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-grow min-w-0 w-full flex flex-col justify-between h-full">
                    <div>
                      <h4 className="font-sans font-bold text-sm text-textmain truncate pr-6">
                        {entry.title}
                      </h4>
                      {entry.notes && (
                        <p className="text-[10px] text-textdim/70 truncate mt-1">{entry.notes}</p>
                      )}
                    </div>

                    <div className="space-y-1.5 mt-3">
                      <div className="flex justify-between items-center text-[9px] font-mono">
                        <span className="text-textdim font-bold">{entry.completedUnits} / {entry.totalUnits} Units</span>
                        <span className="text-accent font-extrabold">{pct}% Complete</span>
                      </div>
                      <div className="h-1.5 w-full bg-panel2 border border-accent/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions overlay menu */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditEntry(entry);
                      }}
                      className="text-[9px] font-mono text-textdim hover:text-accent cursor-pointer opacity-0 group-hover/pinned:opacity-100 transition-opacity"
                    >
                      Edit
                    </button>
                    <span className="text-textdim/20 text-[9px] opacity-0 group-hover/pinned:opacity-100">|</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm('Delete this learning entry?')) deleteEntry(entry.id);
                      }}
                      className="text-[9px] font-mono text-textdim hover:text-danger cursor-pointer opacity-0 group-hover/pinned:opacity-100 transition-opacity"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Bento Grid */}
      <div className="space-y-3">
        <h3 className="font-display font-bold text-xs tracking-widest text-textdim uppercase select-none">
          📦 VAULT CATALOG
        </h3>
        
        {allFiltered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {allFiltered.map((entry) => {
              const isPinned = entry.status === 'in-progress';
              const spanClass = isPinned ? 'col-span-1 md:col-span-2' : 'col-span-1';
              const pct = entry.totalUnits > 0 ? Math.round((entry.completedUnits / entry.totalUnits) * 100) : 0;

              return (
                <div
                  key={entry.id}
                  onClick={() => setActiveEntry(entry)}
                  className={`bg-panel/30 border border-panel2 hover:border-accent/30 rounded-lg p-5 flex flex-col justify-between cursor-pointer transition-all duration-300 relative group/tile min-h-[190px] shadow-sm ${spanClass}`}
                >
                  <div className="space-y-4">
                    {/* Badge and options header */}
                    <div className="flex items-center justify-between gap-3">
                      {/* Status Badge */}
                      <span
                        className="text-[8px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider select-none badge border-none"
                        style={{
                          backgroundColor:
                            entry.status === 'completed'
                              ? 'var(--border-strong)'
                              : entry.status === 'in-progress'
                              ? 'rgba(110, 142, 251, 0.15)'
                              : 'rgba(136, 146, 166, 0.08)',
                          color:
                            entry.status === 'completed'
                              ? 'var(--text)'
                              : entry.status === 'in-progress'
                              ? 'var(--accent)'
                              : 'var(--textdim)',
                        }}
                      >
                        {entry.status === 'completed'
                          ? 'Completed'
                          : entry.status === 'in-progress'
                          ? 'Active Trial'
                          : 'Not Started'}
                      </span>

                      {/* Units display */}
                      <span className="text-[9px] font-mono text-textdim/55">
                        {entry.completedUnits} / {entry.totalUnits} Units ({pct}%)
                      </span>
                    </div>

                    {/* Content details layout */}
                    <div className="flex gap-4 items-start">
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 rounded border border-panel2 shrink-0 overflow-hidden bg-panel relative flex items-center justify-center shadow-inner">
                        {entry.thumbnailUrl ? (
                          <img src={entry.thumbnailUrl} alt={entry.title} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">📚</span>
                        )}
                      </div>

                      {/* Title & Notes */}
                      <div className="min-w-0">
                        <h4 className="font-sans font-bold text-xs text-textmain leading-snug group-hover/tile:text-accent transition-colors block truncate">
                          {entry.title}
                        </h4>
                        {entry.notes && (
                          <p className="text-[10px] text-textdim/60 leading-relaxed truncate mt-1">{entry.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tags and Controls Footer */}
                  <div className="border-t border-accent/5 pt-3.5 mt-4 flex items-center justify-between gap-4">
                    {/* Tags row */}
                    <div className="flex flex-wrap gap-1 items-center overflow-hidden h-5.5">
                      {entry.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="bg-panel border border-accent/15 text-textdim text-[8px] font-mono px-1.5 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Action buttons on card hover */}
                    <div className="flex items-center gap-1.5 opacity-0 group-hover/tile:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditEntry(entry);
                        }}
                        className="text-[9px] font-mono text-textdim hover:text-accent cursor-pointer"
                      >
                        Edit
                      </button>
                      <span className="text-textdim/20 text-[9px]">|</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this learning entry?')) deleteEntry(entry.id);
                        }}
                        className="text-[9px] font-mono text-textdim hover:text-danger cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-panel2 rounded-lg text-xs text-textdim/60 font-mono uppercase tracking-widest select-none">
            No entries captured in this sector sector
          </div>
        )}
      </div>

      {/* Folder creation dialog modal */}
      {showAddFolderModal && (
        <div
          onClick={cancelForm}
          className="fixed inset-0 bg-bg/85 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 cursor-pointer transition-opacity duration-300 animate-fadeIn"
        >
          <SystemPanel
            glow={true}
            className="max-w-md w-full p-6 bg-panel border-accent/40 shadow-2xl relative overflow-hidden flex flex-col animate-scaleUp cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold text-base tracking-wider text-accent uppercase mb-4">
              {editingFolder ? 'Modify Archive Sector' : 'Form Archive Sector'}
            </h3>

            <form onSubmit={handleFolderSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Sector Name</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g. Algorithms, French, Piano"
                  className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-sm text-textmain focus:outline-none focus:border-accent"
                  maxLength={20}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Sector Icon</label>
                  <input
                    type="text"
                    value={folderIcon}
                    onChange={(e) => setFolderIcon(e.target.value)}
                    placeholder="e.g. 💻, 🧠, ⚙, 🎨"
                    className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-sm text-textmain focus:outline-none focus:border-accent font-mono"
                    maxLength={2}
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Theme Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={folderColor}
                      onChange={(e) => setFolderColor(e.target.value)}
                      className="w-10 h-8 bg-transparent border border-accent/20 rounded cursor-pointer shrink-0"
                    />
                    <span className="text-[10px] font-mono uppercase text-textmain">{folderColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-accent/10 mt-6">
                <button
                  type="button"
                  onClick={cancelForm}
                  className="px-3 py-1.5 border border-textdim/20 text-textdim hover:text-textmain text-xs font-mono rounded cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-accent/15 border border-accent/40 hover:bg-accent/25 text-accent text-xs font-mono font-bold rounded cursor-pointer transition-colors"
                >
                  {editingFolder ? 'Apply Changes' : 'Confirm Sector'}
                </button>
              </div>
            </form>
          </SystemPanel>
        </div>
      )}

      {/* Add / Edit Entry form dialog modal */}
      {showEntryModal && (
        <div
          onClick={() => setShowEntryModal(false)}
          className="fixed inset-0 bg-bg/85 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 cursor-pointer transition-opacity duration-300 animate-fadeIn"
        >
          <SystemPanel
            glow={true}
            className="max-w-2xl w-full p-6 bg-panel border-accent/40 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto animate-scaleUp cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display font-bold text-base tracking-wider text-accent uppercase mb-4">
              {editingEntry ? 'Modify Course parameters' : 'Archive Learning parameters'}
            </h3>

            <form onSubmit={handleEntrySubmit} className="space-y-4">
              {/* pasted URL */}
              <div className="space-y-1">
                <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Learning URL</label>
                <input
                  type="url"
                  value={entryUrl}
                  onChange={(e) => setEntryUrl(e.target.value)}
                  onBlur={handleUrlBlur}
                  placeholder="Paste YouTube video/playlist URL, or any link..."
                  className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-xs text-textmain focus:outline-none focus:border-accent font-mono"
                  required
                />
              </div>

              {/* Title & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Course Title</label>
                  <input
                    type="text"
                    value={entryTitle}
                    onChange={(e) => setEntryTitle(e.target.value)}
                    placeholder="Enter Course Title..."
                    className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-xs text-textmain focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Learning Type</label>
                  <select
                    value={entryType}
                    onChange={(e) => setEntryType(e.target.value as any)}
                    className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-xs text-textmain focus:outline-none focus:border-accent font-mono cursor-pointer"
                  >
                    <option value="link">Generic Link</option>
                    <option value="video">YouTube Video</option>
                    <option value="playlist">YouTube Playlist</option>
                  </select>
                </div>
              </div>

              {/* Thumbnail and Total Units */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Thumbnail URL</label>
                  <input
                    type="url"
                    value={entryThumbnail}
                    onChange={(e) => setEntryThumbnail(e.target.value)}
                    placeholder="Paste direct thumbnail link (or auto-populates on YouTube blur)..."
                    className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-xs text-textmain focus:outline-none focus:border-accent font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">
                    {entryType === 'playlist' ? 'Units (Total)' : 'Steps/Units (Total)'}
                  </label>
                  <input
                    type="number"
                    value={entryType === 'playlist' ? tempSubItems.length : entryTotalUnits}
                    onChange={(e) => setEntryTotalUnits(Math.max(1, Number(e.target.value)))}
                    disabled={entryType === 'playlist'}
                    className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-xs text-textmain focus:outline-none focus:border-accent font-mono disabled:opacity-40"
                    min={1}
                    required
                  />
                </div>
              </div>

              {/* Tags, notes and Sector Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Tag Chips</label>
                  <input
                    type="text"
                    value={entryTags}
                    onChange={(e) => setEntryTags(e.target.value)}
                    placeholder="e.g. coding, rust, history (comma-separated)"
                    className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-xs text-textmain focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Assigned Sector</label>
                  <select
                    value={entryFolderId}
                    onChange={(e) => setEntryFolderId(e.target.value)}
                    className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-xs text-textmain focus:outline-none focus:border-accent font-mono cursor-pointer"
                  >
                    <option value="none">Unassigned Sector</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.icon} {f.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[9px] text-textdim uppercase font-mono tracking-wider block">Archive Notes</label>
                <textarea
                  value={entryNotes}
                  onChange={(e) => setEntryNotes(e.target.value)}
                  placeholder="Record summary logs, lessons, or reminders..."
                  className="w-full bg-bg border border-accent/25 rounded px-3 py-1.5 text-xs text-textmain focus:outline-none focus:border-accent h-16 font-sans resize-none"
                />
              </div>

              {/* Dynamic Sub-items Playlist Builder */}
              {entryType === 'playlist' && (
                <div className="border-t border-accent/10 pt-4 mt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-mono text-accent uppercase tracking-widest block font-bold">
                      Playlist Syllabus Lessons ({tempSubItems.length})
                    </span>
                    <button
                      type="button"
                      onClick={addSubItemRow}
                      className="px-2 py-1 bg-accent/10 border border-accent/35 text-accent font-mono text-[9px] rounded uppercase tracking-wider font-bold cursor-pointer"
                    >
                      ✚ Add Lesson row
                    </button>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {tempSubItems.map((item, idx) => (
                      <div key={item.id} className="flex gap-2 items-center bg-panel2/30 border border-accent/5 p-2 rounded">
                        <span className="text-[9px] font-mono text-textdim/55 w-5">{idx + 1}.</span>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateSubItemRow(item.id, 'title', e.target.value)}
                          placeholder="Lesson Title"
                          className="flex-grow bg-bg border border-accent/20 rounded px-2 py-1 text-xs text-textmain focus:outline-none"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => removeSubItemRow(item.id)}
                          className="text-[10px] font-mono text-danger hover:text-danger/80 px-2 cursor-pointer"
                        >
                          ✖
                        </button>
                      </div>
                    ))}
                    {tempSubItems.length === 0 && (
                      <div className="text-center py-4 text-[10px] font-mono text-textdim/45 uppercase">
                        Syllabus is empty. Add lessons above.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-2 justify-end pt-2 border-t border-accent/10 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEntryModal(false)}
                  className="px-3 py-1.5 border border-textdim/20 text-textdim hover:text-textmain text-xs font-mono rounded cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-accent/15 border border-accent/40 hover:bg-accent/25 text-accent text-xs font-mono font-bold rounded cursor-pointer transition-colors"
                >
                  {editingEntry ? 'Confirm Changes' : 'Confirm Archive'}
                </button>
              </div>
            </form>
          </SystemPanel>
        </div>
      )}

      {/* Embedded Player/Viewer Modal */}
      {activeEntry && (
        <div
          onClick={() => setActiveEntry(null)}
          className="fixed inset-0 bg-bg/90 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 cursor-pointer transition-opacity duration-300 animate-fadeIn"
        >
          <SystemPanel
            glow={true}
            className="max-w-4xl w-full p-6 bg-panel border-accent/40 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] overflow-y-auto brutalist-modal-card cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-start gap-4 mb-4 border-b border-accent/10 pb-3">
              <div>
                <span className="text-[9px] font-mono text-accent2 uppercase tracking-widest block font-bold">
                  {activeEntry.type.toUpperCase()} VIEWER
                </span>
                <h3 className="font-display font-bold text-lg text-textmain tracking-wide">
                  {activeEntry.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveEntry(null)}
                className="text-xs font-mono text-textdim hover:text-textmain cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Embed / Redirection Layer */}
            <div className="w-full flex flex-col lg:flex-row gap-6">
              
              {/* Left Column: Player Screen */}
              <div className="flex-grow w-full lg:max-w-2xl">
                {activeEntry.type === 'video' && activeEntry.videoId ? (
                  <div className="aspect-video w-full rounded border border-panel2 overflow-hidden bg-black shadow-inner">
                    <iframe
                      src={`https://www.youtube.com/embed/${activeEntry.videoId}`}
                      title={activeEntry.title}
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : activeEntry.type === 'playlist' && activeEntry.playlistId ? (
                  <div className="aspect-video w-full rounded border border-panel2 overflow-hidden bg-black shadow-inner">
                    <iframe
                      src={`https://www.youtube.com/embed/videoseries?list=${activeEntry.playlistId}`}
                      title={activeEntry.title}
                      className="w-full h-full border-none"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full rounded border border-dashed border-accent/25 flex flex-col items-center justify-center text-center p-6 bg-panel2/15 select-none">
                    <span className="text-4xl mb-2">🌐</span>
                    <span className="text-sm font-bold text-textmain">External Resource Link</span>
                    <p className="text-[10px] text-textdim mt-1.5 max-w-sm">
                      This element does not support inline embedding. Click the action button to redirect.
                    </p>
                    <a
                      href={activeEntry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-5 px-5 py-2 bg-accent/15 border border-accent/30 hover:bg-accent/25 text-accent text-xs font-mono font-bold rounded cursor-pointer transition-all inline-block"
                    >
                      Open Learning Resource ➔
                    </a>
                  </div>
                )}
              </div>

              {/* Right Column: Syllabus Checklist / Notes */}
              <div className="w-full lg:w-72 flex flex-col justify-between h-auto lg:h-[350px]">
                <div className="space-y-4 flex-grow overflow-y-auto pr-1">
                  
                  {/* Playlist syllabus units */}
                  {activeEntry.type === 'playlist' && (
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-accent uppercase tracking-widest block font-bold border-b border-accent/15 pb-1">
                        Syllabus Progress ({activeEntry.completedUnits}/{activeEntry.totalUnits})
                      </span>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto">
                        {subItems
                          .filter((s) => s.entryId === activeEntry.id)
                          .map((item, idx) => (
                            <div
                              key={item.id}
                              className={`flex items-center gap-2 p-1.5 rounded border text-[11px] select-none ${
                                item.watched
                                  ? 'bg-accent/5 border-accent/15 opacity-60'
                                  : 'bg-panel2/25 border-accent/5 hover:border-accent/15'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => toggleSubItemWatched(item.id)}
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center font-mono text-[8px] cursor-pointer transition-all shrink-0 ${
                                  item.watched
                                    ? 'bg-accent border-accent text-panel font-bold'
                                    : 'border-accent/30 text-transparent'
                                }`}
                              >
                                ✔
                              </button>
                              <span className={`truncate ${item.watched ? 'line-through text-textdim/50' : 'text-textmain'}`}>
                                {idx + 1}. {item.title}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Notes panel */}
                  {activeEntry.notes && (
                    <div className="space-y-1.5">
                      <span className="text-[9px] font-mono text-textdim uppercase tracking-widest block font-bold border-b border-accent/15 pb-1">
                        Archive Notes
                      </span>
                      <p className="text-[11px] text-textdim leading-relaxed h-28 overflow-y-auto pr-1">
                        {activeEntry.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Neumorphic Close action inside card modal */}
                <div className="border-t border-accent/5 pt-4 flex gap-3 mt-4">
                  {activeEntry.type !== 'link' && (
                    <a
                      href={activeEntry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 border border-accent/25 hover:border-accent/50 text-[10px] font-mono text-textdim hover:text-textmain py-2 rounded text-center uppercase tracking-wider"
                    >
                      Direct Link
                    </a>
                  )}
                  <button
                    onClick={() => setActiveEntry(null)}
                    className="flex-grow px-4 py-2 rounded text-xs font-mono font-bold uppercase tracking-wider neu-btn active:scale-95 cursor-pointer transition-all duration-300"
                  >
                    Close Viewer
                  </button>
                </div>
              </div>

            </div>
          </SystemPanel>
        </div>
      )}
    </div>
  );
};

export default CourseVault;
