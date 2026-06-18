/**
 * FocusProLab tanıtım videosu üretir.
 * Kullanım: npm run render-onboarding-video
 */
import { chromium } from "playwright";
import { createReadStream, existsSync, mkdirSync, renameSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const htmlPath = join(root, "docs/onboarding-video/index.html");
const outDir = join(root, "docs/onboarding-video/output");
const finalPath = join(root, "public/FocusProLab-sistem-tanitim.mp4");

async function main() {
  if (!existsSync(htmlPath)) {
    console.error("HTML bulunamadı:", htmlPath);
    process.exit(1);
  }

  mkdirSync(outDir, { recursive: true });

  const launchOptions = { headless: true };
  try {
    await chromium.launch({ ...launchOptions, channel: "msedge" });
    launchOptions.channel = "msedge";
  } catch {
    // Playwright Chromium (npx playwright install chromium)
  }

  const browser = await chromium.launch(launchOptions);
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: outDir,
      size: { width: 1280, height: 720 }
    }
  });

  const page = await context.newPage();
  await page.goto(`file:///${htmlPath.replace(/\\/g, "/")}`, { waitUntil: "networkidle" });

  await page.waitForFunction(() => window.__VIDEO_READY__ === true, { timeout: 15000 });
  const duration = await page.evaluate(() => window.__VIDEO_DURATION__ || 78000);

  console.log(`Kayıt başladı (${Math.round(duration / 1000)} sn)…`);
  await page.waitForTimeout(duration + 1500);

  await context.close();
  await browser.close();

  const webmFiles = readdirSync(outDir).filter((f) => f.endsWith(".webm"));
  if (!webmFiles.length) {
    console.error("Video dosyası oluşturulamadı.");
    process.exit(1);
  }

  const webmPath = join(outDir, webmFiles[webmFiles.length - 1]);
  const webmOut = join(outDir, "FocusProLab-sistem-tanitim.webm");

  if (webmPath !== webmOut) {
    try {
      renameSync(webmPath, webmOut);
    } catch {
      await pipeline(createReadStream(webmPath), createWriteStream(webmOut));
    }
  }

  // MP4: ffmpeg varsa dönüştür, yoksa webm bırak
  const { spawnSync } = await import("node:child_process");
  const { existsSync: fsExists } = await import("node:fs");
  const playwrightFfmpeg = join(
    process.env.LOCALAPPDATA || "",
    "ms-playwright",
    "ffmpeg-1011",
    "ffmpeg-win64.exe"
  );
  const ffmpegBin = fsExists(playwrightFfmpeg) ? playwrightFfmpeg : "ffmpeg";
  const ffmpeg = spawnSync(ffmpegBin, ["-version"], { encoding: "utf8" });
  if (ffmpeg.status === 0 && ffmpegBin !== playwrightFfmpeg) {
    const mp4Tmp = join(outDir, "FocusProLab-sistem-tanitim-tmp.mp4");
    const conv = spawnSync(
      ffmpegBin,
      ["-y", "-i", webmOut, "-c:v", "libx264", "-preset", "medium", "-crf", "23", "-pix_fmt", "yuv420p", mp4Tmp],
      { encoding: "utf8" }
    );
    if (conv.status === 0) {
      renameSync(mp4Tmp, finalPath);
      console.log("MP4:", finalPath);
    } else {
      console.warn("ffmpeg dönüşümü başarısız, webm kullanın:", webmOut);
    }
  } else {
    const publicWebm = join(root, "public/FocusProLab-sistem-tanitim.webm");
    renameSync(webmOut, publicWebm);
    console.log("ffmpeg yok — WebM kaydedildi:", publicWebm);
    console.log("MP4 için: ffmpeg -i public/FocusProLab-sistem-tanitim.webm -c:v libx264 public/FocusProLab-sistem-tanitim.mp4");
  }

  console.log("Tamamlandı.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
