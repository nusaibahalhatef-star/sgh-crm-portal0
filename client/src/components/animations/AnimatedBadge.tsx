import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedBadgeProps {
  count: number;
  className?: string;
  maxDisplay?: number;
  showZero?: boolean;
  pulseOnChange?: boolean;
  pulseDuration?: number; // ms
}

/**
 * AnimatedBadge - شارة رقمية متحركة مع تأثير نبض عند التحديث
 */
export default function AnimatedBadge({
  count,
  className,
  maxDisplay = 99,
  showZero = false,
  pulseOnChange = true,
  pulseDuration = 1000,
}: AnimatedBadgeProps) {
  const [isPulsing, setIsPulsing] = useState(false);
  const [isScaling, setIsScaling] = useState(false);
  const previousCountRef = useRef(count);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousCountRef.current = count;
      return;
    }

    if (count !== previousCountRef.current && pulseOnChange) {
      // Scale bounce effect
      setIsScaling(true);
      setTimeout(() => setIsScaling(false), 300);

      // Pulse ring effect (only when count increases)
      if (count > previousCountRef.current) {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), pulseDuration);
      }
    }

    previousCountRef.current = count;
  }, [count, pulseOnChange, pulseDuration]);

  if (!showZero && count <= 0) return null;

  const display = count > maxDisplay ? `${maxDisplay}+` : String(count);

  return (
    <span className={cn("relative inline-flex", className)}>
      {/* Pulse ring */}
      {isPulsing && (
        <span
          className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"
          style={{ animationDuration: `${pulseDuration}ms`, animationIterationCount: 2 }}
        />
      )}
      {/* Badge */}
      <span
        className={cn(
          "relative inline-flex items-center justify-center",
          "min-w-[18px] h-[18px] px-1",
          "text-[10px] font-bold text-white",
          "bg-red-500 rounded-full",
          "transition-transform duration-300 ease-out",
          isScaling && "scale-125"
        )}
      >
        {display}
      </span>
    </span>
  );
}
