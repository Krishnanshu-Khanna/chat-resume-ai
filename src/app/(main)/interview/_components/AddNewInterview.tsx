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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { generateInterviewQuestions } from "../action";


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

export default function AddNewInterview({ isOpen, onClose }: AddNewInterviewProps) {
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

      const res = await generateInterviewQuestions(data);
      toast({
        description: "Interview questions generated successfully!",
      });
      onClose();
      form.reset();
      router.push(`/interview/${res.mockId}`);
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again. "+error,
      });
    } finally {
      setLoading(false);
    }
  });

  return (
    <div>
      {/* <div
        className="cursor-pointer rounded-lg border bg-primary-foreground p-10 transition-all  hover:shadow-md"
        onClick={() => setOpenDialog(true)}
      >
        <h1 className="text-center text-lg font-semibold">+ Add New</h1>
      </div> */}
      <Dialog
        open={isOpen}
        onOpenChange={(isOpen) => !isOpen && (form.reset(), onClose())}
      >
        <DialogContent className="max-w-xl rounded-lg border border-neutral-300 bg-white px-6 py-5 shadow-lg dark:border-neutral-700 dark:bg-neutral-900 sm:px-8">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-neutral-800 dark:text-white">
              Create Your Interview
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-5">
            {/* Job Role */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Job Role/Position
              </label>
              <div className="flex items-center rounded-md border border-neutral-300 bg-white px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800">
                <Input
                  placeholder="Ex. Full Stack Developer"
                  {...form.register("jobPosition", { required: true })}
                  list="jobRoles"
                  className="w-full bg-transparent text-neutral-800 placeholder-neutral-400 focus:outline-none dark:text-white dark:placeholder-neutral-500"
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
                    const selectedRole = form.watch("jobPosition");
                    if (selectedRole) {
                      autoSuggestTechStack(selectedRole);
                    } else {
                      toast({
                        variant: "destructive",
                        description: "Please enter a job role first.",
                      });
                    }
                  }}
                  className="text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
                >
                  <WandSparkles className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Job Description / Tech Stack
              </label>
              <Textarea
                placeholder="Ex. React, Angular, Node.js, MySQL"
                {...form.register("jobDescription", { required: true })}
                className="rounded-md border border-neutral-300 bg-white text-neutral-800 placeholder-neutral-400 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
              />
            </div>

            {/* Experience */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                Years of Experience
              </label>
              <Input
                placeholder="Ex. 5"
                type="number"
                min="0"
                max="70"
                {...form.register("jobExperience", { required: true })}
                className="rounded-md border border-neutral-300 bg-white text-neutral-800 placeholder-neutral-400 focus:ring-1 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-neutral-800 dark:text-white dark:placeholder-neutral-500"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 pt-3">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                className="rounded-md px-4 py-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-md bg-indigo-600 px-5 py-2 font-medium text-white transition hover:bg-indigo-500"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="mr-2 animate-spin" /> Generating...
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
