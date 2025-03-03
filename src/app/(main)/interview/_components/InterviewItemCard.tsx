import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Trash } from "lucide-react";
import { deleteMockInterview } from "./action";
import { useToast } from "@/hooks/use-toast";

interface Interview {
  mockId: string;
  jobPosition: string;
  jobExperience: number;
  createdAt: string;
}

const InterviewItemCard: React.FC<{
  interview: Interview;
  onDeleteSuccess: (mockId: string) => void;
}> = ({ interview, onDeleteSuccess }) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const onStart = () => {
    router.push(`/interview/${interview?.mockId}`);
  };

  const onFeedbackPress = () => {
    router.push(`/interview/${interview?.mockId}/feedback`);
  };

  const onDelete = async () => {
    try {
      console.log("Deleting interview...");

      await deleteMockInterview(interview.mockId);
      console.log("Interview deleted, showing toast...");
      toast({
        description: "Interview deleted successfully.",
      });
      setTimeout(() => {
        console.log("Updating state...");
        onDeleteSuccess(interview.mockId);
      }, 500);
    } catch (error) {
      console.error("Error deleting interview:", error);
    } finally {
      console.log("Closing dialog...");
      setIsDialogOpen(false);
    }
  };

  return (
    <div className="relative rounded-lg border bg-white p-4 shadow-md transition hover:shadow-lg dark:bg-neutral-900">
      {/* Delete Button */}
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-3 top-3 p-2 text-red-500 transition hover:text-red-700"
        onClick={() => setIsDialogOpen(true)}
      >
        <Trash className="h-4 w-4" />
      </Button>

      {/* Job Details */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
          {interview?.jobPosition}
        </h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Experience:{" "}
          <span className="font-medium">
            {interview?.jobExperience} Year(s)
          </span>
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Created At: {new Date(interview?.createdAt).toLocaleString()}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button
          size="sm"
          variant="outline"
          className="rounded-md border border-purple-500 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900 dark:hover:text-white"
          onClick={onFeedbackPress}
        >
          Feedback
        </Button>
        <Button
          size="sm"
          className="rounded-md bg-purple-600 text-white hover:bg-purple-500"
          onClick={onStart}
        >
          Start
        </Button>
      </div>

      {/* Confirmation Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="mx-4 w-full max-w-sm rounded-lg bg-white p-5 shadow-lg dark:bg-neutral-900">
            <h3 className="mb-3 text-lg font-bold text-neutral-900 dark:text-white">
              Confirm Deletion
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Are you sure you want to delete this interview? This action cannot
              be undone.
            </p>
            <div className="mt-4 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewItemCard;
