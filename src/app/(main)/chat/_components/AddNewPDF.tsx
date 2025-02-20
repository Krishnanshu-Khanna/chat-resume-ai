"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { File, Loader2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddNewPDF({
  onUploadSuccess,
}: {
  onUploadSuccess: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (
      selectedFile &&
      selectedFile.type === "application/pdf" &&
      selectedFile.size < 4000000
    ) {
      setFile(selectedFile);
    } else {
      toast({
        description: "Please upload a valid PDF file under 4MB.",
        variant: "destructive",
      });
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("pdf", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      toast({ description: "Upload successful!", variant: "default" });
      console.log(data);
      onUploadSuccess();
      router.push(`/chat/${data.chatId}`);
    } else {
      toast({
        description: data.error || "Upload failed.",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full max-w-lg rounded-lg p-6 shadow-md dark:bg-gray-900">
        <CardHeader>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Upload PDF
          </h1>
        </CardHeader>

        <CardContent>
          <label
            htmlFor="pdf-upload"
            className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-6 transition hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
          >
            <UploadCloud className="mb-2 h-12 w-12 text-gray-500 dark:text-gray-400" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Drag & drop or click to upload a PDF
            </p>
            <input
              id="pdf-upload"
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              className="hidden"
              multiple={false}
            />
          </label>

          {file && (
            <div className="mt-4 flex items-center space-x-3 rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
              <File className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {file.name}
              </span>
            </div>
          )}
          {loading ? (
            <div className="mt-4 flex items-center justify-center space-x-3 rounded-lg bg-gray-100 p-3 dark:bg-gray-700">
              <Loader2 className="animate-spin" />
              <span>Loading...</span>
            </div>
          ) : (
            <Button
              className="mt-4 w-full"
              disabled={!file}
              onClick={handleUpload}
            >
              Upload PDF
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
