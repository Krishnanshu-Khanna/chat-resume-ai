import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import React from "react";

interface ChatItemProps {
  chat: {
    chatId: string;
    pdfUrl: string;
    createdAt: string;
  };
  onSeeResume: (chatId: string) => void;
}

const ChatItemCard: React.FC<ChatItemProps> = ({ chat, onSeeResume }) => {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-white dark:bg-secondary p-4 shadow-md">
      <div>
        <h3 className="text-lg font-semibold">Chat ID: {chat.chatId}</h3>
        <p className="text-sm text-gray-500">
          Created at: {new Date(chat.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSeeResume(chat.chatId)}
        >
          <FileText className="mr-1 h-4 w-4" />
          See Chat
        </Button>
      </div>
    </div>
  );
};

export default ChatItemCard;
