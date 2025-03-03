"use client";

import React, { useEffect, useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  XCircle,
  ChevronsUpDown,
  Activity,
  Target,
  BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getFeedback } from "./action"; // Importing the server action

interface FeedbackItem {
  id: number;
  mockIdRef: string;
  question: string;
  correctAns: string | null;
  userAns: string | null;
  feedback: string | null;
  rating: string | null;
  answerBy: string | null;
  createdAt: Date;
}

const Feedback = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [averageRating, setAverageRating] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { interviewId } = useParams() as { interviewId: string };

  useEffect(() => {
    const fetchFeedback = async () => {
      setLoading(true);
      const { feedbackList, averageRating } = await getFeedback(interviewId);
      setFeedbackList(feedbackList);
      setAverageRating(averageRating);
      setLoading(false);
    };

    fetchFeedback();
  }, []);

  interface RatingColorProps {
    rating: string | null;
  }

  const getRatingColor = ({ rating }: RatingColorProps): string => {
    const numRating = parseFloat(rating ?? "0");
    if (numRating >= 8) return "text-green-600";
    if (numRating >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Activity className="mx-auto h-12 w-12 animate-pulse text-indigo-600" />
          <p className="mt-4 text-gray-600">
            Loading your interview feedback...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-12">
      {feedbackList.length === 0 ? (
        <Card className="mx-auto max-w-lg shadow-lg">
          <CardHeader className="flex flex-col items-center text-center">
            <XCircle className="h-16 w-16 text-red-500" />
            <h2 className="mt-4 text-2xl font-semibold text-gray-900">
              No Feedback Available
            </h2>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6 text-sm text-gray-600">
              No feedback has been generated for this interview. It could be due
              to an incomplete interview or system issue.
            </p>
            <Button
              variant="outline"
              onClick={() => router.replace("/interview")}
              className="w-full md:w-auto"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mx-auto mb-8 max-w-3xl">
            <Card className="shadow-md">
              <CardHeader className="flex flex-row items-center gap-4">
                <BadgeCheck className="h-12 w-12 text-purple-600" />
                <div>
                  <h2 className="text-2xl font-bold text-purple-600">
                    Great Job!
                  </h2>
                  <p className="text-sm text-gray-600">
                    You&apos;re done with your mock interview.
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6">
                  <div className="rounded-xl bg-purple-50 p-4 dark:bg-purple-900/30">
                    <p className="text-sm font-medium text-purple-600 dark:text-purple-300">
                      Overall Rating
                    </p>
                    <p
                      className={`text-4xl font-bold ${getRatingColor({ rating: averageRating })}`}
                    >
                      {averageRating ? `${averageRating}/10` : "N/A"}
                    </p>
                  </div>
                  <div className="rounded-xl bg-indigo-50 p-4 dark:bg-indigo-900/30">
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-300">
                      Total Questions
                    </p>
                    <p className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">
                      {feedbackList.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mx-auto max-w-3xl space-y-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Detailed Interview Feedback
            </h3>
            <p className="text-sm text-gray-500">
              Review each question&apos;s performance and get insights for
              improvement.
            </p>

            {feedbackList.map((item, index) => (
              <Collapsible
                key={index}
                className="overflow-hidden rounded-lg border shadow-sm"
              >
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between bg-gray-100 p-4 transition-all hover:bg-gray-200 dark:bg-primary-foreground">
                    <div className="flex items-center gap-3">
                      <Target
                        className={`h-5 w-5 ${
                          parseFloat(item.rating ?? "0") >= 7
                            ? "text-green-500"
                            : parseFloat(item.rating ?? "0") >= 4
                              ? "text-yellow-500"
                              : "text-red-500"
                        }`}
                      />
                      <span className="line-clamp-1 font-medium text-gray-800 dark:text-gray-400">
                        {item.question}
                      </span>
                    </div>
                    <ChevronsUpDown className="h-4 text-gray-500" />
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="bg-white p-5 dark:bg-secondary">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                        Your Answer
                      </h4>
                      <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                        {item.userAns || "No answer provided"}
                      </p>
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                        Correct Answer
                      </h4>
                      <p className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                        {item.correctAns}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                      Feedback
                    </h4>
                    <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                      {item.feedback}
                    </p>
                  </div>
                  <div className="mt-4 text-right">
                    <span
                      className={`font-semibold ${getRatingColor({ rating: item.rating })}`}
                    >
                      Rating: {item.rating}/10
                    </span>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}

            <div className="mt-8 text-center">
              <Button
                onClick={() => router.replace("/interview")}
                className="w-full md:w-auto"
              >
                Return to Dashboard
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Feedback;
