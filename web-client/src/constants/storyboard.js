/** Must match server `ffmpeg.js` / `hlsPipeline.js` STORYBOARD_* */

export const STORYBOARD_TILE = {
  intervalSec: 5,
  cols: 10,
  rows: 10,
  cellWidth: 160,
  cellHeight: 90,
}

/** Older publishes: thumbnail+tile=5×4, no storyboardMeta */
export const LEGACY_STORYBOARD_TILE = {
  cols: 5,
  rows: 4,
  cellWidth: 142,
  cellHeight: 80,
}

/**
 * @param {{ time: number, x: number, y: number }[] | undefined} meta
 * @param {number} tSec scrub time in seconds
 */
export function storyboardIndexAtTime(meta, tSec) {
  if (!meta?.length) return 0
  let idx = 0
  for (let i = 0; i < meta.length; i++) {
    if (meta[i].time <= tSec) idx = i
    else break
  }
  return idx
}
