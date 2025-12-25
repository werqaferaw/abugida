import React from 'react';
import './Header.css';

type View = 'library' | 'detail' | 'installed';

interface HeaderProps {
  user: { email: string };
  onLogout: () => void;
  currentView: View;
  onNavigate: (view: View) => void;
}

export function Header({ user, onLogout, currentView, onNavigate }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-left">
        <div className="header-logo">
          <span className="header-logo-text">አ</span>
        </div>
        <span className="header-title">Abugida</span>
      </div>

      <nav className="header-nav">
        <button
          className={`header-nav-item ${currentView === 'library' ? 'active' : ''}`}
          onClick={() => onNavigate('library')}
        >
          <svg className="header-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Library
        </button>
        <button
          className={`header-nav-item ${currentView === 'installed' ? 'active' : ''}`}
          onClick={() => onNavigate('installed')}
        >
          <svg className="header-nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="9" />
          </svg>
          Installed
        </button>
      </nav>

      <div className="header-right">
        <div className="header-user">
          <div className="header-user-avatar">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <span className="header-user-email">{user.email}</span>
        </div>
        <button className="header-logout" onClick={onLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16,17 21,12 16,7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </header>
  );
}




