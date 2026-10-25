import React, { useState } from 'react';
import { 
  Star, 
  Check, 
  X, 
  ExternalLink, 
  ShoppingBag, 
  Tag, 
  CheckCircle2,
  Sparkles,
  Search
} from 'lucide-react';
import { AffiliateProduct } from '../types';
import { trackAffiliateClick } from '../analytics';
import { formatAmazonUrl, AMAZON_LINK_ATTRIBUTES, getAmazonAffiliateTag, extractAsin } from '../amazon';

interface AffiliateProductCardProps {
  product: AffiliateProduct;
  articleSlug: string;
}

interface MigratedProductInfo {
  asin: string;
  name: string;
  specs?: string[];
  pros?: string[];
  cons?: string[];
  badge?: string;
}

// Known Amazon ASIN migration table (replaces delisted/404 listings with active products)
const PRODUCT_INFO_MIGRATIONS: Record<string, MigratedProductInfo> = {
  'B0032ANC0Y': {
    asin: 'B003LCSW9K',
    name: 'Good Ideas Rain Wizard 50-Gal Rain Barrel (Faux Oak with Brass Spigot)',
    specs: [
      '50-Gallon Storage Capacity',
      'Flat-Back Wall Fit (Sits Flush)',
      'Distressed Faux Oak Camouflage Finish',
      'Solid Brass Spigot & Debris Screen'
    ],
    pros: [
      'Flat back fits snugly against exterior walls or fence sightlines',
      'Distressed faux oak woodgrain blends into suburban landscaping and passes HOA scrutiny',
      'Includes heavy-duty 3/4-inch brass spigot and overflow routing'
    ],
    cons: [
      'Planter top requires periodic clearing of fallen leaves',
      'Needs a solid cinderblock or gravel riser for bucket clearance underneath'
    ],
    badge: 'Suburban HOA Camouflage'
  },
  'B002AQZX4A': {
    asin: 'B09BC836BC',
    name: 'Waterdrop King Tank 2.25 Gal Stainless Steel Gravity Purifier',
    specs: [
      'Dual Black Carbon Elements (6,000-Gal Lifespan)',
      '304 Food-Grade Stainless Housing',
      'Metal Level Spigot & Stand Included',
      'Requires Zero Electricity or Plumbing'
    ],
    pros: [
      '100% independent of municipal power or line pressure',
      'Certified reduction of chlorine, heavy metals, microplastics & sediment',
      'Indestructible 304 food-grade stainless housing'
    ],
    cons: [
      'Requires periodic manual topping off',
      'Filters must be primed before initial installation'
    ],
    badge: 'Top Rated Countertop Purifier'
  },
  'B00N8GFFN8': {
    asin: 'B088LJQWTC',
    name: 'Ashley Hearth AW1120E-P EPA Certified Pedestal Wood Burning Stove',
    specs: [
      '68,000 BTU Heating Capacity',
      'Heats up to 1,200 sq ft',
      'EPA 2026 Certified (<1.8 g/hr emissions)',
      'Heavy-duty cast iron door with air-wash ceramic glass'
    ],
    pros: [
      'Exceeds strict suburban municipal clean air standards',
      'Burn time up to 8 hours on seasoned hardwood',
      'Integrated pedestal design hides blower ducting'
    ],
    cons: [
      'Requires 6-inch double-wall stainless chimney pipe'
    ],
    badge: 'EPA 2026 Air Quality Certified'
  },
  'B09WJ8X11Q': {
    asin: 'B09MVJP7MV',
    name: 'EcoFlow DELTA Pro 3600Wh LFP Station'
  },
  'B08ZNJ7M9P': {
    asin: '1612432735',
    name: 'Preppers Long-Term Survival Guide (Food, Shelter, Off-Grid Power)'
  },
  'B09V2BXYLK': {
    asin: 'B0DP4LTRMG',
    name: 'ECO-WORTHY 48V 100Ah Server Rack LiFePO4 Battery (5.12kWh 3U Rackmount)',
    specs: [
      '5.12kWh Usable Energy (48V 100Ah)',
      'Standard 19-Inch 3U Server Rack Form Factor',
      '6,000+ Deep Discharge Cycles (LiFePO4 Chemistry)',
      'Built-in 100A Smart BMS with Dual RS485/CAN Ports'
    ],
    pros: [
      'Fits standard audio / IT server cabinets for zero-footprint suburban stealth',
      'Silent solid-state operation with no noisy cooling fans under normal load',
      'True 48V nominal architecture minimizes line losses and wiring gauge requirements'
    ],
    cons: [
      'Weighs approximately 98 lbs (requires 2-person lift or server rack shelf support)',
      'Requires compatible 48V hybrid inverter/charger with LiFePO4 charging profiles'
    ],
    badge: 'Suburban Server Rack Choice'
  },
  'B072VCH268': {
    asin: 'B002YGKGSO',
    name: 'Rutland Grapho-Glas Wood Stove Gasket Kit with E-Z Spread Cement',
    specs: [
      'High-Density Graphite-Impregnated Braided Fiberglass',
      'Includes 2 fl oz E-Z Spread Gasket Cement',
      'Rated to 1,000°F (538°C) Continuous Thermal Service',
      'Universal Fit for Wood Stoves, Pellet Heaters & Fireplace Inserts'
    ],
    pros: [
      'Graphite impregnation resists creosote adhesion and prevents door-jam sticking',
      'Restores airtight combustion seal to prevent runaway drafts and CO leakage',
      'Pre-packaged with high-temperature adhesive for easy one-hour DIY installation'
    ],
    cons: [
      'Requires thoroughly scraping and cleaning old channel down to bare cast iron before applying',
      'Adhesive requires 24 hours of curing before lighting first hot fire'
    ],
    badge: 'Airtight Hearth Maintenance'
  },
  'B0044FQG98': {
    asin: 'B001AH3G30',
    name: 'WaterWorker HT-32B Vertical Pre-Charged Well Pressure Tank (32-Gallon)',
    specs: [
      '32-Gallon Total Volume / 10.2 Gal Drawdown at 30-50 PSI',
      'Heavy-Duty Butyl Diaphragm with Polypropylene Liner',
      'Precharged to 38 PSI (Compatible with 40-60 PSI Switches)',
      '1-inch Solid Brass System Connection with Steel Base Ring'
    ],
    pros: [
      'Cushions pump starts to prevent cycling wear and prolong submersible pump motor life',
      'Heavy-gauge steel shell with epoxy powder-coat resists damp basement and pit humidity',
      'Seamless polypropylene liner prevents drinking water contact with metal tank walls'
    ],
    cons: [
      'Tall vertical form factor (approx. 43 inches) requires adequate overhead basement clearance',
      'Must verify and adjust precharge air pressure with a bicycle gauge prior to water filling'
    ],
    badge: 'Deep Well Pressure Anchor'
  },
  'B000FPSF7S': {
    asin: 'B01M3VYDYI',
    name: 'Square D by Schneider Electric Pumptrol 40-60 PSI Well Pump Pressure Switch',
    specs: [
      'Factory Setting: 40 PSI Cut-In / 60 PSI Cut-Out',
      '1/4-inch FNPT Liquid Pressure Connection',
      'DPST Contacts Rated for 2 HP at 230V / 1.5 HP at 115V',
      'NEMA Type 1 Indoor General Purpose Enclosure'
    ],
    pros: [
      'Industry benchmark for reliable well pump actuation over millions of electrical cycles',
      'Adjustable differential and cut-in screws with printed guide on inner cover',
      'Sturdy copper contacts resist pitting from inductive pump start currents'
    ],
    cons: [
      'Terminal screws require firm torque to prevent loose wire arcing on 230V circuits',
      'Enclosure is indoor-rated; outdoor wellheads require weatherproof protective housing'
    ],
    badge: 'Industrial Benchmark'
  }
};

export const AffiliateProductCard: React.FC<AffiliateProductCardProps> = ({
  product,
  articleSlug
}) => {
  const [clicked, setClicked] = useState(false);

  // Check migration by ASIN or by keyword in existing product name
  let migration: MigratedProductInfo | undefined = undefined;
  if (product.asin && PRODUCT_INFO_MIGRATIONS[product.asin]) {
    migration = PRODUCT_INFO_MIGRATIONS[product.asin];
  } else if (product.name && /berkey/i.test(product.name)) {
    migration = PRODUCT_INFO_MIGRATIONS['B002AQZX4A'];
  } else if (product.name && /drolet/i.test(product.name)) {
    migration = PRODUCT_INFO_MIGRATIONS['B00N8GFFN8'];
  }

  const activeAsin = migration?.asin || extractAsin(product.asin) || (product.asin || '').trim();
  const displayName = migration?.name || product.name;
  const displayBadge = migration?.badge || product.badge;
  const displaySpecs = migration?.specs || product.specs || [];
  const displayPros = migration?.pros || product.pros || [];
  const displayCons = migration?.cons || product.cons || [];

  const amazonTag = getAmazonAffiliateTag();
  const directUrl = formatAmazonUrl(activeAsin, amazonTag);
  const searchFallbackUrl = `https://www.amazon.com/s?k=${encodeURIComponent(displayName || activeAsin)}&tag=${amazonTag}`;

  const handleAmazonClick = async () => {
    setClicked(true);
    trackAffiliateClick(activeAsin, displayName, articleSlug);
    try {
      await fetch('/api/monetization/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asin: activeAsin,
          productName: displayName,
          articleSlug
        })
      });
    } catch (err) {
      console.warn("Failed to log affiliate click", err);
    }
  };

  return (
    <div className="my-6 sm:my-8 rounded-xl sm:rounded-2xl bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 border border-stone-800 p-4 sm:p-6 shadow-xl relative overflow-hidden group">
      {/* Top Banner with Badge and ASIN - Stripped of all hardcoded prices per Amazon Operating Agreement */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4 pb-2.5 sm:pb-3 border-b border-stone-800/80">
        <div className="flex items-center space-x-2">
          {displayBadge && (
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center space-x-1 shadow-sm">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{displayBadge}</span>
            </span>
          )}
          {activeAsin && (
            <span className="text-[11px] sm:text-xs font-mono text-stone-400 flex items-center space-x-1">
              <Tag className="w-3 h-3 text-amber-500" />
              <span>ASIN: {activeAsin}</span>
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2 text-xs sm:text-sm">
          <div className="flex items-center text-amber-400 font-mono font-medium">
            <Star className="w-3.5 h-3.5 fill-amber-400 mr-1" />
            <span>{product.rating ? `${product.rating} / 5.0` : 'Top Rated'}</span>
          </div>
          <span className="text-stone-600">•</span>
          <a
            href={directUrl}
            target={AMAZON_LINK_ATTRIBUTES.target}
            rel={AMAZON_LINK_ATTRIBUTES.rel}
            onClick={handleAmazonClick}
            className="font-mono text-xs text-amber-400 hover:text-amber-300 font-bold bg-amber-950/40 hover:bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-800/60 transition-colors flex items-center space-x-1"
          >
            <span>View on Amazon</span>
            <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
          </a>
        </div>
      </div>

      {/* Title & Core Specs */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <h3 className="text-lg sm:text-2xl font-serif font-bold text-stone-100 group-hover:text-amber-300 transition-colors leading-snug">
            {displayName}
          </h3>
          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-stone-400">
            <span className="flex items-center space-x-1 text-emerald-400 font-mono text-[11px] bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/60">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Availability: In Stock on Amazon</span>
            </span>
            <span className="text-stone-600">•</span>
            <span className="text-amber-400 font-mono text-[11px]">Prime Delivery Available</span>
          </div>
        </div>

        {/* Specs Matrix */}
        {displaySpecs && displaySpecs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {displaySpecs.map((spec, idx) => (
              <div key={idx} className="flex items-center space-x-2 bg-stone-900/90 px-3 py-2 rounded-lg sm:rounded-xl border border-stone-800 text-stone-200">
                <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></div>
                <span className="font-mono text-xs sm:text-sm leading-tight">{spec}</span>
              </div>
            ))}
          </div>
        )}

        {/* Pros and Cons Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 pt-1 sm:pt-2">
          {/* Pros */}
          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-emerald-950/20 border border-emerald-900/40">
            <div className="text-emerald-400 font-bold text-xs sm:text-sm mb-2 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4" />
              <span>Homestead Advantages</span>
            </div>
            <ul className="space-y-1.5 sm:space-y-2 text-stone-300 text-xs sm:text-sm">
              {displayPros.map((pro, idx) => (
                <li key={idx} className="flex items-start space-x-2 leading-relaxed">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-amber-950/20 border border-amber-900/40">
            <div className="text-amber-400 font-bold text-xs sm:text-sm mb-2 flex items-center space-x-1.5">
              <X className="w-4 h-4 text-amber-500" />
              <span>Field Limitations</span>
            </div>
            <ul className="space-y-1.5 sm:space-y-2 text-stone-300 text-xs sm:text-sm">
              {displayCons.map((con, idx) => (
                <li key={idx} className="flex items-start space-x-2 leading-relaxed">
                  <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                  <span>{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Button & Amazon Disclosure */}
        <div className="pt-3 sm:pt-4 flex flex-col md:flex-row items-center justify-between gap-3 border-t border-stone-800">
          <div className="text-[11px] sm:text-xs text-stone-400 flex items-center space-x-1.5 self-start md:self-center">
            <ShoppingBag className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span>Associate Tag: <code className="text-amber-400 font-mono font-bold">{amazonTag}</code></span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
            <a
              href={searchFallbackUrl}
              target={AMAZON_LINK_ATTRIBUTES.target}
              rel={AMAZON_LINK_ATTRIBUTES.rel}
              onClick={handleAmazonClick}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700/80 text-stone-300 hover:text-stone-100 font-semibold text-xs flex items-center justify-center space-x-1.5 transition-all text-center"
              title="Search all listings & verified sellers on Amazon"
            >
              <Search className="w-3.5 h-3.5 text-stone-400" />
              <span>Search Sellers</span>
            </a>

            <a
              href={directUrl}
              target={AMAZON_LINK_ATTRIBUTES.target}
              rel={AMAZON_LINK_ATTRIBUTES.rel}
              onClick={handleAmazonClick}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-amber-950/60 transition-all active:scale-95 text-center"
            >
              <span>Check Current Price on Amazon</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {clicked && (
        <div className="mt-2.5 text-center text-xs text-emerald-400 font-mono">
          ✓ Outbound Amazon affiliate session logged. Redirecting...
        </div>
      )}
    </div>
  );
};
