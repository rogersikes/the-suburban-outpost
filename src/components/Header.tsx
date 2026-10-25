import React, { useState } from 'react';
import { 
  Zap, 
  Droplets, 
  Flame, 
  Compass, 
  SlidersHorizontal, 
  BookOpen, 
  Search,
  ShieldCheck, 
  Menu,
  X,
  Cpu,
  Calculator,
  ShoppingBag,
  Download
} from 'lucide-react';

interface HeaderProps {
  currentView: 'reader' | 'console';
  setCurrentView: (view: 'reader' | 'console') => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  onSearch: (q: string) => void;
  searchQuery: string;
  autopilotActive: boolean;
  totalArticles: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  activeCategory,
  setActiveCategory,
  onSearch,
  searchQuery,
  autopilotActive,
  totalArticles
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const categories = [
    { name: "All Dispatches", icon: BookOpen },
    { name: "Urban & Fringe", icon: Compass },
    { name: "Solar & Power", icon: Zap },
    { name: "Water Systems", icon: Droplets },
    { name: "Heating & Stoves", icon: Flame },
    { name: "Sanitation", icon: ShieldCheck },
    { name: "Legal & Codes", icon: SlidersHorizontal }
  ];

  const handleSelectCategory = (catName: string) => {
    setActiveCategory(catName);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-stone-950/95 backdrop-blur-md border-b border-stone-800 text-stone-200">
      {/* Top Outpost Ticker & Telemetry Bar (Desktop only, minimal on mobile) */}
      <div className="bg-stone-900 border-b border-stone-800 px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs text-stone-300 font-mono">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="flex items-center text-emerald-400 font-semibold truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1.5 shrink-0 inline-block"></span>
              thesuburbanoutpost.com
            </span>
            <span className="hidden sm:inline-block text-stone-600">|</span>
            <span className="hidden md:flex items-center space-x-1.5 text-amber-300">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Solar Grid: 4.8kW Floating</span>
            </span>
            <span className="hidden lg:flex items-center space-x-1.5 text-sky-300">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>Cisterns: 2,450 Gal</span>
            </span>
            <span className="hidden sm:inline-block text-stone-600">|</span>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-rebate-calculator'))}
              className="hidden sm:flex items-center space-x-1.5 text-amber-400 hover:text-amber-300 font-semibold transition-colors cursor-pointer"
              title="Calculate 30% Federal Clean Energy Tax Credit"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-400" />
              <span>30% Clean Energy Rebate Calculator</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-[11px] sm:text-xs">
            <span className="text-stone-400 hidden sm:inline">
              Residential Autonomy & Off-Grid Media
            </span>
            <span className="text-amber-500/90 font-mono font-semibold sm:hidden">
              EST. 2026
            </span>
          </div>
        </div>
      </div>

      {/* Main Brand Row */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-4 flex items-center justify-between gap-3">
        {/* Logo and Tagline */}
        <div 
          onClick={() => { setCurrentView('reader'); setActiveCategory('All Dispatches'); setMobileMenuOpen(false); }}
          className="cursor-pointer group flex items-center space-x-2.5 sm:space-x-4 min-w-0"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-600 to-amber-800 p-0.5 shadow-md flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-stone-950 rounded-[10px] sm:rounded-[14px] flex items-center justify-center border border-amber-500/30">
              <Compass className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-2">
              <h1 className="font-serif text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-stone-100 group-hover:text-amber-400 transition-colors truncate">
                THE SUBURBAN OUTPOST
              </h1>
              <span className="hidden sm:inline-block text-[11px] uppercase tracking-wider px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded font-mono font-bold shrink-0">
                EST. 2026
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-400 tracking-normal sm:tracking-wide font-sans truncate">
              Practical Off-Grid Power, Water & Heat for Suburban Homes
            </p>
          </div>
        </div>

        {/* Desktop Search Bar */}
        <div className="hidden md:block w-72 lg:w-88 relative shrink-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search guides (solar, rainwater, HOA)..."
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full bg-stone-900 text-stone-100 pl-10 pr-4 py-2 text-sm rounded-xl border border-stone-800 focus:outline-none focus:border-amber-500 placeholder-stone-500 transition-colors shadow-inner"
          />
        </div>

        {/* Mobile Action Icons (Search Toggle & Hamburger Menu) */}
        <div className="flex items-center space-x-1.5 md:hidden shrink-0">
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Toggle search"
            className={`p-2.5 rounded-xl border transition-colors ${
              mobileSearchOpen || searchQuery 
                ? 'bg-amber-600 text-stone-950 border-amber-500' 
                : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
            }`}
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-white hover:border-stone-700 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-400" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Expandable Search Bar */}
      {mobileSearchOpen && (
        <div className="md:hidden px-3 py-2 bg-stone-900 border-t border-stone-800 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search solar, cisterns, zoning..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full bg-stone-950 text-stone-100 pl-9 pr-3 py-2 text-sm rounded-lg border border-stone-700 focus:outline-none focus:border-amber-500 placeholder-stone-500"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => onSearch('')}
              className="px-2.5 py-1.5 text-xs font-mono text-stone-400 bg-stone-800 rounded-lg hover:text-white"
            >
              Clear
            </button>
          )}
        </div>
      )}

      {/* Mobile Drawer / Slide-down Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-stone-950 border-t border-stone-800 px-4 py-5 shadow-2xl animate-in slide-in-from-top duration-200">
          <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold mb-3">
            Browse Publication Categories
          </div>
          <div className="grid grid-cols-1 gap-1.5 mb-5">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = activeCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  onClick={() => handleSelectCategory(cat.name)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-base font-semibold transition-all ${
                    isSelected
                      ? 'bg-amber-600 text-stone-950 shadow-md font-bold'
                      : 'bg-stone-900 text-stone-200 hover:bg-stone-800 active:bg-stone-800'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-stone-950' : 'text-amber-400'}`} />
                    <span>{cat.name}</span>
                  </div>
                  {isSelected && <span className="text-xs font-mono uppercase font-bold">Active</span>}
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-stone-800/80 space-y-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.dispatchEvent(new CustomEvent('open-rebate-calculator'));
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm shadow-md"
            >
              <Calculator className="w-4 h-4" />
              <span>30% Clean Energy Rebate Calculator</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                const el = document.getElementById('readiness-calculator-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-stone-900 border border-stone-800 text-stone-200 hover:text-amber-400 font-semibold text-sm"
            >
              <Calculator className="w-4 h-4 text-amber-400" />
              <span>Launch Readiness Calculator</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                window.open('https://www.amazon.com/dp/B09MVJP7MV?tag=thesuburbanoutpost-20', '_blank');
              }}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 font-semibold text-sm"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span>Browse Tested Amazon Hardware</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Categories Row (Swipeable on Mobile) */}
      {currentView === 'reader' && (
        <div className="border-t border-stone-800/80 bg-stone-950/90">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 overflow-x-auto scrollbar-none">
            <div className="flex items-center space-x-1.5 sm:space-x-2.5 w-max">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'bg-stone-800 text-amber-400 border border-amber-500/40 shadow-sm'
                        : 'text-stone-300 hover:text-stone-100 hover:bg-stone-900 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`} />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Admin Console Active Notice */}
      {currentView === 'console' && (
        <div className="bg-amber-950/60 border-t border-amber-800/60 px-3 sm:px-4 py-2 text-xs sm:text-sm font-mono text-amber-300 flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <Cpu className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <span className="font-bold truncate">ADMIN CONSOLE</span>
          </div>
          <button
            onClick={() => setCurrentView('reader')}
            className="flex items-center space-x-1 underline text-stone-200 hover:text-white shrink-0 ml-2"
          >
            <span>&larr; Public Site</span>
          </button>
        </div>
      )}
    </header>
  );
};
