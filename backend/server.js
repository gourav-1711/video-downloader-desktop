const express = require("express");
const cors = require("cors");
const os = require("os");
const path = require("path");
const fs = require("fs");
const { execFile } = require("child_process");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

// 🔍 Helper to get correct binary path based on OS
let isDev = true;

try {
  // check if we are in electron
  if (process.versions && process.versions.electron) {
    const { app: electronApp } = require("electron");
    isDev = !electronApp.isPackaged;
  } else {
    isDev = process.env.NODE_ENV !== "production";
  }
} catch (error) {
  // Fallback if electron module is not found (pure node execution)
  isDev = process.env.NODE_ENV !== "production";
}

const basePath = isDev
  ? path.join(__dirname)
  : path.join(process.resourcesPath, "backend");

function getBinaryPath(name) {
  const platform = os.platform();
  const binaryName = platform === "win32" ? `${name}.exe` : name;
  return path.join(
    basePath,
    "bin",
    platform === "win32" ? "win" : platform === "darwin" ? "mac" : "linux",
    binaryName
  );
}

const ytdlpPath = getBinaryPath("yt-dlp");

const ffmpegPath = getBinaryPath("ffmpeg");

const downloadsPath = path.join(
  os.homedir(),
  "Downloads",
  "4k Video Downloader"
);

console.log("YTDLP Path:", getBinaryPath("yt-dlp"));
console.log("FFmpeg Path:", getBinaryPath("ffmpeg"));
console.log("FFmpeg Exists:", fs.existsSync(getBinaryPath("ffmpeg")));

// 🛠️ Ensure download folder exists
if (!fs.existsSync(downloadsPath)) {
  fs.mkdirSync(downloadsPath, { recursive: true });
}

// 📥 Download Router
const downloadRouter = require("./download")(
  ytdlpPath,
  ffmpegPath,
  downloadsPath
);
app.use("/api/new-download", downloadRouter);

// validate if video can be downloaded by ytdlp
app.post("/get-video-info", (req, res) => {
  const videoUrl = req.body.url;

  if (!videoUrl || typeof videoUrl !== "string") {
    return res.status(400).json({ error: "Missing or invalid URL" });
  }

  const args = [
    "--print-json",
    "--skip-download", // ⬅ prevents 403 + fragment probe
    "--no-check-formats", // ⬅ don’t validate every format
    "--no-warnings",
    "--no-check-certificate",
    "--playlist-items",
    "1",
    videoUrl,
  ];

  execFile(ytdlpPath, args, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ Video info fetch failed:", error.message);
      return res.status(400).json({
        success: false,
        error: "Invalid or unsupported URL",
        message: stderr || error.message,
      });
    }

    try {
      const lines = stdout.trim().split("\n");
      const data = JSON.parse(lines[0]);

      let previewUrl = "";

      // pick a playable mp4 stream if possible
      if (data.formats) {
        const best = data.formats.find(
          (f) =>
            f.ext === "mp4" &&
            f.vcodec !== "none" &&
            f.acodec !== "none" &&
            f.url
        );

        if (best) previewUrl = best.url;
      }

      res.json({
        success: true,
        bg_title: data.title,
        title: data.title,
        uploader: data.uploader,
        duration: data.duration,
        site: data.extractor,
        views: data.view_count,
        uploadDate: data.upload_date,
        thumbnail: data.thumbnail,
        channel_url: data.channel_url,
        previewUrl,
      });
    } catch (err) {
      console.error("JSON parse error:", err);
      res.status(500).json({
        success: false,
        error: "Failed to parse yt-dlp output",
        message: err.message,
      });
    }
  });
});

// Playlist download moved to download.js

// 🚀 Hello World route
app.get("/", (req, res) => {
  res.send("Hello, world! 4k video downloader backend is running.");
});

// 🧠 Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
