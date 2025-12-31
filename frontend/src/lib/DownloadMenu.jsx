import React from "react";
import { useDownload } from "../context/DownloadContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  X,
  FileVideo,
  FileAudio,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

export default function DownloadMenu() {
  const { downloads, cancelDownload } = useDownload();

  const getIcon = (type) => {
    if (type === "audio")
      return <FileAudio className="w-5 h-5 text-blue-500" />;
    return <FileVideo className="w-5 h-5 text-purple-500" />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "text-green-500";
      case "failed":
        return "text-red-500";
      case "downloading":
        return "text-blue-500";
      default:
        return "text-muted-foreground";
    }
  };
  console.log(downloads);
  
  return (
    <div className="w-full max-w-4xl mx-auto px-5 space-y-6 pb-36 h-screen overflow-y-scroll  pt-6">
      <h1 className="text-3xl font-bold text-center mb-6">Downloads</h1>

      {downloads.length === 0 ? (
        <div className="text-center text-muted-foreground mt-10">
          No active downloads.
        </div>
      ) : (
        <div className="space-y-4">
          {downloads.map((download) => (
            <Card key={download.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {getIcon(download.type)}
                    <div className="truncate">
                      <p
                        className="font-medium truncate max-w-[200px] sm:max-w-md"
                        title={download.url}
                      >
                        {download.url}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {download.type}
                      </p>
                    </div>
                  </div>
                  {download.progress.status === "downloading" ||
                  download.progress.status === "starting" ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => cancelDownload(download.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  ) : download.progress.status === "completed" ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span
                      className={`font-medium capitalize ${getStatusColor(
                        download.progress.status
                      )}`}
                    >
                      {download.progress.status}
                    </span>
                    <span>{download.progress.percent}%</span>
                  </div>

                  <Progress value={download.progress.percent} className="h-2" />

                  {(download.progress.status === "downloading" ||
                    download.progress.status === "starting" ||
                    download.progress.status === "preparing") && (
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex justify-between text-xs text-muted-foreground w-full">
                        <span>{download.progress.speed}</span>
                        <span>ETA: {download.progress.eta}</span>
                      </div>
                      {/* Detailed status like "Downloading video 1 of 5" */}
                      {download.progress.detail && (
                        <div className="text-xs text-blue-500 font-medium">
                          {download.progress.detail}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
