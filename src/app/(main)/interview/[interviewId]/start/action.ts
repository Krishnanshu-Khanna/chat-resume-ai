"use server"; // ✅ Required for Server Actions

import { generateAIResponseWithPrompt } from "@/lib/gemini";
import prisma from "@/lib/prisma";

export async function getInterviewDetails(interviewId: string) {
  try {
    return await prisma.mockInterview.findFirst({
      where: { mockId: interviewId },
    });
  } catch (error) {
    console.error("Error fetching interview details:", error);
    return null;
  }
}

interface Question {
  question: string;
  answer: string;
}

interface AnswerRecord {
  mockIdRef: string;
  question: string;
  correctAns: string;
  userAns: string;
  feedback: string;
  rating: string;
  answerBy: string;
}
export const saveAnswerToDatabase = async (
  answerRecord: AnswerRecord,
): Promise<boolean> => {
  try {
    if (!answerRecord.mockIdRef) {
      throw new Error("Mock ID is missing");
    }

    await prisma.userAnswer.create({
      data: { ...answerRecord, mockIdRef: answerRecord.mockIdRef! },
    });
    return true;
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Database save error:", errorMessage);
    return false;
  }
};


export const processAnswer = async (
  userAnswer: string,
  mockInterviewQuestion: Question[],
  activeQuestionIndex: number,
  mockId: string,
  userId: string,
): Promise<AnswerRecord | null> => {
  if (!userAnswer.trim()) {
    return null;
  }

 try {
   const feedbackPrompt = `Question: ${mockInterviewQuestion[activeQuestionIndex]?.question}, User Answer: ${userAnswer}. Please give a rating out of 10 and feedback on improvement in the following JSON format:
  {
    "rating": <number>,
    "feedback": "<text>"
  }`;

   const result = await generateAIResponseWithPrompt(feedbackPrompt);

   let JsonfeedbackResp;
   try {
     // Remove the code block markers and parse the JSON

      const cleanedResult: string = result.replace(/```json|```/g, "");
     JsonfeedbackResp = JSON.parse(cleanedResult);
   } catch (error) {
     console.error("JSON parsing error:", error);
     console.log("Invalid JSON string:", result);
     // Handle the error appropriately, e.g., return a default value or throw an error
     return null; // or handle the error as appropriate for your application
   }

   const answerRecord: AnswerRecord = {
     mockIdRef: mockId,
     question: mockInterviewQuestion[activeQuestionIndex]?.question,
     correctAns: mockInterviewQuestion[activeQuestionIndex]?.answer,
     userAns: userAnswer,
     feedback: JsonfeedbackResp?.feedback,
     rating: JsonfeedbackResp?.rating.toString(),
     answerBy: userId,
   };
   try {
     await saveAnswerToDatabase(answerRecord);
   } catch (error) {
     console.error("Error saving answer to database:", error);
   }

   return answerRecord;
 } catch (error) {
   console.error("Answer processing error:", error);
   return null;
 }
};
