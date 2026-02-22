import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Direction = "up" | "down" | "left" | "right" | "none";

interface FadeInProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number; // ms
  duration?: number; // ms
  distance?: number; // px
  className?: string;
  once?: boolean; // animate only once (default true)
  threshold?: number; // intersection observer threshold
  as?: React.ElementType;
}

/**
 * FadeIn - مكون ظهور تدريجي مع اتجاه الحركة
 * يدعم IntersectionObserver للتفعيل عند الظهور في viewport
 */
export default function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 500,
  distance = 20,
  className,
  once = true,
  threshold = 0.1,
  as: Component = "div",
}: FadeInProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [once, threshold]);

  const getTransform = (): string => {
    if (isVisible) return "translate3d(0, 0, 0)";
    switch (direction) {
      case "up":
        return `translate3d(0, ${distance}px, 0)`;
      case "down":
        return `translate3d(0, -${distance}px, 0)`;
      case "left":
        return `translate3d(${distance}px, 0, 0)`;
      case "right":
        return `translate3d(-${distance}px, 0, 0)`;
      case "none":
        return "translate3d(0, 0, 0)";
    }
  };

  const Tag = Component as any;

  return (
    <Tag
      ref={ref}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * StaggeredList - قائمة بظهور متتابع لكل عنصر
 */
interface StaggeredListProps {
  children: ReactNode[];
  staggerDelay?: number; // ms between each item
  direction?: Direction;
  duration?: number;
  distance?: number;
  className?: string;
  itemClassName?: string;
}

export function StaggeredList({
  children,
  staggerDelay = 80,
  direction = "up",
  duration = 400,
  distance = 15,
  className,
  itemClassName,
}: StaggeredListProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn
          key={index}
          direction={direction}
          delay={index * staggerDelay}
          duration={duration}
          distance={distance}
          className={itemClassName}
        >
          {child}
        </FadeIn>
      ))}
    </div>
  );
}
