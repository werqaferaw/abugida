import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { FontLibrary } from './components/FontLibrary';
import { FontDetail } from './components/FontDetail';
import { InstalledFonts } from './components/InstalledFonts';
import { Header } from './components/Header';
import './styles/App.css';

type View = 'library' | 'detail' | 'installed';

interface User {
  email: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<View>('library');
  const [selectedFontId, setSelectedFontId] = useState<string | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    window.electronAPI.auth.getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
  }, []);

  const handleLogin = async (email: string, password: string) => {
    const result = await window.electronAPI.auth.login(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  };

  const handleLogout = async () => {
    await window.electronAPI.auth.logout();
    setUser(null);
    setCurrentView('library');
    setSelectedFontId(null);
  };

  const handleSelectFont = (fontId: string) => {
    setSelectedFontId(fontId);
    setCurrentView('detail');
  };

  const handleBack = () => {
    setCurrentView('library');
    setSelectedFontId(null);
  };

  if (isLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app">
      {/* Removed custom header - using native Windows title bar and menu */}
      <div className="app-toolbar">
        <div className="toolbar-nav">
          <button
            className={`toolbar-btn ${currentView === 'library' ? 'active' : ''}`}
            onClick={() => setCurrentView('library')}
          >
            Library
          </button>
          <button
            className={`toolbar-btn ${currentView === 'installed' ? 'active' : ''}`}
            onClick={() => setCurrentView('installed')}
          >
            Installed
          </button>
        </div>
        <div className="toolbar-user">
          <span className="user-email">{user.email}</span>
          <button className="toolbar-btn" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>
      <main className="app-main">
        {currentView === 'library' && (
          <FontLibrary onSelectFont={handleSelectFont} />
        )}
        {currentView === 'detail' && selectedFontId && (
          <FontDetail fontId={selectedFontId} onBack={handleBack} />
        )}
        {currentView === 'installed' && (
          <InstalledFonts onSelectFont={handleSelectFont} />
        )}
      </main>
    </div>
  );
}

export default App;




