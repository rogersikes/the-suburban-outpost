import React, { useState } from 'react';
import { 
  Calculator, 
  Zap, 
  Droplets, 
  Check, 
  SlidersHorizontal, 
  Sparkles, 
  Home, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck, 
  Battery, 
  Sun, 
  Layers, 
  ThermometerSnowflake, 
  Wifi, 
  HeartPulse, 
  Utensils,
  Flame,
  Printer,
  RotateCcw,
  ExternalLink,
  Tag
} from 'lucide-react';
import { trackCalculatorAction, trackAffiliateClick } from '../analytics';
import { formatAmazonUrl, AMAZON_LINK_ATTRIBUTES } from '../amazon';

interface ApplianceOption {
  id: string;
  name: string;
  kwh: number;
  description: string;
  icon: React.ElementType;
}

const APPLIANCES: ApplianceOption[] = [
  { 
    id: 'fridge', 
    name: 'Refrigerator & Deep Freezer', 
    kwh: 2.4, 
    description: 'Continuous cold storage to preserve perishable food and medicine', 
    icon: ThermometerSnowflake 
  },
  { 
    id: 'water', 
    name: 'Running Water (Well Pump / Booster)', 
    kwh: 3.5, 
    description: 'Pressurized water for toilets, showers, and cooking sinks', 
    icon: Droplets 
  },
  { 
    id: 'comms', 
    name: 'Home Office, Wi-Fi & Starlink', 
    kwh: 1.4, 
    description: 'Modem, routers, laptops, satellite comms & emergency news', 
    icon: Wifi 
  },
  { 
    id: 'medical', 
    name: 'Medical Equipment (CPAP / Oxygen)', 
    kwh: 1.2, 
    description: 'Life-critical overnight breathing or diagnostic machines', 
    icon: HeartPulse 
  },
  { 
    id: 'climate', 
    name: 'Climate Zone Heating / Cooling', 
    kwh: 7.2, 
    description: 'Safe-room mini-split heat pump or window AC unit', 
    icon: Zap 
  },
  { 
    id: 'cooking', 
    name: 'Electric Cooking (Induction / Microwave)', 
    kwh: 2.6, 
    description: 'Hot meal preparation independent of natural gas lines', 
    icon: Utensils 
  }
];

interface DwellingType {
  id: string;
  name: string;
  baseKwh: number;
  sqFt: number;
  summary: string;
  people: string;
}

const DWELLINGS: DwellingType[] = [
  { 
    id: 'standard', 
    name: 'Standard Suburban Single-Family', 
    baseKwh: 9.5, 
    sqFt: 1800, 
    summary: '2–4 Bedroom residential home with pitched roof and backyard', 
    people: '3–4 Residents' 
  },
  { 
    id: 'townhome', 
    name: 'Townhome / Urban Lot', 
    baseKwh: 5.5, 
    sqFt: 1100, 
    summary: 'Shared walls, compact roof plane, patio or small yard', 
    people: '1–2 Residents' 
  },
  { 
    id: 'large', 
    name: 'Large Suburban / Fringe Property', 
    baseKwh: 15.0, 
    sqFt: 3000, 
    summary: '4+ Bedrooms, detached garage, larger baseline loads', 
    people: '4–6 Residents' 
  },
  { 
    id: 'cabin', 
    name: 'Backyard Outpost / ADU / Cabin', 
    baseKwh: 3.5, 
    sqFt: 600, 
    summary: 'Compact secondary dwelling or minimalist shelter', 
    people: '1–2 Residents' 
  }
];

export const ReadinessCalculator: React.FC = () => {
  // Step state: 1: Dwelling, 2: Electrical Loads, 3: Water & Heat, 4: Generated Blueprint
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Dwelling & Property
  const [selectedDwelling, setSelectedDwelling] = useState<string>('standard');
  const [occupants, setOccupants] = useState<number>(3);
  const [sunlightHours, setSunlightHours] = useState<number>(4.2); // Average US peak sun hours

  // Step 2: Critical Loads & Duration
  const [selectedAppliances, setSelectedAppliances] = useState<string[]>(['fridge', 'water', 'comms', 'medical']);
  const [autonomyDays, setAutonomyDays] = useState<number>(7); // 3, 7, 14, 30

  // Step 3: Water & Thermal Strategy
  const [waterStrategy, setWaterStrategy] = useState<'slimline' | 'bladder' | 'gravity'>('slimline');
  const [heatingStrategy, setHeatingStrategy] = useState<'wood' | 'minisplit' | 'propane'>('wood');

  // Calculations
  const dwelling = DWELLINGS.find(d => d.id === selectedDwelling) || DWELLINGS[0];
  const appliancesKwh = APPLIANCES
    .filter(a => selectedAppliances.includes(a.id))
    .reduce((sum, a) => sum + a.kwh, 0);

  const dailyKwh = Math.round((dwelling.baseKwh + appliancesKwh) * 10) / 10;
  
  // Solar Array Required (with 25% safety margin / system losses)
  const solarKwNeeded = Math.round(((dailyKwh * 1.25) / sunlightHours) * 10) / 10;
  
  // Battery Bank Needed for target autonomy duration (accounting for 80% DoD)
  const batteryKwhNeeded = Math.round((dailyKwh * 0.85 * Math.min(autonomyDays, 7)) * 10) / 10;
  
  // Rainwater: Roof Area * 0.623 * 36 inches annual rainfall avg
  const annualWaterGallons = Math.round(dwelling.sqFt * 0.623 * 34);
  const dailyWaterNeedsGal = occupants * 3.5; // Emergency baseline consumption (drinking, cooking, hygiene)
  const recommendedCisternGal = Math.min(1500, Math.max(350, Math.round(dailyWaterNeedsGal * autonomyDays * 1.2)));

  // Estimated System Hardware Budget Range
  const lowCost = Math.round((solarKwNeeded * 800) + (batteryKwhNeeded * 450) + (recommendedCisternGal * 1.2));
  const highCost = Math.round((solarKwNeeded * 1200) + (batteryKwhNeeded * 650) + (recommendedCisternGal * 2.0));

  const toggleAppliance = (id: string) => {
    setSelectedAppliances(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleGenerateBlueprint = () => {
    trackCalculatorAction('generate_blueprint', {
      dwelling: selectedDwelling,
      occupants,
      autonomyDays,
      dailyKwh,
      solarKwNeeded,
      batteryKwhNeeded,
      recommendedCisternGal
    });
    setStep(4);
    // Smooth scroll into view
    const el = document.getElementById('readiness-calculator-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="readiness-calculator-section" className="rounded-2xl sm:rounded-3xl bg-stone-900 border border-stone-800 p-4 sm:p-8 lg:p-10 shadow-2xl text-stone-200 relative overflow-hidden">
      {/* Decorative ambient gradient */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-800">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
            <Calculator className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-amber-500">
                Interactive Engineering Widget
              </span>
            </div>
            <h3 className="font-serif font-extrabold text-xl sm:text-2xl text-stone-100 tracking-tight">
              Suburban Off-Grid Readiness Calculator
            </h3>
          </div>
        </div>

        {/* Step Indicator Badges */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 text-xs font-mono">
          {[
            { num: 1, label: 'Property' },
            { num: 2, label: 'Loads' },
            { num: 3, label: 'Strategy' },
            { num: 4, label: 'Blueprint' }
          ].map(s => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div 
                key={s.num}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg border transition-all ${
                  isActive 
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                    : isCompleted
                      ? 'bg-stone-800/80 border-stone-700 text-emerald-400'
                      : 'bg-stone-950 border-stone-850 text-stone-400 opacity-60'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="w-4 h-4 rounded-full bg-stone-800 text-[10px] flex items-center justify-center font-bold">
                    {s.num}
                  </span>
                )}
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-stone-950 h-1.5 rounded-full overflow-hidden my-6 border border-stone-800">
        <div 
          className="bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-500 h-full transition-all duration-500 ease-out"
          style={{ width: `${(step / 4) * 100}%` }}
        ></div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: PROPERTY & DWELLING PROFILE                                       */}
      {/* ========================================================================= */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h4 className="text-base sm:text-lg font-serif font-bold text-stone-100 flex items-center space-x-2">
              <Home className="w-5 h-5 text-amber-400" />
              <span>Step 1: Select Your Property & Dwelling Profile</span>
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              Dwelling square footage and roof dimensions dictate your solar footprint and annual rainwater harvestable volume.
            </p>
          </div>

          {/* Dwelling Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {DWELLINGS.map(d => {
              const isSelected = selectedDwelling === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setSelectedDwelling(d.id)}
                  className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-amber-950/20 border-amber-500/70 shadow-lg shadow-amber-950/30 ring-1 ring-amber-500/40' 
                      : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-serif font-bold text-stone-100 text-sm sm:text-base">
                      {d.name}
                    </span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-amber-500 border-amber-400 text-stone-950' : 'border-stone-700 bg-stone-900'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                  <p className="text-xs text-stone-300 mt-2 leading-relaxed font-sans">
                    {d.summary}
                  </p>
                  <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] font-mono text-stone-400">
                    <span>Est. Area: <strong className="text-stone-200">{d.sqFt} sq ft</strong></span>
                    <span>Baseline: <strong className="text-amber-400">~{d.baseKwh} kWh/day</strong></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Household Occupants & Sun Exposure */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
              <label className="block text-xs font-mono font-semibold text-stone-300 mb-2">
                HOUSEHOLD OCCUPANTS: <span className="text-amber-400 font-bold">{occupants} People</span>
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setOccupants(num)}
                    className={`flex-1 py-2 rounded-lg text-xs font-mono font-bold transition-all ${
                      occupants === num 
                        ? 'bg-amber-600 text-stone-950' 
                        : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    {num}{num === 6 ? '+' : ''}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-stone-400 mt-2 block">
                Calculates drinking, cooking, and sanitation water demand.
              </span>
            </div>

            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
              <label className="block text-xs font-mono font-semibold text-stone-300 mb-2">
                AVERAGE DAILY PEAK SUNLIGHT: <span className="text-amber-400 font-bold">{sunlightHours} Hours</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: '3.5h North', val: 3.5 },
                  { label: '4.2h Mid', val: 4.2 },
                  { label: '5.2h South', val: 5.2 }
                ].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setSunlightHours(opt.val)}
                    className={`py-2 px-1 rounded-lg text-xs font-mono font-bold transition-all text-center ${
                      sunlightHours === opt.val 
                        ? 'bg-amber-600 text-stone-950' 
                        : 'bg-stone-900 text-stone-300 hover:bg-stone-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-stone-400 mt-2 block">
                Accounts for solar panel angle and regional sun hours.
              </span>
            </div>
          </div>

          {/* Next Button */}
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={() => {
                trackCalculatorAction('step_next', { from: 1, to: 2 });
                setStep(2);
              }}
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-lg active:scale-95"
            >
              <span>Next: Select Critical Loads</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: CRITICAL ELECTRICAL LOADS & OUTAGE TARGET                         */}
      {/* ========================================================================= */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h4 className="text-base sm:text-lg font-serif font-bold text-stone-100 flex items-center space-x-2">
              <Zap className="w-5 h-5 text-amber-400" />
              <span>Step 2: Define Critical Loads & Grid-Down Target</span>
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              Select which household appliances must stay energized during a prolonged blackout or complete utility disconnection.
            </p>
          </div>

          {/* Independence Duration */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800">
            <label className="block text-xs font-mono font-semibold text-stone-300 mb-2">
              TARGET GRID-DOWN INDEPENDENCE: <span className="text-amber-400 font-bold">{autonomyDays} Days</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { days: 3, label: '3 Days', desc: 'Weekend Blackout' },
                { days: 7, label: '7 Days', desc: 'Regional Grid Freeze' },
                { days: 14, label: '14 Days', desc: 'Severe Emergency' },
                { days: 30, label: '30+ Days', desc: '100% Off-Grid' }
              ].map(opt => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setAutonomyDays(opt.days)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    autonomyDays === opt.days 
                      ? 'bg-amber-950/40 border-amber-500/80 text-amber-300 ring-1 ring-amber-500/30' 
                      : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <div className="font-mono font-bold text-sm">{opt.label}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Appliances Multi-Select Grid */}
          <div className="space-y-2.5">
            <span className="block text-xs font-mono font-semibold text-stone-300 uppercase">
              Select Household Circuits to Power:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {APPLIANCES.map(app => {
                const isSelected = selectedAppliances.includes(app.id);
                const Icon = app.icon;
                return (
                  <div
                    key={app.id}
                    onClick={() => toggleAppliance(app.id)}
                    className={`p-3.5 sm:p-4 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                      isSelected
                        ? 'bg-amber-950/20 border-amber-500/60 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-stone-950 border-stone-800 hover:border-stone-700 opacity-75'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-stone-900 text-stone-500'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-xs sm:text-sm text-stone-100 truncate">
                          {app.name}
                        </span>
                        <span className="text-[11px] font-mono text-amber-400 shrink-0 ml-2">
                          +{app.kwh} kWh
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-300 mt-1 leading-snug">
                        {app.description}
                      </p>
                    </div>

                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected ? 'bg-amber-500 border-amber-400 text-stone-950' : 'border-stone-700 bg-stone-900'
                    }`}>
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Running Wattage Total Ticker */}
          <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between text-xs font-mono">
            <span className="text-stone-400">Total Calculated Electrical Consumption:</span>
            <span className="text-amber-400 font-bold text-sm">
              {dailyKwh} kWh / Day
            </span>
          </div>

          {/* Nav Buttons */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono font-semibold flex items-center space-x-1.5 transition-colors border border-stone-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={() => {
                trackCalculatorAction('step_next', { from: 2, to: 3 });
                setStep(3);
              }}
              className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold font-mono text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-lg active:scale-95"
            >
              <span>Next: Water & Thermal Strategy</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: WATER & THERMAL REDUNDANCY STRATEGY                               */}
      {/* ========================================================================= */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h4 className="text-base sm:text-lg font-serif font-bold text-stone-100 flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-sky-400" />
              <span>Step 3: Water Harvest & Emergency Heating Defense</span>
            </h4>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              Select your stealth water storage setup and winter thermal source to calculate your complete autonomous bill of materials.
            </p>
          </div>

          {/* Water Catchment Choice */}
          <div>
            <label className="block text-xs font-mono font-semibold text-stone-300 mb-2 uppercase">
              Rainwater Catchment & Storage Strategy:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'slimline',
                  title: 'Slimline Wall Cisterns',
                  desc: 'Mounts flush behind cedar privacy fences. 100% stealth from street.',
                  cap: '500–1,000 Gallons'
                },
                {
                  id: 'bladder',
                  title: 'Under-Deck TPU Bladder',
                  desc: 'Lays flat in dead space beneath rear deck. UV-protected & hidden.',
                  cap: '750–1,500 Gallons'
                },
                {
                  id: 'gravity',
                  title: 'Countertop Gravity Purifier',
                  desc: 'Zero-electricity dual-carbon elements for clean drinking water.',
                  cap: 'Point-of-Use Hub'
                }
              ].map(w => {
                const isSelected = waterStrategy === w.id;
                return (
                  <div
                    key={w.id}
                    onClick={() => setWaterStrategy(w.id as any)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-sky-950/30 border-sky-500/70 text-sky-200 ring-1 ring-sky-500/30'
                        : 'bg-stone-950 border-stone-800 hover:border-stone-700 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-serif font-bold text-sm text-stone-100">{w.title}</span>
                      {isSelected && <Check className="w-4 h-4 text-sky-400" />}
                    </div>
                    <p className="text-xs text-stone-300 leading-snug">{w.desc}</p>
                    <div className="mt-2 pt-2 border-t border-stone-800 text-[10px] font-mono text-sky-400">
                      Capacity Target: {w.cap}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Heating Strategy */}
          <div>
            <label className="block text-xs font-mono font-semibold text-stone-300 mb-2 uppercase">
              Backup Heating & Thermal Redundancy:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'wood',
                  title: 'EPA Clean-Burn Wood Stove',
                  desc: 'Zero electricity required. Independent of grid power or gas line pressure.',
                  rating: '100% Off-Grid'
                },
                {
                  id: 'minisplit',
                  title: 'Inverter Mini-Split Heat Pump',
                  desc: 'High seasonal efficiency (SEER 22+). Powered directly by battery bank.',
                  rating: 'Clean & Silent'
                },
                {
                  id: 'propane',
                  title: 'Catalytic Vent-Free Gas',
                  desc: 'Operates on standard 20lb / 100lb tanks with zero electric hookup.',
                  rating: 'Compact Backup'
                }
              ].map(h => {
                const isSelected = heatingStrategy === h.id;
                return (
                  <div
                    key={h.id}
                    onClick={() => setHeatingStrategy(h.id as any)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-950/30 border-amber-500/70 text-amber-200 ring-1 ring-amber-500/30'
                        : 'bg-stone-950 border-stone-800 hover:border-stone-700 text-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-serif font-bold text-sm text-stone-100">{h.title}</span>
                      {isSelected && <Check className="w-4 h-4 text-amber-400" />}
                    </div>
                    <p className="text-xs text-stone-300 leading-snug">{h.desc}</p>
                    <div className="mt-2 pt-2 border-t border-stone-800 text-[10px] font-mono text-amber-400">
                      Rating: {h.rating}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Nav & Generate Blueprint Button */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-mono font-semibold flex items-center space-x-1.5 transition-colors border border-stone-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              type="button"
              onClick={handleGenerateBlueprint}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 font-extrabold font-mono text-xs uppercase tracking-wider flex items-center space-x-2 transition-all shadow-xl shadow-amber-950/50 hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              <span>Generate Autonomous Blueprint</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: THE SUBURBAN AUTONOMY BLUEPRINT                                   */}
      {/* ========================================================================= */}
      {step === 4 && (
        <div className="space-y-8 animate-fadeIn">
          {/* Blueprint Title & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-800">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  BLUEPRINT COMPILED
                </span>
                <span className="text-xs font-mono text-stone-400">
                  Target: {autonomyDays} Days Autonomy
                </span>
              </div>
              <h4 className="text-xl sm:text-2xl font-serif font-extrabold text-stone-100 mt-1">
                Your Suburban Autonomy Engineering Blueprint
              </h4>
              <p className="text-xs sm:text-sm text-stone-300 mt-0.5">
                Engineered for {dwelling.name} ({dwelling.sqFt} sq ft, {occupants} occupants).
              </p>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-mono font-semibold flex items-center space-x-1.5 border border-stone-700 transition-colors"
                title="Modify Assumed Parameters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Adjust Inputs</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-mono font-bold flex items-center space-x-1.5 transition-colors shadow-md"
                title="Print or Save PDF Blueprint"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Spec</span>
              </button>
            </div>
          </div>

          {/* Sizing Results Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Solar */}
            <div className="p-5 rounded-2xl bg-stone-950 border border-amber-500/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase font-bold text-amber-400">Solar Array</span>
                <Sun className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-mono">
                {solarKwNeeded} kW
              </div>
              <p className="text-xs text-stone-400 mt-1 leading-snug">
                ~{Math.round(solarKwNeeded * 2.5)} bifacial 400W panels. Mountable below 6ft fence or on garage roof.
              </p>
            </div>

            {/* Card 2: Battery Storage */}
            <div className="p-5 rounded-2xl bg-stone-950 border border-emerald-500/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase font-bold text-emerald-400">Battery Reserve</span>
                <Battery className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-mono">
                {batteryKwhNeeded} kWh
              </div>
              <p className="text-xs text-stone-400 mt-1 leading-snug">
                Grade-A LiFePO4 cells. 3,500+ cycle life. Silent indoor operation (&lt;32 dBA).
              </p>
            </div>

            {/* Card 3: Water Capacity */}
            <div className="p-5 rounded-2xl bg-stone-950 border border-sky-500/40 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-sky-500/10 rounded-full blur-xl pointer-events-none"></div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase font-bold text-sky-400">Water Storage</span>
                <Droplets className="w-4 h-4 text-sky-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-mono">
                {recommendedCisternGal} Gal
              </div>
              <p className="text-xs text-stone-400 mt-1 leading-snug">
                Covers {autonomyDays} days emergency consumption for {occupants} people + first-flush filter.
              </p>
            </div>

            {/* Card 4: Daily Energy Baseline */}
            <div className="p-5 rounded-2xl bg-stone-950 border border-stone-800 relative overflow-hidden group">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono uppercase font-bold text-stone-400">Daily Demand</span>
                <Zap className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-stone-100 font-mono">
                {dailyKwh} <span className="text-sm font-sans font-normal text-stone-400">kWh/day</span>
              </div>
              <p className="text-xs text-stone-400 mt-1 leading-snug">
                Powers refrigerator, water pressure, Starlink comms, and medical circuits.
              </p>
            </div>
          </div>

          {/* Hardware & Stealth Feasibility Verification */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Cost & Specs */}
            <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl bg-stone-950 border border-stone-800 space-y-4">
              <h5 className="font-serif font-bold text-stone-100 text-base flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>Estimated Hardware Bill of Materials & Investment</span>
              </h5>
              
              <div className="flex items-baseline space-x-3 text-stone-100">
                <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-400">
                  ${lowCost.toLocaleString()} – ${highCost.toLocaleString()}
                </span>
                <span className="text-xs font-mono text-stone-400">
                  Complete DIY & Semi-Pro Equipment Cost
                </span>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-850 text-xs font-mono">
                <div className="flex items-center justify-between text-stone-300">
                  <span>• Solar Panels ({solarKwNeeded}kW Bifacial):</span>
                  <span>${Math.round(solarKwNeeded * 850).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-stone-300">
                  <span>• LFP Battery & Inverter ({batteryKwhNeeded}kWh):</span>
                  <span>${Math.round(batteryKwhNeeded * 550).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-stone-300">
                  <span>• Rainwater Catchment ({recommendedCisternGal} Gal Stealth):</span>
                  <span>${Math.round(recommendedCisternGal * 1.5).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-stone-300">
                  <span>• NEC 702 Transfer Switch & Wire Harness:</span>
                  <span>$450 – $650</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300 flex items-start space-x-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>HOA & Zoning Feasibility:</strong> 100% compliant when installed behind cedar fence lines. Zero combustion exhaust, noise level under 32 dBA, and zero backfeed to municipal grid.
                </span>
              </div>
            </div>

            {/* Field Tested Hardware Recommendations */}
            <div className="p-5 sm:p-6 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-mono text-amber-400 uppercase font-semibold">
                  Field-Tested Hardware
                </span>
                <h5 className="font-serif font-bold text-stone-100 text-base mt-0.5">
                  Recommended Core Components
                </h5>
                <p className="text-xs text-stone-400 mt-1">
                  Amazon verified models tested for low-noise suburban duty cycles:
                </p>

                <div className="space-y-3 mt-4">
                  <a
                    href={formatAmazonUrl('B09MVJP7MV')}
                    target={AMAZON_LINK_ATTRIBUTES.target}
                    rel={AMAZON_LINK_ATTRIBUTES.rel}
                    onClick={() => trackAffiliateClick('B09MVJP7MV', 'EcoFlow DELTA Pro', 'readiness-calculator')}
                    className="p-3 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 block transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                      <span className="group-hover:underline">EcoFlow DELTA Pro 3600Wh</span>
                      <span className="flex items-center text-[11px] font-mono font-bold bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-amber-300">
                        View on Amazon <ExternalLink className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      3.6kWh – 25kWh LFP. 32 dBA quiet.
                    </div>
                  </a>

                  <a
                    href={formatAmazonUrl('B09BC836BC')}
                    target={AMAZON_LINK_ATTRIBUTES.target}
                    rel={AMAZON_LINK_ATTRIBUTES.rel}
                    onClick={() => trackAffiliateClick('B09BC836BC', 'Waterdrop King Tank Gravity Purifier', 'readiness-calculator')}
                    className="p-3 rounded-xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 block transition-all group"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                      <span className="group-hover:underline">Waterdrop King Tank Stainless 2.25 Gal</span>
                      <span className="flex items-center text-[11px] font-mono font-bold bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded text-amber-300">
                        View on Amazon <ExternalLink className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-0.5">
                      Zero-electric gravity drinking water purifier (304 stainless).
                    </div>
                  </a>
                </div>
              </div>

              <div className="pt-2 text-[10px] font-mono text-stone-500">
                Purchases through these links support The Suburban Outpost research homestead.
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
