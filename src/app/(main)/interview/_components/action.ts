"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function deleteMockInterview(mockId: string) {
  try {
    await prisma.mockInterview.delete({
      where: {
        mockId,
      },
    });
    return { success: true, message: "Mock interview deleted successfully" };
  } catch (error) {
    console.error("Error deleting mock interview:", error);
    return { success: false, message: "Failed to delete mock interview" };
  }
}

export async function getInterviewList(){
    const { userId } = await auth();
    try {
        if (!userId) {
            throw new Error("User ID is null");
        }
        const interviews = await prisma.mockInterview.findMany({
            where: {
                createdBy: userId,
            },
            orderBy: { createdAt: "desc" },
        });
        return interviews;
    } catch (error) {
        console.error("Error fetching interviews:", error);
        return [];
    }
}