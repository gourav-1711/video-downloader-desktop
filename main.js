const { app, BrowserWindow } = require("electron");
const { ipcMain } = require("electron/main");
const path = require("path");
const isDev = !app.isPackaged;

var win ;

function createWindow() {
   win = new BrowserWindow({

    // fullscreen: true,
    width: 800,
    height: 700,
    frame: false,
    titleBarStyle: "hidden",
     icon: path.join(__dirname, 'icons', 'logo.ico'),
     autoHideMenuBar: true,
     resizable: false,
     maximizable: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload : path.join(__dirname,"preload.js")
      // menuBarVisible: false,
    },
  });
  if (isDev) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "frontend/dist/index.html"));
  }
}


app.whenReady().then(() => {
  require("./backend/server");
  createWindow();
});

ipcMain.on("minimize", () => win.minimize())
ipcMain.on("maximize", () => {
  if (win.isMaximized()) {
    win.unmaximize()
  } else {
    win.maximize()
  }
})
ipcMain.on("close", () => win.close())