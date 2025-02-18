import { z } from "zod";

export const optionalString = z.string().trim().optional().or(z.literal(""));

export const generalInfoSchema = z.object({
  title: optionalString,
  description: optionalString,
});

export type GeneralInfoValues = z.infer<typeof generalInfoSchema>;

export const personalInfoSchema = z.object({
  photo: z
    .custom<File | undefined>()
    .refine(
      (file) =>
        !file || (file instanceof File && file.type.startsWith("image/")),
      "Must be an image file",
    )
    .refine(
      (file) => !file || file.size <= 1024 * 1024 * 4,
      "File must be less than 4MB",
    ),
  firstName: optionalString,
  lastName: optionalString,
  jobTitle: optionalString,
  city: optionalString,
  country: optionalString,
  phone: optionalString,
  email: optionalString,
  linkedin: optionalString,
});

export type PersonalInfoValues = z.infer<typeof personalInfoSchema>;

export const workExperienceSchema = z.object({
  workExperiences: z
    .array(
      z.object({
        position: optionalString,
        company: optionalString,
        startDate: optionalString,
        endDate: optionalString,
        description: optionalString,
        city: optionalString,
      }),
    )
    .optional(),
});

export type WorkExperienceValues = z.infer<typeof workExperienceSchema>;

export type WorkExperience = NonNullable<
  z.infer<typeof workExperienceSchema>["workExperiences"]
>[number];

export const educationSchema = z.object({
  educations: z
    .array(
      z.object({
        degree: optionalString,
        school: optionalString,
        startDate: optionalString,
        endDate: optionalString,
        grade: optionalString,
        city: optionalString,
      }),
    )
    .optional(),
});

export type EducationValues = z.infer<typeof educationSchema>;

export const skillsSchema = z.object({
  skills: z.array(z.string().trim()).optional(),
});

export type SkillsValues = z.infer<typeof skillsSchema>;

export const summarySchema = z.object({
  summary: optionalString,
});

export const projectSchema = z.object({
  projects: z
    .array(
      z.object({
        title: optionalString,
        description: optionalString,
        startDate: optionalString,
        endDate: optionalString,
        link: optionalString,
        techStack: optionalString,
      }),
    )
    .optional(),
});

export type ProjectValues = z.infer<typeof projectSchema>;

export type Projects = NonNullable<
  z.infer<typeof projectSchema>["projects"]
>[number];

export type SummaryValues = z.infer<typeof summarySchema>;

export const resumeSchema = z.object({
  ...generalInfoSchema.shape,
  ...personalInfoSchema.shape,
  ...workExperienceSchema.shape,
  ...educationSchema.shape,
  ...skillsSchema.shape,
  ...summarySchema.shape,
  ...projectSchema.shape,
  colorHex: optionalString,
  borderStyle: optionalString,
  fontStyle: optionalString,
});
export type ResumeValues = Omit<z.infer<typeof resumeSchema>, "photo"> & {
  id?: string;
  photo?: File | string | null;
};

export const generateWorkExperienceSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Required")
    .min(20, "Must be at least 20 characters"),
});

export type GenerateWorkExperienceInput = z.infer<
  typeof generateWorkExperienceSchema
>;

export const generateSummarySchema = z.object({
  jobTitle: optionalString,
  ...workExperienceSchema.shape,
  ...educationSchema.shape,
  ...projectSchema.shape,
  ...skillsSchema.shape,
});

export type GenerateSummaryInput = z.infer<typeof generateSummarySchema>;

export const generateProjectsSchema = z.object({
  description: z
    .string()
    .trim()
    .min(1, "Required")
    .min(20, "Must be at least 20 characters"),
});
export type GenerateProjectsInput = z.infer<typeof generateProjectsSchema>;

export const interviewFormSchema = z.object({
  jobPosition: optionalString,
  jobDescription: optionalString,
  jobExperience: optionalString,
});

export type InterviewFormValues = z.infer<typeof interviewFormSchema>;

export const interviewQuestionSchema = z.object({
  question: z.string().min(1),
  answer: z.string().nullable(),
  category: z.string().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  tags: z.array(z.string().min(1)).nonempty(),
  notes: z.string().nullable(),
});

export type InterviewQuestion = z.infer<typeof interviewQuestionSchema>;

export const mockInterviewSchema = z.object({
  jsonMockResp: z.string().min(1),
  jobPosition: z.string().min(1),
  jobDesc: z.string().min(1),
  jobExperience: z.string().min(1),
  createdBy: z.string().min(1),
  mockId: z.string().min(1),
});

export type MockInterview = z.infer<typeof mockInterviewSchema>;

export const userAnswerSchema = z.object({
  mockIdRef: z.number().int().positive(),
  question: z.string().min(1),
  correctAns: z.string().nullable(),
  userAns: z.string().nullable(),
  feedback: z.string().nullable(),
  rating: z.enum(["POOR", "AVERAGE", "GOOD", "EXCELLENT"]).nullable(),
  userEmail: z.string().email().nullable(),
  createdAt: z.date().default(() => new Date()),
});

export type UserAnswer = z.infer<typeof userAnswerSchema>;