import React from "react";
import {
  Sparkles,
  Shield,
  Lightbulb,
  Newspaper,
  ArrowRight,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
  tags?: string[];
  imageUrl?: string | null;
}

export const NEWS_CATEGORIES = ["All", "Tech News", "Developer", "AI", "Security"] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export function formatTimeAgo(dateInput: string | Date | undefined): string {
  if (!dateInput) return "Recently";
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function getCategoryBadge(category: string) {
  const cat = category?.toLowerCase();
  if (cat === "ai") {
    return {
      label: "AI",
      tint: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
      icon: Sparkles,
    };
  }
  if (cat === "security") {
    return {
      label: "Security",
      tint: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
      icon: Shield,
    };
  }
  if (cat === "developer") {
    return {
      label: "Developer",
      tint: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
      icon: Lightbulb,
    };
  }
  return {
    label: "Tech News",
    tint: "bg-primary/10 text-primary border-primary/20",
    icon: Newspaper,
  };
}

export function NewsCard({ item }: { item: NewsItem }) {
  const badgeConfig = getCategoryBadge(item.category);

  return (
    <article className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center rounded-full bg-muted/80 px-2.5 py-0.5 text-[11px] font-bold text-foreground">
            {item.source}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeConfig.tint}`}
          >
            <badgeConfig.icon className="h-3 w-3" />
            {badgeConfig.label}
          </span>
        </div>

        <h3
          className="mt-3.5 font-display text-base font-bold text-foreground line-clamp-2 leading-snug"
          title={item.title}
        >
          {item.title}
        </h3>

        <p
          className="mt-2 text-sm text-muted-foreground line-clamp-2 leading-relaxed"
          title={item.summary}
        >
          {item.summary}
        </p>
      </div>

      <div className="mt-5 flex items-center justify-between pt-3 border-t border-border/50 text-xs">
        <span className="text-muted-foreground font-medium">
          {formatTimeAgo(item.publishedAt)}
        </span>
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-semibold text-primary hover:text-accent transition-colors cursor-pointer"
        >
          Read more <ArrowRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </article>
  );
}

export function NewsSkeletonGrid({
  count = 4,
  className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 shadow-soft animate-pulse h-56"
        >
          <div>
            <div className="flex justify-between items-center">
              <div className="h-5 w-16 rounded-full bg-muted" />
              <div className="h-5 w-20 rounded-full bg-muted" />
            </div>
            <div className="mt-4 h-5 w-4/5 rounded bg-muted" />
            <div className="mt-2 h-4 w-full rounded bg-muted/70" />
            <div className="mt-1 h-4 w-2/3 rounded bg-muted/70" />
          </div>
          <div className="flex justify-between items-center pt-3 border-t border-border/40">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function NewsErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-accent/15 text-accent">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="font-display text-base font-bold text-foreground">
        Couldn't load news right now
      </h3>
      <p className="max-w-md text-xs text-muted-foreground">
        We encountered an issue connecting to the live tech news feed. Your progress and other features are unaffected.
      </p>
      <Button
        onClick={onRetry}
        variant="outline"
        size="sm"
        className="mt-2 rounded-full border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
      >
        <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Try again
      </Button>
    </div>
  );
}

/**
 * Picks 4 curated news items with variety:
 * - At most 1 item per source
 * - Preferring Developer & AI (and Security) first, then Tech News
 */
export function selectCuratedDashboardNews(items: NewsItem[], limit = 4): NewsItem[] {
  if (!items || items.length === 0) return [];

  const selected: NewsItem[] = [];
  const usedSources = new Set<string>();

  // Pass 1: Developer & AI & Security items, at most 1 per source, newest first
  const highPriority = items.filter(
    (item) => item.category === "Developer" || item.category === "AI" || item.category === "Security"
  );

  for (const item of highPriority) {
    if (selected.length >= limit) break;
    const sourceKey = (item.source || "").toLowerCase().trim();
    if (!usedSources.has(sourceKey)) {
      usedSources.add(sourceKey);
      selected.push(item);
    }
  }

  // Pass 2: Remaining items (Tech News, etc.), at most 1 per source
  if (selected.length < limit) {
    for (const item of items) {
      if (selected.length >= limit) break;
      const sourceKey = (item.source || "").toLowerCase().trim();
      if (!usedSources.has(sourceKey)) {
        usedSources.add(sourceKey);
        selected.push(item);
      }
    }
  }

  // Pass 3 (Fallback): If there are fewer than 4 distinct sources in total, fill remaining slots
  if (selected.length < limit) {
    for (const item of items) {
      if (selected.length >= limit) break;
      if (!selected.some((s) => s.id === item.id || s.url === item.url)) {
        selected.push(item);
      }
    }
  }

  return selected;
}

