import React, { useState } from 'react';
import { Lock, ShieldAlert, KeyRound, ArrowLeft, Eye, EyeOff, ShieldCheck, Compass } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: (token: string, username: string) => void;
  onCancel: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('outpost_admin_token', data.token);
        sessionStorage.setItem('outpost_admin_user', data.username);
        onSuccess(data.token, data.username);
      } else {
        setError(data.message || 'Authentication failed. Please check username and password.');
      }
    } catch (err: any) {
      setError('Connection error while validating credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full rounded-2xl bg-stone-900 border border-stone-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle decorative amber glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Back Link */}
        <button
          onClick={onCancel}
          className="flex items-center space-x-1.5 text-xs font-mono text-stone-400 hover:text-amber-400 transition-colors mb-6 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Return to Public Website</span>
        </button>

        {/* Header with Lock */}
        <div className="flex items-center space-x-3.5 mb-6">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-500 font-bold">
              Restricted Station Access
            </div>
            <h2 className="text-xl font-serif font-extrabold text-stone-100">
              Admin & Content Engine
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-stone-300 mb-6 leading-relaxed">
          Sign in to access the Autonomous Gemini Writer, DataForSEO Keyword Vault, Tracking Tags (GA4/GTM/GSC), and monetization pipelines.
        </p>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/50 border border-red-800/80 text-red-300 text-xs flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span className="leading-snug">{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-stone-300 mb-1.5 font-semibold">
              ADMIN USERNAME
            </label>
            <input
              type="text"
              autoFocus
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. admin"
              className="w-full bg-stone-950 text-stone-100 px-4 py-2.5 rounded-xl border border-stone-700 focus:outline-none focus:border-amber-500 text-sm font-mono placeholder-stone-600"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-stone-300 mb-1.5 font-semibold">
              SECURITY KEY / PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-stone-950 text-stone-100 pl-4 pr-11 py-2.5 rounded-xl border border-stone-700 focus:outline-none focus:border-amber-500 text-sm font-mono placeholder-stone-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 p-1"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 text-stone-950 font-bold text-sm uppercase tracking-wider transition-all shadow-lg flex items-center justify-center space-x-2 active:scale-95"
          >
            <KeyRound className="w-4 h-4" />
            <span>{loading ? "Authenticating..." : "Unlock Engine Console"}</span>
          </button>
        </form>

        {/* Security Credentials Notice for Site Owner */}
        <div className="mt-6 pt-4 border-t border-stone-800 text-[11px] text-stone-400 font-mono space-y-1">
          <div className="text-stone-300 font-semibold flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Default Owner Credentials:</span>
          </div>
          <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 text-stone-300">
            Username: <strong className="text-amber-400">admin</strong><br />
            Password: <strong className="text-amber-400">outpost2026!</strong>
          </div>
          <p className="text-[10px] text-stone-500 pt-1">
            You can change your username and password anytime inside the console settings.
          </p>
        </div>
      </div>
    </div>
  );
};
