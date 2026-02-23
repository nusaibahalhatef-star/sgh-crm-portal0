import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

/**
 * ConfirmDeleteDialog - مكون حوار تأكيد الحذف الموحد
 * يمنع تكرار كود حوار التأكيد في كل صفحة
 * 
 * الاستخدام:
 * const deleteConfirm = useConfirmDialog<Offer>();
 * 
 * <ConfirmDeleteDialog
 *   open={deleteConfirm.isOpen}
 *   onOpenChange={deleteConfirm.closeConfirm}
 *   itemName={deleteConfirm.item?.title}
 *   itemType="العرض"
 *   onConfirm={() => deleteConfirm.confirm(() => deleteMutation.mutate(deleteConfirm.item!.id))}
 *   isLoading={deleteMutation.isPending}
 * />
 */

interface ConfirmDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName?: string | null;
  itemType?: string;
  title?: string;
  description?: string;
  onConfirm: () => void;
  isLoading?: boolean;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning";
}

export function ConfirmDeleteDialog({
  open,
  onOpenChange,
  itemName,
  itemType = "العنصر",
  title,
  description,
  onConfirm,
  isLoading = false,
  confirmText = "حذف",
  cancelText = "إلغاء",
  variant = "destructive",
}: ConfirmDeleteDialogProps) {
  const dialogTitle = title || "تأكيد الحذف";
  const dialogDescription = description || (
    itemName
      ? `هل أنت متأكد من حذف ${itemType} "${itemName}"؟ لا يمكن التراجع عن هذا الإجراء.`
      : `هل أنت متأكد من حذف هذا ${itemType}؟ لا يمكن التراجع عن هذا الإجراء.`
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent dir="rtl">
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row-reverse gap-2">
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={variant === "destructive" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
          >
            {isLoading ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                جاري الحذف...
              </>
            ) : (
              confirmText
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
