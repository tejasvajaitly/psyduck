"use client";

import type { PutBlobResult } from "@vercel/blob";
import { useState } from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AnalysisStepper } from "./stepper";
import { toast } from "sonner";
import { CheckIcon } from "lucide-react";

export default function AvatarUploadPage() {
  const [blob, setBlob] = useState<PutBlobResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    setIsUploading(true);
    try {
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: "POST",
        body: file,
      });
      const newBlob = (await response.json()) as PutBlobResult;
      setBlob(newBlob);
      toast.success("File uploaded successfully!");
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleExtract = async () => {
    if (!blob?.url) {
      alert("Please upload a file first");
      return;
    }

    setIsLoading(true);
    setProgress("");
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/extract?fileUrl=" + blob.url);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Failed to start extraction");
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));

            if (data.type === "progress") {
              setProgress(data.message);
            } else if (data.type === "complete") {
              setResult(data.data);
              setIsLoading(false);
              toast.success("Analysis completed successfully!");
            } else if (data.type === "error") {
              setError(data.message);
              setIsLoading(false);
              toast.error(data.message);
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsLoading(false);
      toast.error(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div>
      <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-background border-neutral-200 dark:border-neutral-800 rounded-lg">
        <FileUpload onChange={handleFileUpload} />
        {isUploading && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Spinner />
            <span className="text-sm text-gray-600">Uploading file...</span>
          </div>
        )}

        {blob && (
          <div className="flex items-center justify-center mt-4 cursor-default">
            <div className="group relative flex items-center gap-2">
              <CheckIcon className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-gray-600">
                File uploaded successfully
              </span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                {blob.url}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center mt-4 space-y-4">
        <Button
          className="cursor-pointer"
          onClick={handleExtract}
          disabled={isLoading || !blob?.url}
        >
          Extract Data
        </Button>

        {isLoading && progress && (
          <div className="text-sm text-gray-600">{progress}</div>
        )}

        {error && <div className="text-sm text-red-600">Error: {error}</div>}

        {result && (
          <Link href={`/runs/${result.id}`}>
            <Button>View Run</Button>
          </Link>
        )}
        {isLoading && <AnalysisStepper currentProgress={progress} />}
      </div>
    </div>
  );
}
