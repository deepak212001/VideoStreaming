/** Duration: seconds number or string → display like 3:45 or 1:02:03 */
export function formatDuration(duration) {
  if (duration == null) return "";
  if (typeof duration === "number") {
    const h = Math.floor(duration / 3600);
    const m = Math.floor((duration % 3600) / 60);
    const s = Math.floor(duration % 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  if (typeof duration === "string") return duration;
  return "";
}

/** Like count for buttons (no "views" suffix): 0 → "0", 24000 → "24K") */
export function formatLikeCount(n) {
  if (n == null || Number.isNaN(Number(n))) return "0";
  const v = Math.max(0, Math.floor(Number(n)));
  if (v >= 1_000_000) {
    const x = v / 1_000_000;
    return `${x >= 10 ? Math.round(x) : x.toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (v >= 1_000) {
    const x = v / 1_000;
    return `${x >= 10 ? Math.round(x) : x.toFixed(1).replace(/\.0$/, "")}K`;
  }
  return String(v);
}

export function formatViewCount(n) {
  if (n == null || Number.isNaN(Number(n))) return "0 views";
  const v = Number(n);
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M views`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(1)}K views`;
  return `${v} views`;
}

/** ISO date string → short relative label */
export function formatRelativeUpload(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const now = Date.now();
  const diffSec = Math.floor((now - d) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} days ago`;
  if (diffSec < 2592000) return `${Math.floor(diffSec / 604800)} weeks ago`;
  if (diffSec < 31536000) return `${Math.floor(diffSec / 2592000)} months ago`;
  return `${Math.floor(diffSec / 31536000)} years ago`;
}
