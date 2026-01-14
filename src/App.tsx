import { useState, useEffect, useCallback, useMemo } from 'react';
import { LockScreen } from './components/LockScreen';
import { Sidebar } from './components/Sidebar';
import { EntryList } from './components/EntryList';
import { EntryDetail } from './components/EntryDetail';
import { EntryForm } from './components/EntryForm';
import { DeleteConfirm } from './components/DeleteConfirm';
import { HotkeyDialog } from './components/HotkeyDialog';
import { ImportDialog } from './components/ImportDialog';
import { ExportDialog } from './components/ExportDialog';
import { useVault } from './hooks/useVault';
import type { PasswordEntry, Category, ViewMode, EntryInput, UpdateEntryInput } from './types';
import './styles/global.css';
import './styles/components.css';
import './styles/app.css';

type AppState = 'loading' | 'locked' | 'unlocked';

export default function App() {
  const vault = useVault();

  const [appState, setAppState] = useState<AppState>('loading');
  const [vaultExists, setVaultExists] = useState(false);
  const [entries, setEntries] = useState<PasswordEntry[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<PasswordEntry | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<PasswordEntry | null>(null);
  const [deleteEntry, setDeleteEntry] = useState<PasswordEntry | null>(null);
  const [showHotkeyDialog, setShowHotkeyDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Initialize app
  useEffect(() => {
    const init = async () => {
      const exists = await vault.vaultExists();
      setVaultExists(exists);

      const unlocked = await vault.isUnlocked();
      setAppState(unlocked ? 'unlocked' : 'locked');
    };
    init();
  }, [vault]);

  // Load data when unlocked
  useEffect(() => {
    if (appState === 'unlocked') {
      loadData();
    }
  }, [appState]);

  const loadData = async () => {
    const [entriesData, categoriesData] = await Promise.all([
      vault.getEntries(),
      vault.getCategories(),
    ]);
    setEntries(entriesData);
    setCategories(categoriesData);
  };

  // Filter entries based on view mode and search
  const filteredEntries = useMemo(() => {
    let result = entries;

    if (viewMode === 'favorites') {
      result = result.filter((e) => e.favorite);
    } else if (viewMode === 'category' && selectedCategory) {
      result = result.filter((e) => e.category === selectedCategory);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.username.toLowerCase().includes(query) ||
          e.url?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [entries, viewMode, selectedCategory, searchQuery]);

  // Entry counts for sidebar
  const entryCounts = useMemo(() => {
    const byCategory: Record<string, number> = {};
    let favorites = 0;

    entries.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + 1;
      if (e.favorite) favorites++;
    });

    return {
      all: entries.length,
      favorites,
      byCategory,
    };
  }, [entries]);

  // Get view title
  const viewTitle = useMemo(() => {
    if (viewMode === 'favorites') return 'Favorites';
    if (viewMode === 'category' && selectedCategory) return selectedCategory;
    return 'All Passwords';
  }, [viewMode, selectedCategory]);

  // Handlers
  const handleUnlock = async (password: string): Promise<boolean> => {
    const success = await vault.unlock(password);
    if (success) {
      setAppState('unlocked');
    }
    return success;
  };

  const handleCreate = async (password: string): Promise<boolean> => {
    const success = await vault.createVault(password);
    if (success) {
      setVaultExists(true);
      setAppState('unlocked');
    }
    return success;
  };

  const handleLock = useCallback(async () => {
    await vault.lock();
    setAppState('locked');
    setEntries([]);
    setSelectedEntry(null);
    setSearchQuery('');
  }, [vault]);

  const handleViewChange = (mode: ViewMode, category?: string) => {
    setViewMode(mode);
    setSelectedCategory(category || null);
    setSelectedEntry(null);
  };

  const handleSelectEntry = (entry: PasswordEntry) => {
    setSelectedEntry(entry);
  };

  const handleAddEntry = () => {
    setEditingEntry(null);
    setShowForm(true);
  };

  const handleEditEntry = (entry: PasswordEntry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleSaveEntry = async (data: EntryInput | UpdateEntryInput) => {
    let result: PasswordEntry | null;

    if ('id' in data) {
      result = await vault.updateEntry(data);
    } else {
      result = await vault.addEntry(data);
    }

    if (result) {
      await loadData();
      setSelectedEntry(result);
      setShowForm(false);
      setEditingEntry(null);
    }
  };

  const handleDeleteEntry = (id: string) => {
    const entry = entries.find((e) => e.id === id);
    if (entry) {
      setDeleteEntry(entry);
    }
  };

  const confirmDelete = async () => {
    if (deleteEntry) {
      const success = await vault.deleteEntry(deleteEntry.id);
      if (success) {
        await loadData();
        if (selectedEntry?.id === deleteEntry.id) {
          setSelectedEntry(null);
        }
        setDeleteEntry(null);
      }
    }
  };

  const handleToggleFavorite = async (id: string) => {
    const result = await vault.toggleFavorite(id);
    if (result) {
      setEntries((prev) => prev.map((e) => (e.id === id ? result : e)));
      if (selectedEntry?.id === id) {
        setSelectedEntry(result);
      }
    }
  };

  const handleImport = async (csvContent: string) => {
    const result = await vault.importPasswords(csvContent);
    if (result.imported_count > 0) {
      await loadData();
    }
    return result;
  };

  const handleExport = async () => {
    return await vault.exportPasswords();
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore shortcuts when typing in input fields (except for specific shortcuts)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

      // Ctrl+/ or ? - Open hotkey dialog (works in all states)
      if ((e.ctrlKey && e.key === '/') || (e.shiftKey && e.key === '?')) {
        e.preventDefault();
        setShowHotkeyDialog(true);
        return;
      }

      // Ctrl+S - Save entry form (when form is open)
      if (e.ctrlKey && e.key === 's' && showForm) {
        e.preventDefault();
        const saveButton = document.querySelector('.entry-form-modal .btn-primary') as HTMLButtonElement;
        if (saveButton) {
          saveButton.click();
        }
        return;
      }

      // Only handle other shortcuts when unlocked
      if (appState !== 'unlocked') return;

      // Ctrl+L - Lock vault
      if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        handleLock();
        return;
      }

      // Ctrl+N - Add new entry (only when no modal is open)
      if (e.ctrlKey && e.key === 'n' && !showForm && !deleteEntry && !showHotkeyDialog && !showImportDialog && !showExportDialog) {
        e.preventDefault();
        handleAddEntry();
        return;
      }

      // Ctrl+I - Import passwords
      if (e.ctrlKey && e.key === 'i' && !showForm && !deleteEntry && !showHotkeyDialog && !showImportDialog && !showExportDialog) {
        e.preventDefault();
        setShowImportDialog(true);
        return;
      }

      // Ctrl+E - Export passwords
      if (e.ctrlKey && e.key === 'e' && !showForm && !deleteEntry && !showHotkeyDialog && !showImportDialog && !showExportDialog) {
        e.preventDefault();
        setShowExportDialog(true);
        return;
      }

      // Ctrl+F - Focus search (only when not in input field)
      if (e.ctrlKey && e.key === 'f' && !isInput) {
        e.preventDefault();
        const searchInput = document.querySelector('.search-container .input') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }

      // Arrow keys and Enter - Navigate entry list (when no modal is open and not typing)
      if (!showForm && !deleteEntry && !showHotkeyDialog && !isInput) {
        // Arrow Down - Select next entry
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          const currentIndex = selectedEntry
            ? filteredEntries.findIndex(entry => entry.id === selectedEntry.id)
            : -1;
          const nextIndex = Math.min(currentIndex + 1, filteredEntries.length - 1);
          if (nextIndex >= 0 && filteredEntries[nextIndex]) {
            handleSelectEntry(filteredEntries[nextIndex]);
          }
          return;
        }

        // Arrow Up - Select previous entry
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          const currentIndex = selectedEntry
            ? filteredEntries.findIndex(entry => entry.id === selectedEntry.id)
            : -1;
          const prevIndex = Math.max(currentIndex - 1, 0);
          if (prevIndex >= 0 && filteredEntries[prevIndex]) {
            handleSelectEntry(filteredEntries[prevIndex]);
          }
          return;
        }

        // Enter - Open selected entry for editing (if one is selected)
        if (e.key === 'Enter' && selectedEntry) {
          e.preventDefault();
          handleEditEntry(selectedEntry);
          return;
        }
      }

      // Escape - Close any open modal
      if (e.key === 'Escape') {
        if (showHotkeyDialog) {
          setShowHotkeyDialog(false);
        } else if (showImportDialog) {
          setShowImportDialog(false);
        } else if (showExportDialog) {
          setShowExportDialog(false);
        } else if (showForm) {
          setShowForm(false);
          setEditingEntry(null);
        } else if (deleteEntry) {
          setDeleteEntry(null);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, showForm, deleteEntry, showHotkeyDialog, showImportDialog, showExportDialog, handleLock, filteredEntries, selectedEntry]);

  // Render loading state
  if (appState === 'loading') {
    return (
      <div className="app" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="loading-dots">
          <span>.</span><span>.</span><span>.</span>
        </div>
      </div>
    );
  }

  // Render lock screen
  if (appState === 'locked') {
    return (
      <div className="app">
        <LockScreen
          vaultExists={vaultExists}
          onUnlock={handleUnlock}
          onCreate={handleCreate}
          isLoading={vault.isLoading}
          error={vault.error}
        />
      </div>
    );
  }

  // Render main app
  return (
    <div className="app">
      <Sidebar
        categories={categories}
        viewMode={viewMode}
        selectedCategory={selectedCategory}
        onViewChange={handleViewChange}
        onLock={handleLock}
        entryCounts={entryCounts}
        onImport={() => setShowImportDialog(true)}
        onExport={() => setShowExportDialog(true)}
      />

      <main className="app-main">
        <EntryList
          entries={filteredEntries}
          categories={categories}
          selectedEntry={selectedEntry}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectEntry={handleSelectEntry}
          onAddEntry={handleAddEntry}
          title={viewTitle}
        />

        <EntryDetail
          entry={selectedEntry}
          categories={categories}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
          onToggleFavorite={handleToggleFavorite}
        />
      </main>

      {showForm && (
        <EntryForm
          entry={editingEntry}
          categories={categories}
          onSave={handleSaveEntry}
          onCancel={() => {
            setShowForm(false);
            setEditingEntry(null);
          }}
          onGeneratePassword={vault.generatePassword}
          isLoading={vault.isLoading}
        />
      )}

      {deleteEntry && (
        <DeleteConfirm
          title={deleteEntry.title}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteEntry(null)}
          isLoading={vault.isLoading}
        />
      )}

      {showHotkeyDialog && (
        <HotkeyDialog onClose={() => setShowHotkeyDialog(false)} />
      )}

      {showImportDialog && (
        <ImportDialog
          onImport={handleImport}
          onClose={() => setShowImportDialog(false)}
          isLoading={vault.isLoading}
        />
      )}

      {showExportDialog && (
        <ExportDialog
          onExport={handleExport}
          onClose={() => setShowExportDialog(false)}
          isLoading={vault.isLoading}
        />
      )}
    </div>
  );
}
