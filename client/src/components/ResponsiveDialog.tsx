import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ResponsiveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * ResponsiveDialog - Dialog wrapper that becomes full screen on mobile
 * 
 * Usage:
 * <ResponsiveDialog
 *   open={isOpen}
 *   onOpenChange={setIsOpen}
 *   title="عنوان النافذة"
 *   description="وصف اختياري"
 *   footer={<Button>حفظ</Button>}
 * >
 *   {content}
 * </ResponsiveDialog>
 */
export default function ResponsiveDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: ResponsiveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          // Full screen on mobile
          "max-h-screen overflow-y-auto",
          "md:max-h-[90vh]",
          // Full width on mobile, max-w on desktop
          "w-full max-w-full",
          "md:max-w-2xl",
          // Remove rounded corners on mobile for full screen effect
          "rounded-none md:rounded-lg",
          // Custom positioning for mobile
          "fixed inset-0",
          "md:relative md:inset-auto",
          className
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl md:text-2xl">{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        
        <div className="py-4 overflow-y-auto flex-1">
          {children}
        </div>

        {footer && (
          <DialogFooter className="flex-row gap-2 sm:flex-row sm:justify-end sm:space-x-2">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
