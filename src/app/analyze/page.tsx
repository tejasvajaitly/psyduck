"use client";
import React from "react";
import { FileUpload } from "@/components/ui/file-upload";
import { Spinner } from "@/components/ui/spinner";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function UploadStatement() {
  const router = useRouter();
  const mutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });
      return response.json();
    },
    onSuccess: (data) => {
      router.push(`/runs/${data.id}`);
    },
  });

  const handleFileUpload = (files: File[]) => {
    const formData = new FormData();
    formData.append("pdfFile", files[0]);
    mutation.mutate(formData);
  };

  return (
    <div className="w-full max-w-4xl mx-auto min-h-96 border border-dashed bg-background border-neutral-200 dark:border-neutral-800 rounded-lg">
      <FileUpload onChange={handleFileUpload} />
      {mutation.isPending && (
        <div className="flex justify-center items-center h-full">
          <Spinner />
        </div>
      )}
    </div>
  );
}
