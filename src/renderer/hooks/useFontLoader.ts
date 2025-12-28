import { useState, useEffect } from 'react';

/**
 * Custom Hook for Font Loading with Memory Leak Prevention
 * 
 * Properly loads fonts into the browser and cleans up Blob URLs
 * to prevent memory leaks.
 * 
 * Usage:
 *   const loaded = useFontLoader(fontId, weight);
 *   if (loaded) {
 *     // Render with font
 *   }
 */
export function useFontLoader(fontId: string, weight: string, namePrefix: string = 'font') {
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    let blobUrl: string | null = null;
    let isCancelled = false;
    
    async function load() {
      try {
        const data = await window.electronAPI.fonts.getFile(fontId, weight);
        
        // Check if component was unmounted during async operation
        if (isCancelled) return;
        
        const blob = new Blob([data], { type: 'font/ttf' });
        blobUrl = URL.createObjectURL(blob);
        
        const fontFaceName = `${namePrefix}-${fontId}-${weight}`;
        const fontFace = new FontFace(fontFaceName, `url(${blobUrl})`);
        await fontFace.load();
        
        // Check again before mutating DOM
        if (isCancelled) return;
        
        document.fonts.add(fontFace);
        setLoaded(true);
      } catch (err) {
        console.error(`Failed to load font ${fontId} ${weight}:`, err);
      }
    }
    
    load();
    
    // Cleanup function - revokes blob URL to prevent memory leak
    return () => {
      isCancelled = true;
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [fontId, weight, namePrefix]);
  
  return loaded;
}

