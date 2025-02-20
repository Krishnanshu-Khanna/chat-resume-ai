"use server";

import { env } from "@/env";
import { generateLangchainCompletion } from "@/lib/langchain";
import prisma from "@/lib/prisma"; // Assuming your Prisma client is configured here
import { auth } from "@clerk/nextjs/server";

const PRO_LIMIT = env.MAX_MESSAGES_PER_CHAT;

export async function getUserId() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }
  return userId;
}

export async function askQuestion(
  chatId: string,
  question: string,
  subscriptionLevel: string,
) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }

  // Fetch chat and user details
  const chat = await prisma.chatPDF.findUnique({
    where: { chatId: chatId }, // Assuming `id` is the unique identifier
  });

  if (!chat) {
    throw new Error("Chat not found");
  }

  if (chat.userId !== userId) {
    throw new Error("Unauthorized access");
  }
  // Count user messages for this file
  const userMessageCount = await prisma.message.count({
    where: { chatId, role: "human" },
  });

  // Check limits based on membership

  if (userMessageCount >= Number(PRO_LIMIT)) {
    return {
      success: false,
      message: `You've reached the ${subscriptionLevel} limit of ${PRO_LIMIT} questions per document! 😢`,
    };
  }

  // Save user's message
  await prisma.message.create({
    data: {
      chatId,
      role: "human",
      message: question,
    },
  });

  // Generate AI response
  const reply = await generateLangchainCompletion(chatId, question);

  // Save AI's response
  await prisma.message.create({
    data: {
      chatId,
      role: "ai",
      message: reply,
    },
  });

  return { success: true, message: null };
}

export async function getChatHistory(chatId: string) {
  if (!chatId) {
    console.error("getChatHistory called with undefined chatId");
    return [];
  }

  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }

  const messages = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "asc" },
  });

  if (!messages || messages.length === 0) {
    console.warn(`No messages found for chatId: ${chatId}`);
    return []; // Return an empty array instead of `undefined`
  }

  return messages.map((msg) => ({
    role: msg.role,
    message: msg.message,
    createdAt: msg.createdAt,
  }));
}

export async function getChatDetails(chatId: string) {
  if (!chatId) {
    throw new Error("Invalid chatId");
  }

  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }

  return prisma.chatPDF.findUnique({
    where: {
      chatId: chatId, // Ensure chatId is passed correctly
    },
  });
}

export async function getChatList() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not found");
  }

  return prisma.chatPDF.findMany({
    where: { userId },
    select: {
      chatId: true,
      pdfUrl: true,
      userId: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}