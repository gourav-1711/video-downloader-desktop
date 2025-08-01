
import { Minus, Square, X } from "lucide-react"

export function SiteHeader() {
  const ipc = window.electron?.ipcRenderer

  const handleMinimize = () => ipc?.send("minimize")
  const handleMaximize = () => ipc?.send("maximize")
  const handleClose = () => ipc?.send("close")

  return (
    <header
      className="bg-background sticky top-0 z-50 flex w-full items-center border-b"
      style={{ WebkitAppRegion: "drag" }}
    >
      <div className="flex h-[--header-height] w-full items-center gap-2 px-4 justify-between">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-4">
          EveryThing Downloader
        </div>

        {/* Right: Search + Window Controls */}
        <div
          className="flex items-center gap-2"
          style={{ WebkitAppRegion: "no-drag" }}
        >
         
          <div className="flex gap-3 ml-2">
            <button onClick={handleMinimize} className="p-1 rounded hover:bg-muted">
              <Minus size={16} />
            </button>
            <button onClick={handleMaximize} className="p-1 rounded hover:bg-muted">
              <Square size={16} />
            </button>
            <button onClick={handleClose} className="p-1 rounded hover:bg-red-500 hover:text-white">
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
