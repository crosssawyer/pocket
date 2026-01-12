import { KeyIcon, StarIcon, LockIcon, categoryIcons } from './Icons';
import type { Category, ViewMode } from '../types';
import '../styles/sidebar.css';

interface SidebarProps {
  categories: Category[];
  viewMode: ViewMode;
  selectedCategory: string | null;
  onViewChange: (mode: ViewMode, category?: string) => void;
  onLock: () => void;
  entryCounts: { all: number; favorites: number; byCategory: Record<string, number> };
}

export function Sidebar({
  categories,
  viewMode,
  selectedCategory,
  onViewChange,
  onLock,
  entryCounts,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <KeyIcon size={20} />
          <span>Pocket</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <button
            className={`nav-item ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => onViewChange('all')}
          >
            <KeyIcon size={18} />
            <span>All Passwords</span>
            <span className="nav-count">{entryCounts.all}</span>
          </button>

          <button
            className={`nav-item ${viewMode === 'favorites' ? 'active' : ''}`}
            onClick={() => onViewChange('favorites')}
          >
            <StarIcon size={18} filled={viewMode === 'favorites'} />
            <span>Favorites</span>
            <span className="nav-count">{entryCounts.favorites}</span>
          </button>
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Categories</div>
          {categories.map((category) => {
            const Icon = categoryIcons[category.icon] || KeyIcon;
            const isActive = viewMode === 'category' && selectedCategory === category.name;
            const count = entryCounts.byCategory[category.name] || 0;

            return (
              <button
                key={category.name}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => onViewChange('category', category.name)}
              >
                <span className="nav-icon" style={{ color: category.color }}>
                  <Icon size={18} />
                </span>
                <span>{category.name}</span>
                <span className="nav-count">{count}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item lock-button" onClick={onLock}>
          <LockIcon size={18} />
          <span>Lock Vault</span>
        </button>
      </div>
    </aside>
  );
}
