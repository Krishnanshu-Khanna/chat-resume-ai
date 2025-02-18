"use client";

import { Button } from "@/components/ui/button";
import usePremiumModal from "@/hooks/usePremiumModal";
import { PlusSquare } from "lucide-react";
import Link from "next/link";

interface CreateResumeButtonProps {
  canCreate: boolean;
}

export default function CreateResumeButton({
  canCreate,
}: CreateResumeButtonProps) {
  const premiumModal = usePremiumModal();

  if (canCreate) {
    return (
      <Button
        asChild
        className="mx-auto flex items-center gap-2 rounded-xl bg-white/80 px-6 py-3 font-semibold text-indigo-600 shadow-lg backdrop-blur-md transition-all duration-300 hover:bg-white hover:shadow-xl"
      >
        <Link href="/editor" className="flex items-center gap-2">
          <PlusSquare className="size-5 text-indigo-500 transition-transform group-hover:rotate-90" />
          <span>New Resume</span>
        </Link>
      </Button>
    );
  }

  return (
    <Button
      onClick={() => premiumModal.setOpen(true)}
      className="mx-auto flex w-fit gap-2"
    >
      <PlusSquare className="size-5" />
      New resume
    </Button>
  );
}
