"use client";

import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import { Spinner } from "@/components/ui/spinner";

// Define all possible steps in the analysis process
const STEPS = [
  { id: "fetch", label: "Fetching file" },
  { id: "extract", label: "Extracting information" },
  { id: "prepare", label: "Preparing information" },
  { id: "analyze", label: "Analyzing information" },
  { id: "structure", label: "Structuring transactions" },
  { id: "decision", label: "Making final decision" },
  { id: "metrics", label: "Analyzing financial metrics" },
  { id: "save", label: "Saving to database" },
  { id: "complete", label: "Complete" },
];

// Map progress messages to step IDs
const getStepFromProgress = (progress: string): string => {
  if (progress.includes("Fetching file")) return "fetch";
  if (progress.includes("Extracting information")) return "extract";
  if (progress.includes("Preparing information")) return "prepare";
  if (progress.includes("Analyzing information")) return "analyze";
  if (progress.includes("Structuring information")) return "structure";
  if (progress.includes("Making final decision")) return "decision";
  if (progress.includes("Deep analysis of financial metrics")) return "metrics";
  if (progress.includes("Saving to database")) return "save";
  if (progress.includes("Complete")) return "complete";
  return "";
};

interface AnalysisStepperProps {
  currentProgress: string;
}

export function AnalysisStepper({ currentProgress }: AnalysisStepperProps) {
  const currentStepId = getStepFromProgress(currentProgress);

  // Find the index of the current step
  const currentStepIndex = STEPS.findIndex((step) => step.id === currentStepId);

  return (
    <div className="w-full max-w-3xl mx-auto my-8">
      <div className="flex flex-col gap-1">
        {STEPS.map((step, index) => {
          // Determine step status
          const isCompleted = currentStepIndex > index;
          const isCurrent = currentStepIndex === index;
          const isPending = currentStepIndex < index;

          return (
            <div key={step.id} className="flex items-start gap-4">
              {/* Step indicator */}
              <div className="relative flex items-center justify-center">
                <div
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full  text-xs font-medium",
                    isCompleted && "bg-black text-white",
                    isCurrent &&
                      "border-neutral-300 bg-neutral-100 text-neutral-600",
                    isPending &&
                      "border-neutral-200 bg-neutral-50 text-neutral-400"
                  )}
                >
                  {isCompleted ? (
                    <CheckIcon className="h-3 w-3" />
                  ) : isCurrent ? (
                    <Spinner size="xs" />
                  ) : (
                    <span></span>
                  )}
                  {/* {isCurrent && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Spinner />
                    </div>
                  )} */}
                </div>
                {/* Connector line */}

                {isCompleted && (
                  <div
                    className={cn(
                      "absolute left-2 top-5 h-[calc(100%-4px)] w-[1px] -translate-x-1/2",
                      isCompleted ? "bg-neutral-300" : "bg-neutral-200"
                    )}
                  />
                )}
              </div>

              {/* Step content */}
              <div className="flex flex-col pb-4">
                <div className="flex items-center">
                  <h3
                    className={cn(
                      "text-xs font-medium",
                      isCompleted && "text-neutral-800",
                      isCurrent && "text-neutral-800",
                      isPending && "text-neutral-400"
                    )}
                  >
                    {isCurrent ? (
                      <TextShimmer>{step.label}</TextShimmer>
                    ) : isCompleted ? (
                      step.label
                    ) : (
                      <span></span>
                    )}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
