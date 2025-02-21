"use server";

import { env } from "@/env";
import generateAIResponse from "@/lib/gemini";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import {
  interviewFormSchema,
  InterviewFormValues,
  MockInterview,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { canUseAITools } from "@/lib/permissions";

export async function generateInterviewQuestions(
  input: InterviewFormValues,
): Promise<MockInterview> {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
 const subscriptionLevel = await getUserSubscriptionLevel(userId);
 if (!canUseAITools(subscriptionLevel)) {
   throw new Error("Upgrade your subscription to use this feature");
 }
 

  const { jobPosition, jobDescription, jobExperience } =
    interviewFormSchema.parse(input);

  if (!jobPosition || !jobDescription || !jobExperience) {
    throw new Error("Invalid job details provided.");
  }

  const systemMessage = `**You are an AI that generates structured interview questions.**  
**Output Format (JSON only):**  
\`\`\`json
[
  {
    "question": "<Interview question>",
    "answer": "<Concise answer>",
    "category": "<Technical | Behavioral | HR>",
    "difficulty": "<EASY | MEDIUM | HARD>",
    "tags": ["<tag1>", "<tag2>"]
  }
]
\`\`\`  
### **Rules:**  
- **Output only valid JSON** (no extra text).  
- Use **double quotes** for all keys/values.  
- Ensure **non-empty array** output.  
- Keep **questions relevant and diverse**.  
- **Concise answers**, aligned with best practices.  
Your goal: Generate **high-quality questions** to assess role-specific expertise.`;

  const userMessage = `Please provide a set of ${env.NUMBER_OF_QUESTIONS} interview questions based on:
  - Job Position: ${jobPosition}
  - Job Description: ${jobDescription}
  - Job Experience: ${jobExperience}`;

  const responseText = await generateAIResponse(userMessage, systemMessage);

  if (!responseText || responseText.trim().length === 0) {
    throw new Error("AI response is empty.");
  }

  console.log("Raw AI response:", responseText);

  return (await saveInterviewQuestions(
    responseText,
    jobPosition,
    jobDescription,
    jobExperience,
  )) as unknown as {
    jobPosition: string;
    jobExperience: string;
    jsonMockResp: string;
    jobDesc: string;
    createdBy: string;
    mockId: string;
  };
}

export async function saveInterviewQuestions(
  aiResponse: string,
  jobPosition: string,
  jobDesc: string,
  jobExperience: string,
) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Ensure the response is valid JSON
  let parsedData;
  try {
    parsedData = JSON.parse(aiResponse.replace(/```json|```/g, "").trim());
  } catch (error) {
    console.error("❌ Invalid AI response JSON:", error);
    throw new Error("AI response is not valid JSON.");
  }

  // Count existing interviews for the user
  const userInterviews = await prisma.mockInterview.count({
    where: { createdBy: userId },
  });

  // Set a limit (e.g., max 5 interviews per user)
  const MAX_INTERVIEWS = env.MAX_INTERVIEWS_PER_USER;
  if (userInterviews >= Number(MAX_INTERVIEWS)) {
    throw new Error("Interview limit reached. Please delete old interviews.");
  }

  // Generate a unique mockId
  const mockId = uuidv4();

  // Save the interview
  const savedMockInterview = await prisma.mockInterview.create({
    data: {
      jsonMockResp: JSON.stringify(parsedData),
      jobPosition,
      jobDesc,
      jobExperience,
      createdBy: userId,
      mockId,
    },
  });

  console.log("✅ Successfully saved Mock Interview:", savedMockInterview);
  return savedMockInterview;
}

export async function getUserDetails() {
  try {
    const user = await currentUser();
    if (!user) throw new Error("User not found");

    return {
      email: user.emailAddresses[0]?.emailAddress || "",
      firstName: user.firstName || "",
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw new Error("Failed to fetch user details");
  }
}




export async function fetchUserInterviews() {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("No user found");
  }

  try {
    const userInterviews = await prisma.mockInterview.findMany({
      where: { createdBy:userId },
      select: {
        id: true,
        jobPosition: true,
        jobDesc: true,
        jobExperience: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const userRatings=await prisma.userAnswer.findMany({
      where:{answerBy:userId},
      select:{
        rating:true
      }
    })

    return { userInterviews,userRatings };
  } catch (error) {
    console.error("❌ Error fetching user interviews:", error);
    throw new Error("Failed to fetch interview data");
  }
}
