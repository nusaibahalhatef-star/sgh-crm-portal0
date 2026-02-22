import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FlashUpdateProps {
  children: ReactNode;
  /** The value to watch for changes */
  watchValue: unknown;
  /** Flash color class (default: blue highlight) */
  flashColor?: string;
  /** Duration of the flash in ms */
  duration?: number;
  className?: string;
  /** Whether to show a subtle border flash */
  borderFlash?: boolean;
}

/**
 * FlashUpdate - يضيف تأثير وميض خلفي عند تغيير القيمة المراقبة
 * مثالي لتنبيه المستخدم عند تحديث البيانات في الوقت الحقيقي
 */
export default function FlashUpdate({
  children,
  watchValue,
  flashColor = "bg-blue-50/80",
  duration = 1200,
  className,
  borderFlash = false,
}: FlashUpdateProps) {
  const [isFlashing, setIsFlashing] = useState(false);
  const previousValueRef = useRef(watchValue);
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      previousValueRef.current = watchValue;
      return;
    }

    // Deep comparison for objects
    const hasChanged = JSON.stringify(watchValue) !== JSON.stringify(previousValueRef.current);

    if (hasChanged) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), duration);
      previousValueRef.current = watchValue;
      return () => clearTimeout(timer);
    }
  }, [watchValue, duration]);

  return (
    <div
      className={cn(
        "relative transition-all duration-500",
        className
      )}
    >
      {/* Flash overlay */}
      <div
        className={cn(
          "absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-500",
          flashColor,
          isFlashing ? "opacity-100" : "opacity-0"
        )}
      />
      {/* Border flash */}
      {borderFlash && (
        <div
          className={cn(
            "absolute inset-0 rounded-lg pointer-events-none border-2 transition-all duration-500",
            isFlashing
              ? "border-primary/40 shadow-[0_0_12px_rgba(0,163,224,0.15)]"
              : "border-transparent shadow-none"
          )}
        />
      )}
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
