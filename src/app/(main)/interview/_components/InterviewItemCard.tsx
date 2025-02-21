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
    <div className="relative rounded-sm border p-3 shadow-sm">
      {/* Delete button in the top-right corner */}
      <Button
        size="sm"
        variant="outline"
        className="absolute right-2 top-2 flex items-center justify-center"
        onClick={() => setIsDialogOpen(true)}
      >
        <Trash className="text-red-600" />
      </Button>

      {/* Card Content */}
      <div>
        <h2 className="font-bold text-primary">{interview?.jobPosition}</h2>
        <h2 className="text-sm text-gray-500">
          Experience: {interview?.jobExperience} Year(s)
        </h2>
        <h2 className="text-sm text-gray-500">
          Created At: {interview?.createdAt}
        </h2>
      </div>

      <div className="mt-2 flex justify-between gap-5">
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={onFeedbackPress}
        >
          Feedback
        </Button>
        <Button className="w-full" size="sm" onClick={onStart}>
          Start
        </Button>
      </div>

      {/* Confirmation Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-md rounded-lg dark:bg-black bg-white p-6 shadow-lg">
            <h3 className="mb-4 text-lg font-bold">Confirm Deletion</h3>
            <p className="mb-4">
              Are you sure you want to delete this interview?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onDelete}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewItemCard;
