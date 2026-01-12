import { XIcon, TrashIcon } from './Icons';
import '../styles/delete-confirm.css';

interface DeleteConfirmProps {
  title: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function DeleteConfirm({ title, onConfirm, onCancel, isLoading }: DeleteConfirmProps) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal delete-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Delete Password</h3>
          <button className="btn btn-ghost btn-icon" onClick={onCancel}>
            <XIcon size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div className="delete-icon-container">
            <TrashIcon size={32} />
          </div>
          <p className="delete-message">
            Are you sure you want to delete <strong>"{title}"</strong>?
          </p>
          <p className="delete-warning">This action cannot be undone.</p>
        </div>

        <div className="modal-footer">
          <button className="btn btn-glass" onClick={onCancel} disabled={isLoading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
