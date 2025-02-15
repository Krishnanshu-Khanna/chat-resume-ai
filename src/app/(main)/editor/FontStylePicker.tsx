"use client";
import { Button } from "@/components/ui/button";
import { PencilIcon } from "lucide-react";
import { useSubscriptionLevel } from "../SubscriptionLevelProvider";
import usePremiumModal from "@/hooks/usePremiumModal";
import { canUseCustomizations } from "@/lib/permissions";

export const FontStyles = {
  serif: "font-serif", // Use `font-` prefix for Tailwind's font utilities
  sansSerif: "font-sans",
  mono: "font-mono",
  default: "",
};

const fontStyles = Object.values(FontStyles);

interface FontStyleButtonProps {
  fontStyle: string | undefined;
  onChange: (fontStyle: string) => void;
}

export default function FontStyleButton({
  fontStyle,
  onChange,
}: FontStyleButtonProps) {
   const subscriptionLevel = useSubscriptionLevel();

  const premiumModal = usePremiumModal();

  function handleClick() {
    if (!canUseCustomizations(subscriptionLevel)) {
      premiumModal.setOpen(true);
      return;
    }
    const currentIndex = fontStyle ? fontStyles.indexOf(fontStyle) : -1;
    const nextIndex = (currentIndex + 1) % fontStyles.length;
    onChange(fontStyles[nextIndex]);    
  }

  return (
    <Button
      variant="outline"
      size="icon"
      title="Change font style"
      onClick={handleClick}
    >
      <PencilIcon className="h-5 w-5" />
    </Button>
  );
}
