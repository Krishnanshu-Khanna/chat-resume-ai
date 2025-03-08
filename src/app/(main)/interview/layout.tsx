import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Interviews",
  description: "Practice your interview skills with AI-powered mock interviews",
};

export default function InterviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
