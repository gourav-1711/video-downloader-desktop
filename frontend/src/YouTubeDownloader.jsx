"use client";
import React, { useState } from "react";
import Header from "./Header";
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
import { Download, Music, Video, Search, Loader2 } from "lucide-react";
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

  const [audioLoading, setAudioLoading] = useState(false);
  const [highestLoading, setHighestLoading] = useState(false);
  const [FullVideoLoading, setFullVideoLoading] = useState(false);

  const [bestLoading, setBestLoading] = useState(false);
  const [fastestLoading, setFastestLoading] = useState(false);

  const [playlistLoading, setPlaylistLoading] = useState(false);

  const [alertOpen, setAlertOpen] = useState(false);

  const [invalidUrl, setInvalidUrl] = useState(false);

  const [urlLoading , setUrlLoading] = useState(false);

  const url = "http://localhost:3000";

  const downloadAudio = () => {
    setAudioLoading(true);
    axios
      .post(url + "/download/audio", { url: ytUrl })
      .then(() => {
        toast.success("Audio Downloaded");
      })
      .catch(() => {
        toast.error("Audio Failed");
      })
      .finally(() => setAudioLoading(false));
  };

  const downloadHighestQuality = () => {
    setHighestLoading(true);
    axios
      .post(url + "/download/video-only", { url: ytUrl })
      .then(() => {
        toast.success("Video-only Downloaded");
      })
      .catch(() => {
        toast.error("Video-only Failed");
      })
      .finally(() => setHighestLoading(false));
  };

  const downloadBestQuality = () => {
    setBestLoading(true);
    axios
      .post(url + "/download/merged", { url: ytUrl })
      .then(() => {
        toast.success("Best Quality Downloaded");
      })
      .catch(() => {
        toast.error("Best Quality Failed");
      })
      .finally(() => setBestLoading(false));
  };

  const downloadFastest = () => {
    setFastestLoading(true);
    axios
      .post(url + "/download/fast", { url: ytUrl })
      .then(() => {
        toast.success("Fastest Download Done");
      })
      .catch(() => {
        toast.error("Fastest Failed");
      })
      .finally(() => setFastestLoading(false));
  };

  const downloadFullVideo = () => {
    setFullVideoLoading(true);
    axios
      .post(url + "/download/video", { url: ytUrl })
      .then(() => {
        toast.success("Full Quality Download Done");
      })
      .catch(() => {
        toast.error("Download Failed");
      })
      .finally(() => setFullVideoLoading(false));
  };
  const downloadPlaylist = () => {
    setPlaylistLoading(true);
    toast("Started Downloading Playlist");
    axios
      .post(url + "/download/playlist", { url: ytUrl })
      .then(() => {
        toast.success("PlayList Downloaded");
      })
      .catch(() => {
        toast.error("Download Failed");
      })
      .finally(() => setPlaylistLoading(false));
  };
  const getTittle = () => {
    axios
      .post(url + "/get-title", { url: ytUrl })
      .then((res) => {
        toast.success(`Tittle: ${res.data.title}`);
      })
      .catch(() => {
        toast.error("Get Tittle Failed");
      });
  };

  const getPreview = () => {
    setPreviewLoading(true);
    axios
      .post(url + "/get-preview", { url: ytUrl })
      .then((res) => {
        toast.success(`Preview Found`);
        setPreviewUrl(res.data.previewUrl);
        setPreviewLoading(false);
      })
      .catch(() => {
        toast.error(" Preview Not Found");
        setPreviewLoading(false);
      });
  };

  const checkUrl = () => {
    setUrlLoading(true);
    axios
      .post(url + "/validate", { url: ytUrl })
      .then((res) => {
        setInvalidUrl(false);
        setUrlLoading(false);
        setDownloadReady(true)
      })
      .catch((err) => {
        setInvalidUrl(true);
        setUrlLoading(false);
        setDownloadReady(false)

      });
  }

  const DownloadReadyFunc = () => {
    if (ytUrl === "") {
      setAlertOpen(!alertOpen);
      return;
    } else {
      checkUrl();
      // setDownloadReady(true);
      getTittle();
      getPreview();
    }
  };

  const renderButton = (isLoading, onClick) =>
    isLoading ? (
      <Button disabled className="flex items-center gap-2 bg-gray-800">
        <Loader2 className="w-4 h-4 animate-spin" />
        Downloading
      </Button>
    ) : (
      <Button onClick={onClick} className="flex items-center gap-2">
        <Download className="w-4 h-4" />
        Download
      </Button>
    );

  return (
    <>
      <div className="w-full max-w-4xl mx-auto px-5  space-y-6 h-screen overflow-y-scroll pb-20">
        <Toaster richColors={true} position="top-right" />
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">EveryThing Downloader</h1>
          <p className="text-muted-foreground">Files Will be Saved In Your PC in A Folder Named Your-Downloads In  Download</p>
          <p className="text-muted-foreground">
            Speed Completly Depends On Your Internet
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Enter YouTube URL
            </CardTitle>
            <CardDescription>Paste a video URL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            {!DownloadReady && (
              <div className="text-center border p-5">
                Insert URL To Preview
              </div>
            )}
            {DownloadReady &&
              (previewLoading ? (
                
                <SkeletonCard/>
              ) : ( !invalidUrl &&
                <video src={previewUrl} controls className={` ${invalidUrl ? "hidden" : "block"} w-full`}></video>
              ))}
          </CardContent>
        </Card>

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
                {renderButton(audioLoading, downloadAudio)}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge> Audio Yes</Badge>
                  <p className="font-medium">Highest Quality (Video )</p>
                </div>
                {renderButton(FullVideoLoading, downloadFullVideo)}
              </div>

              {/* HIGHEST QUALITY VIDEO (NO AUDIO) */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge>No Audio</Badge>
                  <p className="font-medium">Highest Quality (Video Only)</p>
                </div>
                {renderButton(highestLoading, downloadHighestQuality)}
              </div>

              {/* BEST MERGED QUALITY */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge>Audio Yes</Badge>
                  <p className="font-medium">Best Quality (Merged)</p>
                </div>
                {renderButton(bestLoading, downloadBestQuality)}
              </div>

              {/* FASTEST DOWNLOAD */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge>Fast</Badge>
                  <p className="font-medium">Fastest (Low Quality)</p>
                </div>
                {renderButton(fastestLoading, downloadFastest)}
              </div>

              {/* playlist download */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge>Audio</Badge>
                  <p className="font-medium">Playlist Download</p>
                </div>
                {renderButton(playlistLoading, downloadPlaylist)}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
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
      <Skeleton className="h-[125px] w-full rounded-xl bg-gray-400" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full bg-gray-400" />
        <Skeleton className="h-4 w-full bg-gray-400" />
      </div>
    </div>
  )
}
