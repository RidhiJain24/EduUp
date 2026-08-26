const express = require('express');
const axios = require('axios');
const router = express.Router();

// In-memory cache for playlist search queries
// Key: query (lowercase trimmed string), Value: { timestamp: number, data: array }
const cache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// @route   GET /api/playlists/search?query=<topic>
// @desc    Search YouTube playlists by topic
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'YouTube API key is not configured on the server' });
    }

    const cacheKey = query.trim().toLowerCase();
    const now = Date.now();

    // Check if result exists in cache and is less than 1 hour old
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      if (now - cached.timestamp < CACHE_TTL_MS) {
        return res.json(cached.data);
      } else {
        cache.delete(cacheKey);
      }
    }

    // Call YouTube Data API v3 search endpoint
    const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
      params: {
        part: 'snippet',
        type: 'playlist',
        q: query.trim(),
        maxResults: 4,
        key: apiKey,
      },
    });

    const items = response.data.items || [];

    // Transform response items into clean format
    const transformedPlaylists = items.map((item) => {
      const playlistId = item.id?.playlistId || '';
      const snippet = item.snippet || {};
      const thumbnails = snippet.thumbnails || {};
      const thumbnailUrl =
        thumbnails.high?.url ||
        thumbnails.medium?.url ||
        thumbnails.default?.url ||
        '';

      return {
        playlistId,
        channelName: snippet.channelTitle || '',
        title: snippet.title || '',
        thumbnailUrl,
        playlistUrl: `https://www.youtube.com/playlist?list=${playlistId}`,
      };
    });

    // Save transformed result to in-memory cache
    cache.set(cacheKey, {
      timestamp: now,
      data: transformedPlaylists,
    });

    return res.json(transformedPlaylists);
  } catch (error) {
    if (error.response) {
      const status = error.response.status || 500;
      const apiError = error.response.data?.error;
      const message = apiError?.message || 'Failed to fetch playlists from YouTube API';
      
      return res.status(status).json({
        error: message,
      });
    }

    return res.status(500).json({
      error: error.message || 'An unexpected error occurred while fetching YouTube playlists',
    });
  }
});

module.exports = router;
