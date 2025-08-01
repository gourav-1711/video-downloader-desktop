# 🎬 YouTube Downloader Desktop App

A feature-packed, cross-platform desktop app to download YouTube videos and audio using `yt-dlp` and `ffmpeg`, built with Electron, Express.js, and React (Vite).


## 📁 Folder Structure


yt-downloader-desktop/
│
├── frontend/   # React + Vite frontend
├── backend/    # Express + yt-dlp server
└── main.js     # Electron entry point

1. 🔧 Install Dependencies
Install Node packages in both frontend/ and backend/ folders:

bash
Copy
Edit
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
2. 📦 Add yt-dlp and ffmpeg Binaries
This project uses yt-dlp and ffmpeg binaries to handle YouTube video/audio downloads.

📁 Folder Structure Required:
bash
Copy
Edit
backend/
└── bin/
    └── win/
        ├── yt-dlp.exe
        └── ffmpeg.exe
⚠️ These binaries are not included in the repo. You must download them manually.

🔗 Download Links
yt-dlp (Windows):
https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe

ffmpeg (Windows):
https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip
↳ After downloading, extract and copy ffmpeg.exe from the bin/ folder inside the zip.

Put both .exe files in:

bash
Copy
Edit
backend/bin/win/
🚀 Running & Building the App
▶️ Run in Dev Mode
bash
Copy
Edit
npm run dev
This will:

Start the backend

Start the frontend

Launch the Electron app in development mode

🏗️ Build Desktop Installer (.exe / Setup)
bash
Copy
Edit
npm run build
This will:

Build the frontend

Package the Electron app

Create a Windows installer .exe file

🙌 Contribution & Notes
Git is set up to ignore node_modules, binaries, and platform-specific build files.

This version is optimized for Windows.

Cross-platform support (Linux/Mac) may need extra work on binary paths.

📜 License
MIT – use it, remix it, just don’t resell it as-is.

💬 Credits
Built with ❤️ using:

yt-dlp

ffmpeg

Electron

React + Vite

Node.js + Express

yaml
Copy
Edit

