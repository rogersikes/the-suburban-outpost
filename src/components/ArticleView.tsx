import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  Bookmark, 
  CheckCircle, 
  ChevronRight, 
  ShieldCheck, 
  HelpCircle, 
  Code, 
  Layers, 
  ChevronDown,
  Type,
  Share2,
  Link2,
  AlertTriangle,
  Terminal
} from 'lucide-react';
import { Article } from '../types';
import { AffiliateProductCard } from './AffiliateProductCard';
import { TechnicalDiagram } from './TechnicalDiagram';
import { AdUnit } from './AdUnit';
import { SmartImage } from './SmartImage';
import { getAuthorByName, getAuthorForCategory } from '../authors';
import { NewsletterSignupCard } from './NewsletterSignupCard';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
  onNavigateSlug: (slug: string) => void;
}

// Helper to render inline markdown tags (bold, italic, code, links) with high-readability styling
function renderFormattedInline(text: string): React.ReactNode[] {
  // Regex matches **bold**, *italic*, `code`, or [link](url)
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
      const inner = part.slice(2, -2);
      const lower = inner.toLowerCase();
      if (lower.includes('trap')) {
        return <strong key={index} className="text-red-400 font-bold tracking-tight">{inner}</strong>;
      }
      if (lower.includes('legal defense') || lower.includes('solution') || lower.includes('remedy')) {
        return <strong key={index} className="text-emerald-400 font-bold tracking-tight">{inner}</strong>;
      }
      return <strong key={index} className="text-stone-100 font-semibold">{inner}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length >= 2 && !part.startsWith('**')) {
      return <em key={index} className="text-stone-300 italic">{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
      return (
        <code key={index} className="font-mono text-xs px-1.5 py-0.5 rounded bg-stone-900 text-amber-300 border border-stone-800">
          {part.slice(1, -1)}
        </code>
      );
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      return (
        <a key={index} href={linkMatch[2]} className="text-amber-400 underline decoration-amber-500/40 hover:text-amber-300 transition-colors">
          {linkMatch[1]}
        </a>
      );
    }
    return part;
  });
}

interface ParsedBlock {
  type: 'h2' | 'h3' | 'h4' | 'hr' | 'code' | 'callout-trap' | 'callout-solution' | 'ul' | 'ol' | 'blockquote' | 'p';
  content?: string;
  items?: string[];
  language?: string;
}

function parseMarkdownBlocks(markdown: string): ParsedBlock[] {
  const blocks: ParsedBlock[] = [];
  const lines = markdown.split(/\r?\n/);
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // 1. Code block fence: ```
    if (trimmed.startsWith('```')) {
      const lang = trimmed.replace('```', '').trim();
      i++;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({ type: 'code', content: codeLines.join('\n'), language: lang });
      i++;
      continue;
    }

    // 2. Horizontal separator: --- or ***
    if (trimmed === '---' || trimmed === '***') {
      blocks.push({ type: 'hr' });
      i++;
      continue;
    }

    // 3. Heading 2: ##
    if (trimmed.startsWith('## ') && !trimmed.startsWith('### ')) {
      blocks.push({ type: 'h2', content: trimmed.replace(/^##\s+/, '') });
      i++;
      continue;
    }

    // 4. Heading 3: ###
    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'h3', content: trimmed.replace(/^###\s+/, '') });
      i++;
      continue;
    }

    // 5. Heading 4: ####
    if (trimmed.startsWith('#### ')) {
      blocks.push({ type: 'h4', content: trimmed.replace(/^####\s+/, '') });
      i++;
      continue;
    }

    // 6. Direct Trap Callout: "**The Trap:**" or "* **The Trap:**"
    const trapMatch = trimmed.match(/^(\*|-)?\s*\*\*The Trap:\*\*\s*(.*)$/i);
    if (trapMatch) {
      blocks.push({ type: 'callout-trap', content: trapMatch[2] });
      i++;
      continue;
    }

    // 7. Direct Solution Callout: "**The Legal Defense:**" or "**The Solution:**"
    const solutionMatch = trimmed.match(/^(\*|-)?\s*\*\*(The Legal Defense|The Solution):\*\*\s*(.*)$/i);
    if (solutionMatch) {
      blocks.push({ type: 'callout-solution', content: solutionMatch[3] });
      i++;
      continue;
    }

    // 8. Blockquote: >
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [trimmed.replace(/^>\s*/, '')];
      i++;
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s*/, ''));
        i++;
      }
      blocks.push({ type: 'blockquote', content: quoteLines.join(' ') });
      continue;
    }

    // 9. Numbered Ordered list: 1. , 2.
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push({ type: 'ol', items });
      continue;
    }

    // 10. Bulleted Unordered list: * or -
    if (/^(\*|-)\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^(\*|-)\s+/.test(lines[i].trim())) {
        const itemLine = lines[i].trim();
        // Check if individual list item is actually a trap or solution card
        const itemTrap = itemLine.match(/^(\*|-)\s*\*\*The Trap:\*\*\s*(.*)$/i);
        const itemSol = itemLine.match(/^(\*|-)\s*\*\*(The Legal Defense|The Solution):\*\*\s*(.*)$/i);
        
        if (itemTrap) {
          if (items.length > 0) {
            blocks.push({ type: 'ul', items: [...items] });
            items.length = 0;
          }
          blocks.push({ type: 'callout-trap', content: itemTrap[2] });
          i++;
          continue;
        }
        if (itemSol) {
          if (items.length > 0) {
            blocks.push({ type: 'ul', items: [...items] });
            items.length = 0;
          }
          blocks.push({ type: 'callout-solution', content: itemSol[3] });
          i++;
          continue;
        }

        items.push(itemLine.replace(/^(\*|-)\s+/, ''));
        i++;
      }
      if (items.length > 0) {
        blocks.push({ type: 'ul', items });
      }
      continue;
    }

    // 11. Empty lines
    if (!trimmed) {
      i++;
      continue;
    }

    // 12. Standard Paragraph: group consecutive text lines
    const pLines: string[] = [trimmed];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('---') &&
      !lines[i].trim().startsWith('***') &&
      !lines[i].trim().startsWith('>') &&
      !/^(\*|-)\s+/.test(lines[i].trim()) &&
      !/^\d+\.\s+/.test(lines[i].trim())
    ) {
      pLines.push(lines[i].trim());
      i++;
    }
    blocks.push({ type: 'p', content: pLines.join(' ') });
  }

  return blocks;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  onBack,
  onNavigateSlug
}) => {
  const [showSchema, setShowSchema] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // Resolve author metadata
  const authorInfo = getAuthorByName(article.author?.name) || getAuthorForCategory(article.category);
  const authorName = article.author?.name || authorInfo.name;
  const authorRole = article.author?.role || authorInfo.role;
  const authorAvatar = article.author?.avatar || authorInfo.avatar;
  const authorBio = article.author?.bio || authorInfo.bio;
  const authorCredentials = article.author?.credentials || authorInfo.credentials;

  // Determine contextual engineering blueprint type
  let diagramType: any = 'solar';
  const fullArticleContext = `${article.title} ${article.primaryKeyword || ''} ${article.category || ''} ${article.slug}`.toLowerCase();
  if (fullArticleContext.includes('well pump') || fullArticleContext.includes('submersible') || fullArticleContext.includes('pressure tank')) {
    diagramType = 'well_pump';
  } else if (fullArticleContext.includes('generator') || fullArticleContext.includes('soundproof') || fullArticleContext.includes('dba') || fullArticleContext.includes('acoustic')) {
    diagramType = 'generator_soundproof';
  } else if (fullArticleContext.includes('root cellar') || fullArticleContext.includes('crawl space') || fullArticleContext.includes('canning') || fullArticleContext.includes('food storage')) {
    diagramType = 'root_cellar';
  } else if (fullArticleContext.includes('transfer switch') || fullArticleContext.includes('nec 702') || fullArticleContext.includes('subpanel') || fullArticleContext.includes('breaker')) {
    diagramType = 'transfer_switch';
  } else if (fullArticleContext.includes('toilet') || fullArticleContext.includes('sanitation') || fullArticleContext.includes('compost') || fullArticleContext.includes('waterless')) {
    diagramType = 'sanitation';
  } else if (fullArticleContext.includes('rainwater') || fullArticleContext.includes('cistern') || fullArticleContext.includes('first flush') || fullArticleContext.includes('barrel')) {
    diagramType = 'rainwater';
  } else if (fullArticleContext.includes('stove') || fullArticleContext.includes('wood') || fullArticleContext.includes('pellet') || fullArticleContext.includes('fireplace') || fullArticleContext.includes('flue')) {
    diagramType = 'stove';
  }

  // Generate Google Schema JSON-LD for rich snippets
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.metaDescription,
    "image": [article.featuredImage],
    "datePublished": article.publishedAt,
    "dateModified": article.updatedAt,
    "author": {
      "@type": "Person",
      "name": authorName,
      "jobTitle": authorRole
    },
    "publisher": {
      "@type": "Organization",
      "name": "The Suburban Outpost",
      "logo": {
        "@type": "ImageObject",
        "url": "https://thesuburbanoutpost.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://thesuburbanoutpost.com/article/${article.slug}`
    }
  };

  const faqSchema = article.faq && article.faq.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": article.faq.map(f => ({
      "@type": "Question",
      "name": f.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": f.answer
      }
    }))
  } : null;

  // Font size styling classes
  const bodyTextClass = fontSize === 'xlarge' 
    ? 'text-lg sm:text-2xl leading-relaxed sm:leading-10' 
    : fontSize === 'large' 
      ? 'text-base sm:text-xl leading-relaxed sm:leading-9' 
      : 'text-sm sm:text-lg leading-relaxed sm:leading-8';

  return (
    <article className="min-h-screen bg-stone-950 text-stone-200 pb-16 sm:pb-24">
      {/* Article Sticky Reading Navigation Bar */}
      <div className="bg-stone-900/95 border-b border-stone-800 px-3 sm:px-4 py-2 sm:py-3 sticky top-0 z-40 backdrop-blur-md">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 sm:space-x-2 text-stone-300 hover:text-amber-400 transition-colors font-medium group text-xs sm:text-sm shrink-0"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden sm:inline">Back to All Outpost Dispatches</span>
            <span className="sm:hidden inline">Back</span>
          </button>

          {/* Reader Accessibility Controls: Font Size Switcher & Bookmark */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Font Size Adjuster */}
            <div className="flex items-center bg-stone-950 rounded-lg sm:rounded-xl p-0.5 sm:p-1 border border-stone-800 text-[11px] sm:text-xs font-mono">
              <span className="px-1.5 text-stone-400 hidden sm:flex items-center space-x-1">
                <Type className="w-3.5 h-3.5 text-stone-400" />
                <span>Text:</span>
              </span>
              <button
                onClick={() => setFontSize('normal')}
                className={`px-2 py-0.5 sm:py-1 rounded sm:rounded-lg transition-colors ${
                  fontSize === 'normal' 
                    ? 'bg-amber-600 text-stone-950 font-bold' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Standard Text Size"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('large')}
                className={`px-2 py-0.5 sm:py-1 rounded sm:rounded-lg transition-colors ${
                  fontSize === 'large' 
                    ? 'bg-amber-600 text-stone-950 font-bold' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Large Text Size"
              >
                A+
              </button>
              <button
                onClick={() => setFontSize('xlarge')}
                className={`px-2 py-0.5 sm:py-1 rounded sm:rounded-lg transition-colors font-bold ${
                  fontSize === 'xlarge' 
                    ? 'bg-amber-600 text-stone-950 font-bold' 
                    : 'text-stone-400 hover:text-stone-200'
                }`}
                title="Extra Large Text Size"
              >
                A++
              </button>
            </div>

            <button
              onClick={() => setShowSchema(!showSchema)}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono text-xs hidden sm:flex items-center space-x-1.5 border border-stone-700"
              title="View Google Rich Snippet JSON-LD"
            >
              <Code className="w-3.5 h-3.5 text-amber-400" />
              <span>{showSchema ? "Hide" : "Schema"}</span>
            </button>

            {/* Share / Distinct URL Copy */}
            <button
              onClick={() => {
                const url = window.location.origin + `/articles/${article.slug}`;
                navigator.clipboard.writeText(url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              }}
              className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono text-xs flex items-center space-x-1.5 border border-stone-700 transition-colors"
              title="Copy Distinct Article URL"
            >
              {copied ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">URL Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">Share URL</span>
                </>
              )}
            </button>

            <button
              onClick={() => setSaved(!saved)}
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl border transition-colors ${
                saved 
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' 
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
              }`}
              title="Bookmark Outpost Guide"
            >
              <Bookmark className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${saved ? 'fill-amber-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Schema.org Structured Data Inspector (Dropdown) */}
      {showSchema && (
        <div className="bg-stone-900 border-b border-stone-800 px-3 sm:px-4 py-3 sm:py-4 text-xs font-mono">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-400 font-semibold text-xs sm:text-sm">
                Google Rich Snippet Structured Data (Article + FAQPage JSON-LD)
              </span>
              <span className="text-emerald-400 text-xs">Valid Schema.org 100%</span>
            </div>
            <pre className="p-3 sm:p-4 bg-stone-950 rounded-xl border border-stone-800 overflow-x-auto text-[11px] sm:text-xs text-stone-300 max-h-60 scrollbar-thin">
              {JSON.stringify([jsonLdSchema, faqSchema], null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-8">
        {/* Category Pill and Target Intent */}
        <div className="flex flex-wrap items-center gap-2 mb-3 sm:mb-4">
          <span className="px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
            {article.category}
          </span>
          <span className="text-stone-600 hidden sm:inline">•</span>
          <span className="text-xs sm:text-sm font-mono text-stone-400 truncate">
            Field Target: <strong className="text-stone-200">"{article.primaryKeyword}"</strong>
          </span>
        </div>

        {/* Title and Subtitle with Large, Bold Editorial Typography */}
        <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl font-extrabold text-stone-100 tracking-tight leading-snug sm:leading-[1.18]">
          {article.title}
        </h1>
        <p className="mt-3 sm:mt-5 text-base sm:text-xl md:text-2xl text-stone-300 font-sans leading-relaxed">
          {article.subtitle}
        </p>

        {/* Author & Meta Bar */}
        <div className="mt-5 sm:mt-8 pt-4 sm:pt-6 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center space-x-3">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-amber-500/40 shrink-0 bg-stone-950 p-0.5"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-stone-100 text-sm sm:text-base">{authorName}</span>
                {authorCredentials && (
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-amber-400 border border-stone-700">
                    {authorCredentials}
                  </span>
                )}
              </div>
              <div className="text-xs text-stone-400">{authorRole}</div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs sm:text-sm font-mono text-stone-400">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-stone-500" />
              <span>Published: {article.publishedAt}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-stone-500" />
              <span>{article.readingTime}</span>
            </span>
          </div>
        </div>

        {/* FTC & Amazon Affiliate Disclosure Notice */}
        <div className="mt-5 sm:mt-6 p-3.5 sm:p-4 rounded-xl bg-stone-900 border border-stone-800 text-xs sm:text-sm text-stone-300 flex items-start space-x-2.5 sm:space-x-3">
          <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-stone-100">Editorial & Affiliate Policy:</strong> The Suburban Outpost is reader-supported. As an Amazon Associate, we earn from qualifying purchases through affiliate links in this dispatch.
          </p>
        </div>

        {/* Executive Summary / Key Takeaways Box */}
        <div className="my-6 sm:my-8 p-4 sm:p-7 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-950/30 to-stone-900 border border-amber-800/40 shadow-xl">
          <div className="flex items-center space-x-2 text-amber-400 font-mono text-xs sm:text-sm uppercase font-bold tracking-wider mb-2.5 sm:mb-3">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span>Field Dispatch Summary & Verdict</span>
          </div>
          <p className="text-sm sm:text-lg text-stone-200 leading-relaxed font-sans">
            {article.summary}
          </p>

          {/* Urban & Fringe Feasibility Indicators */}
          <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-amber-900/30 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs font-mono">
            <div className="bg-stone-950/80 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-stone-800">
              <span className="text-stone-400 block text-[10px]">NOISE PROFILE</span>
              <span className="text-emerald-400 font-bold text-xs sm:text-sm">&lt; 35 dBA Silent</span>
            </div>
            <div className="bg-stone-950/80 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-stone-800">
              <span className="text-stone-400 block text-[10px]">HOA RESTRICTION</span>
              <span className="text-amber-400 font-bold text-xs sm:text-sm">Sub-Fence Stealth</span>
            </div>
            <div className="bg-stone-950/80 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-stone-800">
              <span className="text-stone-400 block text-[10px]">ZONING CODE</span>
              <span className="text-sky-400 font-bold text-xs sm:text-sm">NEC 702 Ready</span>
            </div>
            <div className="bg-stone-950/80 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-stone-800">
              <span className="text-stone-400 block text-[10px]">ODOR / SMOKE</span>
              <span className="text-purple-400 font-bold text-xs sm:text-sm">Zero Neighbor Alert</span>
            </div>
          </div>
        </div>

        {/* Featured Image with Technical Caption */}
        <div className="my-6 sm:my-8 rounded-2xl sm:rounded-3xl overflow-hidden border border-stone-800 shadow-2xl bg-stone-950">
          <SmartImage
            src={article.featuredImage}
            alt={article.title}
            category={article.category}
            className="w-full h-52 sm:h-80 md:h-[420px] object-cover"
          />
          <div className="bg-stone-900 px-3.5 sm:px-5 py-2.5 sm:py-3 border-t border-stone-800 flex items-center justify-between text-xs sm:text-sm text-stone-300 font-mono">
            <span className="truncate mr-2">{article.imageCaption}</span>
            <span className="text-stone-400 hidden sm:inline shrink-0">Field Benchmark</span>
          </div>
        </div>

        {/* Top Responsive AdSense Unit */}
        <AdUnit format="leaderboard" slotName="Article Header Leaderboard" />

        {/* Interactive Schematic Diagram */}
        <TechnicalDiagram type={diagramType} title={`TECHNICAL SCHEMATIC: ${article.title.split(':')[0]} Setup`} />

        {/* Article Body Content */}
        <div className="mt-8 sm:mt-12 space-y-4 sm:space-y-6 text-stone-200">
          {parseMarkdownBlocks(article.contentMarkdown).map((block, idx) => {
            switch (block.type) {
              case 'h2':
                return (
                  <h2 
                    key={idx} 
                    className="font-serif text-xl sm:text-3xl lg:text-4xl font-extrabold text-amber-100 pt-8 sm:pt-10 pb-3 border-b border-stone-800 tracking-tight leading-snug"
                  >
                    {renderFormattedInline(block.content || '')}
                  </h2>
                );
              case 'h3':
                return (
                  <h3 
                    key={idx} 
                    className="font-serif text-lg sm:text-2xl font-bold text-stone-100 pt-6 sm:pt-7 pb-1 tracking-tight leading-snug"
                  >
                    {renderFormattedInline(block.content || '')}
                  </h3>
                );
              case 'h4':
                return (
                  <h4 
                    key={idx} 
                    className="font-sans text-xs sm:text-sm font-bold text-amber-400 pt-4 pb-1 uppercase tracking-wider font-mono"
                  >
                    {renderFormattedInline(block.content || '')}
                  </h4>
                );
              case 'hr':
                return <hr key={idx} className="my-8 sm:my-10 border-stone-800" />;
              case 'code':
                return (
                  <div key={idx} className="my-6 rounded-2xl bg-stone-900/90 border border-stone-800 p-4 sm:p-5 shadow-xl">
                    <div className="flex items-center justify-between text-xs font-mono text-stone-400 pb-2 mb-3 border-b border-stone-800">
                      <div className="flex items-center space-x-2 text-amber-400">
                        <Terminal className="w-3.5 h-3.5" />
                        <span className="font-semibold uppercase tracking-wider">System Schematic & Blueprint</span>
                      </div>
                      <span className="text-[10px] text-stone-500 font-mono">ASCII Architecture</span>
                    </div>
                    <pre className="font-mono text-xs sm:text-sm text-amber-200/95 leading-relaxed overflow-x-auto whitespace-pre">
                      <code>{block.content}</code>
                    </pre>
                  </div>
                );
              case 'callout-trap':
                return (
                  <div key={idx} className="my-3 sm:my-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-950/40 via-stone-900 to-stone-900 border border-red-900/50 shadow-md">
                    <div className="flex items-center space-x-2 text-red-400 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                      <span>The Municipal Trap</span>
                    </div>
                    <div className="text-stone-200 text-sm sm:text-base leading-relaxed pl-1">
                      {renderFormattedInline(block.content || '')}
                    </div>
                  </div>
                );
              case 'callout-solution':
                return (
                  <div key={idx} className="my-3 sm:my-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-stone-900 to-stone-900 border border-emerald-900/50 shadow-md">
                    <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider mb-2">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>The Legal Defense & Field Solution</span>
                    </div>
                    <div className="text-stone-200 text-sm sm:text-base leading-relaxed pl-1">
                      {renderFormattedInline(block.content || '')}
                    </div>
                  </div>
                );
              case 'blockquote':
                return (
                  <blockquote key={idx} className="my-5 border-l-4 border-amber-500 bg-stone-900/60 p-4 sm:p-5 rounded-r-2xl text-stone-300 italic text-sm sm:text-base leading-relaxed">
                    {renderFormattedInline(block.content || '')}
                  </blockquote>
                );
              case 'ol':
                return (
                  <ol key={idx} className="my-5 sm:my-6 space-y-3 sm:space-y-3.5">
                    {block.items?.map((item, i) => (
                      <li key={i} className="flex items-start space-x-3 sm:space-x-3.5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-stone-900/50 border border-stone-850">
                        <span className="w-6 h-6 rounded-lg bg-amber-950/80 border border-amber-800 text-amber-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className={`text-stone-200 flex-1 leading-relaxed ${bodyTextClass}`}>
                          {renderFormattedInline(item)}
                        </div>
                      </li>
                    ))}
                  </ol>
                );
              case 'ul':
                return (
                  <ul key={idx} className="my-4 sm:my-5 space-y-2.5 sm:space-y-3 pl-1">
                    {block.items?.map((item, i) => (
                      <li key={i} className={`flex items-start space-x-3 ${bodyTextClass}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2.5 shrink-0" />
                        <span className="text-stone-200 flex-1 leading-relaxed">
                          {renderFormattedInline(item)}
                        </span>
                      </li>
                    ))}
                  </ul>
                );
              case 'p':
              default:
                return (
                  <p key={idx} className={`${bodyTextClass} text-stone-200 leading-relaxed font-sans mb-3 sm:mb-4`}>
                    {renderFormattedInline(block.content || '')}
                  </p>
                );
            }
          })}
        </div>

        {/* Amazon Affiliate Recommended Products Section */}
        {article.affiliateProducts && article.affiliateProducts.length > 0 && (
          <div className="my-10 sm:my-14 pt-6 sm:pt-8 border-t border-stone-800">
            <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 border-b border-stone-800">
              <div>
                <h3 className="text-xl sm:text-3xl font-serif font-bold text-stone-100">
                  Recommended Equipment
                </h3>
                <p className="text-xs sm:text-sm text-stone-400 mt-1">
                  Direct affiliate links with verified specs and live Amazon availability
                </p>
              </div>
              <span className="text-xs sm:text-sm font-mono text-amber-400 font-bold shrink-0 ml-2">
                {article.affiliateProducts.length} Field Picks
              </span>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {article.affiliateProducts.map((product, idx) => (
                <AffiliateProductCard
                  key={idx}
                  product={product}
                  articleSlug={article.slug}
                />
              ))}
            </div>
          </div>
        )}

        {/* Mid-Article Responsive AdSense Unit */}
        <AdUnit format="in-article" slotName="Article Mid-Content Ad" />

        {/* Frequently Asked Questions Section (with Schema.org Accordion) */}
        {article.faq && article.faq.length > 0 && (
          <div className="my-10 sm:my-14 pt-6 sm:pt-8 border-t border-stone-800">
            <div className="flex items-center space-x-2 text-stone-100 font-serif font-bold text-xl sm:text-3xl mb-5 sm:mb-6">
              <HelpCircle className="w-5 h-5 sm:w-7 sm:h-7 text-amber-500 shrink-0" />
              <h3>Frequently Asked Questions</h3>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {article.faq.map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl sm:rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden transition-all shadow-md"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full px-4 sm:px-6 py-3.5 sm:py-4 text-left flex items-center justify-between hover:bg-stone-850 transition-colors"
                  >
                    <span className="font-serif font-bold text-sm sm:text-lg text-stone-100 pr-3">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0 transition-transform duration-300 ${
                        openFaq === idx ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {openFaq === idx && (
                    <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-1 sm:pt-2 text-xs sm:text-base text-stone-300 border-t border-stone-800/60 leading-relaxed font-sans">
                      {item.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Author Bio Box */}
        <div className="my-8 sm:my-12 p-5 sm:p-7 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 shadow-xl">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-amber-500/50 shrink-0 bg-stone-950 p-0.5 shadow-md"
          />
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="text-[11px] font-mono text-amber-500 font-semibold uppercase tracking-wider">
                Field Author & Technical Lead
              </span>
              {authorCredentials && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                  {authorCredentials}
                </span>
              )}
            </div>
            <h4 className="text-lg sm:text-xl font-serif font-bold text-stone-100 mt-0.5">
              {authorName}
            </h4>
            <div className="text-xs font-mono text-stone-400 mb-2">
              {authorRole}
            </div>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
              {authorBio}
            </p>
          </div>
        </div>

        {/* Dispatch Newsletter Subscription & Companion PDF Blueprint */}
        <NewsletterSignupCard variant="article_footer" source={`article_${article.slug}`} />

        {/* Related Articles / Authority Internal Linking Clusters */}
        {article.internalLinks && article.internalLinks.length > 0 && (
          <div className="my-10 sm:my-14 pt-6 sm:pt-8 border-t border-stone-800">
            <div className="flex items-center space-x-2 text-stone-100 font-serif font-bold text-xl sm:text-3xl mb-5 sm:mb-6">
              <Layers className="w-5 h-5 sm:w-7 sm:h-7 text-amber-500 shrink-0" />
              <h3>Related Technical Manuals</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {article.internalLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={`/articles/${link.slug}`}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigateSlug(link.slug);
                  }}
                  className="cursor-pointer group p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-stone-900 border border-stone-800 hover:border-amber-500/50 transition-all flex flex-col justify-between shadow-md block"
                >
                  <div>
                    <span className="text-[11px] sm:text-xs font-mono text-amber-400 uppercase font-semibold">
                      Cross-Referenced Dispatch
                    </span>
                    <h4 className="font-serif font-bold text-sm sm:text-lg text-stone-100 group-hover:text-amber-400 transition-colors mt-1 leading-snug">
                      {link.anchor}
                    </h4>
                  </div>
                  <div className="mt-3 sm:mt-4 flex items-center justify-between text-xs font-mono text-stone-400 pt-2.5 sm:pt-3 border-t border-stone-800/80">
                    <span className="truncate mr-2">/articles/{link.slug}</span>
                    <span className="text-amber-400 font-bold group-hover:translate-x-1 transition-transform flex items-center shrink-0">
                      Read <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Navigation Back CTA */}
        <div className="mt-10 sm:mt-16 pt-6 sm:pt-8 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-bold text-xs sm:text-base flex items-center justify-center space-x-2 transition-colors shadow-md"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dispatches Catalog</span>
          </button>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-stone-400 hover:text-amber-400 text-xs sm:text-sm font-mono transition-colors py-2"
          >
            &uarr; Back to Top
          </button>
        </div>
      </div>
    </article>
  );
};
