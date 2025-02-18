"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import Link from "next/link";
// import RecordAnswerSection from "./_components/RecordAnswers";
import QuestionsSection from "./_components/QuestionSection";
import { getInterviewDetails } from "./action";
import { JsonValue } from "@prisma/client/runtime/library";
import { useParams } from "next/navigation";
import RecordAnswerSection from "./_components/RecordAnswers";


interface MockInterview {
  id: number;
  jsonMockResp: JsonValue;
  jobPosition: string;
  jobDesc: string;
  jobExperience: string;
  createdBy: string;
  createdAt: Date;
  mockId: string;
}
interface Question {
  question: string;
  answer: string;
}

const StartInterview = () => {
  const { interviewId } = useParams() as { interviewId: string };
  const [interviewData, setInterviewData] = useState<MockInterview | null>(
    null,
  );
  const [mockInterviewQuestions, setMockInterviewQuestions] = useState<
    Question[]
  >([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchInterviewDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await getInterviewDetails(interviewId);
      if (result) {
        setInterviewData(result);
        setMockInterviewQuestions(JSON.parse(typeof result.jsonMockResp === 'string' ? result.jsonMockResp : "[]"));
      }
    } catch (error) {
      console.error("Failed to fetch interview details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [interviewId]);

  useEffect(() => {
    fetchInterviewDetails();
  }, [fetchInterviewDetails]);

  const handleAnswerSave = () => {
    setActiveQuestionIndex((prev) =>
      Math.min(prev + 1, mockInterviewQuestions.length - 1),
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin" />
          <p className="mt-4 text-gray-600">Loading interview details...</p>
        </div>
      </div>
    );
  }

  if (mockInterviewQuestions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">No interview questions found.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 px-4 py-6">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        {/* Questions Section */}
        <QuestionsSection
          mockInterviewQuestion={mockInterviewQuestions}
          activeQuestionIndex={activeQuestionIndex}
        />


        {/* Video/Audio Recording Section */} 
         {interviewData && (
          <RecordAnswerSection
            mockInterviewQuestion={mockInterviewQuestions}
            activeQuestionIndex={activeQuestionIndex}
            interviewData={interviewData}
            onAnswerSave={handleAnswerSave}
            mockIdRef={interviewData.mockId}
          />
        )}
      </div>

      <div className="mt-6 flex justify-end gap-6">
        {activeQuestionIndex > 0 && (
          <Button onClick={() => setActiveQuestionIndex((prev) => prev - 1)}>
            Previous Question
          </Button>
        )}
        {activeQuestionIndex < mockInterviewQuestions.length - 1 ? (
          <Button onClick={handleAnswerSave}>Next Question</Button>
        ) : (
          <Link href={`/interview/${interviewData?.mockId}/feedback`}>
            <Button>End Interview</Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default StartInterview;
