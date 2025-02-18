"use server";

import {
  generateProjectsSchema,
  GenerateSummaryInput,
  generateSummarySchema,
  GenerateWorkExperienceInput,
  generateWorkExperienceSchema,
  Projects,
  WorkExperience,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { canUseAITools } from "@/lib/permissions";
import generateAIResponse from "@/lib/gemini";



export async function generateSummary(input: GenerateSummaryInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");
   const subscriptionLevel = await getUserSubscriptionLevel(userId);

   if (!canUseAITools(subscriptionLevel)) {
     throw new Error("Upgrade your subscription to use this feature");
   }
  const { jobTitle, workExperiences, educations, skills, projects } = generateSummarySchema.parse(input);
  const systemMessage = `You are a job resume generator AI.  Generate a concise and impactful professional summary from the provided data.  Focus on quantifiable achievements and keywords relevant to the job market.  The summary should be plain text only, without any formatting or extra embellishments.  It must be ATS-friendly and designed to quickly capture a recruiter's attention.  Do not include any introductory or concluding phrases like "I am a..." or "In summary...".  Just provide the summary text.`;
  const userMessage =
    `Job Title: ${jobTitle || "N/A"}\n\n` +
    `Work Experience:\n${workExperiences?.map((exp) => `Position: ${exp.position} at ${exp.company}, ${exp.city} (${exp.startDate} - ${exp.endDate})\nDescription: ${exp.description}`).join("\n\n")}\n\n` +
    `Education:\n${educations?.map((edu) => `Degree: ${edu.degree} at ${edu.school} (${edu.startDate} - ${edu.endDate}) with grade ${edu.grade}`).join("\n\n")}\n\n` +
    `Projects:\n${projects?.map((pro) => `Project: ${pro.title} using ${pro.techStack} (${pro.startDate} - ${pro.endDate})\nDescription: ${pro.description}`).join("\n\n")}\n\n` +
    `Skills: ${skills}`;

  return await generateAIResponse(systemMessage, userMessage);
}

export async function generateWorkExperience(
  input: GenerateWorkExperienceInput,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Upgrade your subscription to use this feature");
  }

  const { description } = generateWorkExperienceSchema.parse(input);

  const systemMessage = `
  You are a job resume generator AI. Your task is to generate a single work experience entry based on the user input.
  Your response must adhere to the following structure. You can omit fields if they can't be inferred from the provided data, but don't add any new ones.

  Job title: <job title>
  Company: <company name>
  Start date: <format: YYYY-MM-DD> (only if provided)
  End date: <format: YYYY-MM-DD> (only if provided)
  Description: <an optimized description in bullet format, might be inferred from the job title>
  `;

  const userMessage = `
  Please provide a work experience entry from this description:
  ${description}
  `;

  

  const aiResponse = await generateAIResponse(systemMessage, userMessage);

  if (!aiResponse) {
    throw new Error("Failed to generate AI response");
  }

  console.log("aiResponse", aiResponse);

  return {
    position: aiResponse.match(/Job title: (.*)/)?.[1] || "",
    company: aiResponse.match(/Company: (.*)/)?.[1] || "",
    description: (aiResponse.match(/Description:([\s\S]*)/)?.[1] || "").trim(),
    startDate: aiResponse.match(/Start date: (\d{4}-\d{2}-\d{2})/)?.[1],
    endDate: aiResponse.match(/End date: (\d{4}-\d{2}-\d{2})/)?.[1],
  } satisfies WorkExperience;
}
export async function generateProjects(input: GenerateWorkExperienceInput) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const subscriptionLevel = await getUserSubscriptionLevel(userId);

  if (!canUseAITools(subscriptionLevel)) {
    throw new Error("Upgrade your subscription to use this feature");
  }

  const { description } = generateProjectsSchema.parse(input);
  const systemMessage =
    "You are a job resume generator AI. Generate a structured project entry.";
  const userMessage = `Description: ${description}`;

  const aiResponse = await generateAIResponse(systemMessage, userMessage);
  return {
    startDate: aiResponse.match(/Start date: (\d{4}-\d{2}-\d{2})/)?.[1],
    endDate: aiResponse.match(/End date: (\d{4}-\d{2}-\d{2})/)?.[1],
    title: aiResponse.match(/Project title: (.*)/)?.[1] || "",
    techStack: aiResponse.match(/Tech stack: (.*)/)?.[1] || "",
    description: (aiResponse.match(/Description:([\s\S]*)/)?.[1] || "").trim(),
    link: aiResponse.match(/Project link: (.*)/)?.[1] || "",
  } satisfies Projects;
}
