"use server";

import { env } from "@/env";
import generateAIResponse from "@/lib/gemini";
import { canUseAITools } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import {
  interviewFormSchema,
  InterviewFormValues,
  MockInterview,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { currentUser } from "@clerk/nextjs/server";

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

  const systemMessage = `You are an advanced AI specializing in generating high-quality job interview questions.  
Your task is to generate a structured set of interview questions based on the provided job details.  

**Response Format:**  
Return a **valid JSON array** containing objects with the following fields:  

\`\`\`json
[
  {
    "question": "<The interview question>",
    "answer": "<A well-structured answer>",
    "category": "<Relevant category (e.g., Technical, Behavioral, HR)>",
    "difficulty": "<EASY | MEDIUM | HARD>",
    "tags": ["<tag1>", "<tag2>", "<tag3>"],
    "notes": "<Additional useful notes>"
  }
]
\`\`\`

### **STRICT RULES:**
1. **Output ONLY valid JSON.** No explanations, comments, or additional text.  
2. **Use double quotes** for all keys and string values.  
3. Ensure the response is **always a non-empty array**.  
4. Maintain the **exact structure and field order** as shown above.  
5. Questions should be **clear, relevant, and diverse** based on the job details.  
6. Keep answers **concise yet informative**, ensuring they align with industry best practices.  

Your goal is to generate **high-quality interview questions** that assess the candidate's knowledge, problem-solving abilities, and role-specific expertise.`;

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
