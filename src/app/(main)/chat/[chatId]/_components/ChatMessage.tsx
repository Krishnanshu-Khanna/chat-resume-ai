"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { BotIcon, Loader2Icon } from "lucide-react";
import Markdown from "react-markdown";
import { Message } from "./Chat";

function ChatMessage({ message }: { message: Message }) {
  const isHuman = message.role === "human";
  const { user } = useUser();

  return (
    <div
      className={`flex w-full ${isHuman ? "justify-end" : "justify-start"} my-2`}
    >
      {/* Avatar */}
      {!isHuman && (
        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 shadow-md">
          <BotIcon className="h-6 w-6 text-white" />
        </div>
      )}

      {/* Chat Bubble */}
      <div
        className={`max-w-xs rounded-lg px-4 py-2 shadow-md sm:max-w-md md:max-w-lg lg:max-w-lg ${
          isHuman
            ? "rounded-br-none bg-purple-600 text-white"
            : "rounded-bl-none bg-gray-200 text-gray-900"
        }`}
      >
        {message.message === "Thinking..." ? (
          <div className="flex items-center justify-center">
            <Loader2Icon className="h-5 w-5 animate-spin text-white" />
          </div>
        ) : (
          <Markdown>{message.message}</Markdown>
        )}
      </div>

      {/* User Avatar */}
      {isHuman && user?.imageUrl && (
        <Image
          src={user.imageUrl}
          alt="User Avatar"
          width={40}
          height={40}
          className="ml-3 rounded-full shadow-md"
        />
      )}
    </div>
  );
}

export default ChatMessage;
