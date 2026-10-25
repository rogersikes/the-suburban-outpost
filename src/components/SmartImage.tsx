import React, { useState } from 'react';
import { Shield, Zap, Droplets, Flame, Compass, Sparkles } from 'lucide-react';

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  category?: string;
  fallbackSrc?: string;
}

const CATEGORY_FALLBACKS: Record<string, string> = {
  "Legal & Codes": "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
  "Water Systems": "https://images.unsplash.com/photo-1516214104703-d870798883c5?auto=format&fit=crop&w=1200&q=80",
  "Solar & Power": "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1200&q=80",
  "Heating & Stoves": "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
  "Sanitation": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=80",
  "Urban & Fringe": "https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=1200&q=80"
};

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt = 'The Suburban Outpost',
  className = '',
  category = 'Urban & Fringe',
  fallbackSrc,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src);
  const [hasFailedOnce, setHasFailedOnce] = useState<boolean>(false);
  const [hasFailedAll, setHasFailedAll] = useState<boolean>(false);

  React.useEffect(() => {
    setCurrentSrc(src);
    setHasFailedOnce(false);
    setHasFailedAll(false);
  }, [src]);

  const handleError = () => {
    if (!hasFailedOnce) {
      setHasFailedOnce(true);
      const fallback = fallbackSrc || CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS["Urban & Fringe"];
      setCurrentSrc(fallback);
    } else {
      setHasFailedAll(true);
    }
  };

  if (hasFailedAll || !currentSrc) {
    // Beautiful stylized editorial placeholder in case offline or blocked
    return (
      <div className={`bg-gradient-to-br from-stone-900 via-stone-850 to-stone-950 flex flex-col items-center justify-center p-6 text-center border border-stone-800 ${className}`}>
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
          {category === 'Water Systems' ? (
            <Droplets className="w-8 h-8" />
          ) : category === 'Solar & Power' ? (
            <Zap className="w-8 h-8" />
          ) : category === 'Heating & Stoves' ? (
            <Flame className="w-8 h-8" />
          ) : (
            <Compass className="w-8 h-8" />
          )}
        </div>
        <span className="text-xs font-mono font-bold text-stone-300 uppercase tracking-wider">
          {category}
        </span>
        <span className="text-[11px] text-amber-500/80 font-mono mt-0.5">
          The Suburban Outpost Field Archive
        </span>
      </div>
    );
  }

  return (
    <img
      src={currentSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={handleError}
      className={className}
      {...props}
    />
  );
};
