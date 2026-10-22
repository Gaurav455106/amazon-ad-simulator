import { useState } from 'react';
import { useStore, getUsers } from '../../store/useStore';

/** Simulator-only: each trainee gets an isolated account with its own campaigns. */
export default function UserSwitchModal({ onClose }) {
  const switchUser = useStore(s => s.switchUser);
  const currentUserName = useStore(s => s.currentUserName);
  const [newUserName, setNewUserName] = useState('');

  const createAndSwitch = () => {
    const name = newUserName.trim();
    if (!name) return;
    switchUser(name);
    setNewUserName('');
    onClose();
  };

  return (
    <div className="user-switch-overlay" onClick={onClose}>
      <div className="user-switch-modal" onClick={e => e.stopPropagation()}>
        <div className="user-switch-header">
          <div>
            <h3 style={{ fontSize: 17, fontWeight: 700 }}>Switch account</h3>
            <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>Each account has its own campaigns, products and settings.</p>
          </div>
          <button type="button" className="user-switch-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="user-switch-body">
          <p className="user-switch-label">Accounts</p>
          <div className="user-switch-list">
            {getUsers().map(user => (
              <button
                type="button"
                key={user}
                className={`user-switch-item ${currentUserName === user ? 'active' : ''}`}
                onClick={() => { if (currentUserName !== user) switchUser(user); onClose(); }}
              >
                <div className="user-switch-avatar">{user[0].toUpperCase()}</div>
                <span style={{ fontSize: 14 }}>{user}</span>
                {currentUserName === user && <span className="user-switch-badge">Active</span>}
              </button>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #eee', paddingTop: 16, marginTop: 4 }}>
            <p className="user-switch-label">Add new account</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="text"
                className="user-switch-inp"
                placeholder="Account name (e.g. Trainee B)"
                value={newUserName}
                onChange={e => setNewUserName(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') createAndSwitch(); }}
              />
              <button type="button" className="user-switch-create-btn" disabled={!newUserName.trim()} onClick={createAndSwitch}>
                Create &amp; switch
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
