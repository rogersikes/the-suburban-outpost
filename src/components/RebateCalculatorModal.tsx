import React, { useState } from 'react';
import { 
  X, 
  Calculator, 
  DollarSign, 
  Zap, 
  Flame, 
  Battery, 
  Droplets, 
  ShieldCheck, 
  ExternalLink, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { formatAmazonUrl, AMAZON_LINK_ATTRIBUTES, getAmazonAffiliateTag } from '../amazon';

interface RebateCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  amazonTag?: string;
}

type SystemType = 'solar_battery' | 'standalone_battery' | 'wood_stove' | 'rainwater';

export const RebateCalculatorModal: React.FC<RebateCalculatorModalProps> = ({
  isOpen,
  onClose,
  amazonTag = "thesuburbanoutpost-20"
}) => {
  if (!isOpen) return null;

  const [systemType, setSystemType] = useState<SystemType>('solar_battery');
  const [systemCost, setSystemCost] = useState<number>(8500);
  const [includeStateRebate, setIncludeStateRebate] = useState<boolean>(true);

  // System type configuration defaults
  const systemConfigs = {
    solar_battery: {
      name: "Solar Array + Battery Microgrid",
      law: "IRS Section 25D (Residential Clean Energy Credit)",
      federalRate: 0.30,
      cap: null,
      defaultCost: 8500,
      minCost: 1500,
      maxCost: 40000,
      stateRebateEstimate: 750,
      annualUtilitySavingsRate: 0.16,
      icon: Zap,
      accentColor: "amber",
      qualifyingProducts: [
        {
          name: "EcoFlow DELTA Pro 3600Wh LFP Station (30% Tax Credit Qualified)",
          asin: "B09MVJP7MV",
          desc: "Full 240V residential backup. Qualifies as home battery storage (>3kWh)."
        },
        {
          name: "ECO-WORTHY 48V 100Ah Server Rack LiFePO4 Battery (5.12kWh)",
          asin: "B0DP4LTRMG",
          desc: "Modular UL-certified home energy storage. Qualifies for 30% IRS Section 25D."
        }
      ]
    },
    standalone_battery: {
      name: "Residential Battery Energy Storage (3kWh+)",
      law: "Inflation Reduction Act Standalone Storage Credit",
      federalRate: 0.30,
      cap: null,
      defaultCost: 4500,
      minCost: 1000,
      maxCost: 25000,
      stateRebateEstimate: 500,
      annualUtilitySavingsRate: 0.12,
      icon: Battery,
      accentColor: "emerald",
      qualifyingProducts: [
        {
          name: "EcoFlow DELTA Pro 3600Wh LFP Station",
          asin: "B09MVJP7MV",
          desc: "Zero-emission indoor emergency power. 100% tax credit eligible."
        }
      ]
    },
    wood_stove: {
      name: "EPA-Certified Clean Wood / Pellet Stove (75%+ HHV)",
      law: "IRS Section 25C Biomass Stove Credit",
      federalRate: 0.30,
      cap: 2000,
      defaultCost: 3200,
      minCost: 800,
      maxCost: 10000,
      stateRebateEstimate: 400,
      annualUtilitySavingsRate: 0.28,
      icon: Flame,
      accentColor: "orange",
      qualifyingProducts: [
        {
          name: "Ashley Hearth AW1120E-P EPA Certified Wood Stove (68,000 BTU)",
          asin: "B088LJQWTC",
          desc: "Meets EPA 2026 clean air emission limits with >75% thermal efficiency rating."
        },
        {
          name: "Castle Serenity Wood Pellet Stove with Smart Controller",
          asin: "B00FQR70VY",
          desc: "High-efficiency thermal biomass heater with automatic thermostat ignition."
        }
      ]
    },
    rainwater: {
      name: "Stealth Rainwater Catchment & Gravity Filtration",
      law: "State & Municipal Water Conservation Rebates",
      federalRate: 0.0,
      cap: null,
      defaultCost: 1800,
      minCost: 300,
      maxCost: 8000,
      stateRebateEstimate: 600,
      annualUtilitySavingsRate: 0.22,
      icon: Droplets,
      accentColor: "sky",
      qualifyingProducts: [
        {
          name: "Good Ideas Rain Wizard 50-Gal Rain Barrel (Faux Oak)",
          asin: "B003LCSW9K",
          desc: "Qualifies for municipal rain catchment rebates in CA, TX, CO, and AZ."
        },
        {
          name: "Waterdrop King Tank 2.25 Gal Stainless Gravity Purifier",
          asin: "B09BC836BC",
          desc: "Zero-electricity drinking purification for harvested rainwater."
        }
      ]
    }
  };

  const currentCfg = systemConfigs[systemType];

  // Calculate credits
  const rawFedCredit = systemCost * currentCfg.federalRate;
  const federalCredit = currentCfg.cap ? Math.min(rawFedCredit, currentCfg.cap) : rawFedCredit;
  const stateRebate = includeStateRebate ? currentCfg.stateRebateEstimate : 0;
  const netOutOfPocket = Math.max(0, systemCost - federalCredit - stateRebate);
  const estimatedAnnualSavings = Math.round(systemCost * currentCfg.annualUtilitySavingsRate);
  const paybackYears = estimatedAnnualSavings > 0 ? (netOutOfPocket / estimatedAnnualSavings).toFixed(1) : "N/A";

  const handleSelectSystem = (type: SystemType) => {
    setSystemType(type);
    setSystemCost(systemConfigs[type].defaultCost);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="relative w-full max-w-3xl rounded-2xl bg-stone-900 border border-stone-800 shadow-2xl text-stone-100 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif font-bold text-lg sm:text-xl text-stone-100">
                  Residential Clean Energy Credit & Rebate Calculator
                </h3>
                <span className="text-[10px] font-mono uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold hidden sm:inline-block">
                  IRS 25D & IRA 2026
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Calculate federal 30% tax credits, municipal rebates, and net out-of-pocket costs for suburban systems.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Step 1: System Selection */}
          <div>
            <label className="text-xs font-mono uppercase tracking-wider text-amber-400 font-semibold block mb-2">
              1. Select Suburban System Category:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {(Object.keys(systemConfigs) as SystemType[]).map((type) => {
                const cfg = systemConfigs[type];
                const Icon = cfg.icon;
                const isSelected = systemType === type;
                return (
                  <button
                    key={type}
                    onClick={() => handleSelectSystem(type)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
                        : 'bg-stone-950 border-stone-800 hover:border-stone-700 text-stone-400'
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1.5 ${isSelected ? 'text-amber-400' : 'text-stone-500'}`} />
                    <div className={`font-semibold text-xs leading-tight ${isSelected ? 'text-stone-100' : 'text-stone-300'}`}>
                      {cfg.name.split(' (')[0]}
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 mt-1">
                      {cfg.federalRate > 0 ? `${(cfg.federalRate * 100)}% Tax Credit` : 'State Rebates'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: System Cost Input & Slider */}
          <div className="bg-stone-950 p-4 sm:p-5 rounded-xl border border-stone-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <label className="text-xs font-mono text-stone-300 font-bold block">
                  2. Estimated Total System Hardware & Installation Cost:
                </label>
                <span className="text-[11px] text-stone-500">
                  Governed by {currentCfg.law}
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-stone-400 font-bold">$</span>
                <input
                  type="number"
                  min={currentCfg.minCost}
                  max={currentCfg.maxCost}
                  step={100}
                  value={systemCost}
                  onChange={(e) => setSystemCost(Math.max(0, Number(e.target.value)))}
                  className="w-36 bg-stone-900 border border-stone-700 rounded-xl pl-7 pr-3 py-1.5 text-right font-mono font-bold text-amber-400 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <input
              type="range"
              min={currentCfg.minCost}
              max={currentCfg.maxCost}
              step={250}
              value={systemCost}
              onChange={(e) => setSystemCost(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />

            <div className="flex items-center space-x-2 pt-2 border-t border-stone-900">
              <input
                type="checkbox"
                id="state-rebate-toggle"
                checked={includeStateRebate}
                onChange={(e) => setIncludeStateRebate(e.target.checked)}
                className="accent-amber-500 rounded cursor-pointer w-4 h-4"
              />
              <label htmlFor="state-rebate-toggle" className="text-xs text-stone-300 cursor-pointer select-none">
                Include estimated local utility / state rebate (<span className="font-mono text-emerald-400">${currentCfg.stateRebateEstimate}</span> avg)
              </label>
            </div>
          </div>

          {/* Results Financial Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-stone-950 via-stone-900 to-amber-950/30 border border-amber-500/30 shadow-xl space-y-4">
            <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center justify-between">
              <span>Financial Incentive Breakdown</span>
              <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded">Tax Year 2026</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800">
                <span className="text-[10px] font-mono text-stone-400 block uppercase">Original Cost</span>
                <div className="text-lg font-mono font-bold text-stone-200 mt-1">
                  ${systemCost.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/80">
                <span className="text-[10px] font-mono text-emerald-400 block uppercase">Federal Tax Credit</span>
                <div className="text-lg font-mono font-bold text-emerald-300 mt-1">
                  -${federalCredit.toLocaleString()}
                </div>
                <span className="text-[9px] font-mono text-emerald-500 block">
                  {currentCfg.cap ? '30% (Capped)' : currentCfg.federalRate > 0 ? '30% Uncapped' : 'N/A'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/80">
                <span className="text-[10px] font-mono text-sky-400 block uppercase">State Rebates</span>
                <div className="text-lg font-mono font-bold text-sky-300 mt-1">
                  -${stateRebate.toLocaleString()}
                </div>
                <span className="text-[9px] font-mono text-sky-500 block">Estimated</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40">
                <span className="text-[10px] font-mono text-amber-400 block uppercase font-bold">Your Net Cost</span>
                <div className="text-xl font-mono font-black text-amber-300 mt-1">
                  ${netOutOfPocket.toLocaleString()}
                </div>
                <span className="text-[9px] font-mono text-amber-500 block">
                  Save ${(federalCredit + stateRebate).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payback & Utility Savings Note */}
            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center space-x-2 text-stone-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  Est. Annual Utility Bill Avoidance: <strong className="text-emerald-400 font-mono">${estimatedAnnualSavings.toLocaleString()}/yr</strong>
                </span>
              </div>
              <span className="font-mono text-stone-400">
                Estimated Payback: <strong className="text-amber-400">{paybackYears} Years</strong>
              </span>
            </div>
          </div>

          {/* Step 3: Verified Qualifying Products on Amazon */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-mono uppercase tracking-wider text-stone-300 font-semibold flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Field-Tested Products Qualifying for this Credit</span>
              </label>
              <span className="text-[11px] font-mono text-stone-500">
                Verified with Tag: <code className="text-amber-400">{amazonTag}</code>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentCfg.qualifyingProducts.map((p, idx) => {
                const directLink = formatAmazonUrl(p.asin, amazonTag);
                const searchFallbackLink = `https://www.amazon.com/s?k=${encodeURIComponent(p.name)}&tag=${amazonTag}`;
                return (
                  <div key={idx} className="p-4 rounded-xl bg-stone-950 border border-stone-800 flex flex-col justify-between hover:border-stone-700 transition-colors">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-serif font-bold text-sm text-stone-100 leading-snug">
                          {p.name}
                        </h5>
                        <span className="text-[11px] font-mono font-bold text-amber-400 shrink-0 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">
                          Tax Credit Eligible
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                        {p.desc}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-850 flex items-center justify-between">
                      <a
                        href={searchFallbackLink}
                        target={AMAZON_LINK_ATTRIBUTES.target}
                        rel={AMAZON_LINK_ATTRIBUTES.rel}
                        className="text-[11px] font-mono text-stone-400 hover:text-stone-200 underline"
                      >
                        Search Models
                      </a>

                      <a
                        href={directLink}
                        target={AMAZON_LINK_ATTRIBUTES.target}
                        rel={AMAZON_LINK_ATTRIBUTES.rel}
                        className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold font-mono text-xs flex items-center space-x-1 transition-colors shadow-sm"
                      >
                        <span>Check Price on Amazon</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legal / IRS Disclaimer */}
          <p className="text-[11px] text-stone-500 leading-relaxed font-mono">
            * Disclaimer: Tax credit calculations are provided for residential planning estimates under IRS Form 5695 (Residential Energy Credits) and the Inflation Reduction Act of 2022. Consult your CPA or certified tax professional for individual eligibility determinations.
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono font-semibold transition-colors"
          >
            Close Calculator
          </button>

          <button
            onClick={() => {
              onClose();
              const el = document.getElementById('readiness-calculator-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold font-mono flex items-center space-x-1.5 transition-colors shadow-md"
          >
            <span>Open System Readiness Audit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
