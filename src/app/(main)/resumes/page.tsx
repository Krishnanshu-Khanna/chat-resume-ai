import { canCreateResume } from "@/lib/permissions";
import prisma from "@/lib/prisma";
import { getUserSubscriptionLevel } from "@/lib/subscription";
import { resumeDataInclude } from "@/lib/types";
import { auth } from "@clerk/nextjs/server";
import { Metadata } from "next";
import CreateResumeButton from "./CreateResumeButton";
import ResumeItem from "./ResumeItem";
import Footer from "./Footer";

export const metadata: Metadata = {
  title: "Your resumes",
};

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const [resumes, totalCount, subscriptionLevel] = await Promise.all([
    prisma.resume.findMany({
      where: {
        userId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: resumeDataInclude,
    }),
    prisma.resume.count({
      where: {
        userId,
      },
    }),
    getUserSubscriptionLevel(userId),
  ]);

  return (
    <>
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-10">
      {/* Hero Section */}
      <section className="relative rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-lg">
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            Manage Your Resumes Effortlessly
          </h1>
          <p className="mt-2 text-lg opacity-90">
            Create, edit, and track your resumes in one place.
          </p>
        </div>
        <div className="mt-6 flex justify-center">
          <CreateResumeButton
            canCreate={canCreateResume(subscriptionLevel, totalCount)}
           
          />
        </div>
      </section>

      {/* Resume List Section */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-purple-100">Your Resumes</h2>
          <span className="text-gray-600  dark:text-purple-100">Total: {totalCount}</span>
        </div>

        {/* Grid Layout for Resumes */}
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {resumes.length > 0 ? (
            resumes.map((resume) => (
              <div
                key={resume.id}
                className="relative rounded-lg border dark:bg-primary-foreground p-4 shadow-md transition hover:shadow-lg"
              >
                <ResumeItem resume={resume} />
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              No resumes found. Start by creating one!
            </p>
          )}
        </div>
      </section>
    </main>
      <Footer />
    </>
  );
}
