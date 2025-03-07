// src/app/(main)/chat/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your chats",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
