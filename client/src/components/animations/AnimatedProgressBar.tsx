import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedProgressBarProps {
  value: number; // 0-100
  className?: string;
  barClassName?: string;
  height?: string;
  delay?: number; // ms
  duration?: number; // ms
  showLabel?: boolean;
  labelPosition?: "inside" | "outside";
}

/**
 * AnimatedProgressBar - شريط تقدم متحرك ينمو من 0 إلى القيمة المحددة
 */
export default function AnimatedProgressBar({
  value,
  className,
  barClassName,
  height = "h-2",
  delay = 200,
  duration = 800,
  showLabel = false,
  labelPosition = "outside",
}: AnimatedProgressBarProps) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(Math.min(Math.max(value, 0), 100));
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <div className={cn("w-full", className)}>
      {showLabel && labelPosition === "outside" && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-muted-foreground">{Math.round(width)}%</span>
        </div>
      )}
      <div className={cn("w-full bg-muted rounded-full overflow-hidden", height)}>
        <div
          className={cn(
            "h-full rounded-full transition-all ease-out relative",
            barClassName || "bg-primary",
          )}
          style={{
            width: `${width}%`,
            transitionDuration: `${duration}ms`,
          }}
        >
          {showLabel && labelPosition === "inside" && width > 15 && (
            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
              {Math.round(width)}%
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
