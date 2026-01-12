import { SearchIcon, PlusIcon, StarIcon, GlobeIcon, categoryIcons, KeyIcon } from './Icons';
import type { PasswordEntry, Category } from '../types';
import '../styles/entry-list.css';

interface EntryListProps {
  entries: PasswordEntry[];
  categories: Category[];
  selectedEntry: PasswordEntry | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectEntry: (entry: PasswordEntry) => void;
  onAddEntry: () => void;
  title: string;
}

export function EntryList({
  entries,
  categories,
  selectedEntry,
  searchQuery,
  onSearchChange,
  onSelectEntry,
  onAddEntry,
  title,
}: EntryListProps) {
  const getCategoryColor = (categoryName: string): string => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.color || '#6366f1';
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    return categoryIcons[category?.icon || 'key'] || KeyIcon;
  };

  const formatUrl = (url: string | null): string => {
    if (!url) return '';
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      return parsed.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="entry-list">
      <div className="entry-list-header">
        <h2 className="entry-list-title">{title}</h2>
        <button className="btn btn-primary btn-sm" onClick={onAddEntry}>
          <PlusIcon size={16} />
          Add
        </button>
      </div>

      <div className="search-container">
        <div className="input-with-icon">
          <SearchIcon size={16} className="input-icon" />
          <input
            type="text"
            className="input"
            placeholder="Search passwords..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="entry-items">
        {entries.length === 0 ? (
          <div className="entry-empty">
            <KeyIcon size={32} className="entry-empty-icon" />
            <p>No passwords yet</p>
            <span>Click "Add" to create your first entry</span>
          </div>
        ) : (
          entries.map((entry) => {
            const Icon = getCategoryIcon(entry.category);
            const color = getCategoryColor(entry.category);

            return (
              <button
                key={entry.id}
                className={`entry-item ${selectedEntry?.id === entry.id ? 'active' : ''}`}
                onClick={() => onSelectEntry(entry)}
              >
                <div className="entry-icon" style={{ backgroundColor: `${color}20`, color }}>
                  <Icon size={18} />
                </div>
                <div className="entry-info">
                  <div className="entry-title">
                    {entry.title}
                    {entry.favorite && <StarIcon size={12} filled className="entry-favorite" />}
                  </div>
                  <div className="entry-meta">
                    <span className="entry-username">{entry.username}</span>
                    {entry.url && (
                      <>
                        <span className="entry-dot">·</span>
                        <span className="entry-url">
                          <GlobeIcon size={10} />
                          {formatUrl(entry.url)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
