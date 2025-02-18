'use server';
import prisma from "@/lib/prisma";

export async function getQuestions(mockId: string) {
  // ✅ Accept `mockId` as a string, not an object.
  try {
    const interview = await prisma.mockInterview.findUnique({
      where: { mockId },
    });

    return interview;
  } catch (error) {
    console.error("Database error:", error);
    throw new Error("Failed to fetch interview details");
  }
}
