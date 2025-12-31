"use client";
import React, { useState } from "react";
import { useDownload } from "./context/DownloadContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, Music, Video, Search, Loader2, Image } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Toaster } from "./components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "./components/ui/skeleton";

export default function HomeComponent() {
  const [ytUrl, setYtUrl] = useState("");
  const [DownloadReady, setDownloadReady] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  const [alertOpen, setAlertOpen] = useState(false);
  const [invalidUrl, setInvalidUrl] = useState(false);
  const [urlLoading, setUrlLoading] = useState(false);
  const [details, setDetails] = useState({});
  const [showThumbnail, setShowThumbnail] = useState(false);

  const { startDownload } = useDownload();
  const url = "http://localhost:3000";

  const downloadAudio = () => startDownload(ytUrl, "audio");
  const downloadHighestQuality = () => startDownload(ytUrl, "video-only");
  const downloadBestQuality = () => startDownload(ytUrl, "merged");
  const downloadFastest = () => startDownload(ytUrl, "video"); // Assuming 'video' maps to fast/default in backend logic or adjust as needed.

  const formatViews = (views) => {
    if (!views) return "N/A";
    if (views >= 1000000) return (views / 1000000).toFixed(1) + "M";
    if (views >= 1000) return (views / 1000).toFixed(1) + "K";
    return views.toString();
  };

  const formatDate = (dateStr) => {
    if (!dateStr || dateStr.length !== 8) return dateStr || "Unknown Date";
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return new Date(`${year}-${month}-${day}`).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const downloadFastestAction = () => {
    startDownload(ytUrl, "fast");
  };

  const downloadFullVideo = () => startDownload(ytUrl, "video");

  const downloadPlaylist = () => {
    startDownload(ytUrl, "playlist");
  };

  const downloadPlaylistVideo = () => {
    startDownload(ytUrl, "playlistVideo");
  };

  const getFileInfo = () => {
    setUrlLoading(true);
    setPreviewLoading(true);
    toast.info("Finding video info...");

    axios
      .post(url + "/get-video-info", { url: ytUrl })
      .then((res) => {
        const data = res.data;
        if (data.success) {
          console.log(data);

          setDetails(data);
          setPreviewUrl(data.previewUrl);
          setInvalidUrl(false);
          setDownloadReady(true);
          toast.success("Video Found!");
        }
      })
      .catch((err) => {
        console.error(err);
        setInvalidUrl(true);
        setDownloadReady(false);
        setDetails({});
        toast.error("Failed to fetch video info");
      })
      .finally(() => {
        setUrlLoading(false);
        setPreviewLoading(false);
      });
  };

  const DownloadReadyFunc = async () => {
    if (ytUrl === "") {
      setAlertOpen(!alertOpen);
      return;
    } else {
      if (checkError()) return;
      getFileInfo();
    }
  };

  const renderButton = (onClick, label) => (
    <Button onClick={onClick} className="flex items-center gap-2">
      <Download className="w-4 h-4" />
      {label}
    </Button>
  );

  const checkError = () => {
    try {
      new URL(ytUrl);
      return false;
    } catch (error) {
      setInvalidUrl(true);
      return true;
    }
  };

  return (
    <>
      <Toaster richColors={true} position="top-right" />
      <div className="w-full max-w-2xl mx-auto px-5  space-y-6 h-screen overflow-y-scroll pb-36">
        {/* header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">4k Video Downloader </h1>
          <p>
            Supported Sites And Sources :{" "}
            <a target="_blank" href="https://ytdl-org.github.io/youtube-dl/supportedsites.html">
              Check
            </a>
          </p>
        </div>

        {/*  left side input and preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Enter YouTube URL
            </CardTitle>
            <CardDescription>Paste a video URL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* input box */}
            <div className="flex gap-2">
              <Input
                type="text"
                value={ytUrl}
                onChange={(e) => setYtUrl(e.target.value)}
                placeholder="your_video_url"
                className="flex-1"
              />
              <Button onClick={DownloadReadyFunc}>Download</Button>
            </div>

            {/* preview space */}
            {!DownloadReady && (
              <div className="text-center border p-5">
                Insert URL To Preview
              </div>
            )}
            {DownloadReady &&
              (previewLoading ? (
                <SkeletonCard />
              ) : (
                !invalidUrl && (
                  <div className="w-full">
                    {previewUrl && !showThumbnail ? (
                      <div className="border rounded-xl p-4 space-y-3 bg-card/50 backdrop-blur-sm">
                        <div className="flex items-start gap-4">
                          <img
                            src={details?.thumbnail || ""}
                            alt="Thumbnail"
                            className="w-24 h-24 object-cover rounded-lg shadow-sm"
                          />
                          <div className="space-y-1 flex-1 min-w-0">
                            <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                              {details?.title || "Unknown Title"}
                            </h3>
                            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground mt-2">
                              {details?.uploader && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] h-5 px-1.5"
                                >
                                  {details.uploader}
                                </Badge>
                              )}
                              <Badge
                                variant="outline"
                                className="text-[10px] h-5 px-1.5"
                              >
                                {formatViews(details?.views)} Views
                              </Badge>
                              <span className="flex items-center">
                                {formatDate(details?.uploadDate)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-xs h-8 border border-dashed"
                          onClick={() => setShowThumbnail(true)}
                        >
                          <Image className="w-3 h-3 mr-2" />
                          Show Full Thumbnail
                        </Button>
                      </div>
                    ) : (
                      <div className="relative group">
                        <img
                          src={details?.thumbnail || previewUrl} // Fallback to previewUrl if thumbnail missing? Or just thumbnail
                          alt="Video Thumbnail"
                          className="w-full rounded-xl shadow-sm object-cover max-h-[300px]"
                        />
                        {previewUrl && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacit z-50"
                            onClick={() => setShowThumbnail(false)}
                          >
                            Show Details
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                )
              ))}
          </CardContent>
        </Card>

        {/* right side download option */}
        {DownloadReady && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Download Options
              </CardTitle>
              <CardDescription>Select and download below</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* AUDIO MP3 */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline">High</Badge>
                  <p className="font-medium">MP3 Audio</p>
                </div>
                {renderButton(downloadAudio, "Download Audio")}
              </div>

              {/* high quality video with audio */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge> Audio Yes</Badge>
                  <p className="font-medium">Highest Quality (Video )</p>
                </div>
                {renderButton(downloadFullVideo, "Download Video")}
              </div>

              {/* HIGHEST QUALITY VIDEO (NO AUDIO) */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge>No Audio</Badge>
                  <p className="font-medium">Highest Quality (Video Only)</p>
                </div>
                {renderButton(downloadHighestQuality, "Download Video Only")}
              </div>

              {/* BEST MERGED QUALITY */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge>Audio Yes</Badge>
                  <p className="font-medium">Best Quality (Medium)</p>
                </div>
                {renderButton(downloadBestQuality, "Download Merged")}
              </div>

              {/* FASTEST DOWNLOAD */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge>Fast</Badge>
                  <p className="font-medium">Fastest (Low Quality)</p>
                </div>
                {renderButton(downloadFastestAction, "Download Fast")}
              </div>

              {/* playlist download */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge>Audio</Badge>
                  <p className="font-medium">Playlist Download</p>
                </div>
                {/* Playlist still uses local state for now */}
                <Button onClick={downloadPlaylist}>Download Playlist</Button>
              </div>

              {/* playlist download with video */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge>Video</Badge>
                  <p className="font-medium">
                    Playlist Download (High Quality)
                  </p>
                </div>

                <Button onClick={downloadPlaylistVideo}>
                  Download Playlist{" "}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      {/* important dont change these  */}
      {/* invalid url */}
      <AlertDialog open={invalidUrl} setOpen={setInvalidUrl}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Invalid URL</AlertDialogTitle>
            <AlertDialogDescription>
              This URL Is Either Incorrect Or No Longer Supported
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setInvalidUrl(false)}>
              Okay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* empty url */}
      <AlertDialog open={alertOpen} setOpen={setAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Please Enter A URL</AlertDialogTitle>
            <AlertDialogDescription>
              You Haven't Entered A URL To Countinue
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlertOpen(false)}>
              Okay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* alert loading  */}
      <AlertDialog open={urlLoading} setOpen={setUrlLoading}>
        <AlertDialogContent className={"flex items-center justify-center"}>
          <Loader2 className="size-10 animate-spin" />
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export function SkeletonCard() {
  return (
    <div className="flex flex-col space-y-3">
      <Skeleton className="h-[125px] w-full rounded-xl bg-muted" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full bg-muted" />
        <Skeleton className="h-4 w-full bg-muted" />
      </div>
    </div>
  );
}
