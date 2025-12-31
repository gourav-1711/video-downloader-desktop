# 4K Video Downloader

Thank you for purchasing the **4K Video Downloader**! This powerful application allows you to verify easily download videos and audio from YouTube and other supported platforms in high quality.

## 📦 Installation Instructions

The installation file is included directly in this folder.

1.  **Locate the Setup File**: Find the file named **`4k-video-downloader Setup 1.0.0.exe`** in this directory.
2.  **Run the Installer**: Double-click the file to start the installation process.
3.  **Follow Prompts**: Follow the on-screen instructions to complete the setup. The application will launch automatically once finished.

## 🚀 How to Use

1.  **Launch the App**: Open **4K Video Downloader** from your desktop shortcut or Start menu.
2.  **Copy a Link**: Go to YouTube (or another supported site) and copy the URL of the video or playlist you want to download.
3.  **Paste & Analyze**: Paste the link into the application's search bar. The app will automatically analyze the link.
4.  **Select Options**:
    - Choose your desired **Video Quality** (e.g., 1080p, 4K) or **Audio Only** (MP3).
    - Select download location if prompted.
5.  **Download**: Click the **Download** button. You can track progress in the "Downloads" tab.

## ✨ Key Features

- **High Quality**: Download videos up to 8K resolution.
- **Audio Extraction**: Save audio tracks directly as MP3.
- **Playlist Support**: Download full playlists with one click.
- **Fast Mode**: Optimized speeds for quick downloads.
- **Simple Interface**: Clean, easy-to-use design.

## 🆘 Support

If you encounter any issues during installation or usage, please verify your internet connection and ensure you have sufficient disk space. For further assistance, refer to the documentation or contact support.

---

_Developed with ❤️ for the best downloading experience._

<br>
<br>

---

## 🛠️ Developer Guide (Build from Source)

If you are a developer and want to modify or build the application from source, follow these steps.

### Prerequisites

- **Node.js**: v16 or higher.
- **Git**: For cloning the repository.

### 1. Setup



# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Development

Run the app in development mode (Backend + Frontend + Electron):

```bash
npm run dev
```

### 3. Build

To build the executable for your OS:

```bash
npm run build
```

The output file will be located in the `dist` folder.
