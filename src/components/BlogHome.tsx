import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Calendar, 
  Tag, 
  BookOpen, 
  ExternalLink,
  ShieldCheck, 
  ChevronRight,
  ChevronLeft,
  Mail
} from 'lucide-react';
import { Article } from '../types';
import { ReadinessCalculator } from './ReadinessCalculator';
import { SmartImage } from './SmartImage';
import { formatAmazonUrl, AMAZON_LINK_ATTRIBUTES } from '../amazon';
import { EDITORIAL_TEAM_LIST } from '../authors';
import { NewsletterSignupCard } from './NewsletterSignupCard';

interface BlogHomeProps {
  articles: Article[];
  onSelectArticle: (article: Article) => void;
  selectedCategory: string;
  searchQuery: string;
  onResetCategory?: () => void;
  amazonTag?: string;
}

export const BlogHome: React.FC<BlogHomeProps> = ({
  articles,
  onSelectArticle,
  selectedCategory,
  searchQuery,
  onResetCategory,
  amazonTag
}) => {
  const activeTag = amazonTag || 'thesuburbanoutpost-20';
  const ARTICLES_PER_PAGE = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const streamHeaderRef = useRef<HTMLDivElement>(null);

  // Filter articles based on category and search query
  const filteredArticles = articles.filter(art => {
    const matchesCategory = selectedCategory === 'All Dispatches' || art.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.primaryKeyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Reset to page 1 whenever category or search filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const heroArticle = filteredArticles[0] || articles[0];
  // 10 articles per page (not counting the featured flagship article)
  const availableGridArticles = filteredArticles.slice(1);
  const totalPages = Math.max(1, Math.ceil(availableGridArticles.length / ARTICLES_PER_PAGE));
  const validCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const startIndex = (validCurrentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentGridArticles = availableGridArticles.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages || newPage === validCurrentPage) return;
    setCurrentPage(newPage);
    if (streamHeaderRef.current) {
      streamHeaderRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getPageNumbers = (current: number, total: number): (number | string)[] => {
    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    const pages: (number | string)[] = [1];
    if (current > 3) {
      pages.push('...');
    }
    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    if (current < total - 2) {
      pages.push('...');
    }
    pages.push(total);
    return pages;
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-200">
      {/* Top Content Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {/* Featured Flagship Article (Hero Section) */}
        {heroArticle && (
          <a 
            href={`/articles/${heroArticle.slug}`}
            onClick={(e) => {
              e.preventDefault();
              onSelectArticle(heroArticle);
            }}
            className="cursor-pointer group my-5 sm:my-8 rounded-2xl sm:rounded-3xl bg-stone-900 border border-stone-800 hover:border-amber-500/60 transition-all overflow-hidden shadow-2xl hover:shadow-amber-950/30 grid grid-cols-1 lg:grid-cols-12 gap-0 block text-left"
          >
            {/* Hero Image */}
            <div className="lg:col-span-7 relative h-52 sm:h-80 lg:h-[480px] overflow-hidden bg-stone-950">
              <SmartImage
                src={heroArticle.featuredImage}
                alt={heroArticle.title}
                category={heroArticle.category}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 group-hover:brightness-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/30 to-transparent lg:hidden"></div>
              
              {/* Badges on image */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 flex flex-wrap gap-1.5 sm:gap-2">
                <span className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-bold bg-amber-500 text-stone-950 shadow-md">
                  FEATURED DISPATCH
                </span>
                <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-mono font-semibold bg-stone-900/90 text-stone-200 border border-stone-700/80 backdrop-blur-md">
                  {heroArticle.category}
                </span>
              </div>
            </div>

            {/* Hero Text */}
            <div className="lg:col-span-5 p-4 sm:p-7 lg:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2.5 text-xs sm:text-sm font-mono text-stone-400 mb-2 sm:mb-3">
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-stone-500" />
                    <span>{heroArticle.publishedAt}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    <span>{heroArticle.readingTime}</span>
                  </span>
                </div>

                <h2 className="font-serif text-xl sm:text-3xl lg:text-4xl font-extrabold text-stone-100 group-hover:text-amber-400 transition-colors leading-snug sm:leading-[1.2]">
                  {heroArticle.title}
                </h2>

                <p className="mt-2.5 sm:mt-4 text-sm sm:text-base lg:text-lg text-stone-300 line-clamp-3 leading-relaxed">
                  {heroArticle.subtitle}
                </p>

                {/* Key Takeaway Snippet */}
                <div className="mt-4 sm:mt-6 p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-stone-950/90 border border-stone-800 text-xs sm:text-sm text-stone-300">
                  <span className="text-amber-400 font-mono font-bold block mb-1 text-xs uppercase tracking-wider">
                    Core Verdict & Takeaway:
                  </span>
                  <p className="line-clamp-2 text-stone-300 font-sans leading-relaxed">
                    {heroArticle.summary}
                  </p>
                </div>
              </div>

              {/* Author & CTA */}
              <div className="mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-stone-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center space-x-2.5 sm:space-x-3.5 min-w-0">
                  <img
                    src={heroArticle.author.avatar}
                    alt={heroArticle.author.name}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-amber-500/40 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-sm sm:text-base font-bold text-stone-100 truncate">{heroArticle.author.name}</div>
                    <div className="text-[11px] sm:text-xs text-stone-400 truncate">{heroArticle.author.role}</div>
                  </div>
                </div>

                <span className="px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-amber-600 group-hover:bg-amber-500 text-stone-950 font-bold text-xs sm:text-sm flex items-center space-x-1.5 transition-all shadow-md shrink-0">
                  <span>Read Guide</span>
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </a>
        )}

        {/* Two-Column Editorial Layout (Main Grid + Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 my-6 sm:my-10">
          {/* Main Articles Stream */}
          <div ref={streamHeaderRef} className="lg:col-span-8 space-y-6 sm:space-y-8 scroll-mt-24">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-stone-800">
              <div>
                <h3 className="font-serif text-xl sm:text-3xl font-extrabold text-stone-100">
                  {selectedCategory === 'All Dispatches' ? 'Latest Outpost Dispatches' : selectedCategory}
                </h3>
                {totalPages > 1 && (
                  <span className="text-[11px] font-mono text-amber-500/90 block mt-0.5">
                    Page {validCurrentPage} of {totalPages} • {ARTICLES_PER_PAGE} guides per page
                  </span>
                )}
              </div>
              <span className="text-xs sm:text-sm font-mono text-stone-400">
                {filteredArticles.length} Guides Total
              </span>
            </div>

            {filteredArticles.length === 0 ? (
              <div className="text-center py-12 sm:py-16 bg-stone-900/50 rounded-2xl border border-stone-800 px-4">
                <BookOpen className="w-10 h-10 text-stone-600 mx-auto mb-3" />
                <h4 className="text-lg sm:text-xl font-bold text-stone-200">No articles found in this filter</h4>
                <p className="text-sm text-stone-400 mt-2">
                  Try searching for another keyword or return to All Dispatches.
                </p>
                {onResetCategory && (
                  <button
                    onClick={onResetCategory}
                    className="mt-4 px-4 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-400 text-sm font-semibold cursor-pointer"
                  >
                    View All Dispatches
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {currentGridArticles.map((article) => (
                    <a
                      key={article.id}
                      href={`/articles/${article.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onSelectArticle(article);
                      }}
                      className="cursor-pointer group rounded-xl sm:rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 transition-all flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-amber-950/20 text-left block"
                    >
                      <div>
                        {/* Image Thumbnail */}
                        <div className="relative h-44 sm:h-56 overflow-hidden bg-stone-950">
                          <SmartImage
                            src={article.featuredImage}
                            alt={article.title}
                            category={article.category}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-95 group-hover:brightness-100"
                          />
                          <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold bg-stone-950/90 text-amber-400 border border-stone-700 backdrop-blur-md">
                            {article.category}
                          </span>
                          {article.affiliateProducts && article.affiliateProducts.length > 0 && (
                            <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-emerald-950/90 text-emerald-300 border border-emerald-800 flex items-center space-x-1">
                              <Tag className="w-3 h-3" />
                              <span>{article.affiliateProducts.length} Field Picks</span>
                            </span>
                          )}
                        </div>

                        {/* Content Card Body */}
                        <div className="p-4 sm:p-6">
                          <div className="flex items-center space-x-2 text-[11px] sm:text-xs font-mono text-stone-400 mb-2">
                            <span>{article.publishedAt}</span>
                            <span>•</span>
                            <span>{article.readingTime}</span>
                          </div>

                          <h4 className="font-serif text-lg sm:text-2xl font-bold text-stone-100 group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                            {article.title}
                          </h4>

                          <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-stone-300 line-clamp-3 leading-relaxed">
                            {article.summary}
                          </p>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2.5 sm:pt-3 flex items-center justify-between border-t border-stone-800/80 text-xs sm:text-sm">
                        <div className="flex items-center space-x-2 min-w-0">
                          <img
                            src={article.author.avatar}
                            alt={article.author.name}
                            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-amber-500/30 shrink-0"
                          />
                          <span className="text-stone-300 font-semibold truncate">{article.author.name}</span>
                        </div>

                        <span className="text-amber-400 font-bold flex items-center space-x-1 shrink-0 group-hover:translate-x-1 transition-transform">
                          <span>Read</span>
                          <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </span>
                      </div>
                    </a>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Range info */}
                    <div className="text-xs font-mono text-stone-400 text-center sm:text-left">
                      Showing <span className="text-amber-400 font-semibold">{startIndex + 1}</span>–
                      <span className="text-amber-400 font-semibold">{Math.min(endIndex, availableGridArticles.length)}</span> of{' '}
                      <span className="text-stone-200 font-semibold">{availableGridArticles.length}</span> dispatches
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex items-center space-x-1 sm:space-x-1.5 flex-wrap justify-center">
                      {/* Previous Page */}
                      <button
                        onClick={() => handlePageChange(validCurrentPage - 1)}
                        disabled={validCurrentPage === 1}
                        className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-400 hover:border-amber-500/50 disabled:opacity-35 disabled:hover:text-stone-300 disabled:hover:border-stone-800 disabled:cursor-not-allowed transition-colors text-xs font-mono flex items-center space-x-1 cursor-pointer"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Prev</span>
                      </button>

                      {/* Numbered Page Buttons */}
                      {getPageNumbers(validCurrentPage, totalPages).map((p, idx) => {
                        if (p === '...') {
                          return (
                            <span key={`ellipsis-${idx}`} className="px-1.5 py-1 text-stone-500 font-mono text-xs">
                              ...
                            </span>
                          );
                        }
                        const pageNum = p as number;
                        const isActive = pageNum === validCurrentPage;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                              isActive
                                ? 'bg-amber-600 text-stone-950 shadow-md shadow-amber-900/40 scale-105'
                                : 'bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-400 hover:border-amber-500/50'
                            }`}
                            aria-current={isActive ? 'page' : undefined}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      {/* Next Page */}
                      <button
                        onClick={() => handlePageChange(validCurrentPage + 1)}
                        disabled={validCurrentPage === totalPages}
                        className="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-stone-900 border border-stone-800 text-stone-300 hover:text-amber-400 hover:border-amber-500/50 disabled:opacity-35 disabled:hover:text-stone-300 disabled:hover:border-stone-800 disabled:cursor-not-allowed transition-colors text-xs font-mono flex items-center space-x-1 cursor-pointer"
                        aria-label="Next page"
                      >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* In-Grid Simplified Readiness Calculator */}
            <div id="readiness-calculator-section" className="my-8 sm:my-12">
              <ReadinessCalculator />
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="lg:col-span-4 space-y-6 sm:space-y-8">
            {/* The Suburban Outpost Editorial Collective */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-stone-900 border border-stone-800 shadow-xl text-stone-300">
              <div className="flex items-center justify-between mb-3 pb-3 border-b border-stone-800">
                <div>
                  <h4 className="font-serif font-bold text-stone-100 text-base leading-tight">
                    Editorial Bureau
                  </h4>
                  <div className="text-[11px] font-mono text-amber-500">
                    Domain Engineering Collective
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold">
                  5 Specialists
                </span>
              </div>
              <p className="text-xs leading-relaxed text-stone-300 font-sans mb-4">
                Field guides and hardware evaluations are autonomously authored by specialized engineering leads matching each technical domain:
              </p>
              
              <div className="space-y-2.5">
                {EDITORIAL_TEAM_LIST.filter(a => a.id !== 'roger_sikes').map(author => (
                  <div key={author.id} className="flex items-center space-x-2.5 p-2 rounded-xl bg-stone-950/70 border border-stone-800/80">
                    <img
                      src={author.avatar}
                      alt={author.name}
                      className="w-9 h-9 rounded-full border border-amber-500/40 shrink-0 bg-stone-900 p-0.5"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-stone-200 text-xs truncate">{author.name}</span>
                        <span className="text-[9px] font-mono text-amber-400 shrink-0 font-semibold">{author.categories[0]}</span>
                      </div>
                      <div className="text-[10px] text-stone-400 truncate">{author.role}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between text-xs font-mono text-stone-400">
                <span>thesuburbanoutpost.com</span>
                <span className="text-emerald-400 font-semibold">Autonomous Staff</span>
              </div>
            </div>

            {/* Top Tested Equipment Widget with Amazon Affiliate Links */}
            <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-stone-900 border border-stone-800 shadow-xl">
              <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 border-b border-stone-800">
                <span className="font-serif font-bold text-stone-100 text-sm sm:text-base">
                  Tested Outpost Gear
                </span>
                <span className="text-[11px] sm:text-xs font-mono text-amber-400 uppercase font-semibold">
                  Amazon Field Picks
                </span>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <a
                  href={formatAmazonUrl('B09MVJP7MV', activeTag)}
                  target={AMAZON_LINK_ATTRIBUTES.target}
                  rel={AMAZON_LINK_ATTRIBUTES.rel}
                  className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-500/50 block transition-all group"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-amber-400 font-semibold truncate mr-2">EcoFlow DELTA Pro (3.6kWh)</span>
                    <span className="text-amber-400 font-mono text-[11px] font-bold shrink-0 bg-amber-950/60 border border-amber-800/60 px-2 py-0.5 rounded">Check Current Price</span>
                  </div>
                  <p className="text-xs text-stone-300 mt-1 leading-snug">
                    Zero-noise 3600W LFP whole-house backup power station with 240V split-phase capability for home panels.
                  </p>
                  <div className="mt-2.5 text-[11px] text-stone-400 flex items-center justify-between border-t border-stone-900 pt-2">
                    <span className="font-mono">ASIN: B09MVJP7MV</span>
                    <span className="text-amber-400 font-semibold group-hover:underline flex items-center">
                      View on Amazon <ExternalLink className="w-3 h-3 ml-1" />
                    </span>
                  </div>
                </a>

                <a
                  href={formatAmazonUrl('B09BC836BC', activeTag)}
                  target={AMAZON_LINK_ATTRIBUTES.target}
                  rel={AMAZON_LINK_ATTRIBUTES.rel}
                  className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-500/50 block transition-all group"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-sky-400 font-semibold truncate mr-2">Waterdrop King Tank (2.25 Gal)</span>
                    <span className="text-sky-400 font-mono text-[11px] font-bold shrink-0 bg-sky-950/60 border border-sky-800/60 px-2 py-0.5 rounded">Check Current Price</span>
                  </div>
                  <p className="text-xs text-stone-300 mt-1 leading-snug">
                    304 food-grade stainless steel gravity filtration with 6,000-gal dual carbon elements, metal spigot & stand.
                  </p>
                  <div className="mt-2.5 text-[11px] text-stone-400 flex items-center justify-between border-t border-stone-900 pt-2">
                    <span className="font-mono">ASIN: B09BC836BC</span>
                    <span className="text-sky-400 font-semibold group-hover:underline flex items-center">
                      View on Amazon <ExternalLink className="w-3 h-3 ml-1" />
                    </span>
                  </div>
                </a>

                <a
                  href={formatAmazonUrl('B088LJQWTC', activeTag)}
                  target={AMAZON_LINK_ATTRIBUTES.target}
                  rel={AMAZON_LINK_ATTRIBUTES.rel}
                  className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-stone-950 border border-stone-800 hover:border-amber-500/50 block transition-all group"
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-orange-400 font-semibold truncate mr-2">Ashley Hearth AW1120E-P Wood Stove</span>
                    <span className="text-orange-400 font-mono text-[11px] font-bold shrink-0 bg-orange-950/60 border border-orange-800/60 px-2 py-0.5 rounded">Check Current Price</span>
                  </div>
                  <p className="text-xs text-stone-300 mt-1 leading-snug">
                    68,000 BTU EPA 2026 certified clean-burn pedestal wood stove for up to 1,200 sq ft residential heating.
                  </p>
                  <div className="mt-2.5 text-[11px] text-stone-400 flex items-center justify-between border-t border-stone-900 pt-2">
                    <span className="font-mono">ASIN: B088LJQWTC</span>
                    <span className="text-orange-400 font-semibold group-hover:underline flex items-center">
                      View on Amazon <ExternalLink className="w-3 h-3 ml-1" />
                    </span>
                  </div>
                </a>
              </div>
            </div>

            {/* Functional Newsletter Dispatch Card with PDF Delivery */}
            <NewsletterSignupCard variant="sidebar" source="blog_sidebar" />
          </div>
        </div>
      </div>
    </div>
  );
};
