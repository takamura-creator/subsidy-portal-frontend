"use client";

interface Step {
  label: string;
}

interface WizardStepperProps {
  currentStep: number;
  steps: Step[];
}

export default function WizardStepper({ currentStep, steps }: WizardStepperProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;

        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  isCompleted
                    ? "bg-primary text-white"
                    : isCurrent
                      ? "bg-bg-card text-primary border-2 border-primary"
                      : "bg-border/30 text-text2"
                }`}
              >
                {isCompleted ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-xs whitespace-nowrap ${
                  isCurrent ? "text-primary font-medium" : isCompleted ? "text-text" : "text-text2"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mx-2 mt-[-18px] ${
                  isCompleted ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
