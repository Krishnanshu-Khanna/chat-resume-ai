import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interview",
};

export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
