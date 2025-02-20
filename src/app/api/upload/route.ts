import { generateEmbedding } from "@/app/(main)/chat/action";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import path from "path";
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 400 });
    }
    const formData = await request.formData();
    const pdf = formData.get("pdf") as File;
    if (!pdf) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    try {
        // Upload to Blob Storage (Vercel Blob or S3)
        const blob = await put(
            `resumes_pdf/${Date.now()}${path.extname(pdf.name)}`,
            pdf,
            {
                access: "public",
            },
        );
        const chatId=uuidv4();
        // Store the Blob URL in Neon DB
        await prisma.chatPDF.create({
          data: {
            userId: user.id,
            pdfUrl: blob.url,
            chatId,
          },
        });
        //generate embedding
        await generateEmbedding(chatId);

        return NextResponse.json({ success: true, url: blob.url,chatId:chatId });
    } catch {
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }
}

