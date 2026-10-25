import React, { useState } from 'react';
import { 
  Zap, 
  Droplets, 
  Flame, 
  Info, 
  VolumeX, 
  Package, 
  ShieldCheck, 
  Cpu,
  Layers,
  ArrowRight,
  Activity,
  CheckCircle2
} from 'lucide-react';

export interface SchematicStage {
  label: string;
  name: string;
  specs: string;
  sub: string;
  detail: string;
  color?: string;
}

export interface TechnicalDiagramProps {
  type: 'solar' | 'rainwater' | 'stove' | 'well_pump' | 'generator_soundproof' | 'root_cellar' | 'sanitation' | 'transfer_switch' | 'custom';
  title?: string;
  subtitle?: string;
  codeStandard?: string;
  stages?: SchematicStage[];
}

export const TechnicalDiagram: React.FC<TechnicalDiagramProps> = ({ 
  type, 
  title,
  subtitle,
  codeStandard,
  stages: customStages
}) => {
  const [activeNode, setActiveNode] = useState<number | null>(null);

  // Pre-engineered blueprints for all core suburban off-grid systems
  const BLUEPRINTS: Record<string, {
    defaultTitle: string;
    defaultSubtitle: string;
    standard: string;
    icon: any;
    accentColor: string;
    stages: SchematicStage[];
  }> = {
    well_pump: {
      defaultTitle: "SCHEMATIC: 240V Deep Well Submersible Off-Grid Microgrid",
      defaultSubtitle: "L14-30 240V Pure Sine Inverter • Pressure Switch 30/50 PSI • 44-Gal Bladder Buffer",
      standard: "NEC 430 & Suburban HOA Noise Nuisance Code",
      icon: Droplets,
      accentColor: "sky",
      stages: [
        {
          label: "POWER SOURCE",
          name: "240V Split-Phase L14-30",
          specs: "3600W Cont. / 7200W Surge",
          sub: "Dual 120V Inverter Hub",
          detail: "Provides the heavy 3.5x locked-rotor inductive start surge required by deep submersible pumps without sagging below 220V."
        },
        {
          label: "ISOLATION",
          name: "Double-Pole Motor Breaker",
          specs: "2-Pole 20A DIN-Rail",
          sub: "NEC 430 Motor Branch",
          detail: "Protects against motor winding overheating and provides physical lock-out/tag-out during casing maintenance."
        },
        {
          label: "AUTOMATION",
          name: "Square D 30/50 PSI Switch",
          specs: "Mechanically Actuated",
          sub: "Automatic Pressure Trip",
          detail: "Closes contact when system drops to 30 PSI, and cuts power at 50 PSI. Eliminates need for electronic sensors."
        },
        {
          label: "HYDRAULIC BUFFER",
          name: "44-Gal Bladder Tank",
          specs: "11.6 Gal Drawdown @ 30/50",
          sub: "Butyl Diaphragm",
          detail: "Buffers pump duty cycle to less than 4 starts per hour, extending well pump lifespan from 5 years to 20+ years."
        },
        {
          label: "DOWNHOLE LOAD",
          name: "1/2HP - 1HP 2-Wire Submersible",
          specs: "10-15 GPM @ 150-300ft Head",
          sub: "Stainless Casing & Wire Rope",
          detail: "Zero above-ground noise (<20 dB at wellhead cap), rendering water production completely undetectable to suburban neighbors."
        }
      ]
    },
    generator_soundproof: {
      defaultTitle: "SCHEMATIC: Decibel Suppression Baffle Enclosure (<35 dBA @ 20ft)",
      defaultSubtitle: "Acoustic Labyrinth Maze • Mass Loaded Vinyl 2lb/sqft • Forced 220 CFM Exhaust",
      standard: "Suburban Municipal Night Noise Code (<45 dB)",
      icon: VolumeX,
      accentColor: "amber",
      stages: [
        {
          label: "AIR INTAKE",
          name: "Acoustic S-Curve Baffle",
          specs: "Dual 90° Fiberglass Lined",
          sub: "Zero Direct Line-of-Sight",
          detail: "Forces sound waves into sound-absorbing acoustic foam while permitting uninhibited ambient air for engine combustion."
        },
        {
          label: "MASS ENCLOSURE",
          name: "Dual-Layer MLV Barrier",
          specs: "2 lb/sqft Mass Loaded Vinyl",
          sub: "Mounted to 3/4in MDO Plywood",
          detail: "Stops low-frequency 50-100Hz engine piston rumble that penetrates standard plastic or single-ply wooden sheds."
        },
        {
          label: "THERMAL RELIEF",
          name: "220 CFM Dual 12V Blower Fans",
          specs: "Negative Pressure Static Flow",
          sub: "Powered by Generator 12V Out",
          detail: "Extracts engine heat at 1.8 cubic feet per second, preventing carburetor vapor lock in high summer temperatures."
        },
        {
          label: "EXHAUST TREATMENT",
          name: "Secondary Resonator Muffler",
          specs: "Class A Stainless Deflector",
          sub: "USDA Forest Service Spark Arrestor",
          detail: "Diffuses the sharp crack of high-pressure exhaust gas into quiet, continuous laminar airflow."
        },
        {
          label: "GROUND DECOUPLING",
          name: "Industrial Vibration Isolators",
          specs: "4x 50-Durometer Neoprene Mounts",
          sub: "Decouples from Concrete Slab",
          detail: "Prevents mechanical vibration from resonating through concrete foundations into adjacent neighborhood fence lines."
        }
      ]
    },
    root_cellar: {
      defaultTitle: "SCHEMATIC: Crawl Space Passive Cold-Storage HVAC Architecture",
      defaultSubtitle: "Thermosiphon Earth Intake • 50°-55°F Thermal Stability • 85-90% RH Control",
      standard: "Suburban Basement Foundation Building Code",
      icon: Package,
      accentColor: "emerald",
      stages: [
        {
          label: "AIR INTAKE",
          name: "North-Facing Low Ground Pipe",
          specs: "4in Schedule 40 PVC Intake",
          sub: "Bug Mesh & Incline Drain",
          detail: "Draws cool night air into the floor level of the crawl space, utilizing sub-soil thermal mass to chill intake temperature."
        },
        {
          label: "INSULATION",
          name: "R-15 Closed-Cell Foam Partition",
          specs: "2-inch Rigid Polyiso + Foil",
          sub: "Isolated from Heated Living Area",
          detail: "Prevents living room radiant floor heat from elevating cellar temperatures above the 55°F microbial spoil boundary."
        },
        {
          label: "HUMIDITY BUFFER",
          name: "Pea Gravel / Sand Floor Base",
          specs: "4in Washed Earth Base",
          sub: "Periodic Moisture Retention",
          detail: "Maintains 85-90% relative humidity, keeping root crops (potatoes, carrots, squash) turgid without skin shriveling."
        },
        {
          label: "WARM AIR EXHAUST",
          name: "High-Ceiling Siphon Stack",
          specs: "4in Insulated Vertical Flue",
          sub: "Barometric Butterfly Damper",
          detail: "Passively vents warmed humid air outside as cold floor air enters, establishing a self-powered thermal convection loop."
        }
      ]
    },
    transfer_switch: {
      defaultTitle: "SCHEMATIC: NEC 702 Residential Utility Isolation & Transfer Subpanel",
      defaultSubtitle: "2-Pole Double-Throw Mechanical Interlock • 30A L14-30 Inlet • 6-10 Critical Loads",
      standard: "NEC Article 702 (Optional Standby Systems)",
      icon: Zap,
      accentColor: "amber",
      stages: [
        {
          label: "GRID INCOMING",
          name: "200A Utility Meter & Main Panel",
          specs: "120/240V Single Phase",
          sub: "Utility Transformer Feed",
          detail: "Standard residential electric grid entry. Must be safely and physically isolated before backup power is introduced."
        },
        {
          label: "PHYSICAL INTERLOCK",
          name: "NEC 702 Mechanical Slide Bar",
          specs: "Zero Backfeed Possibility",
          sub: "UL 1008 Certified Interlock",
          detail: "Guarantees utility main breaker and generator breaker can never both be closed simultaneously, protecting lineworkers."
        },
        {
          label: "EXTERNAL INLET",
          name: "NEMA L14-30P Power Inlet Box",
          specs: "30A 120/240V 4-Prong Twist",
          sub: "Exterior Weatherproof NEMA 3R",
          detail: "Allows safe plug-in of off-grid solar station or quiet generator using an outdoor heavy-gauge 10/4 SOOW cord."
        },
        {
          label: "CRITICAL CIRCUITS",
          name: "Dedicated Transfer Subpanel",
          specs: "6-10 Essential Breakers",
          sub: "Well Pump, Fridge, Furnace Blower",
          detail: "Routes emergency power exclusively to designated life-support circuits, preventing overload of battery reserves."
        }
      ]
    },
    sanitation: {
      defaultTitle: "SCHEMATIC: Closed-Loop Waterless Sanitation & Negative Pressure Draft",
      defaultSubtitle: "Urine Diverter • 12V 0.5W Continuous Ventilation • Odorless Carbon Matrix",
      standard: "Uniform Plumbing Code (UPC) Alternate Fixture",
      icon: ShieldCheck,
      accentColor: "purple",
      stages: [
        {
          label: "SEPARATION",
          name: "Precision Liquid Diverter",
          specs: "Front-Funnel Liquid Trap",
          sub: "Zero Contact with Solids",
          detail: "Separating liquids from solids eliminates 99% of methane and ammonia odor by preventing anaerobic fermentation."
        },
        {
          label: "SOLID REACTOR",
          name: "Desiccating Carbon Chamber",
          specs: "Coconut Coir or Peat Moss",
          sub: "Spider-Agitator Handle",
          detail: "Dehydrates solid organic matter rapidly. Aerobic microbes break down waste without smell or insect attraction."
        },
        {
          label: "DRAFT VENTILATION",
          name: "12V Sealed Impeller Fan",
          specs: "0.5W Draw • 14 CFM Continuous",
          sub: "Negative Pressure Inside Bowl",
          detail: "Maintains a constant inward airflow through the toilet seat, pulling all air outside through an exterior wall vent."
        },
        {
          label: "DISCHARGE",
          name: "Insect-Screened Exterior Hood",
          specs: "1.5in Schedule 40 or Marine Flue",
          sub: "Suburban Disguised Flue Cap",
          detail: "Vents silently through an unobtrusive exterior wall penetration that looks identical to a standard bathroom fan outlet."
        }
      ]
    },
    solar: {
      defaultTitle: "SCHEMATIC: 48V 16S LiFePO4 Outpost Power Architecture",
      defaultSubtitle: "Rooftop Bifacial Strings • SmartSolar MPPT • Lynx 1000A Busbar • 6000W Inverter",
      standard: "NEC 705 & UL 1973 Residential Storage",
      icon: Zap,
      accentColor: "amber",
      stages: [
        {
          label: "SOURCE INPUT",
          name: "Rooftop Bifacial PV Array",
          specs: "4,800W PV • 140V Voc (3S2P)",
          sub: "10AWG Dual Shield Cable",
          detail: "Keeps string voltage well below the 250V cold-weather threshold while optimizing early morning diffuse daylight."
        },
        {
          label: "CONVERSION",
          name: "SmartSolar MPPT 250/100",
          specs: "99% High-Speed Tracking",
          sub: "Ultra-Fast Multi-Peak Search",
          detail: "Recovers up to 30% more energy during partial suburban roof shading compared to standard pulse-width controllers."
        },
        {
          label: "SAFETY & SYNC",
          name: "Lynx Class-T 1000A Busbar",
          specs: "Class-T 250A Fuse (20kA I.R.)",
          sub: "2/0 Pure Copper Cable",
          detail: "Essential fire-safety junction with a 20,000A interrupt rating to prevent catastrophic lithium cell dead-shorts."
        },
        {
          label: "STORAGE RESERVE",
          name: "16S 280Ah LiFePO4 Battery",
          specs: "14.3 kWh Usable @ 51.2V",
          sub: "200A Smart BMS Active Balancer",
          detail: "Prismatic Grade-A cells capable of 6,000 cycles to 80% DoD (~15 years of daily residential cycling)."
        },
        {
          label: "AC OUTPUT",
          name: "Split-Phase Hybrid Inverter",
          specs: "6,000W Pure Sine 120/240V",
          sub: "Subpanel Critical Loads",
          detail: "Features an automatic 20ms transfer relay that switches off-grid instantly without rebooting sensitive electronics."
        }
      ]
    },
    rainwater: {
      defaultTitle: "SCHEMATIC: Gravity-Fed Triple Stage Rainwater Flow",
      defaultSubtitle: "Gutter Leaf Screen • 15-Gal First Flush • Food-Grade Opaque Cistern • Ceramic Filter",
      standard: "ARCSA / ASPE Rainwater Standard 63",
      icon: Droplets,
      accentColor: "sky",
      stages: [
        {
          label: "STAGE 1",
          name: "Gutter & Leaf Screen",
          specs: "Stainless 20-Mesh Screen",
          sub: "Pre-Downspout Debris Rejection",
          detail: "Rejects leaves, pine needles, and roof grit before water enters the vertical downspout drop."
        },
        {
          label: "STAGE 2",
          name: "First-Flush Diverter",
          specs: "15-Gal Automatic Ball Float",
          sub: "Slow-Drain Drip Emitter",
          detail: "Isolates the initial 15 gallons containing airborne dust and bird droppings; once full, the floating ball seals."
        },
        {
          label: "STAGE 3",
          name: "UV-Opaque Poly Cistern",
          specs: "500-1000 Gal Food-Grade Tank",
          sub: "100% Light-Blocking Resin",
          detail: "Completely blocks sunlight to prevent algae photosynthesis without requiring chlorine or chemical stabilizers."
        },
        {
          label: "STAGE 4",
          name: "Gravity Ceramic Purifier",
          specs: "0.2 Micron Microfiltration",
          sub: "Activated Coconut Carbon",
          detail: "Zero-electricity drinking purification removing bacteria, cysts, chlorine, and microplastics."
        }
      ]
    },
    stove: {
      defaultTitle: "SCHEMATIC: EPA Certified Clean-Burn Stove Clearances & Class-A Flue",
      defaultSubtitle: "6-Inch Rear Clearance • Type-2 R-1.2 Hearth Pad • 3-2-10 Roof Penetration Rule",
      standard: "NFPA 211 & EPA 2026 Clean Air NSPS",
      icon: Flame,
      accentColor: "orange",
      stages: [
        {
          label: "CLEARANCE",
          name: "Protected Combustible Wall",
          specs: "6-Inch Minimum Air Gap",
          sub: "24-Gauge Sheet Metal Shield",
          detail: "Allows safe stove placement against standard sheetrock/stud walls without exceeding maximum allowable heat rise."
        },
        {
          label: "FLOOR BASE",
          name: "Type-2 R-1.2 Hearth Pad",
          specs: "Extends 16in in Front of Door",
          sub: "Non-Combustible Mineral Board",
          detail: "Safeguards against ember rollout when opening the door during reloading and prevents radiant carpet scorching."
        },
        {
          label: "FLUE RISER",
          name: "Double-Wall Close-Clearance Pipe",
          specs: "6-Inch Black Flue Pipe",
          sub: "Tested to 2,100°F Creosote Flash",
          detail: "Maintains high flue gas temperatures to prevent creosote condensation while permitting tight 6-inch clearances."
        },
        {
          label: "ROOF TERMINATION",
          name: "3-2-10 Foot Roof Rule",
          specs: "Class-A Double-Wall Stainless",
          sub: "Spark Arrestor Rain Cap",
          detail: "Pipe extends 3 feet above roof penetration and 2 feet higher than any portion of the roof within a 10-foot radius."
        }
      ]
    }
  };

  const selectedBlueprint = BLUEPRINTS[type] || BLUEPRINTS.solar;
  const currentTitle = title || selectedBlueprint.defaultTitle;
  const currentSubtitle = subtitle || selectedBlueprint.defaultSubtitle;
  const currentStandard = codeStandard || selectedBlueprint.standard;
  const currentStages = customStages || selectedBlueprint.stages;
  const Icon = selectedBlueprint.icon;

  return (
    <div className="my-6 sm:my-8 rounded-2xl bg-stone-950 border border-stone-800 p-4 sm:p-6 shadow-2xl overflow-hidden relative group">
      {/* Schematic Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 sm:pb-4 mb-4 border-b border-stone-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-xs sm:text-sm font-bold text-stone-100 font-mono tracking-wide">
                {currentTitle}
              </h4>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-400 font-sans mt-0.5">
              {currentSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-stone-900 text-stone-300 border border-stone-800 font-semibold">
            {currentStandard}
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold hidden sm:inline-block">
            AI Blueprint Active
          </span>
        </div>
      </div>

      {/* Visual Component Pipeline */}
      <div className="relative overflow-x-auto pb-2 scrollbar-thin">
        <div 
          className="grid gap-2.5 sm:gap-3 text-center min-w-[620px]"
          style={{ gridTemplateColumns: `repeat(${currentStages.length}, minmax(130px, 1fr))` }}
        >
          {currentStages.map((stage, idx) => {
            const isSelected = activeNode === idx;
            return (
              <div 
                key={idx}
                onClick={() => setActiveNode(isSelected ? null : idx)}
                className={`cursor-pointer p-3 rounded-xl border transition-all text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-950/40 border-amber-400 ring-1 ring-amber-400 shadow-md' 
                    : 'bg-stone-900/80 border-stone-800 hover:border-stone-700 hover:bg-stone-900'
                }`}
              >
                <div>
                  <div className="text-[9px] uppercase font-mono text-amber-400 font-bold tracking-wider mb-1 flex items-center justify-between">
                    <span>{stage.label}</span>
                    <span className="text-stone-500 font-normal">#{idx + 1}</span>
                  </div>
                  <div className="font-semibold text-stone-100 text-xs leading-snug">
                    {stage.name}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-stone-800/80">
                  <div className="text-[10px] text-stone-300 font-mono font-medium truncate">
                    {stage.specs}
                  </div>
                  <div className="text-[10px] text-stone-500 truncate mt-0.5">
                    {stage.sub}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Detail Box */}
      <div className="mt-3.5 p-3.5 rounded-xl bg-stone-900 border border-stone-800 text-xs text-stone-300">
        <div className="flex items-start space-x-2.5">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            {activeNode !== null && currentStages[activeNode] ? (
              <div>
                <div className="font-mono text-xs text-amber-400 font-bold mb-0.5">
                  Stage {activeNode + 1}: {currentStages[activeNode].name} — Field Engineering Notes
                </div>
                <p className="text-stone-300 leading-relaxed">
                  {currentStages[activeNode].detail}
                </p>
              </div>
            ) : (
              <p className="text-stone-400">
                <strong className="text-stone-200">Interactive Blueprint Mode:</strong> Tap any engineering block above to inspect wire gauges, pressure thresholds, and suburban setback compliance details.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
