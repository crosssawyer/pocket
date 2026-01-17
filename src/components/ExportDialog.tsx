import { useState } from 'react';
import { save } from '@tauri-apps/plugin-dialog';
import { writeTextFile } from '@tauri-apps/plugin-fs';
import { XIcon, DownloadIcon, AlertIcon } from './Icons';
import '../styles/export-dialog.css';

interface ExportDialogProps {
  onExport: () => Promise<string>;
  onClose: () => void;
  isLoading: boolean;
}

export function ExportDialog({ onExport, onClose, isLoading }: ExportDialogProps) {
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setError(null);

      // Get CSV content from backend
      const csvContent = await onExport();

      // Prompt user for save location
      const filePath = await save({
        defaultPath: `pocket-passwords-${new Date().toISOString().split('T')[0]}.csv`,
        filters: [{
          name: 'CSV',
          extensions: ['csv']
        }]
      });

      if (!filePath) {
        return; // User cancelled
      }

      // Write file
      await writeTextFile(filePath, csvContent);

      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal export-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Export Passwords</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="export-warning">
            <AlertIcon size={24} />
            <p>
              <strong>Security Warning:</strong> The exported file will contain your passwords in plain text.
              Keep it secure and delete it after importing to another password manager.
            </p>
          </div>

          {error && (
            <div className="export-error">
              <AlertIcon size={16} />
              <span>{error}</span>
            </div>
          )}

          <div className="export-info">
            <p>Passwords will be exported in Chrome/Edge CSV format:</p>
            <ul>
              <li>Compatible with Chrome, Edge, and other browsers</li>
              <li>Contains: name, url, username, password</li>
            </ul>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-glass" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleExport}
            disabled={isLoading}
          >
            <DownloadIcon size={18} />
            {isLoading ? 'Exporting...' : 'Export'}
          </button>
        </div>
      </div>
    </div>
  );
}
