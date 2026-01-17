import { useState } from 'react';
import { XIcon, AlertIcon, TrashIcon, KeyIcon, EyeIcon, EyeOffIcon, CheckIcon } from './Icons';
import '../styles/settings-dialog.css';

interface SettingsDialogProps {
  onClearAll: () => Promise<boolean>;
  onChangeMasterPassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  onClose: () => void;
  isLoading: boolean;
}

export function SettingsDialog({ onClearAll, onChangeMasterPassword, onClose, isLoading }: SettingsDialogProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleClearAll = async () => {
    const success = await onClearAll();
    if (success) {
      setShowConfirm(false);
      onClose();
    }
  };

  const resetPasswordForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordSuccess(false);
    setShowCurrentPassword(false);
    setShowNewPassword(false);
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    const success = await onChangeMasterPassword(currentPassword, newPassword);
    if (success) {
      setPasswordSuccess(true);
      setTimeout(() => {
        resetPasswordForm();
        setShowPasswordChange(false);
      }, 1500);
    } else {
      setPasswordError('Current password is incorrect');
    }
  };

  const handleBack = () => {
    if (showConfirm) {
      setShowConfirm(false);
    } else if (showPasswordChange) {
      resetPasswordForm();
      setShowPasswordChange(false);
    }
  };

  const showMainSettings = !showConfirm && !showPasswordChange;

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
          {showMainSettings && (
            <>
              <div className="settings-section">
                <h4 className="settings-section-title">Security</h4>
                <div className="settings-item">
                  <div className="settings-item-info">
                    <div className="settings-item-title">Change Master Password</div>
                    <div className="settings-item-description">
                      Update your master password. You'll need to enter your current password to confirm.
                    </div>
                  </div>
                  <button
                    className="btn btn-glass"
                    onClick={() => setShowPasswordChange(true)}
                    disabled={isLoading}
                  >
                    <KeyIcon size={18} />
                    Change
                  </button>
                </div>
              </div>

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
          )}

          {showPasswordChange && (
            <div className="settings-password-change">
              {passwordSuccess ? (
                <div className="settings-success">
                  <div className="settings-success-icon">
                    <CheckIcon size={48} />
                  </div>
                  <h4 className="settings-success-title">Password Changed!</h4>
                  <p className="settings-success-text">
                    Your master password has been updated successfully.
                  </p>
                </div>
              ) : (
                <>
                  <h4 className="settings-section-title">Change Master Password</h4>

                  <div className="settings-form">
                    <div className="form-group">
                      <label className="form-label">Current Password</label>
                      <div className="input-with-toggle">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          className="form-input"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Enter current password"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="input-toggle"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <div className="input-with-toggle">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className="form-input"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Enter new password (min 8 characters)"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          className="input-toggle"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Confirm New Password</label>
                      <div className="input-with-toggle">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          className="form-input"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    {passwordError && (
                      <div className="settings-error">
                        <AlertIcon size={16} />
                        {passwordError}
                      </div>
                    )}
                  </div>

                  <div className="settings-confirm-actions">
                    <button
                      className="btn btn-glass"
                      onClick={handleBack}
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleChangePassword}
                      disabled={isLoading || !currentPassword || !newPassword || !confirmPassword}
                    >
                      <KeyIcon size={18} />
                      {isLoading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {showConfirm && (
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
                  onClick={handleBack}
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

        {showMainSettings && (
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
