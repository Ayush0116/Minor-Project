
import express from "express";

const router = express.Router();

const YOUTUBE_API_URL =
  "https://www.googleapis.com/youtube/v3/search";

// GET /api/youtube/search?q=Excel
router.get("/search", async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required."
      });
    }

    if (query.length > 150) {
      return res.status(400).json({
        success: false,
        message: "Search query is too long."
      });
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        message: "YouTube API key is not configured."
      });
    }

    const params = new URLSearchParams({
      part: "snippet",
      q: `${query} tutorial for beginners`,
      type: "video",
      maxResults: "5",
      videoEmbeddable: "true",
      safeSearch: "moderate",
      key: apiKey
    });

    const response = await fetch(
      `${YOUTUBE_API_URL}?${params.toString()}`
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "YouTube API error:",
        data.error?.message || response.status
      );

      return res.status(response.status === 403 ? 502 : 502).json({
        success: false,
        message:
          "YouTube videos could not be fetched. Check API key, API access and quota."
      });
    }

    const videos = (data.items || []).map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      channelTitle: item.snippet.channelTitle,
      thumbnail:
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url ||
        "",
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    return res.json({
      success: true,
      query,
      count: videos.length,
      videos
    });
  } catch (error) {
    console.error("YouTube search error:", error.message);

    return res.status(500).json({
      success: false,
      message: "An error occurred while searching YouTube."
    });
  }
});

export default router;
