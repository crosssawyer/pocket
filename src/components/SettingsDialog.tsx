import { useState } from 'react';
import { XIcon, AlertIcon, TrashIcon } from './Icons';
import '../styles/settings-dialog.css';

interface SettingsDialogProps {
  onClearAll: () => Promise<boolean>;
  onClose: () => void;
  isLoading: boolean;
}

export function SettingsDialog({ onClearAll, onClose, isLoading }: SettingsDialogProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClearAll = async () => {
    const success = await onClearAll();
    if (success) {
      setShowConfirm(false);
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Settings</h3>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <XIcon size={18} />
          </button>
        </div>

        <div className="modal-body">
          {!showConfirm ? (
            <>
              <div className="settings-section">
                <h4 className="settings-section-title">Data Management</h4>
                <div className="settings-item">
                  <div className="settings-item-info">
                    <div className="settings-item-title">Clear All Passwords</div>
                    <div className="settings-item-description">
                      Permanently delete all password entries from your vault. This action cannot be undone.
                    </div>
                  </div>
                  <button
                    className="btn btn-danger"
                    onClick={() => setShowConfirm(true)}
                    disabled={isLoading}
                  >
                    <TrashIcon size={18} />
                    Clear All
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="settings-confirm">
              <div className="settings-confirm-icon">
                <AlertIcon size={48} />
              </div>
              <h4 className="settings-confirm-title">Clear All Passwords?</h4>
              <p className="settings-confirm-text">
                This will permanently delete all password entries from your vault.
                This action cannot be undone. Are you sure you want to continue?
              </p>
              <div className="settings-confirm-actions">
                <button
                  className="btn btn-glass"
                  onClick={() => setShowConfirm(false)}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleClearAll}
                  disabled={isLoading}
                >
                  <TrashIcon size={18} />
                  {isLoading ? 'Clearing...' : 'Yes, Clear All'}
                </button>
              </div>
            </div>
          )}
        </div>

        {!showConfirm && (
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
