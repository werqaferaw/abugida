import React, { useState, useEffect } from 'react';
import { FontCard } from './FontCard';
import type { FontFamily } from '../types/electron';
import './FontLibrary.css';

interface FontLibraryProps {
  onSelectFont: (fontId: string) => void;
}

export function FontLibrary({ onSelectFont }: FontLibraryProps) {
  const [fonts, setFonts] = useState<FontFamily[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState('ሰላም ዓለም');

  useEffect(() => {
    loadFonts();
  }, []);

  const loadFonts = async () => {
    try {
      const fontList = await window.electronAPI.fonts.list();
      setFonts(fontList);
    } catch (err) {
      setError('Failed to load fonts');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="library-loading">
        <div className="loading-spinner" />
        <p>Loading fonts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="library-error">
        <p>{error}</p>
        <button onClick={loadFonts} className="library-retry">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="library">
      <div className="library-header">
        <div className="library-title-section">
          <h1 className="library-title">Font Library</h1>
          <p className="library-subtitle">{fonts.length} Amharic font{fonts.length !== 1 ? 's' : ''} available</p>
        </div>
        
        <div className="library-preview-input-wrapper">
          <label htmlFor="preview-text" className="library-preview-label">
            Preview text
          </label>
          <input
            id="preview-text"
            type="text"
            className="library-preview-input"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Type Amharic text..."
          />
        </div>
      </div>

      {fonts.length === 0 ? (
        <div className="library-empty">
          <div className="library-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7" />
              <path d="M3 7L12 13L21 7" />
              <path d="M3 7H21V5C21 3.89543 20.1046 3 19 3H5C3.89543 3 3 3.89543 3 5V7Z" />
            </svg>
          </div>
          <h2>No fonts available</h2>
          <p>Add fonts to the font repository to get started</p>
        </div>
      ) : (
        <div className="library-grid">
          {fonts.map((font) => (
            <FontCard
              key={font.id}
              font={font}
              previewText={previewText || font.sampleText}
              onClick={() => onSelectFont(font.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}









