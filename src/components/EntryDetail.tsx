import { useState } from 'react';
import {
  CopyIcon,
  EditIcon,
  TrashIcon,
  StarIcon,
  EyeIcon,
  EyeOffIcon,
  GlobeIcon,
  CheckIcon,
  categoryIcons,
  KeyIcon,
} from './Icons';
import type { PasswordEntry, Category } from '../types';
import '../styles/entry-detail.css';

interface EntryDetailProps {
  entry: PasswordEntry | null;
  categories: Category[];
  onEdit: (entry: PasswordEntry) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export function EntryDetail({
  entry,
  categories,
  onEdit,
  onDelete,
  onToggleFavorite,
}: EntryDetailProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!entry) {
    return (
      <div className="entry-detail empty">
        <div className="detail-empty-state">
          <KeyIcon size={48} className="detail-empty-icon" />
          <p>Select a password to view details</p>
        </div>
      </div>
    );
  }

  const getCategoryColor = (categoryName: string): string => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.color || '#6366f1';
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    return categoryIcons[category?.icon || 'key'] || KeyIcon;
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const Icon = getCategoryIcon(entry.category);
  const color = getCategoryColor(entry.category);

  return (
    <div className="entry-detail">
      <div className="detail-header">
        <div className="detail-icon" style={{ backgroundColor: `${color}20`, color }}>
          <Icon size={24} />
        </div>
        <div className="detail-title-section">
          <h2 className="detail-title">{entry.title}</h2>
          <span className="detail-category" style={{ color }}>
            {entry.category}
          </span>
        </div>
        <div className="detail-actions">
          <button
            className={`btn btn-ghost btn-icon ${entry.favorite ? 'active' : ''}`}
            onClick={() => onToggleFavorite(entry.id)}
            title={entry.favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <StarIcon size={18} filled={entry.favorite} />
          </button>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => onEdit(entry)}
            title="Edit"
          >
            <EditIcon size={18} />
          </button>
          <button
            className="btn btn-ghost btn-icon danger"
            onClick={() => onDelete(entry.id)}
            title="Delete"
          >
            <TrashIcon size={18} />
          </button>
        </div>
      </div>

      <div className="detail-fields">
        <div className="detail-field">
          <label>Username</label>
          <div className="detail-field-value">
            <span>{entry.username}</span>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={() => copyToClipboard(entry.username, 'username')}
            >
              {copiedField === 'username' ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
            </button>
          </div>
        </div>

        <div className="detail-field">
          <label>Password</label>
          <div className="detail-field-value">
            <span className={showPassword ? '' : 'password-hidden'}>
              {showPassword ? entry.password : '••••••••••••'}
            </span>
            <div className="detail-field-actions">
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOffIcon size={14} /> : <EyeIcon size={14} />}
              </button>
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => copyToClipboard(entry.password, 'password')}
              >
                {copiedField === 'password' ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              </button>
            </div>
          </div>
        </div>

        {entry.url && (
          <div className="detail-field">
            <label>Website</label>
            <div className="detail-field-value">
              <span className="detail-url">
                <GlobeIcon size={14} />
                {entry.url}
              </span>
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => copyToClipboard(entry.url!, 'url')}
              >
                {copiedField === 'url' ? <CheckIcon size={14} /> : <CopyIcon size={14} />}
              </button>
            </div>
          </div>
        )}

        {entry.notes && (
          <div className="detail-field">
            <label>Notes</label>
            <div className="detail-notes">{entry.notes}</div>
          </div>
        )}
      </div>

      <div className="detail-meta">
        <span>Created {formatDate(entry.created_at)}</span>
        <span>·</span>
        <span>Modified {formatDate(entry.updated_at)}</span>
      </div>
    </div>
  );
}
