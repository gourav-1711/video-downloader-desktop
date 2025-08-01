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

const isDev = process.env.NODE_ENV !== "production";
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

// for production
   const ffmpegPath = "resources/backend/bin/win/ffmpeg.exe" || getBinaryPath("ffmpeg");

// for working in code 
// const ffmpegPath = !isDev
//   ?  "resources/backend/bin/win/ffmpeg.exe"
//   : path.join(__dirname, "bin", "win", "ffmpeg.exe");
// "resources/backend/bin/win/ffmpeg.exe" || getBinaryPath("ffmpeg");

const downloadsPath = path.join(
  os.homedir(),
  "Downloads",
  "Your-Downloads"
);

console.log("YTDLP Path:", getBinaryPath("yt-dlp"));
console.log("FFmpeg Path:", getBinaryPath("ffmpeg"));
console.log("FFmpeg Exists:", fs.existsSync(getBinaryPath("ffmpeg")));

// 🛠️ Ensure download folder exists
if (!fs.existsSync(downloadsPath)) {
  fs.mkdirSync(downloadsPath, { recursive: true });
}

// ⚙️ Execute a yt-dlp command

function runYTDLP(argsArray, res, outputPath) {
  console.log("⚙️ Running:", ytdlpPath, argsArray);

  execFile(ytdlpPath, argsArray, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ ExecFile Error:", error.message);
      console.error("🧨 stderr:", stderr);
      return res
        .status(500)
        .json({ error: "Download failed", message: error.message, stderr });
    }

    console.log("✅ stdout:", stdout);
    res.json({ success: true, path: outputPath });
  });
}
app.post("/validate", (req, res) => {
  const videoUrl = req.body.url;

  if (!videoUrl || typeof videoUrl !== "string") {
    return res.status(400).json({ error: "Missing or invalid URL" });
  }

  // use yt-dlp to check if it can fetch video info
  const args = ["--dump-json", "--playlist-items", "1", "--", videoUrl];

  execFile(ytdlpPath, args, (error, stdout, stderr) => {
    if (error) {
      console.error("❌ URL validation failed:", error.message);
      return res.status(400).json({
        success: false,
        error: "Invalid or unsupported URL",
        message: stderr || error.message,
      });
    }

    try {
      const data = JSON.parse(stdout);
      res.json({
        success: true,
        title: data.title,
        uploader: data.uploader,
        duration: data.duration,
        site: data.extractor,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: "Failed to parse yt-dlp output",
        message: err.message,
      });
    }
  });
});

// get tittle
app.post("/get-title", (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "No URL provided" });

  execFile(ytdlpPath, ["--get-title", "--playlist-items", "1", url], (err, stdout, stderr) => {
    if (err) {
      console.error("yt-dlp error:", stderr);
      return res.status(500).json({ error: "Failed to fetch title" });
    }

    const title = stdout.trim();
    res.json({ title });
  });
});

app.post("/get-preview", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const args = ["-f", "best", "-g", "--playlist-items", "1", url];

  execFile(ytdlpPath, args, (err, stdout, stderr) => {
    if (err) {
      console.error("yt-dlp error:", stderr);
      return res.status(500).json({ error: "Failed to get video URL" });
    }

    const streamUrl = stdout.trim().split("\n")[0]; // safety for multiple outputs
    res.json({ previewUrl: streamUrl });
  });
});


// 🎬 Download Full Video (video + audio)
app.post("/download/video", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

   const output = path.join(downloadsPath, "%(title)s_video.%(ext)s");
  const args = [
    "-f",
    "bv[height=1080]+ba",
    "--no-part",
    "--no-cache-dir",
    "-N",
    "8",
    "-o",
    output,
    "--merge-output-format",
    "mp4",
    "--ffmpeg-location",
    ffmpegPath,
    url,
  ];

  runYTDLP(args, res, output);
});

// 🎧 Download Audio Only (MP3)
app.post("/download/audio", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  const output = path.join(downloadsPath, "%(title)s.%(ext)s");
  const args = [
    "-f",
    "bestaudio",
    "-x",
    "--audio-format",
    "mp3",
    "-o",
    output,
    "--ffmpeg-location",
    ffmpegPath,
    url,
  ];

  runYTDLP(args, res, output);
});

// 🔇 VIDEO ONLY (highest quality, no audio)
app.post("/download/video-only", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

 
  const output = path.join(downloadsPath, "%(title)s_video_only.%(ext)s");
  const args = [
    "-f",
    "bestvideo",
    "--no-part",
    "--no-cache-dir",
    "-N",
    "8",
    "-o",
    output,
    url,
  ];

  runYTDLP(args, res, output);
});

// 🔊 VIDEO + AUDIO (best merged quality)

app.post("/download/merged", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

 
  const output = path.join(downloadsPath, "%(title)s_merged.%(ext)s");
  const args = [
    "-f",
    "bv*[vcodec^=avc1]+ba[acodec^=mp4a]/b",
    "--merge-output-format",
    "mp4",
    "--no-part",
    "--no-cache-dir",
    "-N",
    "8",
    "--ffmpeg-location",
    ffmpegPath,
    "-o",
    output,
    url,
  ];

  runYTDLP(args, res, output);
});

// ⚡ Fast Download
app.post("/download/fast", (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  const output = path.join(downloadsPath, "%(title)s_fast.%(ext)s");
  const args = [
    "-f",
    "best[ext=mp4][vcodec^=avc1][acodec^=mp4a]/best",
    "--no-part",
    "--no-cache-dir",
    "-o",
    output,
    url,
  ];

  runYTDLP(args, res, output);
});
function getPlaylistName(url) {
  return new Promise((resolve, reject) => {
    execFile(
      ytdlpPath,
      ["--print", "%(playlist_title)s", "--playlist-items", "1", url], // ⬅️ only 1st video
      (err, stdout, stderr) => {
        if (err) {
          console.error("🛑 Failed to get playlist title:", stderr);
          return reject("Couldn't get playlist title");
        }

        const firstLine = stdout.split("\n")[0].trim();
        const sanitizedTitle = firstLine.replace(/[<>:"/\\|?*\x00-\x1F]/g, "");
        const time =  Date.now();
        const fallbackName = `Untitled Playlist_${time}`;
        resolve(sanitizedTitle || fallbackName);
      }
    );
  });
}

// 🎞 playlist download
app.post("/download/playlist", async (req, res) => {

  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "No URL provided" });

  try {
    const playlistTitle = await getPlaylistName(url);

    const downloadsPath = path.join(
      os.homedir(),
      "Downloads",
      "Your-Downloads"
    );
    const playlistFolder = path.join(downloadsPath, playlistTitle);

    // make sure the folder exists
    if (!fs.existsSync(playlistFolder)) {
      fs.mkdirSync(playlistFolder, { recursive: true });
    }

    const outputPattern = path.join(
      playlistFolder,
      "%(playlist_index)s - %(title)s.%(ext)s"
    );

    const args = [
      "--yes-playlist",
      "-f",
      "bestaudio",
      "--extract-audio",
      "--audio-format",
      "mp3",
      "--audio-quality",
      "0",
      "--no-part",
      "--no-cache-dir",
      "-N",
      "8",
      "-o",
      outputPattern,
      "--ffmpeg-location",
      ffmpegPath,
      url,
    ];

    console.log("💾 Saving to:", outputPattern);

    execFile(ytdlpPath, args, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ yt-dlp error:", stderr);
        return res
          .status(500)
          .json({ error: "Playlist download failed", stderr });
      }

      console.log("✅ Playlist MP3 download complete");
      res.json({
        success: true,
        folder: playlistFolder,
        message: "Playlist downloaded as MP3",
      });
    });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

// 🚀 Hello World route
app.get("/", (req, res) => {
  res.send("Hello, world! YouTube Downloader backend is running.");
});

// 🧠 Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
