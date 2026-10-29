// Router & Canonical URL manager for The Suburban Outpost

export interface RouteState {
  view: 'reader' | 'console';
  articleSlug: string | null;
  category: string;
  modal: 'about' | 'editorial' | 'affiliate' | 'privacy' | null;
}

export const CATEGORY_MAP: { [slug: string]: string } = {
  'all': 'All Dispatches',
  'urban-and-fringe': 'Urban & Fringe',
  'urban-fringe': 'Urban & Fringe',
  'solar-and-power': 'Solar & Power',
  'solar-power': 'Solar & Power',
  'water-systems': 'Water Systems',
  'heating-and-stoves': 'Heating & Stoves',
  'heating-stoves': 'Heating & Stoves',
  'sanitation': 'Sanitation',
  'legal-and-codes': 'Legal & Codes',
  'legal-codes': 'Legal & Codes'
};

export const REVERSE_CATEGORY_MAP: { [name: string]: string } = {
  'All Dispatches': '/',
  'Urban & Fringe': '/category/urban-and-fringe',
  'Solar & Power': '/category/solar-and-power',
  'Water Systems': '/category/water-systems',
  'Heating & Stoves': '/category/heating-and-stoves',
  'Sanitation': '/category/sanitation',
  'Legal & Codes': '/category/legal-and-codes'
};

export function parsePath(pathname: string): RouteState {
  const clean = pathname.replace(/\/+$/, '') || '/';

  // Admin route
  if (clean === '/admin' || clean === '/console') {
    return { view: 'console', articleSlug: null, category: 'All Dispatches', modal: null };
  }

  // Modals / Info pages
  if (clean === '/about') {
    return { view: 'reader', articleSlug: null, category: 'All Dispatches', modal: 'about' };
  }
  if (clean === '/editorial' || clean === '/editorial-standards') {
    return { view: 'reader', articleSlug: null, category: 'All Dispatches', modal: 'editorial' };
  }
  if (clean === '/affiliate' || clean === '/affiliate-disclosure') {
    return { view: 'reader', articleSlug: null, category: 'All Dispatches', modal: 'affiliate' };
  }
  if (clean === '/privacy' || clean === '/privacy-policy') {
    return { view: 'reader', articleSlug: null, category: 'All Dispatches', modal: 'privacy' };
  }

  // Article route: /articles/:slug or /article/:slug
  const articleMatch = clean.match(/^\/articles?\/([a-zA-Z0-9_-]+)/);
  if (articleMatch) {
    return { view: 'reader', articleSlug: articleMatch[1], category: 'All Dispatches', modal: null };
  }

  // Category route: /category/:slug
  const catMatch = clean.match(/^\/category\/([a-zA-Z0-9_-]+)/);
  if (catMatch) {
    const matchedCategory = CATEGORY_MAP[catMatch[1].toLowerCase()] || 'All Dispatches';
    return { view: 'reader', articleSlug: null, category: matchedCategory, modal: null };
  }

  // Default Home
  return { view: 'reader', articleSlug: null, category: 'All Dispatches', modal: null };
}

export function updatePageMeta(params: {
  title: string;
  description: string;
  urlPath: string;
  image?: string;
  type?: 'website' | 'article';
  noindex?: boolean;
}) {
  const fullUrl = `https://thesuburbanoutpost.com${params.urlPath}`;
  document.title = params.title;

  // Robots indexing directive (noindex, nofollow for admin / backend views)
  let robotsMeta = document.querySelector('meta[name="robots"]');
  if (params.noindex) {
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.head.appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'noindex, nofollow, noarchive');
  } else if (robotsMeta) {
    robotsMeta.setAttribute('content', 'index, follow');
  }

  // Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', params.description);

  // Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', fullUrl);

  // OpenGraph Tags
  setMetaTag('property', 'og:title', params.title);
  setMetaTag('property', 'og:description', params.description);
  setMetaTag('property', 'og:url', fullUrl);
  setMetaTag('property', 'og:type', params.type || 'website');
  if (params.image) {
    setMetaTag('property', 'og:image', params.image);
    setMetaTag('name', 'twitter:image', params.image);
  }
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', params.title);
  setMetaTag('name', 'twitter:description', params.description);
}

function setMetaTag(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}
