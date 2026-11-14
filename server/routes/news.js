const express = require('express');
const router = express.Router();
const Parser = require('rss-parser');
const crypto = require('crypto');

const parser = new Parser();

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Sources configuration
const RSS_SOURCES = [
  { name: 'TechCrunch', url: 'https://techcrunch.com/feed/', baseCategory: 'Tech News' },
  { name: 'The Verge', url: 'https://www.theverge.com/rss/index.xml', baseCategory: 'Tech News' },
  { name: 'Ars Technica', url: 'https://feeds.arstechnica.com/arstechnica/index', baseCategory: 'Tech News' },
  { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org/news/rss/', baseCategory: 'Developer' },
  { name: 'Dev.to', url: 'https://dev.to/feed', baseCategory: 'Developer' }
];

const HN_TOP_STORIES_URL = 'https://hacker-news.firebaseio.com/v0/topstories.json';
const HN_ITEM_BASE_URL = 'https://hacker-news.firebaseio.com/v0/item';
const TIMEOUT_MS = 6000;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Specificity keywords
const AI_KEYWORDS = /\b(ai|artificial intelligence|llm|openai|gemini|claude|machine learning|chatgpt)\b/i;
const SECURITY_KEYWORDS = /\b(security|breach|vulnerability|vulnerabilities|hack|hacked|hacker|hackers|malware|ransomware)\b/i;

/**
 * Strips HTML tags, decodes common HTML entities, collapses whitespace,
 * and limits output to maxLen characters (default 160).
 */
function stripHtmlAndTruncate(rawText, maxLen = 160) {
  if (!rawText || typeof rawText !== 'string') return '';
  let cleaned = rawText.replace(/<[^>]+>/g, ' ');
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8212;/g, '—')
    .replace(/&#8211;/g, '–');
  cleaned = cleaned.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLen) return cleaned;
  return cleaned.slice(0, maxLen - 3).trim() + '...';
}

/**
 * Categorizes an item based on keywords and base source category.
 * Rules:
 * - Base: TechCrunch/The Verge/Ars Technica = "Tech News", freeCodeCamp/Dev.to/Hacker News = "Developer"
 * - AI keywords (ai, artificial intelligence, llm, openai, gemini, claude, machine learning, chatgpt) = "AI"
 * - Security keywords (security, breach, vulnerability, hack, malware, ransomware) = "Security"
 * - Most specific wins (AI / Security over Tech News / Developer)
 */
function categorizeItem(title, summary, baseCategory) {
  const combinedText = `${title} ${summary}`;
  const isAI = AI_KEYWORDS.test(combinedText);
  const isSecurity = SECURITY_KEYWORDS.test(combinedText);

  if (isAI && isSecurity) {
    return AI_KEYWORDS.test(title) ? 'AI' : 'Security';
  }
  if (isAI) return 'AI';
  if (isSecurity) return 'Security';
  return baseCategory;
}

/**
 * Extracts preview image URL from RSS item metadata or content.
 */
function extractImageUrl(item) {
  if (item.enclosure?.url) {
    return item.enclosure.url;
  }
  if (item['media:content']?.['$']?.url) {
    return item['media:content']['$'].url;
  }
  if (item['media:thumbnail']?.['$']?.url) {
    return item['media:thumbnail']['$'].url;
  }
  const content = item['content:encoded'] || item.content || item.description || '';
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match && match[1]) {
    return match[1];
  }
  return null;
}

/**
 * Fetches and parses an RSS feed source with 6-second timeout.
 */
async function fetchRssSource(source) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(source.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': BROWSER_USER_AGENT,
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
      }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`);
    }

    const xml = await res.text();
    const feed = await parser.parseString(xml);
    if (!feed || !Array.isArray(feed.items)) return [];

    return feed.items.map((item) => {
      const title = (item.title || '').trim();
      const rawSummary = item.contentSnippet || item.summary || item.content || item.description || '';
      const summary = stripHtmlAndTruncate(rawSummary) || title;
      const url = (item.link || item.guid || '').trim();
      const rawDate = item.isoDate || item.pubDate;
      let publishedAt = new Date().toISOString();
      if (rawDate) {
        const parsedDate = new Date(rawDate);
        if (!isNaN(parsedDate.getTime())) {
          publishedAt = parsedDate.toISOString();
        }
      }
      const category = categorizeItem(title, summary, source.baseCategory);
      const imageUrl = extractImageUrl(item);
      const id = crypto.createHash('sha256').update(url || title).digest('hex').slice(0, 16);

      return {
        id,
        title,
        summary,
        url,
        source: source.name,
        publishedAt,
        category,
        imageUrl
      };
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetches top 15 Hacker News stories that have an outbound url with 6-second timeout.
 */
async function fetchHackerNews() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const topRes = await fetch(HN_TOP_STORIES_URL, {
      signal: controller.signal,
      headers: { 'User-Agent': BROWSER_USER_AGENT }
    });
    if (!topRes.ok) throw new Error(`HN top stories returned status ${topRes.status}`);
    const topIds = await topRes.json();
    const idsToFetch = (topIds || []).slice(0, 15);

    const storyPromises = idsToFetch.map(async (id) => {
      try {
        const itemRes = await fetch(`${HN_ITEM_BASE_URL}/${id}.json`, {
          signal: controller.signal,
          headers: { 'User-Agent': BROWSER_USER_AGENT }
        });
        if (!itemRes.ok) return null;
        const story = await itemRes.json();
        if (!story || !story.url) return null;
        return story;
      } catch {
        return null;
      }
    });

    const stories = await Promise.all(storyPromises);
    const validStories = stories.filter(Boolean);

    return validStories.map((story) => {
      const title = (story.title || '').trim();
      const summary = stripHtmlAndTruncate(story.text || title);
      const url = story.url.trim();
      const publishedAt = story.time ? new Date(story.time * 1000).toISOString() : new Date().toISOString();
      const category = categorizeItem(title, summary, 'Developer');
      const id = crypto.createHash('sha256').update(url).digest('hex').slice(0, 16);

      return {
        id,
        title,
        summary,
        url,
        source: 'Hacker News',
        publishedAt,
        category,
        imageUrl: null
      };
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Fetches and combines news from all sources in parallel via Promise.allSettled.
 */
async function fetchAllNews() {
  const tasks = [
    ...RSS_SOURCES.map((source) => fetchRssSource(source)),
    fetchHackerNews()
  ];

  const results = await Promise.allSettled(tasks);
  const allItems = [];

  for (let i = 0; i < results.length; i++) {
    const res = results[i];
    if (res.status === 'fulfilled' && Array.isArray(res.value)) {
      allItems.push(...res.value);
    } else {
      const sourceName = i < RSS_SOURCES.length ? RSS_SOURCES[i].name : 'Hacker News';
      console.warn(`[News] Source "${sourceName}" skipped:`, res.reason?.message || res.reason);
    }
  }

  // Deduplicate by URL
  const seenUrls = new Set();
  const dedupedItems = [];

  for (const item of allItems) {
    if (!item.url) continue;
    let normalizedUrl = item.url.toLowerCase();
    try {
      const u = new URL(normalizedUrl);
      u.searchParams.delete('utm_source');
      u.searchParams.delete('utm_medium');
      u.searchParams.delete('utm_campaign');
      u.searchParams.delete('utm_term');
      u.searchParams.delete('utm_content');
      normalizedUrl = u.origin + u.pathname.replace(/\/$/, '') + (u.search || '');
    } catch {
      normalizedUrl = normalizedUrl.replace(/\/$/, '');
    }

    if (!seenUrls.has(normalizedUrl)) {
      seenUrls.add(normalizedUrl);
      dedupedItems.push(item);
    }
  }

  // Sort newest first
  dedupedItems.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return dedupedItems;
}

// In-memory cache for 30 minutes
let cache = {
  updatedAt: null,
  items: []
};
let lastFetchTime = 0;
let ongoingFetchPromise = null;

async function getOrUpdateNews() {
  const now = Date.now();
  const isCacheValid = cache.items.length > 0 && (now - lastFetchTime < CACHE_TTL_MS);

  if (isCacheValid) {
    return cache;
  }

  if (!ongoingFetchPromise) {
    ongoingFetchPromise = fetchAllNews()
      .then((items) => {
        if (items.length > 0) {
          cache = {
            updatedAt: new Date().toISOString(),
            items
          };
          lastFetchTime = Date.now();
        } else if (!cache.updatedAt) {
          cache = {
            updatedAt: new Date().toISOString(),
            items: []
          };
        }
        return cache;
      })
      .catch((err) => {
        console.error('[News] Refresh failed completely:', err.message);
        // Fallback to last cached data if available
        if (cache.items.length > 0) {
          return cache;
        }
        return {
          updatedAt: new Date().toISOString(),
          items: []
        };
      })
      .finally(() => {
        ongoingFetchPromise = null;
      });
  }

  return ongoingFetchPromise;
}

// @route   GET /api/news
// @desc    Get live normalized tech news items (Public, no JWT, in-memory 30m cache)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const data = await getOrUpdateNews();
    const categoryParam = req.query.category?.trim();

    let items = data.items;
    if (categoryParam) {
      const lowerCat = categoryParam.toLowerCase();
      items = items.filter((item) => item.category.toLowerCase() === lowerCat);
    }

    // Return the latest 30
    const limitedItems = items.slice(0, 30);

    return res.json({
      updatedAt: data.updatedAt,
      items: limitedItems
    });
  } catch (err) {
    console.error('Error in GET /api/news:', err);
    if (cache.items.length > 0) {
      return res.json({
        updatedAt: cache.updatedAt,
        items: cache.items.slice(0, 30)
      });
    }
    return res.status(500).json({ error: 'Failed to retrieve news feed' });
  }
});

router.getOrUpdateNews = getOrUpdateNews;
module.exports = router;

