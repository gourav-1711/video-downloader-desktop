import React, { useState } from "react";
import "./App.css";
import YouTubeDownloader from "./YouTubeDownloader.jsx";
import AppFrame from "./AppFrame";
import DownloadMenu from "./lib/DownloadMenu";
import { ModeToggle } from "./components/mode-toggle";
import { DownloadProvider } from "./context/DownloadContext";
import { Home, Download } from "lucide-react";

function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <DownloadProvider>
      <div className="flex flex-col  bg-background text-foreground">
        <AppFrame />

        <div className="flex-1  relative pb-96">
          <div className={activeTab === "home" ? "block h-full" : "hidden"}>
            <YouTubeDownloader />
          </div>
          <div
            className={activeTab === "downloads" ? "block h-full" : "hidden"}
          >
            <DownloadMenu />
          </div>
        </div>

        {/* Bottom Tab Navigation */}
        <div className="fixed bottom-0 left-0 right-0 h-16 border-t bg-card/50 backdrop-blur-lg flex items-center justify-center gap-12 shrink-0 z-50 ">
          <button
            onClick={() => setActiveTab("home")}
            className={`relative flex flex-col items-center justify-center w-28 h-12 rounded-2xl transition-all duration-300 group ${
              activeTab === "home"
                ? "bg-primary/15 text-primary scale-105 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Home
              className={`w-5 h-5 mb-1 transition-transform duration-300 ${
                activeTab === "home"
                  ? "-translate-y-0.5"
                  : "group-hover:-translate-y-0.5"
              }`}
            />
            <span className="text-[10px] font-medium">Home</span>
            {activeTab === "home" && (
              <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full animate-pulse" />
            )}
          </button>

          {/* Separator */}
          <div className="h-8 w-px bg-border" />

          <button
            onClick={() => setActiveTab("downloads")}
            className={`relative flex flex-col items-center justify-center w-28 h-12 rounded-2xl transition-all duration-300 group ${
              activeTab === "downloads"
                ? "bg-primary/15 text-primary scale-105 shadow-sm"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Download
              className={`w-5 h-5 mb-1 transition-transform duration-300 ${
                activeTab === "downloads"
                  ? "-translate-y-0.5"
                  : "group-hover:-translate-y-0.5"
              }`}
            />
            <span className="text-[10px] font-medium">Downloading</span>
            {activeTab === "downloads" && (
              <span className="absolute bottom-1 w-1 h-1 bg-primary rounded-full animate-pulse" />
            )}
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="fixed bottom-20 right-5 z-50">
          <ModeToggle />
        </div>
      </div>
    </DownloadProvider>
  );
}

export default App;
