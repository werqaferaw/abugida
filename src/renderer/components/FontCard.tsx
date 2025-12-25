import React, { useState, useEffect } from 'react';
import type { FontFamily } from '../types/electron';
import './FontCard.css';

interface FontCardProps {
  font: FontFamily;
  previewText: string;
  onClick: () => void;
}

export function FontCard({ font, previewText, onClick }: FontCardProps) {
  const [fontLoaded, setFontLoaded] = useState(false);
  const [installedWeights, setInstalledWeights] = useState<string[]>([]);

  useEffect(() => {
    loadFont();
    checkInstallStatus();
  }, [font.id]);

  const loadFont = async () => {
    try {
      // Load the Regular weight for preview
      const fontData = await window.electronAPI.fonts.getFile(font.id, 'Regular');
      const blob = new Blob([fontData], { type: 'font/ttf' });
      const url = URL.createObjectURL(blob);
      
      const fontFace = new FontFace(`preview-${font.id}`, `url(${url})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      
      setFontLoaded(true);
    } catch (err) {
      console.error('Failed to load font preview:', err);
    }
  };

  const checkInstallStatus = async () => {
    const installed: string[] = [];
    for (const weight of font.weights) {
      const isInstalled = await window.electronAPI.install.isInstalled(font.id, weight.weight);
      if (isInstalled) {
        installed.push(weight.weight);
      }
    }
    setInstalledWeights(installed);
  };

  const installedCount = installedWeights.length;
  const totalWeights = font.weights.length;

  return (
    <div className="font-card" onClick={onClick}>
      <div className="font-card-header">
        <div className="font-card-info">
          <h3 className="font-card-name">{font.name}</h3>
          <p className="font-card-designer">{font.designer}</p>
        </div>
        <div className="font-card-meta">
          <span className="font-card-weights">{totalWeights} weight{totalWeights !== 1 ? 's' : ''}</span>
          {installedCount > 0 && (
            <span className="font-card-installed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 12l2 2 4-4" />
              </svg>
              {installedCount === totalWeights ? 'All installed' : `${installedCount} installed`}
            </span>
          )}
        </div>
      </div>
      
      <div 
        className="font-card-preview"
        style={{ 
          fontFamily: fontLoaded ? `preview-${font.id}, serif` : 'serif',
          opacity: fontLoaded ? 1 : 0.3
        }}
      >
        {previewText}
      </div>

      <div className="font-card-footer">
        <span className="font-card-category">{font.category}</span>
        <span className="font-card-action">
          View details
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </div>
  );
}




