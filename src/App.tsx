/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BlogHome } from './components/BlogHome';
import { ArticleView } from './components/ArticleView';
import { EngineConsole } from './components/EngineConsole';
import { AnalyticsModal } from './components/AnalyticsModal';
import { RebateCalculatorModal } from './components/RebateCalculatorModal';
import { AdminLogin } from './components/AdminLogin';
import { initAnalytics, trackPageView } from './analytics';
import { 
  Article, 
  KeywordOpportunity, 
  GSCData, 
  GA4Data, 
  AutomationConfig, 
  AutomationLog,
  PipelineMetrics 
} from './types';
import { parsePath, updatePageMeta, REVERSE_CATEGORY_MAP } from './routing';

export default function App() {
  const initialRoute = typeof window !== 'undefined' 
    ? parsePath(window.location.pathname) 
    : { view: 'reader' as const, articleSlug: null, category: 'All Dispatches', modal: null };

  const preloadedArticle = typeof window !== 'undefined' && (window as any).__INITIAL_ARTICLE__
    ? ((window as any).__INITIAL_ARTICLE__ as Article)
    : null;

  const [currentView, setCurrentView] = useState<'reader' | 'console'>(initialRoute.view);
  const [activeCategory, setActiveCategory] = useState<string>(initialRoute.category);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(preloadedArticle);
  const [pendingSlug, setPendingSlug] = useState<string | null>(
    preloadedArticle && initialRoute.articleSlug && preloadedArticle.slug === initialRoute.articleSlug 
      ? null 
      : initialRoute.articleSlug
  );
  const [activeModal, setActiveModal] = useState<'about' | 'editorial' | 'affiliate' | 'privacy' | null>(initialRoute.modal);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState<boolean>(false);
  const [showRebateModal, setShowRebateModal] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    return typeof window !== 'undefined' && !!sessionStorage.getItem('outpost_admin_token');
  });
  const [adminUser, setAdminUser] = useState<string>(() => {
    return (typeof window !== 'undefined' && sessionStorage.getItem('outpost_admin_user')) || 'admin';
  });

  const [articles, setArticles] = useState<Article[]>(preloadedArticle ? [preloadedArticle] : []);
  const [keywords, setKeywords] = useState<KeywordOpportunity[]>([]);
  const [pipelineMetrics, setPipelineMetrics] = useState<PipelineMetrics>({
    totalKeywordClusters: 6,
    totalKeywordsDiscovered: 84,
    briefsPendingApproval: 54,
    briefsApproved: 30,
    totalPublishedArticles: 30,
    internalOutboundLinkClicks: 0
  });
  const [gscData, setGscData] = useState<GSCData | null>(null);
  const [ga4Data, setGa4Data] = useState<GA4Data | null>(null);
  const [automationConfig, setAutomationConfig] = useState<AutomationConfig>({
    autopilotEnabled: true,
    publishFrequency: "2 articles / week",
    targetWordCount: 2200,
    amazonTag: "thesuburbanoutpost-20",
    minSearchVolume: 2000,
    maxKeywordDifficulty: 45,
    includeAffiliateModules: true,
    includeFaqSchema: true,
    includeVisualDiagrams: true,
    adPlacements: {
      topBanner: true,
      inArticle: true,
      sidebar: true,
      stickyFooter: false
    }
  });
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatingProgress, setGeneratingProgress] = useState<string>('');

  // Fetch initial data from fullstack backend
  const loadData = async () => {
    try {
      const [artRes, kwRes, gscRes, ga4Res, autoRes, pipeRes] = await Promise.all([
        fetch('/api/articles'),
        fetch('/api/dataforseo/keywords'),
        fetch('/api/analytics/gsc'),
        fetch('/api/analytics/ga4'),
        fetch('/api/automation/status'),
        fetch('/api/analytics/pipeline')
      ]);

      if (artRes.ok) {
        const artData = await artRes.json();
        setArticles(artData.articles || []);
      }
      if (kwRes.ok) {
        const kwData = await kwRes.json();
        setKeywords(kwData.keywords || []);
      }
      if (gscRes.ok) {
        const gsc = await gscRes.json();
        setGscData(gsc);
      }
      if (ga4Res.ok) {
        const ga4 = await ga4Res.json();
        setGa4Data(ga4);
      }
      if (autoRes.ok) {
        const auto = await autoRes.json();
        if (auto.config) setAutomationConfig(auto.config);
        if (auto.logs) setAutomationLogs(auto.logs);
      }
      if (pipeRes.ok) {
        const pipe = await pipeRes.json();
        if (pipe.metrics) setPipelineMetrics(pipe.metrics);
      }
    } catch (err) {
      console.warn("API load fallback", err);
    }
  };

  useEffect(() => {
    loadData();
    initAnalytics();
    trackPageView("The Suburban Outpost - Off-Grid Living & Content Engine", window.location.pathname || "/");

    const handleOpenRebate = () => setShowRebateModal(true);
    window.addEventListener('open-rebate-calculator', handleOpenRebate);

    // Periodic sync interval to ensure blogs written counter, logs & midnight status stay updated
    const syncInterval = setInterval(() => {
      fetch('/api/automation/status')
        .then(res => res.ok ? res.json() : null)
        .then(auto => {
          if (auto) {
            if (auto.config) setAutomationConfig(auto.config);
            if (auto.logs) setAutomationLogs(auto.logs);
          }
        })
        .catch(() => {});
    }, 20000);

    return () => {
      window.removeEventListener('open-rebate-calculator', handleOpenRebate);
      clearInterval(syncInterval);
    };
  }, []);

  // Handle Autopilot Toggle
  const handleToggleAutopilot = async () => {
    try {
      const res = await fetch('/api/automation/toggle-autopilot', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAutomationConfig(prev => ({ ...prev, autopilotEnabled: data.autopilotEnabled }));
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Article Generation via Gemini
  const handleGenerateArticle = async (
    keyword: string, 
    category: string, 
    intent: string, 
    amazonProducts?: any[]
  ) => {
    setIsGenerating(true);
    setGeneratingProgress(`1/4: Analyzing SERP intent & competitors for "${keyword}"...`);

    const timer1 = setTimeout(() => {
      setGeneratingProgress(`2/4: Gemini 3.8 synthesizing 2,200+ word technical guide & equations...`);
    }, 1200);

    const timer2 = setTimeout(() => {
      setGeneratingProgress(`3/4: Embedding Amazon affiliate ASIN cards, specs & technical schematics...`);
    }, 2400);

    const timer3 = setTimeout(() => {
      setGeneratingProgress(`4/4: Weaving internal link graph & compiling Schema.org JSON-LD...`);
    }, 3600);

    try {
      const res = await fetch('/api/gemini/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword,
          category,
          targetIntent: intent,
          amazonProducts
        })
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      if (res.ok) {
        const data = await res.json();
        if (data.article) {
          setArticles(prev => [data.article, ...prev]);
          setSelectedArticle(data.article);
          setCurrentView('reader');
        }
        await loadData();
      }
    } catch (err) {
      console.error("Generation failed:", err);
    } finally {
      setIsGenerating(false);
      setGeneratingProgress('');
    }
  };

  // Handle Ingest Keywords
  const handleIngestKeywords = async (newKeywords: any[]) => {
    try {
      const res = await fetch('/api/ingest/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: newKeywords })
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error("Keyword ingestion failed", err);
    }
  };

  // Handle Ingest GSC queries
  const handleIngestGsc = async (queries: any[]) => {
    try {
      const res = await fetch('/api/ingest/gsc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queries })
      });
      if (res.ok) {
        await loadData();
      }
    } catch (err) {
      console.error("GSC ingestion failed", err);
    }
  };

  // Handle High-Rate Batch Generation
  const handleBatchGenerate = async (count: number) => {
    setIsGenerating(true);
    setGeneratingProgress(`Running High-Rate Autonomous Batch: Generating ${count} guides from DataForSEO & GSC keyword gaps...`);
    try {
      const res = await fetch('/api/automation/batch-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.articles && data.articles.length > 0) {
          setArticles(prev => [...data.articles, ...prev]);
        }
        await loadData();
      }
    } catch (err) {
      console.error("Batch generate failed", err);
    } finally {
      setIsGenerating(false);
      setGeneratingProgress('');
    }
  };

  // Handle Trigger Single Auto-Write
  const handleTriggerSingle = async () => {
    setIsGenerating(true);
    setGeneratingProgress("Auto-Writer Active: Picking next high-opportunity keyword from vault and publishing complete guide...");
    try {
      const res = await fetch('/api/automation/trigger-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.article) {
          setArticles(prev => [data.article, ...prev]);
        }
        await loadData();
      }
    } catch (err) {
      console.error("Trigger single failed:", err);
    } finally {
      setIsGenerating(false);
      setGeneratingProgress('');
    }
  };

  // Resolve pending article slug when articles load, honoring any 301 redirects
  useEffect(() => {
    if (pendingSlug && articles.length > 0) {
      fetch('/api/redirects')
        .then(res => res.json())
        .then(data => {
          const rule = (data.redirects || []).find((r: any) => r.sourceSlug === pendingSlug);
          const effectiveSlug = rule ? rule.targetSlug : pendingSlug;
          if (rule && typeof window !== 'undefined') {
            window.history.replaceState(null, '', `/article/${effectiveSlug}`);
          }
          const found = articles.find(a => a.slug === effectiveSlug);
          if (found) {
            setSelectedArticle(found);
            setPendingSlug(null);
          }
        })
        .catch(() => {
          const found = articles.find(a => a.slug === pendingSlug);
          if (found) {
            setSelectedArticle(found);
            setPendingSlug(null);
          }
        });
    }
  }, [articles, pendingSlug]);

  // Handle URL change & navigation
  const navigateTo = (path: string, options: { replace?: boolean } = {}) => {
    if (typeof window !== 'undefined') {
      if (window.location.pathname !== path) {
        if (options.replace) {
          window.history.replaceState(null, '', path);
        } else {
          window.history.pushState(null, '', path);
        }
      }
      const route = parsePath(path);
      setCurrentView(route.view);
      setActiveModal(route.modal);
      if (route.articleSlug) {
        const slugToCheck = route.articleSlug;
        fetch('/api/redirects')
          .then(r => r.json())
          .then(data => {
            const rule = (data.redirects || []).find((r: any) => r.sourceSlug === slugToCheck);
            const effectiveSlug = rule ? rule.targetSlug : slugToCheck;
            if (rule && typeof window !== 'undefined') {
              window.history.replaceState(null, '', `/articles/${effectiveSlug}`);
            }
            const art = articles.find(a => a.slug === effectiveSlug);
            if (art) {
              setSelectedArticle(art);
              setPendingSlug(null);
            } else {
              setPendingSlug(effectiveSlug);
            }
          })
          .catch(() => {
            const art = articles.find(a => a.slug === slugToCheck);
            if (art) {
              setSelectedArticle(art);
              setPendingSlug(null);
            } else {
              setPendingSlug(slugToCheck);
            }
          });
      } else {
        setSelectedArticle(null);
        setPendingSlug(null);
        setActiveCategory(route.category);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const navigateToArticle = (art: Article) => {
    navigateTo(`/articles/${art.slug}`);
    trackPageView(art.title, `/articles/${art.slug}`);
  };

  const navigateToCategory = (catName: string) => {
    const path = REVERSE_CATEGORY_MAP[catName] || '/';
    navigateTo(path);
    trackPageView(`${catName} - The Suburban Outpost`, path);
  };

  const navigateToHome = () => {
    navigateTo('/');
    trackPageView("The Suburban Outpost - Off-Grid Living & Content Engine", "/");
  };

  const navigateToAdmin = () => {
    navigateTo('/admin');
    trackPageView("The Suburban Outpost - Admin Engine Console", "/admin");
  };

  const navigateToModal = (modal: 'about' | 'editorial' | 'affiliate' | 'privacy' | null) => {
    if (modal) {
      navigateTo(`/${modal}`);
      trackPageView(`${modal.toUpperCase()} - The Suburban Outpost`, `/${modal}`);
    } else {
      if (selectedArticle) {
        navigateTo(`/articles/${selectedArticle.slug}`);
      } else if (activeCategory && activeCategory !== 'All Dispatches') {
        navigateTo(REVERSE_CATEGORY_MAP[activeCategory] || '/');
      } else {
        navigateTo('/');
      }
    }
  };

  // Browser Back/Forward history navigation listener
  useEffect(() => {
    const onPopState = () => {
      const route = parsePath(window.location.pathname);
      setCurrentView(route.view);
      setActiveModal(route.modal);
      if (route.articleSlug) {
        const art = articles.find(a => a.slug === route.articleSlug);
        if (art) {
          setSelectedArticle(art);
          setPendingSlug(null);
        } else {
          setPendingSlug(route.articleSlug);
        }
      } else {
        setSelectedArticle(null);
        setPendingSlug(null);
        setActiveCategory(route.category);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [articles]);

  // Synchronize document title, meta tags, and canonical links
  useEffect(() => {
    if (currentView === 'console') {
      updatePageMeta({
        title: "Outpost Autonomous Engine Console | The Suburban Outpost",
        description: "Admin content engine, SERP keyword tracker, and publishing dashboard.",
        urlPath: '/admin',
        noindex: true
      });
    } else if (selectedArticle) {
      updatePageMeta({
        title: `${selectedArticle.title} | The Suburban Outpost`,
        description: selectedArticle.metaDescription || selectedArticle.subtitle,
        urlPath: `/articles/${selectedArticle.slug}`,
        image: selectedArticle.featuredImage,
        type: 'article'
      });
    } else if (activeCategory && activeCategory !== 'All Dispatches') {
      const catPath = REVERSE_CATEGORY_MAP[activeCategory] || '/';
      updatePageMeta({
        title: `${activeCategory} Field Guides | The Suburban Outpost`,
        description: `Practical guides and residential blueprints for ${activeCategory} in suburban lots and urban fringe homesteads.`,
        urlPath: catPath
      });
    } else if (activeModal) {
      updatePageMeta({
        title: `${activeModal.charAt(0).toUpperCase() + activeModal.slice(1)} | The Suburban Outpost`,
        description: "The Suburban Outpost residential self-reliance engineering standards and disclosures.",
        urlPath: `/${activeModal}`
      });
    } else {
      updatePageMeta({
        title: "The Suburban Outpost | Off-Grid Self-Reliance for Suburban & Urban Fringe",
        description: "Engineering residential self-reliance: quiet solar power storage, stealth rainwater catchment, clean-burn wood heat, and practical off-grid solutions.",
        urlPath: '/'
      });
    }
  }, [currentView, selectedArticle, activeCategory, activeModal]);

  // Keyboard shortcut for site owner: Ctrl + Shift + A (or Cmd + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        if (currentView === 'console') {
          navigateToHome();
        } else {
          navigateToAdmin();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentView]);

  // Navigate to article by slug from internal link
  const handleNavigateSlug = (slug: string) => {
    navigateTo(`/articles/${slug}`);
  };

  return (
    <div className="min-h-screen bg-stone-950 font-sans selection:bg-amber-600 selection:text-white">
      {/* Top Header */}
      <Header
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'console') {
            navigateToAdmin();
          } else {
            navigateToHome();
          }
        }}
        activeCategory={activeCategory}
        setActiveCategory={(cat) => {
          navigateToCategory(cat);
        }}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        autopilotActive={automationConfig.autopilotEnabled}
        totalArticles={articles.length}
      />

      {/* Main View Router */}
      <main>
        {currentView === 'reader' ? (
          selectedArticle ? (
            <ArticleView
              article={selectedArticle}
              onBack={navigateToHome}
              onNavigateSlug={handleNavigateSlug}
            />
          ) : (
            <BlogHome
              articles={articles}
              onSelectArticle={navigateToArticle}
              selectedCategory={activeCategory}
              searchQuery={searchQuery}
              onResetCategory={() => navigateToCategory('All Dispatches')}
              amazonTag={automationConfig.amazonTag}
            />
          )
        ) : (
          !isAdminAuthenticated ? (
            <AdminLogin
              onSuccess={(token, user) => {
                setIsAdminAuthenticated(true);
                setAdminUser(user);
              }}
              onCancel={navigateToHome}
            />
          ) : (
            <EngineConsole
              keywords={keywords}
              pipelineMetrics={pipelineMetrics}
              gscData={gscData || {
                domain: "thesuburbanoutpost.com",
                dateRange: "Internal Pipeline Mode",
                metrics: { totalClicks: 0, totalImpressions: 0, avgCtr: 0, avgPosition: 0 },
                topQueries: [],
                pageOpportunities: []
              }}
              ga4Data={ga4Data || {
                activeUsers28d: 0,
                sessions: 0,
                engagedSessions: 0,
                avgEngagementTime: "0s",
                bounceRate: "0%",
                affiliateClicks: pipelineMetrics.internalOutboundLinkClicks,
                estimatedAffiliateRev: "$0.00",
                estimatedAdSenseRev: "$0.00",
                topCategories: []
              }}
              automationConfig={automationConfig}
              automationLogs={automationLogs}
              articles={articles}
              onToggleAutopilot={handleToggleAutopilot}
              onGenerateArticle={handleGenerateArticle}
              onSelectArticle={(art) => {
                setSelectedArticle(art);
                setCurrentView('reader');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onIngestKeywords={handleIngestKeywords}
              onIngestGsc={handleIngestGsc}
              onBatchGenerate={handleBatchGenerate}
              onTriggerSingle={handleTriggerSingle}
              onOpenAnalyticsSetup={() => setShowAnalyticsModal(true)}
              adminUser={adminUser}
              onRefreshData={loadData}
              onLogout={() => {
                sessionStorage.removeItem('outpost_admin_token');
                sessionStorage.removeItem('outpost_admin_user');
                setIsAdminAuthenticated(false);
                setCurrentView('reader');
              }}
              isGenerating={isGenerating}
              generatingProgress={generatingProgress}
            />
          )
        )}
      </main>

      {/* Public Editorial Footer */}
      <footer className="bg-stone-900 border-t border-stone-800 text-stone-300 text-xs sm:text-base py-8 sm:py-12 px-3.5 sm:px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 sm:gap-8">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-serif font-extrabold text-stone-100 text-lg sm:text-2xl tracking-tight">THE SUBURBAN OUTPOST</span>
              <span className="text-[11px] sm:text-xs font-mono text-amber-500 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                thesuburbanoutpost.com
              </span>
            </div>
            <p className="text-stone-300 mt-2 max-w-lg text-xs sm:text-base leading-relaxed">
              Engineering residential self-reliance: quiet solar power storage, stealth rainwater catchment, clean-burn wood heat, and practical off-grid solutions for suburban and urban fringe homes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-base text-stone-200">
            <a 
              href="/category/solar-and-power" 
              onClick={(e) => { e.preventDefault(); navigateToCategory('Solar & Power'); }} 
              className="hover:text-amber-400 transition-colors py-1"
            >
              Solar & Power
            </a>
            <a 
              href="/category/water-systems" 
              onClick={(e) => { e.preventDefault(); navigateToCategory('Water Systems'); }} 
              className="hover:text-amber-400 transition-colors py-1"
            >
              Water Systems
            </a>
            <a 
              href="/category/heating-and-stoves" 
              onClick={(e) => { e.preventDefault(); navigateToCategory('Heating & Stoves'); }} 
              className="hover:text-amber-400 transition-colors py-1"
            >
              Heating & Stoves
            </a>
            <a 
              href="/category/legal-and-codes" 
              onClick={(e) => { e.preventDefault(); navigateToCategory('Legal & Codes'); }} 
              className="hover:text-amber-400 transition-colors py-1"
            >
              Zoning & Codes
            </a>
          </div>
        </div>

        {/* Amazon & Institutional Trust Links */}
        <div className="max-w-7xl mx-auto mt-6 pt-5 sm:pt-6 border-t border-stone-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-[11px] sm:text-xs font-mono text-stone-400">
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
            <a 
              href="/about" 
              onClick={(e) => { e.preventDefault(); navigateToModal('about'); }} 
              className="hover:text-amber-400 transition-colors underline"
            >
              About The Outpost
            </a>
            <span>•</span>
            <a 
              href="/editorial" 
              onClick={(e) => { e.preventDefault(); navigateToModal('editorial'); }} 
              className="hover:text-amber-400 transition-colors underline"
            >
              Editorial Standards
            </a>
            <span>•</span>
            <a 
              href="/affiliate" 
              onClick={(e) => { e.preventDefault(); navigateToModal('affiliate'); }} 
              className="hover:text-amber-400 transition-colors underline"
            >
              Affiliate Disclosure
            </a>
            <span>•</span>
            <a 
              href="/privacy" 
              onClick={(e) => { e.preventDefault(); navigateToModal('privacy'); }} 
              className="hover:text-amber-400 transition-colors underline"
            >
              Privacy Policy
            </a>
          </div>
          <span className="text-[10px] sm:text-[11px] text-stone-500">
            Publisher: The Suburban Outpost Field Media Group
          </span>
        </div>

        <div className="max-w-7xl mx-auto mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-stone-800/80 text-[11px] sm:text-xs text-stone-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 sm:gap-3">
          <span>&copy; {new Date().getFullYear()} The Suburban Outpost. All rights reserved.</span>
          <span className="text-stone-400 text-left sm:text-right text-[10px] sm:text-[11px]">
            The Suburban Outpost participates in the Amazon Services LLC Associates Program.
          </span>
        </div>
      </footer>

      {/* Trust & Policy Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-xl sm:rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-4 sm:p-8 text-stone-300 shadow-2xl relative">
            <button
              onClick={() => navigateToModal(null)}
              className="absolute top-3 right-3 sm:top-5 sm:right-5 text-stone-400 hover:text-stone-100 text-base sm:text-xl font-bold font-mono px-2 py-1 rounded-lg bg-stone-800 hover:bg-stone-700"
            >
              ✕
            </button>

            {activeModal === 'about' && (
              <div>
                <span className="text-xs font-mono text-amber-500 uppercase tracking-wider block mb-1">About The Publication</span>
                <h2 className="text-2xl font-serif font-bold text-stone-100 mb-4">About The Suburban Outpost</h2>
                <div className="space-y-4 text-sm leading-relaxed text-stone-300">
                  <p>
                    <strong>The Suburban Outpost</strong> is an engineering-first field publication dedicated to utility resilience, off-grid hardware, and self-sufficiency engineered for suburban lots and urban fringe neighborhoods.
                  </p>
                  <p>
                    Unlike traditional rural homesteading media that assumes 40 acres of unzoned wilderness, we focus exclusively on the tight operational envelopes of high-density living: <strong>strict municipal zoning, HOA covenants, lot boundary noise thresholds (&lt;35 dBA), and discreet utility backups</strong>.
                  </p>
                  <p>
                    Our editorial bureau operates as an autonomous engineering collective composed of dedicated domain specialists:
                  </p>
                  <ul className="space-y-1.5 pl-4 border-l-2 border-amber-500/40 text-xs font-mono text-stone-300">
                    <li><strong className="text-amber-400">Elena Rostova, PE</strong> — Hydrological Systems Engineer & Water Infrastructure Lead</li>
                    <li><strong className="text-amber-400">Marcus Vance</strong> — Master Electrician & Solar Off-Grid Specialist</li>
                    <li><strong className="text-amber-400">Caleb Thorne</strong> — Certified Hearth Specialist & Thermal Systems Lead</li>
                    <li><strong className="text-amber-400">Dr. Sarah Lin</strong> — Environmental Microbiologist & Permaculture Lead</li>
                    <li><strong className="text-amber-400">Devon Reed</strong> — Municipal Zoning & HOA Rights Advocate</li>
                    <li><strong className="text-stone-400">Roger Sikes</strong> — Editorial Director & Founder</li>
                  </ul>
                  <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 font-mono text-xs text-stone-400">
                    <strong>Editorial Office:</strong> contact@thesuburbanoutpost.com<br />
                    <strong>Domain:</strong> thesuburbanoutpost.com
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'editorial' && (
              <div>
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider block mb-1">Testing Methodology</span>
                <h2 className="text-2xl font-serif font-bold text-stone-100 mb-4">Editorial Standards & Hardware Testing</h2>
                <div className="space-y-4 text-sm leading-relaxed text-stone-300">
                  <p>
                    Every technical guide and hardware review on The Suburban Outpost follows our strict 4-point Suburban Protocol:
                  </p>
                  <ol className="list-decimal pl-5 space-y-2">
                    <li><strong>Decibel & Perimeter Auditing:</strong> Equipment is tested with calibrated sound level meters to verify noise emissions remain under municipal nuisance limits (&lt;35–50 dBA).</li>
                    <li><strong>Zoning & Code Cross-Referencing:</strong> We evaluate local building ordinances (IRC, NEC 702/705, EPA 2020 NSPS) before endorsing any stove, cistern, or battery bank.</li>
                    <li><strong>Independent Benchmarks:</strong> Manufacturers never pay for favorable ratings. We evaluate teardowns, duty cycles, and battery degradation curves independently.</li>
                    <li><strong>Direct Technical Accountability:</strong> Our guides include wiring schematics, head-loss calculations, and sizing formulas rather than superficial bullet points.</li>
                  </ol>
                </div>
              </div>
            )}

            {activeModal === 'affiliate' && (
              <div>
                <span className="text-xs font-mono text-amber-500 uppercase tracking-wider block mb-1">Operating Agreement Compliance</span>
                <h2 className="text-2xl font-serif font-bold text-stone-100 mb-4">Amazon Associates & Affiliate Disclosure</h2>
                <div className="space-y-4 text-sm leading-relaxed text-stone-300">
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-stone-200 text-xs font-mono leading-relaxed">
                    "The Suburban Outpost is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com."
                  </div>
                  <p>
                    When our readers click on an Amazon link from one of our technical reviews or product comparison cards and complete a qualifying purchase, Amazon pays us a modest referral fee (typically 3%–8% depending on the product category).
                  </p>
                  <p>
                    <strong>This costs you nothing extra:</strong> Amazon’s pricing remains identical whether you navigate directly or click through our link. These commissions fund our test gear purchases, acoustic meters, laboratory equipment, and hosting infrastructure.
                  </p>
                  <p>
                    We only recommend hardware that meets our engineering criteria for reliability, safety, and suburban noise compliance.
                  </p>
                </div>
              </div>
            )}

            {activeModal === 'privacy' && (
              <div>
                <span className="text-xs font-mono text-sky-400 uppercase tracking-wider block mb-1">Data Governance</span>
                <h2 className="text-2xl font-serif font-bold text-stone-100 mb-4">Privacy Policy</h2>
                <div className="space-y-4 text-sm leading-relaxed text-stone-300">
                  <p>
                    The Suburban Outpost respects your personal privacy. We do not sell, rent, or trade your personal information to third parties.
                  </p>
                  <p>
                    We collect standard anonymous analytics (via Google Analytics 4) to monitor page views, session duration, and click-through performance across our editorial silos to improve technical content quality.
                  </p>
                  <p>
                    Outbound affiliate links to Amazon.com may utilize cookies placed by Amazon to track referral commissions in accordance with Amazon’s standard privacy policy.
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-stone-800 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-200 font-mono text-xs font-bold transition-colors"
              >
                Close Policy Window
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analytics & Search Console Setup Modal */}
      <AnalyticsModal
        isOpen={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
      />

      {/* 30% Clean Energy Credit & Rebate Calculator Modal */}
      <RebateCalculatorModal
        isOpen={showRebateModal}
        onClose={() => setShowRebateModal(false)}
        amazonTag={automationConfig.amazonTag}
      />
    </div>
  );
}
