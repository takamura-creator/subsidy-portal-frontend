"use client";

type StepStatus = "completed" | "current" | "upcoming";

interface Step {
  label: string;
  status: StepStatus;
}

interface StatusTimelineProps {
  currentStep: number;
  steps: Step[];
}

export default function StatusTimeline({ steps }: StatusTimelineProps) {
  return (
    <div className="w-full">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-initial">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  step.status === "completed"
                    ? "bg-primary text-white"
                    : step.status === "current"
                      ? "bg-primary text-white animate-pulse-accent"
                      : "bg-border/50 text-text2"
                }`}
              >
                {step.status === "completed" ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs whitespace-nowrap ${
                  step.status === "upcoming" ? "text-text2" : "text-text font-medium"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 mt-[-18px] ${
                  step.status === "completed" ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Mobile: vertical */}
      <div className="sm:hidden flex flex-col gap-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                  step.status === "completed"
                    ? "bg-primary text-white"
                    : step.status === "current"
                      ? "bg-primary text-white animate-pulse-accent"
                      : "bg-border/50 text-text2"
                }`}
              >
                {step.status === "completed" ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`w-0.5 h-4 mt-1 ${
                    step.status === "completed" ? "bg-primary" : "bg-border"
                  }`}
                />
              )}
            </div>
            <span
              className={`text-sm pt-1 ${
                step.status === "upcoming" ? "text-text2" : "text-text font-medium"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
