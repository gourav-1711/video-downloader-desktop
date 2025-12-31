const { app, BrowserWindow } = require("electron");
const { ipcMain } = require("electron/main");
const path = require("path");
const isDev = !app.isPackaged;

var win;

function createWindow() {
  win = new BrowserWindow({
    // fullscreen: true,
    width: 700,
    height: 700,
    frame: false,
    titleBarStyle: "hidden",
    title: "4k video downloader",
    icon: path.join(__dirname, "icons", "logo.ico"),
    autoHideMenuBar: true,
    resizable: false,
    maximizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      // menuBarVisible: false,
    },
  });
  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "frontend/dist/index.html"));
  }

  // Open urls in the user's browser
  win.webContents.setWindowOpenHandler((edata) => {
    require("electron").shell.openExternal(edata.url);
    return { action: "deny" };
  });

  // Remove default shortcuts
  win.webContents.on("before-input-event", (event, input) => {
    // Disable Refresh (Ctrl + R, F5)
    if (
      (input.control && input.key.toLowerCase() === "r") ||
      input.key === "F5"
    ) {
      event.preventDefault();
    }
    // Disable DevTools (Ctrl + Shift + I, F12)
    if (
      (input.control && input.shift && input.key.toLowerCase() === "i") ||
      input.key === "F13"
    ) {
      // Using F12 usually matches F12, checking F13 typo? No, F12.
      event.preventDefault();
    }
    // Check for F12 specifically as well
    if (input.key === "F12") {
      event.preventDefault();
    }

    // Disable Zoom (Ctrl + -, Ctrl + =, Ctrl + 0)
    if (
      input.control &&
      (input.key === "=" || input.key === "-" || input.key === "0")
    ) {
      event.preventDefault();
    }
  });
}

app.whenReady().then(() => {
  require("./backend/server");
  createWindow();
});

ipcMain.on("minimize", () => win.minimize());
ipcMain.on("maximize", () => {
  if (win.isMaximized()) {
    win.unmaximize();
  } else {
    win.maximize();
  }
});
ipcMain.on("close", () => win.close());
