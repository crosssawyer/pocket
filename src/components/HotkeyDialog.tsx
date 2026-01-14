import { XIcon } from './Icons';
import '../styles/hotkey-dialog.css';

interface HotkeyDialogProps {
  onClose: () => void;
}

interface Hotkey {
  keys: string[];
  description: string;
}

interface HotkeySection {
  title: string;
  shortcuts: Hotkey[];
}

export function HotkeyDialog({ onClose }: HotkeyDialogProps) {
  const hotkeyGroups: HotkeySection[] = [
    {
      title: 'General',
      shortcuts: [
        { keys: ['Ctrl', '/'], description: 'Open hotkey dialog' },
        { keys: ['Ctrl', ','], description: 'Open settings' },
        { keys: ['Ctrl', 'L'], description: 'Lock vault' },
        { keys: ['Escape'], description: 'Close dialog' },
      ],
    },
    {
      title: 'Entries',
      shortcuts: [
        { keys: ['Ctrl', 'N'], description: 'Add new entry' },
        { keys: ['Ctrl', 'F'], description: 'Focus search field' },
        { keys: ['↑'], description: 'Select previous entry' },
        { keys: ['↓'], description: 'Select next entry' },
        { keys: ['Enter'], description: 'Edit selected entry' },
      ],
    },
    {
      title: 'Editing',
      shortcuts: [
        { keys: ['Ctrl', 'S'], description: 'Save entry' },
        { keys: ['Escape'], description: 'Cancel editing' },
        { keys: ['Tab'], description: 'Next field' },
        { keys: ['Shift', 'Tab'], description: 'Previous field' },
      ],
    },
    {
      title: 'Import/Export',
      shortcuts: [
        { keys: ['Ctrl', 'I'], description: 'Import passwords' },
        { keys: ['Ctrl', 'E'], description: 'Export passwords' },
      ],
    },
    {
      title: 'Dialog Navigation',
      shortcuts: [
        { keys: ['Tab'], description: 'Next control' },
        { keys: ['Shift', 'Tab'], description: 'Previous control' },
        { keys: ['Enter'], description: 'Confirm action' },
        { keys: ['Escape'], description: 'Cancel action' },
      ],
    },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal hotkey-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Keyboard Shortcuts</h3>
          <button
            className="btn btn-ghost btn-icon"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <XIcon size={18} />
          </button>
        </div>

        <div className="modal-body">
          {hotkeyGroups.map((group, index) => (
            <div key={index} className="hotkey-section">
              <h4 className="hotkey-section-title">{group.title}</h4>
              <div className="hotkey-list">
                {group.shortcuts.map((shortcut, idx) => (
                  <div key={idx} className="hotkey-item">
                    <div className="hotkey-keys">
                      {shortcut.keys.map((key, keyIdx) => (
                        <span key={keyIdx}>
                          <kbd className="hotkey-key">{key}</kbd>
                          {keyIdx < shortcut.keys.length - 1 && (
                            <span className="hotkey-plus">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <span className="hotkey-description">{shortcut.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="modal-footer">
          <button
            className="btn btn-primary"
            onClick={onClose}
            autoFocus
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
