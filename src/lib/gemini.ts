import { env } from "@/env";
import { GoogleGenAI } from "@google/genai";
import { getUserSubscriptionLevel } from "./subscription";
import { canUseAITools } from "./permissions";
import { auth } from "@clerk/nextjs/server";

const ai = new GoogleGenAI({
  apiKey: env.GEMINI_API_KEY,
  apiVersion: "v1",
});

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

  const prompt = `${systemMessage}\n${userMessage || ""}`;
  const modelName = env.GEMINI_MODEL || "gemini-2.0-flash-001";

  const stream = await ai.models.generateContentStream({
    model: modelName,
    contents: prompt,
  });

  let responseText = "";
  for await (const chunk of stream) {
    responseText += chunk.text;
  }

  return responseText;
}

export async function generateAIResponseWithPrompt(prompt: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Upgrade your subscription to use this feature");
  }

  const modelName = env.GEMINI_MODEL || "gemini-2.0-flash-001";

  const result = await ai.models.generateContent({
    model: modelName,
    contents: prompt,
  });

  return result.text;
}
