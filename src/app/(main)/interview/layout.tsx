import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your Interviews",
};

export default function InterviewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
