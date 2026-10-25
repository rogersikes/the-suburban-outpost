/**
 * Google Analytics 4 (GA4), Google Tag Manager (GTM), and Google Search Console (GSC)
 * Integration Utility for The Suburban Outpost.
 */

export interface AnalyticsConfig {
  ga4MeasurementId: string;
  gtmContainerId: string;
  gscVerificationCode: string;
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

const STORAGE_KEY = 'outpost_analytics_config';

// Load stored configuration from localStorage or defaults
export function getStoredAnalyticsConfig(): AnalyticsConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read analytics config", err);
  }
  return {
    ga4MeasurementId: '',
    gtmContainerId: '',
    gscVerificationCode: ''
  };
}

// Apply Google Search Console meta tag to DOM
export function applyGscMeta(code: string) {
  if (!code) return;
  let meta = document.querySelector('meta[name="google-site-verification"]') as HTMLMetaElement;
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = 'google-site-verification';
    document.head.appendChild(meta);
  }
  meta.content = code;
}

// Dynamically inject GA4 gtag.js script
export function loadGa4(measurementId: string) {
  if (!measurementId || typeof window === 'undefined') return;
  const cleanId = measurementId.trim().toUpperCase();
  if (!cleanId.startsWith('G-')) {
    console.warn("GA4 Measurement ID should start with 'G-'", cleanId);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function() {
    window.dataLayer.push(arguments);
  };
  window.gtag('js', new Date());

  // Prevent duplicate script tags
  const existingScript = document.getElementById('ga4-script');
  if (!existingScript) {
    const script = document.createElement('script');
    script.id = 'ga4-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(cleanId)}`;
    document.head.appendChild(script);
  }

  window.gtag('config', cleanId, {
    send_page_view: true,
    page_title: document.title,
    page_location: window.location.href,
    anonymize_ip: true
  });
}

// Dynamically inject GTM script and noscript
export function loadGtm(containerId: string) {
  if (!containerId || typeof window === 'undefined') return;
  const cleanId = containerId.trim().toUpperCase();

  window.dataLayer = window.dataLayer || [];
  
  const existingGtm = document.getElementById('gtm-script');
  if (!existingGtm) {
    const script = document.createElement('script');
    script.id = 'gtm-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(cleanId)}`;
    document.head.appendChild(script);

    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });
  }
}

// Initialize all tracking tags from server and local storage
export async function initAnalytics(): Promise<AnalyticsConfig> {
  let config = getStoredAnalyticsConfig();
  
  // Try fetching latest server config
  try {
    const res = await fetch('/api/settings/analytics');
    if (res.ok) {
      const serverConfig = await res.json();
      if (serverConfig) {
        config = {
          ga4MeasurementId: serverConfig.ga4MeasurementId || config.ga4MeasurementId,
          gtmContainerId: serverConfig.gtmContainerId || config.gtmContainerId,
          gscVerificationCode: serverConfig.gscVerificationCode || config.gscVerificationCode
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      }
    }
  } catch (err) {
    console.warn("Failed to fetch server analytics config, using local cached", err);
  }

  // Apply to DOM
  if (config.gscVerificationCode) {
    applyGscMeta(config.gscVerificationCode);
  }
  if (config.ga4MeasurementId) {
    loadGa4(config.ga4MeasurementId);
  }
  if (config.gtmContainerId) {
    loadGtm(config.gtmContainerId);
  }

  return config;
}

// Save updated config to server and activate
export async function saveAnalyticsConfig(newConfig: AnalyticsConfig): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    
    if (newConfig.gscVerificationCode) {
      applyGscMeta(newConfig.gscVerificationCode);
    }
    if (newConfig.ga4MeasurementId) {
      loadGa4(newConfig.ga4MeasurementId);
    }
    if (newConfig.gtmContainerId) {
      loadGtm(newConfig.gtmContainerId);
    }

    const res = await fetch('/api/settings/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig)
    });
    return res.ok;
  } catch (err) {
    console.error("Failed to save analytics config:", err);
    return false;
  }
}

// Event: Track Page View
export function trackPageView(pageTitle: string, pagePath: string) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  
  // GA4 event
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: pageTitle,
      page_path: pagePath,
      page_location: window.location.href
    });
  }

  // GTM event
  window.dataLayer.push({
    event: 'virtual_page_view',
    pageTitle,
    pagePath,
    timestamp: new Date().toISOString()
  });
}

// Event: Track Outbound Affiliate Click (Amazon)
export function trackAffiliateClick(asin: string, productName: string, articleSlug: string, price?: string) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];

  const payload = {
    event: 'affiliate_click',
    affiliate_network: 'Amazon Associates',
    asin,
    product_name: productName,
    article_slug: articleSlug,
    price: price || 'N/A',
    associate_tag: 'thesuburbanoutpost-20'
  };

  if (window.gtag) {
    window.gtag('event', 'select_item', payload);
  }

  window.dataLayer.push(payload);
}

// Event: Track Readiness Calculator Execution
export function trackCalculatorAction(action: string, details: Record<string, any>) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];

  const payload = {
    event: 'calculator_use',
    action,
    ...details
  };

  if (window.gtag) {
    window.gtag('event', 'calculator_use', payload);
  }

  window.dataLayer.push(payload);
}
