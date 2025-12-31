import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

const DownloadContext = createContext();

export const useDownload = () => useContext(DownloadContext);

export const DownloadProvider = ({ children }) => {
  const [downloads, setDownloads] = useState([]);
  const url = "http://localhost:3000";

  const startDownload = async (videoUrl, type) => {
    try {
      const res = await axios.post(`${url}/api/new-download/start`, {
        url: videoUrl,
        type,
      });

      if (res.data.success) {
        const newDownload = {
          id: res.data.downloadId,
          url: videoUrl,
          type,
          progress: {
            percent: 0,
            speed: "0KiB/s",
            eta: "00:00",
            status: "starting",
          },
          createdAt: new Date(),
        };

        setDownloads((prev) => [newDownload, ...prev]);
        toast.success("Download started");
        trackProgress(newDownload.id);
      }
    } catch (error) {
      console.error("Download start error:", error);
      toast.error("Failed to start download");
    }
  };

  const trackProgress = (id) => {
    const eventSource = new EventSource(
      `${url}/api/new-download/progress/${id}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      setDownloads((prev) =>
        prev.map((d) => (d.id === id ? { ...d, progress: data } : d))
      );

      if (data.status === "completed" || data.status === "failed") {
        eventSource.close();
        if (data.status === "completed") toast.success("Download completed!");
        if (data.status === "failed") toast.error("Download failed!");
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };
  };

  const cancelDownload = async (id) => {
    try {
      await axios.post(`${url}/api/new-download/cancel`, { id });
      setDownloads((prev) => prev.filter((d) => d.id !== id));
      toast.info("Download cancelled");
    } catch (error) {
      console.error("Cancel error", error);
    }
  };

  return (
    <DownloadContext.Provider
      value={{ downloads, startDownload, cancelDownload }}
    >
      {children}
    </DownloadContext.Provider>
  );
};
