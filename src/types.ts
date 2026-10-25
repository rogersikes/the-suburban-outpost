export interface RedirectRule {
  sourceSlug: string;
  targetSlug: string;
  code: 301 | 302;
  reason: string;
  createdAt: string;
}

export interface PipelineMetrics {
  totalKeywordClusters: number;
  totalKeywordsDiscovered: number;
  briefsPendingApproval: number;
  briefsApproved: number;
  totalPublishedArticles: number;
  internalOutboundLinkClicks: number;
}

export interface AffiliateProduct {
  asin: string;
  name: string;
  badge?: string;
  rating?: number;
  price?: string;
  specs?: string[];
  pros?: string[];
  cons?: string[];
  amazonLink: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface InternalLink {
  anchor: string;
  slug: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  publishedAt: string;
  updatedAt: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    bio?: string;
    credentials?: string;
  };
  readingTime: string;
  primaryKeyword: string;
  searchIntent: string;
  featuredImage: string;
  imageCaption: string;
  metaDescription: string;
  summary: string;
  affiliateProducts: AffiliateProduct[];
  internalLinks: InternalLink[];
  faq: FaqItem[];
  contentMarkdown: string;
}

export interface KeywordOpportunity {
  keyword: string;
  searchVolume: number;
  cpc: number;
  difficulty: number;
  intent: 'commercial' | 'informational' | 'transactional' | 'navigational' | string;
  category: string;
  trend: string;
  serpFeatures: string[];
  topCompetitor: string;
  monetizationScore: number;
  recommendedProducts?: {
    asin: string;
    name: string;
    price?: string;
    rating: number;
  }[];
}

export interface GSCQuery {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  trend: 'up' | 'down' | 'opportunity' | string;
  opportunity: string;
}

export interface PageOpportunity {
  page: string;
  targetQuery: string;
  currentPos: number;
  impressions: number;
  potentialClicks: string;
  action: string;
}

export interface GSCData {
  domain: string;
  dateRange: string;
  metrics: {
    totalClicks: number;
    totalImpressions: number;
    avgCtr: number;
    avgPosition: number;
  };
  topQueries: GSCQuery[];
  pageOpportunities: PageOpportunity[];
}

export interface GA4Data {
  activeUsers28d: number;
  sessions: number;
  engagedSessions: number;
  avgEngagementTime: string;
  bounceRate: string;
  affiliateClicks: number;
  estimatedAffiliateRev: string;
  estimatedAdSenseRev: string;
  topCategories: {
    category: string;
    views: number;
    affiliateCtr: string;
    rev: string;
  }[];
}

export interface AutomationLog {
  id: string;
  timestamp: string;
  type: string;
  message: string;
}

export interface AutomationConfig {
  autopilotEnabled: boolean;
  publishFrequency: string;
  targetDailyGoal?: number;
  targetWordCount: number;
  amazonTag: string;
  minSearchVolume: number;
  maxKeywordDifficulty: number;
  includeAffiliateModules: boolean;
  includeFaqSchema: boolean;
  includeVisualDiagrams: boolean;
  timezone?: string;
  pacingMode?: 'paced' | 'turbo';
  publishedToday?: number;
  todayDate?: string;
  hoursUntilMidnight?: number;
  minutesUntilMidnight?: number;
  secondsUntilMidnight?: number;
  adPlacements: {
    topBanner: boolean;
    inArticle: boolean;
    sidebar: boolean;
    stickyFooter: boolean;
  };
}
