import React, { useState } from 'react';
import { 
  Mail, 
  Download, 
  CheckCircle2, 
  FileText, 
  Sparkles, 
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

interface NewsletterSignupCardProps {
  variant?: 'sidebar' | 'inline' | 'article_footer';
  source?: string;
  className?: string;
}

export const NewsletterSignupCard: React.FC<NewsletterSignupCardProps> = ({
  variant = 'sidebar',
  source = 'blog_sidebar',
  className = ''
}) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const resp = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source })
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || 'Failed to subscribe');
      }

      setDownloadUrl(data.downloadUrl || `/api/download-blueprint?email=${encodeURIComponent(email.trim().toLowerCase())}`);
      setStatus('success');
    } catch (err: any) {
      console.error('Subscription error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Could not complete subscription. Please try again.');
    }
  };

  const handleDownload = async () => {
    if (!downloadUrl) return;
    setIsDownloading(true);
    try {
      const resp = await fetch(downloadUrl);
      if (!resp.ok) {
        const errorData = await resp.json().catch(() => ({}));
        throw new Error(errorData.message || 'Unable to download blueprint. Please verify your subscription.');
      }
      const blob = await resp.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = 'The-Suburban-Outpost-Solar-Sizing-Blueprint.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(objectUrl), 10000);
    } catch (err: any) {
      console.warn('Blob download fallback:', err);
      // Fallback direct window location trigger
      window.location.href = downloadUrl;
    } finally {
      setIsDownloading(false);
    }
  };

  // SUCCESS STATE VIEW
  if (status === 'success') {
    return (
      <div className={`p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-emerald-950/60 via-stone-900 to-stone-950 border border-emerald-600/40 text-stone-200 shadow-2xl relative overflow-hidden ${className}`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm sm:text-base mb-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>You're Subscribed!</span>
        </div>

        <p className="text-xs sm:text-sm text-stone-300 leading-relaxed mb-4">
          Welcome to <strong className="text-stone-100">The Outpost Dispatch</strong>. Your companion field manual has been unlocked:
        </p>

        {/* Highlighted PDF Card */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-stone-950/90 border border-stone-800 space-y-3">
          <div className="flex items-start space-x-3">
            <div className="p-2 sm:p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider font-semibold block">
                Technical Manual 04-A
              </span>
              <h5 className="font-serif font-bold text-stone-100 text-xs sm:text-sm leading-snug">
                Suburban Solar Sizing, Battery Storage & Transfer Switch Blueprint
              </h5>
              <span className="text-[11px] font-mono text-stone-400 block mt-0.5">
                4 Pages • Printable PDF • NEC 702 Schematics
              </span>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold font-mono text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all shadow-lg cursor-pointer disabled:opacity-75"
          >
            {isDownloading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Preparing PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Blueprint PDF</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] font-mono text-stone-400">
          <span className="flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero Spam Policy</span>
          </span>
          <button
            onClick={() => { setStatus('idle'); setEmail(''); }}
            className="hover:text-stone-200 underline cursor-pointer"
          >
            Add another email
          </button>
        </div>
      </div>
    );
  }

  // INLINE ARTICLE FOOTER VARIANT
  if (variant === 'article_footer') {
    return (
      <div className={`my-8 sm:my-12 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-950/30 via-stone-900 to-stone-950 border border-amber-800/40 text-stone-200 shadow-2xl relative overflow-hidden ${className}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="md:max-w-md">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm sm:text-base mb-2">
              <Mail className="w-5 h-5 text-amber-400 shrink-0" />
              <span>Join The Outpost Dispatch</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 ml-2">
                Free PDF Included
              </span>
            </div>
            <h4 className="text-xl sm:text-2xl font-serif font-bold text-stone-100 leading-tight mb-2">
              Get Our Complete Technical Blueprints
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Subscribe to weekly engineering manuals on residential solar, stealth cisterns, and secondary biomass heating. Receive our <strong>Suburban Solar Sizing & NEC 702 Blueprint</strong> instantly.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="w-full md:w-80 space-y-2.5">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="homesteader@outpost.com"
                disabled={status === 'loading'}
                className="w-full bg-stone-950 text-stone-100 px-4 py-3 rounded-xl border border-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 placeholder-stone-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm uppercase tracking-wider transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              {status === 'loading' ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Subscribing...</span>
                </>
              ) : (
                <>
                  <span>Subscribe to Dispatches</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {status === 'error' && (
              <p className="text-xs text-rose-400 font-mono mt-1 text-center">
                {errorMessage}
              </p>
            )}

            <span className="text-[11px] text-stone-400 block text-center font-mono">
              Zero spam. Direct companion PDF delivered on signup.
            </span>
          </form>
        </div>
      </div>
    );
  }

  // DEFAULT SIDEBAR VARIANT
  return (
    <div className={`p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-950/40 via-stone-900 to-stone-950 border border-amber-900/40 text-stone-300 shadow-xl ${className}`}>
      <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm sm:text-base mb-1.5">
        <Mail className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
        <span>The Outpost Dispatch</span>
      </div>
      <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
        Join 18,500+ suburban homesteaders receiving our technical blueprints on residential solar, stealth cisterns, and heating codes.
      </p>

      {/* Bonus Callout Pill */}
      <div className="mt-3 p-2.5 rounded-xl bg-stone-950/80 border border-amber-500/30 flex items-center space-x-2 text-xs">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span className="text-stone-300 text-[11px]">
          Includes instant <strong className="text-amber-400">4-page Solar Sizing PDF</strong> blueprint.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="mt-3.5 space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="homesteader@outpost.com"
          disabled={status === 'loading'}
          className="w-full bg-stone-950 text-stone-100 px-3.5 py-2.5 rounded-xl border border-stone-800 text-xs sm:text-sm focus:outline-none focus:border-amber-500 placeholder-stone-500 font-mono"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full py-2.5 sm:py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm uppercase tracking-wider transition-colors shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
        >
          {status === 'loading' ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Confirming...</span>
            </>
          ) : (
            <span>Subscribe to Dispatches</span>
          )}
        </button>
      </form>

      {status === 'error' && (
        <p className="text-xs text-rose-400 font-mono mt-2 text-center">
          {errorMessage}
        </p>
      )}

      <span className="text-[11px] text-stone-400 mt-2.5 block text-center font-mono">
        Zero spam. Free PDF solar sizing schematics upon signup.
      </span>
    </div>
  );
};
