import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Tag, 
  Search, 
  ShieldCheck, 
  ExternalLink, 
  Check, 
  RefreshCw, 
  AlertCircle,
  Copy,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { 
  AnalyticsConfig, 
  getStoredAnalyticsConfig, 
  saveAnalyticsConfig 
} from '../analytics';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose }) => {
  const [config, setConfig] = useState<AnalyticsConfig>({
    ga4MeasurementId: '',
    gtmContainerId: '',
    gscVerificationCode: ''
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testEventSent, setTestEventSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'ga4' | 'gtm' | 'gsc'>('all');

  useEffect(() => {
    if (isOpen) {
      // Fetch latest config from server or local storage
      fetch('/api/settings/analytics')
        .then(res => res.json())
        .then(data => {
          if (data) {
            setConfig({
              ga4MeasurementId: data.ga4MeasurementId || '',
              gtmContainerId: data.gtmContainerId || '',
              gscVerificationCode: data.gscVerificationCode || ''
            });
          }
        })
        .catch(() => {
          setConfig(getStoredAnalyticsConfig());
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await saveAnalyticsConfig(config);
    if (ok) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleSendTestPing = () => {
    if (typeof window !== 'undefined') {
      window.dataLayer = window.dataLayer || [];
      const testPayload = {
        event: 'test_outpost_ping',
        source: 'AnalyticsSetupModal',
        domain: 'thesuburbanoutpost.com',
        timestamp: new Date().toISOString()
      };
      window.dataLayer.push(testPayload);
      if (window.gtag) {
        window.gtag('event', 'test_outpost_ping', testPayload);
      }
      setTestEventSent(true);
      setTimeout(() => setTestEventSent(false), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-4 sm:p-7 text-stone-200 shadow-2xl relative my-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-100 text-lg font-bold font-mono px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors"
        >
          ✕
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-1">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
            <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="font-serif font-extrabold text-xl sm:text-2xl text-stone-100">
              Google Tracking & Search Setup
            </h2>
            <p className="text-xs sm:text-sm text-stone-400">
              Configure Google Analytics 4, Google Tag Manager, and Google Search Console for <code className="text-amber-400 font-mono">thesuburbanoutpost.com</code>
            </p>
          </div>
        </div>

        {/* Current Active Tracking Overview Pill Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 my-5">
          {/* GA4 Status */}
          <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-xs font-bold text-stone-200">Google Analytics 4</div>
                <div className="text-[10px] font-mono text-stone-400 truncate max-w-[130px]">
                  {config.ga4MeasurementId || 'Not connected'}
                </div>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              config.ga4MeasurementId 
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                : 'bg-stone-800 text-stone-400'
            }`}>
              {config.ga4MeasurementId ? 'ACTIVE' : 'READY'}
            </span>
          </div>

          {/* GTM Status */}
          <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-sky-400" />
              <div>
                <div className="text-xs font-bold text-stone-200">Tag Manager (GTM)</div>
                <div className="text-[10px] font-mono text-stone-400 truncate max-w-[130px]">
                  {config.gtmContainerId || 'Not connected'}
                </div>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              config.gtmContainerId 
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                : 'bg-stone-800 text-stone-400'
            }`}>
              {config.gtmContainerId ? 'ACTIVE' : 'READY'}
            </span>
          </div>

          {/* GSC Status */}
          <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-purple-400" />
              <div>
                <div className="text-xs font-bold text-stone-200">Search Console (GSC)</div>
                <div className="text-[10px] font-mono text-stone-400 truncate max-w-[130px]">
                  {config.gscVerificationCode ? 'Meta Tag Installed' : 'Pending'}
                </div>
              </div>
            </div>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
              config.gscVerificationCode 
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                : 'bg-stone-800 text-stone-400'
            }`}>
              {config.gscVerificationCode ? 'ACTIVE' : 'READY'}
            </span>
          </div>
        </div>

        {/* Configuration Form */}
        <form onSubmit={handleSave} className="space-y-5">
          {/* 1. Google Analytics 4 */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-stone-100 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-xs flex items-center justify-center font-bold">1</span>
                <span>Google Analytics 4 Measurement ID</span>
              </label>
              <a 
                href="https://analytics.google.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[11px] font-mono text-amber-400 hover:underline flex items-center"
              >
                analytics.google.com <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
            <div className="relative mt-2">
              <input
                type="text"
                value={config.ga4MeasurementId}
                onChange={(e) => setConfig({ ...config, ga4MeasurementId: e.target.value })}
                placeholder="G-XXXXXXXXXX"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-500 placeholder-stone-600"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">
              Found in your GA4 property under: <strong>Admin → Data Streams → Web → Measurement ID</strong>. This activates real-time audience tracking, reader retention, and pageviews.
            </p>
          </div>

          {/* 2. Google Tag Manager */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-stone-100 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/20 text-sky-400 font-mono text-xs flex items-center justify-center font-bold">2</span>
                <span>Google Tag Manager Container ID</span>
              </label>
              <a 
                href="https://tagmanager.google.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[11px] font-mono text-sky-400 hover:underline flex items-center"
              >
                tagmanager.google.com <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
            <div className="relative mt-2">
              <input
                type="text"
                value={config.gtmContainerId}
                onChange={(e) => setConfig({ ...config, gtmContainerId: e.target.value })}
                placeholder="GTM-XXXXXXX"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2.5 text-stone-100 font-mono text-sm focus:outline-none focus:border-sky-500 placeholder-stone-600"
              />
            </div>
            <p className="text-[11px] text-stone-400 mt-1.5 leading-relaxed">
              Optional if using GA4 directly. Found at the top of your GTM workspace. Enables advanced custom trigger tags and marketing pixels.
            </p>
          </div>

          {/* 3. Google Search Console Verification */}
          <div className="p-4 rounded-xl bg-stone-950/70 border border-stone-800">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-bold text-stone-100 flex items-center space-x-2">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 font-mono text-xs flex items-center justify-center font-bold">3</span>
                <span>Google Search Console Status</span>
              </label>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                ✓ DNS VERIFIED VIA CLOUDFLARE
              </span>
            </div>
            <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-stone-300 space-y-1">
              <p className="text-emerald-400 font-semibold">
                ✓ thesuburbanoutpost.com is verified via Cloudflare DNS TXT Record.
              </p>
              <p className="text-stone-400">
                All subpaths, sitemaps (<code className="text-amber-400">/sitemap.xml</code>), and URLs are authorized for indexing. Optional secondary HTML token can be stored below for redundant verification.
              </p>
            </div>
            <div className="relative mt-2">
              <input
                type="text"
                value={config.gscVerificationCode}
                onChange={(e) => setConfig({ ...config, gscVerificationCode: e.target.value })}
                placeholder="Optional backup HTML tag token"
                className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2 text-stone-100 font-mono text-xs focus:outline-none focus:border-purple-500 placeholder-stone-600"
              />
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleSendTestPing}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs font-mono font-semibold flex items-center justify-center space-x-2 transition-colors border border-stone-700"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>{testEventSent ? "✓ Test Ping Dispatched!" : "Dispatch Test Event to dataLayer"}</span>
            </button>

            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-sm font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{savedSuccess ? "Saved & Activated!" : "Save & Activate Tracking"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
