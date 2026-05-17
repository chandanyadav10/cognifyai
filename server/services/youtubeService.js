const { YoutubeTranscript } = require("youtube-transcript");

/**
 * Extract transcript from YouTube video URL
 * @param {string} url - YouTube video URL
 */
const extractYoutubeTranscript = async (url) => {
  // Extract video ID from various YouTube URL formats
  const videoIdMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );

  if (!videoIdMatch) {
    throw new Error("Invalid YouTube URL. Please provide a valid YouTube video link.");
  }

  const videoId = videoIdMatch[1];

  const transcriptArr = await YoutubeTranscript.fetchTranscript(videoId);

  if (!transcriptArr || transcriptArr.length === 0) {
    throw new Error("No transcript available for this video. Try a video with captions enabled.");
  }

  // Join all transcript segments into one text
  const transcript = transcriptArr.map((seg) => seg.text).join(" ");

  return transcript.trim();
};

module.exports = { extractYoutubeTranscript };
