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
  const [activeWeights, setActiveWeights] = useState<string[]>([]);

  useEffect(() => {
    loadFont();
    checkActivationStatus();
  }, [font.id]);

  const loadFont = async () => {
    try {
      // Load the first available weight for preview (not hardcoded "Regular")
      const firstWeight = font.weights[0]?.weight || 'Regular';
      const fontData = await window.electronAPI.fonts.getFile(font.id, firstWeight);
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

  const checkActivationStatus = async () => {
    const active: string[] = [];
    for (const weight of font.weights) {
      const isActive = await window.electronAPI.fonts.isActive(font.id, weight.weight);
      if (isActive) {
        active.push(weight.weight);
      }
    }
    setActiveWeights(active);
  };

  const activeCount = activeWeights.length;
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
          {activeCount > 0 && (
            <span className="font-card-installed">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M9 12l2 2 4-4" />
              </svg>
              {activeCount === totalWeights ? 'All active' : `${activeCount} active`}
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









