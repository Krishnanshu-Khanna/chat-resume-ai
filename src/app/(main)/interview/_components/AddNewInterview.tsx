"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { interviewFormSchema, InterviewFormValues } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, WandSparkles } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { generateInterviewQuestions } from "../action";
import { useRouter } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { canUseAITools } from "@/lib/permissions";

// Job Role Suggestions
const JOB_ROLE_SUGGESTIONS = [
  "Full Stack Developer",
  "Frontend Developer",
  "Backend Developer",
  "Software Engineer",
  "DevOps Engineer",
  "Data Scientist",
  "Machine Learning Engineer",
  "Cloud Engineer",
  "Mobile App Developer",
  "UI/UX Designer",
];

interface AddNewInterviewProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddNewInterview({
  isOpen,
  onClose,
}: AddNewInterviewProps) {
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      jobPosition: "",
      jobDescription: "",
      jobExperience: "",
    },
  });

  // Tech Stack Auto-Suggestions
  const TECH_STACK_SUGGESTIONS: Record<string, string> = {
    "Full Stack Developer": "React, Node.js, Express, MongoDB, TypeScript",
    "Frontend Developer": "React, Vue.js, Angular, TypeScript, Tailwind CSS",
    "Backend Developer": "Python, Django, Flask, Java Spring, PostgreSQL",
    "Software Engineer": "Java, C++, Python, AWS, Microservices",
    "DevOps Engineer": "Docker, Kubernetes, Jenkins, AWS, Azure",
    "Data Scientist": "Python, TensorFlow, PyTorch, Pandas, NumPy",
    "Machine Learning Engineer": "Python, scikit-learn, Keras, TensorFlow",
    "Cloud Engineer": "AWS, Azure, GCP, Terraform, Kubernetes",
    "Mobile App Developer": "React Native, Flutter, Swift, Kotlin",
    "UI/UX Designer": "Figma, Sketch, Adobe XD, InVision",
  };

  const autoSuggestTechStack = (role: string) => {
    const suggestion = TECH_STACK_SUGGESTIONS[role];
    if (suggestion) {
      form.setValue("jobDescription", suggestion, { shouldValidate: true });
      form.trigger("jobDescription"); // Ensure re-render
      toast({ description: `Auto-filled tech stack for ${role}` });
    }
  };

  const onSubmit = form.handleSubmit(async (data) => {
    try {
      setLoading(true);
      console.log("Submitting data:", data); // Debugging log
      const { userId } = await auth();
      if (!userId) throw new Error("Unauthorized");
      const subscriptionLevel = await getUserSubscriptionLevel(userId);
      if (!canUseAITools(subscriptionLevel)) {
        throw new Error("Upgrade your subscription to use this feature");
      }
      const res = await generateInterviewQuestions(data);
      toast({
        description: "Interview questions generated successfully!",
      });
      setOpenDialog(false);
      form.reset();
      router.push(`/interview/${res.mockId}`);
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  });

  return (
    <div>
      <div
        className="cursor-pointer rounded-lg border bg-primary-foreground p-10 transition-all hover:shadow-md"
        onClick={() => setOpenDialog(true)}
      >
        <h1 className="text-center text-lg font-semibold">+ Add New</h1>
      </div>
      <Dialog
        open={isOpen && openDialog}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            form.reset();
            onClose();
          }
          setOpenDialog(isOpen);
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Create Your Interview Preparation
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit}>
            <div className="my-3 mt-7">
              <label>Job Role/Position</label>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Ex. Full Stack Developer"
                  {...form.register("jobPosition", { required: true })}
                  list="jobRoles"
                />
                <datalist id="jobRoles">
                  {JOB_ROLE_SUGGESTIONS.map((role) => (
                    <option key={role} value={role} />
                  ))}
                </datalist>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const selectedRole = form.watch("jobPosition"); // Use watch instead of getValues
                    if (selectedRole) {
                      autoSuggestTechStack(selectedRole);
                    } else {
                      toast({
                        variant: "destructive",
                        description: "Please enter a job role first.",
                      });
                    }
                  }}
                >
                  <WandSparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="my-3">
              <label>Job Description/Tech Stack</label>
              <Textarea
                placeholder="Ex. React, Angular, NodeJs, MySql etc"
                {...form.register("jobDescription", { required: true })}
              />
            </div>
            <div className="my-3">
              <label>Years of Experience</label>
              <Input
                placeholder="Ex. 5"
                type="number"
                min="0"
                max="70"
                {...form.register("jobExperience", { required: true })}
              />
            </div>
            <div className="flex justify-end gap-5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setOpenDialog(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <LoaderCircle className="mr-2 animate-spin" /> Generating
                  </>
                ) : (
                  "Start Interview"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
