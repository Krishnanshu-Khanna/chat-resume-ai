"use client";
import logo from "@/assets/logo.png";
import resumePreview from "@/assets/resume-preview3.png";
import { Button } from "@/components/ui/button";
import { Youtube } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [showYT, setShowYT] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setShowYT(false);
    }, 9000);
  }, []);
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-100 px-5 py-12 text-center text-gray-900 md:flex-row md:text-start lg:gap-12">
      <div className="max-w-prose space-y-3">
        <Image
          src={logo}
          alt="CV Helper Logo"
          width={150}
          height={150}
          className="mx-auto md:ms-0"
        />
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Create the{" "}
          <span className="inline-block bg-gradient-to-r from-purple-700 to-purple-400 bg-clip-text text-transparent">
            Perfect Resume
          </span>{" "}
          in Minutes
        </h1>
        <p className="text-lg text-gray-500">
          <span className="font-bold">CVHelper</span> is an AI-driven resume
          builder designed to help job seekers craft professional resumes
          effortlessly. Enhance your resume with AI, practice with mock
          interviews, and secure your dream job!
        </p>
        <Button asChild size="lg" variant="premium">
          <Link href="/resumes">Get started</Link>
        </Button>
      </div>

      <div>
        <Image
          src={resumePreview}
          alt="Resume preview"
          loading="lazy"
          width={600}
          className="shadow-md lg:rotate-[1.5deg]"
        />
      </div>

      {showYT && (
        <Link
          href="https://www.youtube.com/watch?v=X6uEMJ-hElM&utm_source=cvhelper&utm_medium=button&utm_campaign=tutorial"
          target="_blank"
          className="fixed bottom-5 left-5 flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white shadow-lg transition duration-200 hover:bg-red-700"
        >
          <Youtube size={18} />
          <span className="hidden text-sm md:block">Watch Tutorial</span>
        </Link>
      )}
    </main>
  );
}
