import fs from "fs";
import path from "path";
import {execFile, execFileSync} from "child_process";
import {promisify} from "util";

const execFileAsync = promisify(execFile);

/** HLS segment length (seconds); keyframe spacing follows this */
export const HLS_SEGMENT_SEC = 6;

export const HLS_QUALITIES = [
  {name: "360", resolution: "640x360", bitrate: "800k", bandwidth: 800_000},
  {name: "480", resolution: "854x480", bitrate: "1400k", bandwidth: 1_400_000},
  {name: "720", resolution: "1280x720", bitrate: "2800k", bandwidth: 2_800_000},
  {name: "1080", resolution: "1920x1080", bitrate: "5000k", bandwidth: 5_000_000},
];

let cachedEncoderKind;

function nvencListedInFfmpeg() {
  const out = execFileSync("ffmpeg", ["-hide_banner", "-encoders"], {
    encoding: "utf8",
    maxBuffer: 4 * 1024 * 1024,
  });
  return /\bh264_nvenc\b/.test(out);
}

function nvencProbeWorks() {
  try {
    execFileSync(
      "ffmpeg",
      [
        "-hide_banner",
        "-loglevel",
        "quiet",
        "-f",
        "lavfi",
        "-i",
        "testsrc=duration=0.1:size=128x128:rate=1",
        "-frames:v",
        "1",
        "-c:v",
        "h264_nvenc",
        "-f",
        "null",
        "-",
      ],
      {stdio: ["ignore", "ignore", "ignore"]},
    );
    return true;
  } catch {
    return false;
  }
}

export function getEncoderKind() {
  if (cachedEncoderKind) return cachedEncoderKind;
  try {
    if (process.env.FORCE_LIBX264 === "1" || process.env.FORCE_LIBX264 === "true") {
      cachedEncoderKind = "libx264";
    } else if (!nvencListedInFfmpeg()) {
      cachedEncoderKind = "libx264";
    } else {
      cachedEncoderKind = nvencProbeWorks() ? "nvenc" : "libx264";
    }
  } catch {
    cachedEncoderKind = "libx264";
  }
  console.log(`[transcode] h264 encoder: ${cachedEncoderKind}`);
  return cachedEncoderKind;
}

export function toFfmpegPath(p) {
  return path.resolve(p).replace(/\\/g, "/");
}

export function videoEncodeArgs(kind, bitrate, intBitrateK) {
  const bufsize = `${intBitrateK * 2}k`;
  const gop = `expr:gte(t,n_forced*${HLS_SEGMENT_SEC})`;

  if (kind === "nvenc") {
    return [
      "-c:v",
      "h264_nvenc",
      "-preset",
      "p4",
      "-tune",
      "hq",
      "-rc",
      "vbr",
      "-b:v",
      bitrate,
      "-maxrate",
      bitrate,
      "-bufsize",
      bufsize,
      "-forced-idr",
      "1",
      "-force_key_frames",
      gop,
    ];
  }

  return [
    "-c:v",
    "libx264",
    "-preset",
    "veryfast",
    "-crf",
    "23",
    "-b:v",
    bitrate,
    "-maxrate",
    bitrate,
    "-bufsize",
    bufsize,
    "-x264-params",
    "scenecut=0:ref=1:bframes=0",
    "-forced-idr",
    "1",
    "-force_key_frames",
    gop,
  ];
}

export async function probeVideoDurationSeconds(inputPath) {
  try {
    const {stdout} = await execFileAsync(
      "ffprobe",
      [
        "-v",
        "error",
        "-show_entries",
        "format=duration",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        toFfmpegPath(inputPath),
      ],
      {encoding: "utf8", maxBuffer: 64 * 1024},
    );
    const n = parseFloat(String(stdout).trim());
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

/** Hover scrub sprite: 1 frame / 5s, 160px-wide cells, 10×10 grid (max 100 thumbs, pre-generated). */
export const STORYBOARD_INTERVAL_SEC = 5;
export const STORYBOARD_COLS = 10;
export const STORYBOARD_ROWS = 10;
export const STORYBOARD_MAX_FRAMES = STORYBOARD_COLS * STORYBOARD_ROWS;
/** Fixed cell size after pad (must match tile layout). */
export const STORYBOARD_CELL_W = 160;
export const STORYBOARD_CELL_H = 90;

/**
 * Metadata for each sprite cell: video time (seconds) and top-left pixel in sprite.jpg.
 * Must stay in sync with {@link generateStoryboardSprite}.
 */
export function buildStoryboardMeta(durationSeconds) {
  const interval = STORYBOARD_INTERVAL_SEC;
  const cols = STORYBOARD_COLS;
  const max = STORYBOARD_MAX_FRAMES;
  const cw = STORYBOARD_CELL_W;
  const ch = STORYBOARD_CELL_H;
  if (!Number.isFinite(durationSeconds) || durationSeconds <= 0) {
    return [{time: 0, x: 0, y: 0}];
  }
  const n = Math.min(max, Math.floor(durationSeconds / interval) + 1);
  const meta = [];
  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    meta.push({time: i * interval, x: col * cw, y: row * ch});
  }
  return meta;
}

export async function generateStoryboardSprite(inputPath, outputJpgPath) {
  const vf = [
    "fps=1/5",
    `select=lte(n\\,${STORYBOARD_MAX_FRAMES - 1})`,
    `scale=${STORYBOARD_CELL_W}:${STORYBOARD_CELL_H}:force_original_aspect_ratio=decrease`,
    `pad=${STORYBOARD_CELL_W}:${STORYBOARD_CELL_H}:(ow-iw)/2:(oh-ih)/2`,
    "setsar=1",
    `tile=${STORYBOARD_COLS}x${STORYBOARD_ROWS}`,
  ].join(",");
  await execFileAsync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      toFfmpegPath(inputPath),
      "-vf",
      vf,
      "-frames:v",
      "1",
      "-update",
      "1",
      "-q:v",
      "3",
      toFfmpegPath(outputJpgPath),
    ],
    {maxBuffer: 8 * 1024 * 1024},
  );
}

export async function runHlsTranscode(inputPath, outputDir, qualities, encoderKind) {
  fs.mkdirSync(outputDir, {recursive: true});
  for (const q of qualities) {
    fs.mkdirSync(path.join(outputDir, q.name), {recursive: true});
  }

  const n = qualities.length;
  const splitTargets = qualities.map((_, i) => `[s${i}]`).join("");
  const splitLine = `[0:v]split=${n}${splitTargets}`;

  const scaleLines = qualities.map((q, i) => {
    const [w, h] = q.resolution.split("x");
    return `[s${i}]scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,format=yuv420p[v${q.name}]`;
  });

  const filterComplex = [splitLine, ...scaleLines].join(";");

  const args = [
    "-hide_banner",
    "-loglevel",
    "error",
    "-y",
    "-i",
    toFfmpegPath(inputPath),
    "-filter_complex",
    filterComplex,
  ];

  for (const q of qualities) {
    const qp = path.join(outputDir, q.name);
    const br = q.bitrate;
    const intBr = parseInt(String(br).replace(/\D/g, ""), 10) || 800;

    args.push(
      "-map",
      `[v${q.name}]`,
      "-map",
      "0:a?",
      ...videoEncodeArgs(encoderKind, br, intBr),
      "-c:a",
      "aac",
      "-b:a",
      "128k",
      "-ar",
      "48000",
      "-ac",
      "2",
      "-f",
      "hls",
      "-hls_time",
      String(HLS_SEGMENT_SEC),
      "-hls_playlist_type",
      "vod",
      "-hls_flags",
      "independent_segments",
      "-hls_segment_filename",
      toFfmpegPath(path.join(qp, "segment%03d.ts")),
      toFfmpegPath(path.join(qp, "index.m3u8")),
    );
  }

  await execFileAsync("ffmpeg", args, {
    maxBuffer: 32 * 1024 * 1024,
  });
}

export {nvencProbeWorks, nvencListedInFfmpeg};
