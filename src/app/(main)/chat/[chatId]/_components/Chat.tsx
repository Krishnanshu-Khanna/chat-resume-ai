"use client";

import { FormEvent, useEffect, useRef, useState, useTransition } from "react";
import { Loader2Icon } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { askQuestion, getChatHistory } from "../action";
import ChatMessage from "./ChatMessage";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSubscriptionLevel } from "@/app/(main)/SubscriptionLevelProvider";

export type Message = {
  chatId?: string;
  role: "human" | "ai";
  message: string;
  createdAt: Date;
};

export default function Chat({ chatId }: { chatId: string }) {
  const { user } = useUser();
  const { toast } = useToast();
  const  subscriptionLevel  = useSubscriptionLevel();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isPending, startTransition] = useTransition();
  const bottomOfChatRef = useRef<HTMLDivElement>(null);

  // Fetch messages once when the component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;

      try {
        const chat = await getChatHistory(chatId);

        if (chat && chat.length > 0) {
          setMessages(
            chat.map(({ role, message, createdAt }) => ({
              role: role as "human" | "ai",
              message,
              createdAt,
            })),
          );
        } else {
          console.warn("Chat history is empty or not found");
          setMessages([]); // Ensure state is always an array
        }
      } catch (error) {
        console.error("Error fetching chat history:", error);
      }
    };

    fetchMessages();
  }, [user, chatId,input]); // Removed `messages` from dependencies

  useEffect(() => {
    bottomOfChatRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const q = input;
    setInput("");

    // Optimistic UI update
    setMessages((prev) => [
      ...prev,
      { role: "human", message: q, createdAt: new Date() },
      { role: "ai", message: "Thinking...", createdAt: new Date() },
    ]);

    startTransition(async () => {
      const { success, message } = await askQuestion(chatId, q,subscriptionLevel);

      if (!success) {
        toast({
          variant: "destructive",
          title: "Error",
          description: message,
        });

        setMessages((prev) =>
          prev.slice(0, prev.length - 1).concat([
            {
              role: "ai",
              message: `Whoops... ${message}`,
              createdAt: new Date(),
            },
          ]),
        );
      } else {
        if(!message) return;
        // Update last AI response with actual answer
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "ai",
            message,
            createdAt: new Date(),
          };
          return updated;
        });
      }
    });
  };

  return (
    <div className="relative flex h-screen w-full flex-col border-l bg-purple-50 dark:bg-gray-800">
      {/* Chat Messages Section */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <ChatMessage
            key={"placeholder"}
            message={{
              role: "ai",
              message: "Ask me anything about the document!",
              createdAt: new Date(),
            }}
          />
        ) : (
          messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))
        )}
        <div ref={bottomOfChatRef} />
      </div>
      {/* ✅ Predefined Menu */}
      <div className="flex flex-col gap-2 overflow-x-hidden bg-gray-100 px-4 py-2 dark:bg-gray-900 sm:flex-row">
        {[
          {
            label: "Detailed Explanation",
            prompt:
              "Provide a comprehensive and in-depth explanation of the given content.",
          },
          {
            label: "Concise Summary",
            prompt: "Summarize the content briefly while retaining key points.",
          },
          {
            label: "Simplified Explanation",
            prompt:
              "Rephrase this in clear, simple, and easy-to-understand language.",
          },
        ].map(({ label, prompt }) => (
          <button
            key={label}
            onClick={() => setInput(prompt)}
            className="whitespace-nowrap rounded-lg bg-purple-500 px-3 py-1 text-white transition hover:bg-purple-600"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chat Input */}
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 flex items-center gap-3 border-t bg-white p-4 shadow-lg dark:bg-gray-900"
      >
        <Input
          placeholder="Ask a Question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-gray-900 focus:ring-purple-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
        <Button
          type="submit"
          disabled={!input || isPending}
          className="ml-2 flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-500 disabled:bg-gray-400"
        >
          {isPending ? (
            <Loader2Icon className="h-5 w-5 animate-spin text-white" />
          ) : (
            "Ask"
          )}
        </Button>
      </form>
    </div>
  );
}