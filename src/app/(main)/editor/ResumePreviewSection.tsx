import ResumePreview from "@/components/ResumePreview";
import { cn } from "@/lib/utils";
import { ResumeValues } from "@/lib/validation";
import ColorPicker from "./ColorPicker";
import BorderStyleButton from "./BorderStyleButton";
import FontStyleButton from "./FontStylePicker";

interface ResumePreviewSectionProps {
  resumeData: ResumeValues;
  setResumeData: (data: ResumeValues) => void;
  className?: string;
}

export default function ResumePreviewSection({
  resumeData,
  setResumeData,
  className,
}: ResumePreviewSectionProps) {
  return (
    <div
      className={cn("group relative hidden w-full md:flex md:w-1/2", className)}
    >
      {/* Toolbar for customizations */}
      <div className="absolute left-1 top-1 flex flex-col gap-3 opacity-50 transition-opacity group-hover:opacity-70 lg:left-3 lg:top-3 xl:opacity-70">
        <ColorPicker
          color={resumeData.colorHex}
          onChange={(color) =>
            setResumeData({ ...resumeData, colorHex: color.hex })
          }
        />
        <BorderStyleButton
          borderStyle={resumeData.borderStyle}
          onChange={(borderStyle) =>
            setResumeData({ ...resumeData, borderStyle })
          }
        />
        <FontStyleButton
          fontStyle={resumeData.fontStyle}
          onChange={(fontStyle) => setResumeData({ ...resumeData, fontStyle })}
        />
      </div>

      {/* Resume Preview Area */}
      <div className="flex w-full justify-center overflow-y-auto bg-secondary p-3">
        <ResumePreview
          resumeData={resumeData}
          className={cn(
            "max-w-2xl shadow-md",
            resumeData.fontStyle || "", // Default to sans-serif if undefined
          )}
        />
      </div>
    </div>
  );
}
