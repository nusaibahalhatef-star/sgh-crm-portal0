import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: number;
  duration?: number; // ms
  className?: string;
  locale?: string;
  prefix?: string;
  suffix?: string;
  onComplete?: () => void;
}

/**
 * AnimatedCounter - عداد أرقام متحرك يعد من القيمة السابقة إلى الجديدة
 * يستخدم easeOutExpo للحصول على تأثير سلس يبدأ سريعاً ويتباطأ
 */
export default function AnimatedCounter({
  value,
  duration = 800,
  className,
  locale = "ar-SA",
  prefix = "",
  suffix = "",
  onComplete,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const previousValueRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Easing function: easeOutExpo
  const easeOutExpo = useCallback((t: number): number => {
    return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
  }, []);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const endValue = value;

    // Skip animation if value hasn't changed
    if (startValue === endValue && hasAnimatedRef.current) return;

    // Flash effect when value changes (not on first render)
    if (hasAnimatedRef.current && startValue !== endValue) {
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 600);
    }

    hasAnimatedRef.current = true;

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    startTimeRef.current = null;

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      const currentValue = Math.round(
        startValue + (endValue - startValue) * easedProgress
      );

      setDisplayValue(currentValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(endValue);
        previousValueRef.current = endValue;
        onComplete?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, easeOutExpo, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <span
      className={cn(
        "tabular-nums transition-colors duration-300",
        isUpdating && "text-primary",
        className
      )}
    >
      {prefix}
      {displayValue.toLocaleString(locale)}
      {suffix}
    </span>
  );
}
