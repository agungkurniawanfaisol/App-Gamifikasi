const VIDEO_ID_RE = /^[a-zA-Z0-9_-]{11}$/;

function isAllowedYoutubeHost(hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, "");
  return (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "youtu.be" ||
    host === "youtube-nocookie.com"
  );
}

/**
 * Extract an 11-character YouTube video ID from common URL shapes.
 * Returns null for unknown hosts or malformed input.
 */
export function parseYoutubeVideoId(input: string): string | null {
  const raw = input.trim();
  if (!raw) return null;

  if (VIDEO_ID_RE.test(raw)) return raw;

  let url: URL;
  try {
    url = new URL(raw.includes("://") ? raw : `https://${raw}`);
  } catch {
    return null;
  }

  if (!isAllowedYoutubeHost(url.hostname)) return null;

  const host = url.hostname.toLowerCase().replace(/^www\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.split("/").filter(Boolean)[0] ?? "";
    return VIDEO_ID_RE.test(id) ? id : null;
  }

  const v = url.searchParams.get("v");
  if (v && VIDEO_ID_RE.test(v)) return v;

  const parts = url.pathname.split("/").filter(Boolean);
  const kindIdx = parts.findIndex(
    (p) => p === "embed" || p === "shorts" || p === "live" || p === "v"
  );
  if (kindIdx >= 0) {
    const id = parts[kindIdx + 1] ?? "";
    return VIDEO_ID_RE.test(id) ? id : null;
  }

  return null;
}

export function toYoutubeEmbedUrl(videoId: string): string {
  if (!VIDEO_ID_RE.test(videoId)) {
    throw new Error("Invalid YouTube video ID");
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}`;
}

/** Normalize any accepted YouTube URL to a nocookie embed URL, or null. */
export function normalizeYoutubeEmbedUrl(input: string): string | null {
  const id = parseYoutubeVideoId(input);
  if (!id) return null;
  return toYoutubeEmbedUrl(id);
}

export function youtubeIframeHtml(
  embedUrl: string,
  title = "YouTube video"
): string {
  const id = parseYoutubeVideoId(embedUrl);
  if (!id) return "";
  const src = toYoutubeEmbedUrl(id);
  return `<div class="youtube-embed"><iframe src="${src}" title="${escapeAttr(title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
}

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
