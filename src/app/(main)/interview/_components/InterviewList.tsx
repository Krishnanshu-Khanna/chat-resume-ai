"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import InterviewItemCard from "./InterviewItemCard";
import { getInterviewList } from "./action";
import { JsonValue } from "@prisma/client/runtime/library";

interface Interview {
  id: number;
  jsonMockResp: JsonValue;
  jobPosition: string;
  jobDesc: string;
  jobExperience: number;
  createdBy: string;
  createdAt: Date;
  mockId: string;
}

const InterviewList = () => {
  const { user } = useUser();
  const [interviewList, setInterviewList] = useState<Interview[]>([]);

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!user) return;
      try {
        const interviews = await getInterviewList();
        setInterviewList(interviews.map(interview => ({
          ...interview,
          jobExperience: Number(interview.jobExperience)
        })));
      } catch (error) {
        console.error("Failed to fetch interviews:", error);
      }
    };

    fetchInterviews();
  }, [user]);

  return (
    <div>
      <h2 className="text-xl font-medium">Previous Mock Interviews</h2>
      <div className="my-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {interviewList.length > 0 ? (
          interviewList.map((int, index) => (
            <InterviewItemCard
              interview={{ ...int, createdAt: int.createdAt.toISOString() }}
              key={index}
              onDeleteSuccess={(mockId) => {
                setInterviewList(
                  interviewList.filter(
                    (interview) => interview.mockId !== mockId,
                  ),
                );
              }}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-neutral-500 dark:text-neutral-300">
            <p className="text-lg"> No mock interviews found!</p>
            <p className="mt-2 text-sm">Start practicing now to get ahead.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InterviewList;
