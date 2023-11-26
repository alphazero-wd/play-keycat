"use client";

import * as ProgressPrimitive from "@radix-ui/react-progress";
import * as React from "react";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    const timeout = setTimeout(() => setProgress(value || 0), 500);
    return () => clearTimeout(timeout);
  }, [value]);

  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={progress}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className,
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full w-full flex-1 bg-gradient-to-l from-primary from-10% via-blue-600 via-25% to-purple-600 to-50% transition-all dark:via-blue-300 dark:to-purple-300"
        style={{ transform: `translateX(-${100 - (progress || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  );
});
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
