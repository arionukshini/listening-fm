import { useEffect, useState } from 'react';
import { extractAmbientColor } from '../utils/ambientColor';

interface BackgroundProps {
  artworkUrl?: string;
}

export function Background({ artworkUrl }: BackgroundProps) {
  const [glow, setGlow] = useState<string>('rgba(255,255,255,0.05)');

  useEffect(() => {
    let cancelled = false;
    if (!artworkUrl) {
      setGlow('rgba(255,255,255,0.05)');
      return;
    }
    extractAmbientColor(artworkUrl).then((rgb) => {
      if (cancelled) return;
      if (rgb) {
        const [r, g, b] = rgb;
        setGlow(`rgba(${r}, ${g}, ${b}, 0.42)`);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [artworkUrl]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-void" aria-hidden="true">
      {artworkUrl && (
        <div
          key={artworkUrl}
          className="absolute inset-0 animate-fade-in bg-cover bg-center opacity-70 blur-2xl saturate-150 scale-110 transition-opacity duration-1000"
          style={{ backgroundImage: `url(${artworkUrl})` }}
        />
      )}
      {/* ambient color wash pulled from the artwork */}
      <div
        className="absolute inset-0 transition-colors duration-1000"
        style={{
          background: `radial-gradient(120% 90% at 50% 15%, ${glow} 0%, transparent 60%)`,
        }}
      />
      {/* dark overlay so text always stays readable */}
      <div className="absolute inset-0 bg-void/50" />
    </div>
  );
}
