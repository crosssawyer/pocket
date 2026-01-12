import { useState, useEffect } from 'react';
import {
  XIcon,
  EyeIcon,
  EyeOffIcon,
  RefreshIcon,
  StarIcon,
} from './Icons';
import type { PasswordEntry, Category, EntryInput, UpdateEntryInput } from '../types';
import '../styles/entry-form.css';

interface EntryFormProps {
  entry: PasswordEntry | null;
  categories: Category[];
  onSave: (entry: EntryInput | UpdateEntryInput) => Promise<void>;
  onCancel: () => void;
  onGeneratePassword: (length: number, includeSymbols: boolean) => Promise<string>;
  isLoading: boolean;
}

export function EntryForm({
  entry,
  categories,
  onSave,
  onCancel,
  onGeneratePassword,
  isLoading,
}: EntryFormProps) {
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [category, setCategory] = useState('Login');
  const [favorite, setFavorite] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLength, setPasswordLength] = useState(16);
  const [includeSymbols, setIncludeSymbols] = useState(true);

  useEffect(() => {
    if (entry) {
      setTitle(entry.title);
      setUsername(entry.username);
      setPassword(entry.password);
      setUrl(entry.url || '');
      setNotes(entry.notes || '');
      setCategory(entry.category);
      setFavorite(entry.favorite);
    }
  }, [entry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: EntryInput | UpdateEntryInput = {
      ...(entry && { id: entry.id }),
      title,
      username,
      password,
      url: url || null,
      notes: notes || null,
      category,
      favorite,
    };

    await onSave(data);
  };

  const handleGeneratePassword = async () => {
    const generated = await onGeneratePassword(passwordLength, includeSymbols);
    setPassword(generated);
    setShowPassword(true);
  };

  const isEditing = !!entry;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal entry-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{isEditing ? 'Edit Password' : 'Add Password'}</h3>
          <button className="btn btn-ghost btn-icon" onClick={onCancel}>
            <XIcon size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-grid">
              <div className="input-group">
                <label className="input-label">Title</label>
                <input
                  type="text"
                  className="input"
                  placeholder="e.g., Google Account"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div className="input-group">
                <label className="input-label">Category</label>
                <select
                  className="select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat.name} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Username / Email</label>
              <input
                type="text"
                className="input"
                placeholder="your@email.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <div className="password-input-wrapper">
                <div className="input-with-action">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon input-action"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="password-generator">
              <div className="generator-controls">
                <div className="generator-length">
                  <label>Length: {passwordLength}</label>
                  <input
                    type="range"
                    min="8"
                    max="32"
                    value={passwordLength}
                    onChange={(e) => setPasswordLength(Number(e.target.value))}
                  />
                </div>
                <label className="toggle-label">
                  <span>Symbols</span>
                  <label className="toggle">
                    <input
                      type="checkbox"
                      checked={includeSymbols}
                      onChange={(e) => setIncludeSymbols(e.target.checked)}
                    />
                    <span className="toggle-slider" />
                  </label>
                </label>
              </div>
              <button
                type="button"
                className="btn btn-glass btn-sm"
                onClick={handleGeneratePassword}
              >
                <RefreshIcon size={14} />
                Generate
              </button>
            </div>

            <div className="input-group">
              <label className="input-label">Website (optional)</label>
              <input
                type="text"
                className="input"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Notes (optional)</label>
              <textarea
                className="textarea"
                placeholder="Additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <label className="favorite-toggle">
              <button
                type="button"
                className={`btn btn-ghost btn-icon ${favorite ? 'active' : ''}`}
                onClick={() => setFavorite(!favorite)}
              >
                <StarIcon size={18} filled={favorite} />
              </button>
              <span>Add to favorites</span>
            </label>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-glass" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !title || !username || !password}
            >
              {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
