"use server"
import { generateEmbeddingsInPineconeVectorStore } from "@/lib/langchain";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function getUserDetails() {
  try {
    const user = await currentUser();
    if (!user) throw new Error("User not found");

    return {
      email: user.emailAddresses[0]?.emailAddress || "",
      firstName: user.firstName || "",
    };
  } catch (error) {
    console.error("Error fetching user details:", error);
    throw new Error("Failed to fetch user details");
  }
}

export async function generateEmbedding(docId: string) {
    const user = await currentUser();
    if (!user) {
        throw new Error("User not found");
    }
    //turn a PDF into embeddings 
    await generateEmbeddingsInPineconeVectorStore(docId);
  // Generate Embedding
    revalidatePath('/chat');

    return {completed:true};
}





