import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  RefreshCw,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAPI } from "@/lib/api";
import {
  NewsItem,
  NEWS_CATEGORIES,
  NewsCategory,
  NewsCard,
  NewsSkeletonGrid,
  NewsErrorState,
  formatTimeAgo,
} from "@/components/news/NewsComponents";

export const Route = createFileRoute("/news")({
  head: () => ({
    meta: [
      { title: "Tech News — EduUp" },
      {
        name: "description",
        content: "Live tech headlines, developer insights, and security updates for CS students.",
      },
      { property: "og:title", content: "Tech News — EduUp" },
      {
        property: "og:description",
        content: "Live tech headlines, developer insights, and security updates for CS students.",
      },
    ],
  }),
  component: NewsPage,
});

function NewsHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link
          to="/dashboard"
          className="flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-foreground"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
            <GraduationCap className="h-5 w-5" />
          </span>
          EduUp
        </Link>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="rounded-full border-border/80 text-foreground hover:bg-muted font-semibold gap-1.5"
        >
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
        </Button>
      </div>
    </header>
  );
}

function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState<NewsCategory>("All");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (cat: NewsCategory = "All", isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const endpoint = cat === "All" ? "/news" : `/news?category=${encodeURIComponent(cat)}`;
      const data = await fetchAPI(endpoint);
      if (data && Array.isArray(data.items)) {
        setNews(data.items);
        setUpdatedAt(data.updatedAt || new Date().toISOString());
      } else {
        setNews([]);
      }
    } catch (err: any) {
      console.error("Failed to fetch news:", err);
      setError("Couldn't load news right now");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchNews(selectedCategory);
  }, [selectedCategory, fetchNews]);

  const handleRefresh = () => {
    fetchNews(selectedCategory, true);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Background ambient glows matching dashboard */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-[300px] w-[300px] rounded-full bg-accent/20 blur-3xl" />

      <NewsHeader />

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-border/60 pb-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                What's happening in tech 📰
              </h1>
              {updatedAt && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/60 px-3 py-1 rounded-full border border-border/40">
                  Updated {formatTimeAgo(updatedAt)}
                </span>
              )}
            </div>
            <p className="mt-2 text-base text-muted-foreground max-w-2xl">
              Live tech headlines, developer tutorials, AI breakthroughs, and security advisories from TechCrunch, The Verge, Ars Technica, freeCodeCamp, Dev.to, and Hacker News.
            </p>
          </div>

          {/* Action Row: Refresh Button */}
          <div className="flex items-center gap-3 self-start sm:self-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              className="h-9 rounded-full px-4 border-border text-xs font-semibold text-foreground hover:bg-muted cursor-pointer gap-2"
              title="Refresh news feed"
              aria-label="Refresh news feed"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-primary" : ""}`} />
              <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
            </Button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex flex-wrap gap-1.5 rounded-2xl bg-muted/60 p-1.5 border border-border/50">
            {NEWS_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-xl px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && news.length === 0 && (
          <NewsSkeletonGrid
            count={12}
            className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          />
        )}

        {/* Error State */}
        {error && news.length === 0 && (
          <NewsErrorState onRetry={() => fetchNews(selectedCategory)} />
        )}

        {/* Empty State */}
        {!loading && !error && news.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center">
            <p className="text-base font-medium text-muted-foreground">
              No stories found in the "{selectedCategory}" category right now.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedCategory("All")}
              className="mt-2 rounded-full border-primary/30 text-primary hover:bg-primary/10 cursor-pointer"
            >
              Show All News
            </Button>
          </div>
        )}

        {/* News Cards Grid */}
        {news.length > 0 && (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {news.map((item) => (
              <NewsCard key={item.id || item.url} item={item} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

