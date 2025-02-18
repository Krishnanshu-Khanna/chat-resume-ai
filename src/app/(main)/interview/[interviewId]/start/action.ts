"use server"; // ✅ Required for Server Actions

import prisma from "@/lib/prisma";
import generateAIResponse from "@/lib/gemini";

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
    const feedbackPrompt = `Question: ${mockInterviewQuestion[activeQuestionIndex]?.question}, User Answer: ${userAnswer}. Please give a rating out of 10 and feedback on improvement in JSON format { \"rating\": <number>, \"feedback\": <text> }`;
    const result = await generateAIResponse(feedbackPrompt);
    const JsonfeedbackResp = JSON.parse(result);

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
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Answer processing error:", errorMessage);
    return null;
  }
};

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
