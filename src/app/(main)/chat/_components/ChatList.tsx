import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import ChatItemCard from "./ChatItemCard";
import { getChatList } from "../[chatId]/action";
import { useRouter } from "next/navigation";

export interface Chat {
  chatId: string;
  userId: string;
  createdAt: string;
  pdfUrl: string;
}

const ChatList = () => {
  const { user } = useUser();
  const [chatList, setChatList] = useState<Chat[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;
      try {
        const chats = await getChatList();
        setChatList(
          chats.map((chat) => ({
            ...chat,
            userId: chat.userId,
            createdAt: new Date(chat.createdAt).toISOString(),
          })),
        );
      } catch (error) {
        console.error("Failed to fetch chats:", error);
      }
    };

    fetchChats();
  }, [user]);

  return (
    <div>
      <h2 className="text-xl font-medium">Chat History</h2>
      <div className="my-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {chatList.length > 0 ? (
          chatList.map((chat) => (
            <ChatItemCard
              chat={chat}
              key={chat.chatId}
              onSeeResume={(chatId: string) => {
                router.push(`/chat/${chatId}`);
                console.log(`Viewing chat: ${chatId}`);
              }}
            />
          ))
        ) : (
          <p>No chats found.</p>
        )}
      </div>
    </div>
  );
};

export default ChatList;
