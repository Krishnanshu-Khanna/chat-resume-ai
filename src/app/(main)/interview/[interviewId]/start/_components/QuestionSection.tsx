"use client";

import { Lightbulb,  Volume2 } from "lucide-react";
import React from "react";

interface Question {
  question: string;
}

interface QuestionsSectionProps {
  mockInterviewQuestion: Question[];
  activeQuestionIndex: number;
}

const QuestionsSection: React.FC<QuestionsSectionProps> = ({
  mockInterviewQuestion = [],
  activeQuestionIndex = 0,
}) => {
  const textToSpeech = (text?: string) => {
    if (!text) return;
    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
    } else {
      alert("Sorry, your browser does not support text-to-speech.");
    }
  };

  return (
    <div className="my-10 space-y-6 rounded-lg border bg-white p-6 shadow-md dark:bg-primary-foreground">
      {/* Question Number Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {mockInterviewQuestion.map((_, index) => (
          <button
            key={index}
            className={`rounded-full px-3 py-2 text-sm font-medium transition-all ${
              activeQuestionIndex === index
                ? "border-2 border-purple-600 bg-purple-100 text-purple-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Q{index + 1}
          </button>
        ))}
      </div>

      {/* Current Question */}
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-lg font-semibold md:text-xl">
          {mockInterviewQuestion[activeQuestionIndex]?.question ||
            "No question available"}
        </h2>
        {mockInterviewQuestion[activeQuestionIndex]?.question && (
          <Volume2
            className="cursor-pointer text-gray-600 transition-all hover:scale-105 hover:text-gray-900 dark:text-white"
            size={50}
            onClick={() =>
              textToSpeech(mockInterviewQuestion[activeQuestionIndex].question)
            }
          />
        )}
      </div>

      {/* Note Section */}
      <div className="rounded-lg border bg-purple-50 p-5 shadow-sm dark:bg-secondary dark:border-purple-900">
        <h2 className="flex items-center gap-2 text-purple-700">
          <Lightbulb className="h-5 w-5 text-purple-500" />
          <strong>Note:</strong>
        </h2>
        <p className="mt-2 text-sm text-purple-800 dark:text-purple-600">
          Turn on your webcam and microphone to begin your AI-powered mock
          interview. You&apos;ll be asked five questions, and upon completion,
          you&apos;ll receive a detailed report based on your responses.
          <br />
          <strong>Important:</strong> Your video is not recorded, and you can
          disable webcam access anytime.
        </p>
      </div>
    </div>
  );
};

export default QuestionsSection;
