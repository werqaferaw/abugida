import React, { useState, useEffect } from 'react';
import type { FontFamily } from '../types/electron';
import './InstalledFonts.css';

interface ActivatedFontsProps {
  onSelectFont: (fontId: string) => void;
}

interface ActiveFontItem {
  fontId: string;
  weight: string;
  fontDetails?: FontFamily;
}

export function ActivatedFonts({ onSelectFont }: ActivatedFontsProps) {
  const [activeFonts, setActiveFonts] = useState<ActiveFontItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedFontFaces, setLoadedFontFaces] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadActiveFonts();
  }, []);

  const loadActiveFonts = async () => {
    setIsLoading(true);
    try {
      const active = await window.electronAPI.fonts.getActive();
      
      // Fetch details for each active font
      const fontsWithDetails: ActiveFontItem[] = [];
      for (const font of active) {
        try {
          const details = await window.electronAPI.fonts.getDetails(font.fontId);
          fontsWithDetails.push({
            ...font,
            fontDetails: details,
          });
          
          // Load font for preview
          await loadFontForPreview(font.fontId, font.weight);
        } catch (err) {
          // Font might have been removed from cloud but still active
          fontsWithDetails.push(font);
        }
      }
      
      setActiveFonts(fontsWithDetails);
    } catch (err) {
      console.error('Failed to load active fonts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadFontForPreview = async (fontId: string, weight: string) => {
    try {
      const fontData = await window.electronAPI.fonts.getFile(fontId, weight);
      const blob = new Blob([fontData], { type: 'font/ttf' });
      const url = URL.createObjectURL(blob);
      
      const fontFaceName = `active-${fontId}-${weight}`;
      const fontFace = new FontFace(fontFaceName, `url(${url})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      
      setLoadedFontFaces(prev => new Set(prev).add(`${fontId}-${weight}`));
    } catch (err) {
      console.error('Failed to load font for preview:', err);
    }
  };

  const handleDeactivate = async (fontId: string, weight: string) => {
    try {
      const result = await window.electronAPI.fonts.deactivate(fontId, weight);
      if (result.success) {
        setActiveFonts(prev => 
          prev.filter(f => !(f.fontId === fontId && f.weight === weight))
        );
      }
    } catch (err) {
      console.error('Failed to deactivate font:', err);
    }
  };

  // Group fonts by family
  const fontsByFamily = activeFonts.reduce((acc, font) => {
    if (!acc[font.fontId]) {
      acc[font.fontId] = {
        fontId: font.fontId,
        details: font.fontDetails,
        weights: [],
      };
    }
    acc[font.fontId].weights.push(font.weight);
    return acc;
  }, {} as Record<string, { fontId: string; details?: FontFamily; weights: string[] }>);

  if (isLoading) {
    return (
      <div className="installed-loading">
        <div className="loading-spinner" />
        <p>Loading activated fonts...</p>
      </div>
    );
  }

  return (
    <div className="installed">
      <div className="installed-header">
        <h1 className="installed-title">Activated Fonts</h1>
        <p className="installed-subtitle">
          {activeFonts.length} font{activeFonts.length !== 1 ? 's' : ''} active in this session
        </p>
      </div>

      {activeFonts.length === 0 ? (
        <div className="installed-empty">
          <div className="installed-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </svg>
          </div>
          <h2>No fonts activated yet</h2>
          <p>Browse the library and activate some fonts to see them here</p>
        </div>
      ) : (
        <div className="installed-list">
          {Object.values(fontsByFamily).map((family) => (
            <div key={family.fontId} className="installed-family">
              <div 
                className="installed-family-header"
                onClick={() => onSelectFont(family.fontId)}
              >
                <div className="installed-family-info">
                  <h3 className="installed-family-name">
                    {family.details?.name || family.fontId}
                  </h3>
                  {family.details && (
                    <p className="installed-family-designer">{family.details.designer}</p>
                  )}
                </div>
                <span className="installed-family-count">
                  {family.weights.length} weight{family.weights.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="installed-weights">
                {family.weights.map((weight) => {
                  const fontFaceName = `active-${family.fontId}-${weight}`;
                  const isLoaded = loadedFontFaces.has(`${family.fontId}-${weight}`);
                  
                  return (
                    <div key={weight} className="installed-weight">
                      <div className="installed-weight-info">
                        <span className="installed-weight-name">{weight}</span>
                        <span 
                          className="installed-weight-preview"
                          style={{ 
                            fontFamily: isLoaded ? `${fontFaceName}, serif` : 'serif',
                            opacity: isLoaded ? 1 : 0.3
                          }}
                        >
                          {family.details?.sampleText || 'ሰላም ዓለም'}
                        </span>
                      </div>
                      <button 
                        className="installed-weight-uninstall"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeactivate(family.fontId, weight);
                        }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                        </svg>
                        Deactivate
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeFonts.length > 0 && (
        <div className="installed-hint">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4M12 8h.01" />
          </svg>
          <p>
            Activated fonts are available in Adobe apps while Abugida is running. 
            Fonts will be deactivated when you close this app.
          </p>
        </div>
      )}
    </div>
  );
}

