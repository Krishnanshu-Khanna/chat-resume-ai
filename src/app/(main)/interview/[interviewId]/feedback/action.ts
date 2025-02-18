"use server";

import prisma from "@/lib/prisma";

export const getFeedback = async (mockId: string) => {
  try {
    const result = await prisma.userAnswer.findMany({
        where: {mockIdRef: mockId},
        orderBy: {id: 'asc'},
    });

    // Calculate the average rating dynamically, only including valid ratings
    const validRatings = result
      .map((item) => parseFloat(item.rating ?? "0"))
      .filter((rating) => !isNaN(rating));

    const totalRating = validRatings.reduce((sum, rating) => sum + rating, 0);
    const avgRating =
      validRatings.length > 0
        ? (totalRating / validRatings.length).toFixed(1)
        : "N/A";

    return { feedbackList: result, averageRating: avgRating };
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return { feedbackList: [], averageRating: "N/A" };
  }
};
