// components/CustomTitleBar.tsx
import { Minus, Square, X } from "lucide-react";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import lightLogo from "./assets/lightLogo.png";
import darkLogo from "./assets/darklog.png";

export default function AppFrame() {
  const ipc = window.electron?.ipcRenderer;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMinimize = () => ipc?.send("minimize");
  const handleMaximize = () => ipc?.send("maximize");
  const handleClose = () => ipc?.send("close");

  const logoSrc = mounted && resolvedTheme === "dark" ? lightLogo : darkLogo;

  return (
    <div
      className="flex items-center justify-between px-4 py-2 bg-background border-b select-none"
      style={{ WebkitAppRegion: "drag" }} // This makes it draggable
    >
      <div className="text-md font-bold text-foreground">
        {" "}
        <img src={logoSrc} alt="App Logo" className="h-6 rounded-xl" />
      </div>
      <div
        className="flex items-center gap-2"
        style={{ WebkitAppRegion: "no-drag" }} // So buttons stay clickable
      >
        <button onClick={handleMinimize} className="hover:bg-muted p-1 rounded">
          <Minus size={16} />
        </button>
        <button onClick={handleMaximize} className="hover:bg-muted p-1 rounded">
          <Square size={16} />
        </button>
        <button
          onClick={handleClose}
          className="hover:bg-red-500 hover:text-white p-1 rounded"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
