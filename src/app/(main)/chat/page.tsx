"use client";

import usePremiumModal from "@/hooks/usePremiumModal";
import { canChat } from "@/lib/permissions";
import { useAuth } from "@clerk/nextjs";
import { BotMessageSquare, Plus, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useSubscriptionLevel } from "../SubscriptionLevelProvider";
import AddNewPDF from "./_components/AddNewPDF";
import ChatList from "./_components/ChatList";
import { getUserDetails } from "./action";


export default function Page() {
  const subscriptionLevel = useSubscriptionLevel();
  const premiumModal = usePremiumModal();
  const { userId } = useAuth();
  const [uploadSection,setUploadSection]=useState(false);
  const [userDetails, setUserDetails] = useState<{
    email: string | null;
    firstName: string | null;
  }>({
    email: null,
    firstName: null,
  });
  useEffect(() => {
    async function fetchUserDetails() {
      if (!userId) return;
      try {
        const details = await getUserDetails();
        setUserDetails(details);
      } catch (error) {
        console.error("Error fetching user details:", error);
        toast.error("Failed to load user details");
      }
    }

    fetchUserDetails();
  }, [userId]);

  return (
    <div className="container mx-auto max-w-6xl px-6 py-12">
      {/* 🔹 Header Section */}
      <div className="flex flex-col items-center text-center">
        <BotMessageSquare
          size={72}
          className="text-indigo-500 drop-shadow-lg"
        />

        <h2 className="text-black-500 mt-3 text-4xl font-extrabold tracking-wide dark:text-gray-100">
          <span className="font-bold">Welcome,</span>{" "}
          <strong className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
            {userDetails.firstName || "Interviewer"}
          </strong>
          👋
        </h2>
      </div>

      {/* ⚡ Create AI Chat Section */}

      {canChat(subscriptionLevel) ? (
        <div className="mt-14 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 shadow-2xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <h2 className="flex items-center gap-3 text-3xl font-bold text-white">
              <Zap size={32} className="text-yellow-400" />
              Chat with AI
            </h2>
            <button
              className="flex items-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition-transform duration-300 ease-in-out hover:scale-110 hover:shadow-2xl"
              onClick={() => setUploadSection(true)}
            >
              <Plus size={24} className="mr-2" />
              New Chat
            </button>
          </div>

          {/* Add New Chat Component */}
          {uploadSection && (
            <div className="mt-8">
              <AddNewPDF onUploadSuccess={() => setUploadSection(false)} />
            </div>
          )}
        </div> // ← Missing closing div added here
      ) : (
        <div className="mt-14 rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 p-8 shadow-2xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <h2 className="flex items-center gap-3 text-3xl font-bold text-white">
              <Zap size={32} className="text-yellow-400" />
              Chat with AI
            </h2>
            <button
              onClick={() => premiumModal.setOpen(true)}
              className="flex items-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-8 py-3 text-lg font-bold text-white shadow-lg transition-transform duration-300 ease-in-out hover:scale-110 hover:shadow-2xl"
            >
              <Plus size={24} className="mr-2" />
              New Chat
            </button>
          </div>
        </div>
      )}

      {/* 🔹 Chat History Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold text-white">AI Chat History</h2>
        <div className="mt-6">
          <ChatList />
        </div>
      </div>
    </div>
  );
}
