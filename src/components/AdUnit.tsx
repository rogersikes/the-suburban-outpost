import React, { useState } from 'react';
import { DollarSign, ExternalLink, Calculator, Eye, EyeOff } from 'lucide-react';

interface AdUnitProps {
  format: 'leaderboard' | 'in-article' | 'sidebar';
  slotName?: string;
  rpm?: number;
  onCalculateRebate?: () => void;
}

export const AdUnit: React.FC<AdUnitProps> = ({ 
  format, 
  slotName = "AdSense Responsive Slot",
  rpm = 24.50,
  onCalculateRebate
}) => {
  const [showMetrics, setShowMetrics] = useState(false);

  const handleOpenRebate = () => {
    if (onCalculateRebate) {
      onCalculateRebate();
    } else {
      window.dispatchEvent(new CustomEvent('open-rebate-calculator'));
    }
  };

  if (format === 'leaderboard') {
    return (
      <div className="w-full my-6 p-4 rounded-xl bg-stone-900/60 border border-stone-800/80 relative group overflow-hidden">
        <div className="flex items-center justify-between text-[11px] text-stone-500 mb-2 font-mono">
          <span className="uppercase tracking-wider">Advertisement • Google AdSense Off-Grid Energy Network</span>
          <button 
            onClick={() => setShowMetrics(!showMetrics)} 
            className="hover:text-stone-300 flex items-center space-x-1"
            title="Toggle Monetization Metrics"
          >
            {showMetrics ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            <span>{showMetrics ? "Hide Telemetry" : "Ad Telemetry"}</span>
          </button>
        </div>

        {/* Ad Body */}
        <div className="bg-stone-950 border border-stone-800 rounded-lg p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
              <DollarSign className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Sponsored Sponsor
              </span>
              <h4 className="text-sm font-semibold text-stone-200 mt-1">
                Zero-Grid Modular Solar Kits: Up to 40% Federal Clean Energy Rebate
              </h4>
              <p className="text-xs text-stone-400 line-clamp-1">
                Pre-engineered suburban residential power systems with plug-and-play lithium battery storage.
              </p>
            </div>
          </div>

          <button 
            onClick={handleOpenRebate}
            className="whitespace-nowrap px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold border border-amber-500 flex items-center space-x-1.5 transition-colors shadow-sm active:scale-95"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculate Rebate</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {showMetrics && (
          <div className="mt-2 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono text-stone-400">
            <span>Placement: {slotName} (728x90 responsive)</span>
            <span>Target Niche: Off-Grid Renewable Energy</span>
            <span className="text-emerald-400 font-semibold">Simulated RPM: ${rpm.toFixed(2)} / 1K views</span>
          </div>
        )}
      </div>
    );
  }

  if (format === 'sidebar') {
    return (
      <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 relative group text-xs">
        <div className="flex items-center justify-between text-[10px] text-stone-500 mb-2 font-mono">
          <span>SPONSORED ADVERTISEMENT</span>
          <span className="text-amber-500/80 font-semibold font-mono">ADSENSE</span>
        </div>

        <div className="p-3 rounded-lg bg-stone-900 border border-stone-800/80">
          <div className="w-full h-28 bg-stone-800/60 rounded flex items-center justify-center mb-3 relative overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=400&q=80" 
              alt="Deep well submersible pump" 
              className="w-full h-full object-cover opacity-80"
            />
            <span className="absolute bottom-1 right-1 bg-stone-950/80 text-[10px] px-1.5 py-0.5 rounded text-stone-300 font-mono">
              Ad
            </span>
          </div>

          <h5 className="font-semibold text-stone-200 text-xs leading-snug">
            Solar Direct 24V Well Pumps for Shallow & Deep Casing
          </h5>
          <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">
            No inverters needed. Direct connect to 200W solar panels for continuous off-grid livestock and irrigation.
          </p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[11px] text-emerald-400 font-mono font-semibold">Free US Shipping</span>
            <a 
              href="https://www.amazon.com/s?k=24v+solar+submersible+well+pump&tag=thesuburbanoutpost-20"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold font-mono rounded text-[11px] flex items-center space-x-1 transition-colors"
            >
              <span>View Specs</span>
              <ExternalLink className="w-3 h-3 text-stone-950" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  // format === 'in-article'
  return (
    <div className="my-8 p-4 rounded-xl bg-stone-900/50 border border-stone-800/80">
      <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 mb-2">
        <span>IN-ARTICLE GOOGLE ADSENSE PLACEMENT</span>
        <span className="text-emerald-400 font-mono">EST. CPM $18.40</span>
      </div>
      <div className="p-4 rounded-lg bg-stone-950 border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-stone-800 text-amber-400">
            Home & Off-Grid Utility
          </span>
          <h4 className="text-sm font-semibold text-stone-200 mt-1">
            Backyard Freeze-Dryers: Harvest Preservation Without Freezers
          </h4>
          <p className="text-xs text-stone-400">
            Store 25-year shelf-life meats, dairy, and garden harvests without electricity consumption.
          </p>
        </div>
        <button className="shrink-0 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-semibold text-xs transition-colors flex items-center space-x-1.5">
          <span>Learn More</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
