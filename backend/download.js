const express = require("express");
const { spawn } = require("child_process");
const { randomUUID } = require("crypto");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Store active downloads: { id: { process, res (SSE response), progress: {} } }
const activeDownloads = new Map();

module.exports = (ytdlpPath, ffmpegPath, downloadsPath) => {
  // Helper to parse yt-dlp progress output
  const parseProgress = (data) => {
    const str = data.toString();

    // Extract percentage
    const percentMatch = str.match(/(\d+\.\d+)%/);
    const percent = percentMatch ? parseFloat(percentMatch[1]) : null;

    // Extract speed
    const speedMatch = str.match(/at\s+([~\d.]+\w+\/s)/);
    const speed = speedMatch ? speedMatch[1] : null;

    // Extract ETA
    const etaMatch = str.match(/ETA\s+([\d:]+)/);
    const eta = etaMatch ? etaMatch[1] : null;

    // Extract size
    const sizeMatch = str.match(/of\s+([~\d.]+\w+)/);
    const totalSize = sizeMatch ? sizeMatch[1] : null;

    // Extract Playlist Index
    // Standard Output: [download] Downloading video 3 of 5
    // OR: [download] Downloading item 3 of 5
    const playlistMatch = str.match(
      /Downloading (?:video|item) (\d+) of (\d+)/
    );
    const playlistDetail = playlistMatch
      ? `Downloading video ${playlistMatch[1]} of ${playlistMatch[2]}`
      : null;

    if (percent !== null || playlistDetail) {
      return {
        percent: percent || 0, // Keep existing percent if line only has playlist info
        speed,
        eta,
        totalSize,
        detail: playlistDetail,
      };
    }
    return null;
  };

  // Helper to get playlist name (moved from server.js)
  const getPlaylistName = (url) => {
    return new Promise((resolve, reject) => {
      const { execFile } = require("child_process");
      execFile(
        ytdlpPath,
        ["--print", "%(playlist_title)s", "--playlist-items", "1", url],
        (err, stdout, stderr) => {
          if (err) {
            console.error("🛑 Failed to get playlist title:", stderr);
            return resolve(`Playlist_${Date.now()}`); // Fallback
          }
          const firstLine = stdout.split("\n")[0].trim();
          const sanitizedTitle = firstLine.replace(
            /[<>:"/\\|?*\x00-\x1F]/g,
            ""
          );
          const time = Date.now();
          const fallbackName = `Untitled Playlist_${time}`;
          resolve(sanitizedTitle || fallbackName);
        }
      );
    });
  };

  // Start Download Endpoint
  router.post("/start", async (req, res) => {
    const { url, type } = req.body;

    if (!url) return res.status(400).json({ error: "No URL provided" });

    const downloadId = randomUUID();

    // Initial active download state
    activeDownloads.set(downloadId, {
      process: null, // Process will be attached later if async
      clients: [],
      progress: {
        percent: 0,
        speed: "0KiB/s",
        eta: "00:00",
        status: "starting",
        detail: "",
      },
    });

    // Respond immediately to UI
    res.json({ success: true, downloadId });

    // BACKGROUND PROCESSING
    (async () => {
      let args = [];
      let outputTemplate = "";

      try {
        switch (type) {
          case "playlist":
            // This can take 5-6 seconds, so we do it in background now
            broadcastProgress(downloadId, {
              status: "preparing",
              detail: "Fetching playlist info...",
            });
            const playlistTitle = await getPlaylistName(url);
            const playlistFolder = path.join(downloadsPath, playlistTitle);

            if (!fs.existsSync(playlistFolder)) {
              fs.mkdirSync(playlistFolder, { recursive: true });
            }

            outputTemplate = path.join(
              playlistFolder,
              "%(playlist_index)s - %(title)s.%(ext)s"
            );
            args = [
              "-f",
              "bestaudio/best",
              "-x",
              "--audio-format",
              "mp3",
              "--extractor-retries",
              "3",
              "--ignore-errors",
              "--yes-playlist",
              "--no-warnings",
              "--no-part",
              "--no-cache-dir",
              "--ffmpeg-location",
              ffmpegPath,
              "-o",
              outputTemplate,
              url,
            ];
            break;

          case "playlistVideo":
            broadcastProgress(downloadId, {
              status: "preparing",
              detail: "Fetching playlist info...",
            });
            const playlistVideoTitle = await getPlaylistName(url);
            const playlistVideoFolder = path.join(
              downloadsPath,
              playlistVideoTitle
            );

            if (!fs.existsSync(playlistVideoFolder)) {
              fs.mkdirSync(playlistVideoFolder, { recursive: true });
            }

            outputTemplate = path.join(
              playlistVideoFolder,
              "%(playlist_index)s - %(title)s.%(ext)s"
            );
            args = [
              "-f",
              "bestvideo+bestaudio/best",
              "-N",
              "8",
              "--no-part",
              "--no-cache-dir",
              "-N",
              "8",
              "-o",
              outputTemplate,
              "--merge-output-format",
              "mp4",
              "--ffmpeg-location",
              ffmpegPath,
              url,
            ];
            break;
          case "audio":
            outputTemplate = path.join(downloadsPath, "%(title)s.%(ext)s");
            args = [
              "-f",
              "bestaudio",
              "-x",
              "--audio-format",
              "mp3",
              "-o",
              outputTemplate,
              "--ffmpeg-location",
              ffmpegPath,
              url,
            ];
            break;
          case "video-only":
            outputTemplate = path.join(
              downloadsPath,
              "%(title)s_video_only.%(ext)s"
            );
            args = [
              "-f",
              "bestvideo",
              "--no-part",
              "--no-cache-dir",
              "-N",
              "8",
              "-o",
              outputTemplate,
              url,
            ];
            break;
          case "merged":
            outputTemplate = path.join(
              downloadsPath,
              "%(title)s_medium.%(ext)s"
            );
            args = [
              "-f",
              "bestvideo[height<=720]+bestaudio/best[height<=720]/best",
              "--merge-output-format",
              "mp4",
              "--no-part",
              "--no-cache-dir",
              "-N",
              "8",
              "--ffmpeg-location",
              ffmpegPath,
              "-o",
              outputTemplate,
              url,
            ];
            break;
          case "fast":
            outputTemplate = path.join(downloadsPath, "%(title)s_low.%(ext)s");
            args = [
              "-f",
              "bestvideo[height<=360]+bestaudio/best[height<=360]/best",
              "--merge-output-format",
              "mp4",
              "--no-part",
              "--no-cache-dir",
              "-N",
              "8",
              "--ffmpeg-location",
              ffmpegPath,
              "-o",
              outputTemplate,
              url,
            ];
            break;
          case "video":
          default:
            outputTemplate = path.join(
              downloadsPath,
              "%(title)s_video.%(ext)s"
            );
            args = [
              "-f",
              "bestvideo+bestaudio/best",
              "-N",
              "8",
              "--no-part",
              "--no-cache-dir",
              "-N",
              "8",
              "-o",
              outputTemplate,
              "--merge-output-format",
              "mp4",
              "--ffmpeg-location",
              ffmpegPath,
              url,
            ];
            break;
        }

        // Spawn logic
        const ytDlpProcess = spawn(ytdlpPath, args);

        // Update the active download with the real process
        const download = activeDownloads.get(downloadId);
        if (download) {
          download.process = ytDlpProcess;

          ytDlpProcess.stdout.on("data", (data) => {
            const progressData = parseProgress(data);
            if (progressData) {
              // If parseProgress returned a playlistDetail, persist it
              // Otherwise keep the old detail if new one is null
              const newDetail = progressData.detail || download.progress.detail;

              download.progress = {
                ...download.progress,
                ...progressData,
                detail: newDetail, // persistent detail
                status: "downloading",
              };
              broadcastProgress(downloadId, download.progress);
            }
          });

          ytDlpProcess.stderr.on("data", (data) => {
            console.error(`[${downloadId}] stderr: ${data}`);
          });

          ytDlpProcess.on("close", (code) => {
            const current = activeDownloads.get(downloadId);
            if (current) {
              const status = code === 0 ? "completed" : "failed";
              current.progress.status = status;
              if (status === "completed") {
                current.progress.percent = 100;
              }
              broadcastProgress(downloadId, current.progress);
              current.clients.forEach((c) => c.end());
              activeDownloads.delete(downloadId);
            }
          });
        }
      } catch (err) {
        console.error("Background start error:", err);
        const download = activeDownloads.get(downloadId);
        if (download) {
          download.progress.status = "failed";
          download.progress.detail = "Setup failed";
          broadcastProgress(downloadId, download.progress);
          download.clients.forEach((c) => c.end());
          activeDownloads.delete(downloadId);
        }
      }
    })();
  });

  // SSE Endpoint for Progress
  router.get("/progress/:id", (req, res) => {
    const { id } = req.params;
    const download = activeDownloads.get(id);

    if (!download) {
      return res.status(404).json({ error: "Download not found" });
    }

    // Set headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Add client to the list
    download.clients.push(res);

    // Send initial status
    res.write(`data: ${JSON.stringify(download.progress)}\n\n`);

    // Remove client on close
    req.on("close", () => {
      const currentDownload = activeDownloads.get(id);
      if (currentDownload) {
        currentDownload.clients = currentDownload.clients.filter(
          (c) => c !== res
        );
      }
    });
  });

  // Cancel Download Endpoint
  router.post("/cancel", (req, res) => {
    const { id } = req.body;
    const download = activeDownloads.get(id);

    if (download) {
      download.process.kill();
      activeDownloads.delete(id);
      res.json({ success: true, message: "Download cancelled" });
    } else {
      res.status(404).json({ error: "Download not found" });
    }
  });

  function broadcastProgress(id, data) {
    const download = activeDownloads.get(id);
    if (download && download.clients.length > 0) {
      const message = `data: ${JSON.stringify(data)}\n\n`;
      download.clients.forEach((client) => client.write(message));
    }
  }

  return router;
};
