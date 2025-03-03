import { env } from "@/env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getUserSubscriptionLevel } from "./subscription";
import { canUseAITools } from "./permissions";
import { auth } from "@clerk/nextjs/server";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export default async function generateAIResponse(
  systemMessage: string,
  userMessage?: string,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Upgrade your subscription to use this feature");
  }

  const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
  const result = await model.generateContentStream({
    contents: [
      {
        role: "user",
        parts: [{ text: `${systemMessage}\n${userMessage || ""}` }],
      },
    ],
  });

  let responseText = "";
  for await (const chunk of result.stream) {
    responseText += chunk.text();
  }

  return responseText;
}

export async function generateAIResponseWithPrompt(
  prompt: string,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Upgrade your subscription to use this feature");
  }
  const model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
  const result = await model.generateContent({
    contents: [
      { role: "user", parts: [{ text: `${prompt}\n` }] },
    ],
  });
  return result.response.text();
}