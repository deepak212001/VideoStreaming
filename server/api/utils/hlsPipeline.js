import fs from "fs";
import path from "path";
import {uploadFileToCloudinary} from "./cloudinary.js";
import {
  HLS_QUALITIES,
  getEncoderKind,
  runHlsTranscode,
  probeVideoDurationSeconds,
  generateStoryboardSprite,
  buildStoryboardMeta,
  STORYBOARD_INTERVAL_SEC,
  STORYBOARD_COLS,
  STORYBOARD_ROWS,
  STORYBOARD_CELL_W,
  STORYBOARD_CELL_H,
} from "./ffmpeg.js";

/** Matches generateStoryboardSprite / buildStoryboardMeta (frontend hover scrub) */
export const STORYBOARD_META = {
  intervalSec: STORYBOARD_INTERVAL_SEC,
  tileCols: STORYBOARD_COLS,
  tileRows: STORYBOARD_ROWS,
  cellWidth: STORYBOARD_CELL_W,
  cellHeight: STORYBOARD_CELL_H,
};

/**
 * Transcode to multi-quality HLS on disk, upload every .ts + rewritten playlists + master + storyboard.
 * @returns {{ masterUrl: string, storyboardUrl: string, storyboardPublicId: string, storyboardMeta: Array<{time:number,x:number,y:number}>, duration: number, hlsRawPrefix: string }}
 */
export async function transcodeAndUploadHls({
  sourceVideoPath,
  assetId,
}) {
  const workDir = path.join(
    path.resolve(process.cwd(), "public", "temp"),
    `hls_work_${assetId}`,
  );
  fs.mkdirSync(workDir, {recursive: true});

  const qualities = HLS_QUALITIES;
  const encoderKind = getEncoderKind();
  const cloudFolder = `videos/hls_${assetId}`;

  const relToUrl = new Map();

  try {
    await runHlsTranscode(sourceVideoPath, workDir, qualities, encoderKind);

    const storyPath = path.join(workDir, "storyboard.jpg");
    try {
      await generateStoryboardSprite(sourceVideoPath, storyPath);
    } catch (e) {
      console.warn("[hls] storyboard generation skipped:", e?.message || e);
    }

    const duration = await probeVideoDurationSeconds(sourceVideoPath);
    const storyboardMeta = buildStoryboardMeta(duration);

    // 1) Upload all segments (.ts)
    for (const q of qualities) {
      const qdir = path.join(workDir, q.name);
      if (!fs.existsSync(qdir)) continue;
      const segments = fs
        .readdirSync(qdir)
        .filter((f) => f.endsWith(".ts"))
        .sort();
      for (const seg of segments) {
        const local = path.join(qdir, seg);
        const relKey = `${q.name}/${seg}`;
        const res = await uploadFileToCloudinary(local, {
          resource_type: "raw",
          folder: cloudFolder,
          public_id: relKey,
          unlinkAfter: true,
        });
        if (!res?.secure_url) {
          throw new Error(`Cloudinary upload failed for ${relKey}`);
        }
        relToUrl.set(relKey, res.secure_url);
      }
    }

    // 2) Rewrite variant playlists (absolute segment URLs) and upload
    const variantMasterUrls = [];
    for (const q of qualities) {
      const idxPath = path.join(workDir, q.name, "index.m3u8");
      if (!fs.existsSync(idxPath)) continue;
      let text = fs.readFileSync(idxPath, "utf8");
      const lines = text.split(/\r?\n/);
      const rewritten = lines
        .map((line) => {
          const t = line.trim();
          if (!t || t.startsWith("#")) return line;
          const base = path.basename(t);
          const key = `${q.name}/${base}`;
          return relToUrl.get(key) || line;
        })
        .join("\n");

      const tmpPl = path.join(workDir, q.name, "index.upload.m3u8");
      fs.writeFileSync(tmpPl, rewritten, "utf8");

      const res = await uploadFileToCloudinary(tmpPl, {
        resource_type: "raw",
        folder: cloudFolder,
        public_id: `${q.name}/index`,
        unlinkAfter: true,
      });
      if (!res?.secure_url) {
        throw new Error(`Cloudinary upload failed for ${q.name}/index.m3u8`);
      }
      variantMasterUrls.push({q, url: res.secure_url});
      try {
        fs.unlinkSync(idxPath);
      } catch {
        /* ignore */
      }
    }

    // 3) Master playlist
    const masterLines = ["#EXTM3U", "#EXT-X-VERSION:3"];
    for (const {q, url} of variantMasterUrls) {
      masterLines.push(
        `#EXT-X-STREAM-INF:BANDWIDTH=${q.bandwidth},RESOLUTION=${q.resolution},CODECS="avc1.64001e,mp4a.40.2"`,
      );
      masterLines.push(url);
    }
    const masterPath = path.join(workDir, "master.m3u8");
    fs.writeFileSync(masterPath, masterLines.join("\n"), "utf8");

    const masterRes = await uploadFileToCloudinary(masterPath, {
      resource_type: "raw",
      folder: cloudFolder,
      public_id: "master",
      unlinkAfter: true,
    });
    if (!masterRes?.secure_url) {
      throw new Error("Cloudinary master.m3u8 upload failed");
    }

    // 4) Storyboard image (hover strip) — optional
    let storyboardUrl = "";
    let storyboardPublicId = "";
    const sbLocal = path.join(workDir, "storyboard.jpg");
    if (fs.existsSync(sbLocal)) {
      const sbRes = await uploadFileToCloudinary(sbLocal, {
        resource_type: "image",
        folder: cloudFolder,
        public_id: "storyboard",
        unlinkAfter: true,
      });
      if (sbRes?.secure_url && sbRes.public_id) {
        storyboardUrl = sbRes.secure_url;
        storyboardPublicId = sbRes.public_id;
      }
    }

    return {
      masterUrl: masterRes.secure_url,
      storyboardUrl,
      storyboardPublicId,
      storyboardMeta,
      duration,
      hlsRawPrefix: cloudFolder,
    };
  } finally {
    try {
      if (fs.existsSync(workDir)) {
        fs.rmSync(workDir, {recursive: true, force: true});
      }
    } catch {
      /* ignore */
    }
  }
}
