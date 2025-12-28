import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { FontLibrary } from './components/FontLibrary';
import { FontDetail } from './components/FontDetail';
import { ActivatedFonts } from './components/ActivatedFonts';
import { ErrorBoundary } from './components/ErrorBoundary';
import './styles/App.css';

type View = 'library' | 'detail' | 'activated';

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

  const handleGuestLogin = async () => {
    const result = await window.electronAPI.auth.loginAsGuest();
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
    return <LoginScreen onLogin={handleLogin} onGuestLogin={handleGuestLogin} />;
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
            className={`toolbar-btn ${currentView === 'activated' ? 'active' : ''}`}
            onClick={() => setCurrentView('activated')}
          >
            Activated
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
        <ErrorBoundary>
          {currentView === 'library' && (
            <FontLibrary onSelectFont={handleSelectFont} />
          )}
          {currentView === 'detail' && selectedFontId && (
            <FontDetail fontId={selectedFontId} onBack={handleBack} />
          )}
          {currentView === 'activated' && (
            <ActivatedFonts onSelectFont={handleSelectFont} />
          )}
        </ErrorBoundary>
      </main>
    </div>
  );
}

export default App;




