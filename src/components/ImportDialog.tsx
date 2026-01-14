import { useState } from 'react';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { XIcon, UploadIcon, CheckIcon, AlertIcon } from './Icons';
import type { ImportResult } from '../types';
import '../styles/import-dialog.css';

interface ImportDialogProps {
  onImport: (csvContent: string) => Promise<ImportResult>;
  onClose: () => void;
  isLoading: boolean;
}

type ImportState = 'select' | 'importing' | 'complete';

export function ImportDialog({ onImport, onClose, isLoading }: ImportDialogProps) {
  const [importState, setImportState] = useState<ImportState>('select');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelectFile = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'CSV',
          extensions: ['csv']
        }]
      });

      if (!selected || typeof selected !== 'string') {
        return;
      }

      setImportState('importing');
      setError(null);

      // Read file content
      const content = await readTextFile(selected);

      // Validate CSV format (check for header)
      if (!content.toLowerCase().startsWith('name,url,username,password')) {
        throw new Error('Invalid CSV format. Expected Chrome/Edge format with columns: name, url, username, password');
      }

      // Import
      const importResult = await onImport(content);
      setResult(importResult);
      setImportState('complete');

    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setImportState('select');
    }
  };

  const handleClose = () => {
    if (importState === 'complete' && result && result.imported_count > 0) {
      // Reload is needed, signal to parent
      onClose();
      window.location.reload();
    } else {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal import-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Import Passwords</h3>
          <button className="btn btn-ghost btn-icon" onClick={handleClose}>
            <XIcon size={18} />
          </button>
        </div>

        <div className="modal-body">
          {importState === 'select' && (
            <>
              <div className="import-instructions">
                <p>Import passwords from Chrome or Edge:</p>
                <ol>
                  <li>Open Chrome/Edge Settings</li>
                  <li>Go to Passwords → Export Passwords</li>
                  <li>Save as CSV file</li>
                  <li>Select the file below</li>
                </ol>
              </div>

              {error && (
                <div className="import-error">
                  <AlertIcon size={16} />
                  <span>{error}</span>
                </div>
              )}

              <button
                className="btn btn-primary import-select-btn"
                onClick={handleSelectFile}
                disabled={isLoading}
              >
                <UploadIcon size={18} />
                Select CSV File
              </button>
            </>
          )}

          {importState === 'importing' && (
            <div className="import-progress">
              <div className="loading-spinner" />
              <p>Importing passwords...</p>
            </div>
          )}

          {importState === 'complete' && result && (
            <div className="import-result">
              <div className="import-success">
                <CheckIcon size={32} />
                <h4>Import Complete</h4>
              </div>

              <div className="import-stats">
                <div className="stat-item">
                  <span className="stat-value">{result.imported_count}</span>
                  <span className="stat-label">Imported</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{result.skipped_count}</span>
                  <span className="stat-label">Skipped</span>
                </div>
              </div>

              {result.skipped_entries.length > 0 && (
                <div className="skipped-list">
                  <h5>Skipped Entries:</h5>
                  <div className="skipped-items">
                    {result.skipped_entries.map((entry, idx) => (
                      <div key={idx} className="skipped-item">
                        <div className="skipped-info">
                          <strong>{entry.title}</strong>
                          <span className="skipped-username">{entry.username}</span>
                        </div>
                        <span className="skipped-reason">{entry.reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          {importState === 'select' && (
            <button className="btn btn-glass" onClick={handleClose}>
              Cancel
            </button>
          )}
          {importState === 'complete' && (
            <button className="btn btn-primary" onClick={handleClose}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
