// src/app/(main)/chat/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your chats",
  description: "Chat with your AI assistant to get help with your resume",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
