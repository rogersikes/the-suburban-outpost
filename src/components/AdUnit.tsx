import React, { useEffect } from 'react';

interface AdUnitProps {
  format?: 'leaderboard' | 'in-article' | 'sidebar';
  slotId?: string;
  slotName?: string;
  className?: string;
}

/**
 * Responsive Google AdSense unit.
 * Only renders when an explicit, active Google AdSense slotId is provided.
 * All mock/placeholder advertisement text and telemetry have been removed.
 */
export const AdUnit: React.FC<AdUnitProps> = ({ 
  slotId,
  className = ""
}) => {
  // If no official AdSense slot ID is configured, render nothing (no placeholders)
  if (!slotId) {
    return null;
  }

  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      // AdSense script handles injection
    }
  }, [slotId]);

  return (
    <div className={`w-full my-6 flex justify-center overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client="ca-pub-7519914520551172"
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
