import { useState } from 'react';
import { ShieldIcon, EyeIcon, EyeOffIcon, LockIcon, KeyIcon } from './Icons';
import '../styles/lock-screen.css';

interface LockScreenProps {
  vaultExists: boolean;
  onUnlock: (password: string) => Promise<boolean>;
  onCreate: (password: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export function LockScreen({ vaultExists, onUnlock, onCreate, isLoading, error }: LockScreenProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    if (!vaultExists) {
      if (password.length < 8) {
        setLocalError('Password must be at least 8 characters');
        return;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }
      await onCreate(password);
    } else {
      await onUnlock(password);
    }
  };

  return (
    <div className="lock-screen">
      <div className="lock-content">
        <div className="lock-icon-container">
          <div className="lock-icon-glow" />
          <ShieldIcon size={48} className="lock-icon" />
        </div>

        <h1 className="lock-title">Pocket</h1>
        <p className="lock-subtitle">
          {vaultExists ? 'Enter your master password' : 'Create your secure vault'}
        </p>

        <form onSubmit={handleSubmit} className="lock-form">
          <div className="input-group">
            <div className="input-with-icon input-with-action">
              <LockIcon size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                className="input"
                placeholder="Master password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
                disabled={isLoading}
              />
              <button
                type="button"
                className="btn btn-ghost btn-icon input-action"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            </div>
          </div>

          {!vaultExists && (
            <div className="input-group">
              <div className="input-with-icon">
                <KeyIcon size={18} className="input-icon" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {(error || localError) && (
            <div className="lock-error">{localError || error}</div>
          )}

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={isLoading || !password}
          >
            {isLoading ? (
              <span className="loading-dots">
                <span>.</span><span>.</span><span>.</span>
              </span>
            ) : vaultExists ? (
              'Unlock Vault'
            ) : (
              'Create Vault'
            )}
          </button>
        </form>

        {!vaultExists && (
          <p className="lock-hint">
            Your master password encrypts all your data locally. Choose a strong password you can remember.
          </p>
        )}
      </div>
    </div>
  );
}
