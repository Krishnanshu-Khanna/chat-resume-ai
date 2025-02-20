"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserId, getChatDetails } from "./action";

import PdfView from "./_components/PDFView";
import Chat from "./_components/Chat";

export default function ChatToPDF() {
  const { chatId } = useParams() as { chatId: string };

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const userId = await getUserId();
        if (!userId) throw new Error("User not found");

        const res = await getChatDetails(chatId);
        if (!res) throw new Error("Chat not found");

        setPdfUrl(res.pdfUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [chatId]); // Ensure chatId updates trigger a re-fetch

  if (loading)
    return (
      <div className="flex h-full items-center justify-center">Loading...</div>
    );
  if (error)
    return (
      <div className="flex h-full items-center justify-center text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div className="grid lg:max-h-screen overflow-hidden lg:grid-cols-5">
      {/* Left (PDF Viewer) */}
      <div className="col-span-5 overflow-auto border-r-2 bg-gray-100 dark:bg-gray-950 lg:col-span-3 lg:border-purple-600">
        <PdfView url={pdfUrl || ""} />
      </div>

      {/* Right (Chat) */}
      <div className="col-span-5 overflow-auto lg:col-span-2">
        <Chat chatId={chatId} />
      </div>
    </div>
  );
}
