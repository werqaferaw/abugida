import React, { useState, useEffect, useCallback } from 'react';
import type { FontFamily } from '../types/electron';
import './FontDetail.css';

interface FontDetailProps {
  fontId: string;
  onBack: () => void;
}

interface WeightStatus {
  weight: string;
  active: boolean;
  loading: boolean;
}

export function FontDetail({ fontId, onBack }: FontDetailProps) {
  const [font, setFont] = useState<FontFamily | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewText, setPreviewText] = useState('');
  const [previewSize, setPreviewSize] = useState(48);
  const [weightStatuses, setWeightStatuses] = useState<WeightStatus[]>([]);
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadFontDetails();
  }, [fontId]);

  const loadFontDetails = async () => {
    try {
      const details = await window.electronAPI.fonts.getDetails(fontId);
      setFont(details);
      setPreviewText(details.sampleText);
      
      // Initialize weight statuses
      const statuses: WeightStatus[] = [];
      for (const weight of details.weights) {
        const active = await window.electronAPI.fonts.isActive(fontId, weight.weight);
        statuses.push({ weight: weight.weight, active, loading: false });
      }
      setWeightStatuses(statuses);
      
      // Load all font weights for preview
      await loadAllFontWeights(details);
    } catch (err) {
      setError('Failed to load font details');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllFontWeights = async (fontDetails: FontFamily) => {
    const loaded = new Set<string>();
    
    for (const weight of fontDetails.weights) {
      try {
        const fontData = await window.electronAPI.fonts.getFile(fontId, weight.weight);
        const blob = new Blob([fontData], { type: 'font/ttf' });
        const url = URL.createObjectURL(blob);
        
        const fontFaceName = `detail-${fontId}-${weight.weight}`;
        const fontFace = new FontFace(fontFaceName, `url(${url})`);
        await fontFace.load();
        document.fonts.add(fontFace);
        
        loaded.add(weight.weight);
      } catch (err) {
        console.error(`Failed to load font weight ${weight.weight}:`, err);
      }
    }
    
    setLoadedFonts(loaded);
  };

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleActivate = async (weight: string) => {
    setWeightStatuses(prev => 
      prev.map(ws => ws.weight === weight ? { ...ws, loading: true } : ws)
    );

    try {
      const result = await window.electronAPI.fonts.activate(fontId, weight);
      if (result.success) {
        setWeightStatuses(prev => 
          prev.map(ws => ws.weight === weight ? { ...ws, active: true, loading: false } : ws)
        );
        showNotification('success', `${font?.name} ${weight} activated successfully!`);
      } else {
        throw new Error(result.error || 'Activation failed');
      }
    } catch (err) {
      setWeightStatuses(prev => 
        prev.map(ws => ws.weight === weight ? { ...ws, loading: false } : ws)
      );
      showNotification('error', `Failed to activate: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeactivate = async (weight: string) => {
    setWeightStatuses(prev => 
      prev.map(ws => ws.weight === weight ? { ...ws, loading: true } : ws)
    );

    try {
      const result = await window.electronAPI.fonts.deactivate(fontId, weight);
      if (result.success) {
        setWeightStatuses(prev => 
          prev.map(ws => ws.weight === weight ? { ...ws, active: false, loading: false } : ws)
        );
        showNotification('success', `${font?.name} ${weight} deactivated successfully!`);
      } else {
        throw new Error(result.error || 'Deactivation failed');
      }
    } catch (err) {
      setWeightStatuses(prev => 
        prev.map(ws => ws.weight === weight ? { ...ws, loading: false } : ws)
      );
      showNotification('error', `Failed to deactivate: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleActivateAll = async () => {
    const inactiveWeights = weightStatuses.filter(ws => !ws.active);
    for (const ws of inactiveWeights) {
      await handleActivate(ws.weight);
    }
  };

  const handleDeactivateAll = async () => {
    const activeWeights = weightStatuses.filter(ws => ws.active);
    for (const ws of activeWeights) {
      await handleDeactivate(ws.weight);
    }
  };

  if (isLoading) {
    return (
      <div className="detail-loading">
        <div className="loading-spinner" />
        <p>Loading font details...</p>
      </div>
    );
  }

  if (error || !font) {
    return (
      <div className="detail-error">
        <p>{error || 'Font not found'}</p>
        <button onClick={onBack} className="detail-back-btn">
          Go Back
        </button>
      </div>
    );
  }

  const activeCount = weightStatuses.filter(ws => ws.active).length;
  const anyLoading = weightStatuses.some(ws => ws.loading);

  return (
    <div className="detail">
      {notification && (
        <div className={`detail-notification ${notification.type}`}>
          {notification.type === 'success' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="9" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
          )}
          {notification.message}
        </div>
      )}

      <button className="detail-back" onClick={onBack}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Library
      </button>

      <div className="detail-header">
        <div className="detail-info">
          <h1 className="detail-name">{font.name}</h1>
          <p className="detail-designer">by {font.designer}</p>
          <p className="detail-description">{font.description}</p>
          <div className="detail-tags">
            <span className="detail-tag">{font.category}</span>
            <span className="detail-tag">{font.weights.length} weight{font.weights.length !== 1 ? 's' : ''}</span>
            {activeCount > 0 && (
              <span className="detail-tag detail-tag-installed">
                {activeCount} active
              </span>
            )}
          </div>
        </div>
        
        <div className="detail-actions">
          {activeCount < font.weights.length && (
            <button 
              className="detail-action-btn primary"
              onClick={handleActivateAll}
              disabled={anyLoading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              Activate All
            </button>
          )}
          {activeCount > 0 && (
            <button 
              className="detail-action-btn danger"
              onClick={handleDeactivateAll}
              disabled={anyLoading}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
              </svg>
              Deactivate All
            </button>
          )}
        </div>
      </div>

      <div className="detail-preview-controls">
        <div className="detail-preview-text-wrapper">
          <label htmlFor="preview-text" className="detail-label">Preview Text</label>
          <input
            id="preview-text"
            type="text"
            className="detail-preview-input"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Type Amharic text..."
          />
        </div>
        <div className="detail-preview-size-wrapper">
          <label htmlFor="preview-size" className="detail-label">Size: {previewSize}px</label>
          <input
            id="preview-size"
            type="range"
            className="detail-size-slider"
            min="24"
            max="120"
            value={previewSize}
            onChange={(e) => setPreviewSize(Number(e.target.value))}
          />
        </div>
      </div>

      <div className="detail-weights">
        {font.weights.map((weight) => {
          const status = weightStatuses.find(ws => ws.weight === weight.weight);
          const fontFaceName = `detail-${fontId}-${weight.weight}`;
          const isLoaded = loadedFonts.has(weight.weight);
          
          return (
            <div key={weight.weight} className="detail-weight-card">
              <div className="detail-weight-header">
                <div className="detail-weight-info">
                  <h3 className="detail-weight-name">{weight.weight}</h3>
                  <p className="detail-weight-file">{weight.file}</p>
                </div>
                <div className="detail-weight-actions">
                  {status?.loading ? (
                    <div className="detail-weight-loading">
                      <span className="loading-spinner small" />
                      Processing...
                    </div>
                  ) : status?.active ? (
                    <button 
                      className="detail-weight-btn uninstall"
                      onClick={() => handleDeactivate(weight.weight)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                      Deactivate
                    </button>
                  ) : (
                    <button 
                      className="detail-weight-btn install"
                      onClick={() => handleActivate(weight.weight)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
                      </svg>
                      Activate
                    </button>
                  )}
                </div>
              </div>
              <div 
                className="detail-weight-preview"
                style={{ 
                  fontFamily: isLoaded ? `${fontFaceName}, serif` : 'serif',
                  fontSize: `${previewSize}px`,
                  opacity: isLoaded ? 1 : 0.3
                }}
              >
                {previewText || font.sampleText}
              </div>
              {status?.active && (
                <div className="detail-weight-status">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 12l2 2 4-4" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  Active - Available in Adobe apps while Abugida is running
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}









