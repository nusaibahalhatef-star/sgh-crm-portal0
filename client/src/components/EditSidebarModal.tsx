import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { GripVertical, X, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import type { NavItem, NavGroup } from "./DashboardSidebarV2";

interface EditSidebarModalProps {
  isOpen: boolean;
  onClose: () => void;
  allToolsGroups: NavGroup[];
  allNavItems: NavItem[];
  visibleItemIds: string[];
  onSave: (newVisibleIds: string[]) => void;
}

const MAX_VISIBLE_ITEMS = 10;

export default function EditSidebarModal({
  isOpen,
  onClose,
  allToolsGroups,
  allNavItems,
  visibleItemIds,
  onSave,
}: EditSidebarModalProps) {
  const [localVisibleIds, setLocalVisibleIds] = useState<string[]>(visibleItemIds);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // تحديث القائمة المحلية عند فتح الـ modal
  useEffect(() => {
    if (isOpen) {
      setLocalVisibleIds(visibleItemIds);
    }
  }, [isOpen, visibleItemIds]);

  // الحصول على العناصر المرئية
  const visibleItems = localVisibleIds
    .map(id => allNavItems.find(item => item.id === id))
    .filter(Boolean) as NavItem[];

  // الحصول على العناصر المخفية مجمعة حسب القسم
  const hiddenItemsByGroup = allToolsGroups.map(group => ({
    ...group,
    items: group.items.filter(item => !localVisibleIds.includes(item.id)),
  })).filter(group => group.items.length > 0);

  // إزالة عنصر من القائمة المرئية
  const removeItem = (itemId: string) => {
    // لا يمكن إزالة "الرئيسية"
    if (itemId === "home") return;
    setLocalVisibleIds(prev => prev.filter(id => id !== itemId));
  };

  // إضافة عنصر إلى القائمة المرئية
  const addItem = (itemId: string) => {
    if (localVisibleIds.length >= MAX_VISIBLE_ITEMS) return;
    if (localVisibleIds.includes(itemId)) return;
    setLocalVisibleIds(prev => [...prev, itemId]);
  };

  // بدء السحب
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // السحب فوق عنصر آخر
  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newItems = [...localVisibleIds];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setLocalVisibleIds(newItems);
    setDraggedIndex(index);
  };

  // انتهاء السحب
  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  // حفظ التغييرات
  const handleSave = () => {
    onSave(localVisibleIds);
    onClose();
  };

  // إعادة تعيين إلى الافتراضي
  const handleReset = () => {
    const defaultIds = ["home", "leads", "appointments", "offer-leads", "camp-registrations", "customers", "tasks", "reports", "whatsapp", "management"];
    setLocalVisibleIds(defaultIds);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="text-right text-xl font-bold">تعديل الشريط الجانبي</DialogTitle>
          <DialogDescription className="text-right text-sm text-muted-foreground">
            اختر العناصر التي تريد عرضها في الشريط الجانبي (حد أقصى {MAX_VISIBLE_ITEMS} عناصر)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 max-h-[calc(90vh-180px)]">
          <div className="p-6 space-y-6">
            {/* العناصر المرئية */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">العناصر المرئية</h3>
                  <span className={cn(
                    "text-sm font-medium px-2 py-0.5 rounded-full",
                    localVisibleIds.length >= MAX_VISIBLE_ITEMS
                      ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                  )}>
                    {localVisibleIds.length}/{MAX_VISIBLE_ITEMS}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-xs"
                >
                  إعادة تعيين
                </Button>
              </div>

              <div className="space-y-2">
                {visibleItems.map((item, index) => {
                  const Icon = item.icon;
                  const isHome = item.id === "home";
                  return (
                    <div
                      key={item.id}
                      draggable={!isHome}
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDragEnd={handleDragEnd}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border bg-card",
                        !isHome && "cursor-move hover:bg-accent/50",
                        draggedIndex === index && "opacity-50",
                        isHome && "opacity-60"
                      )}
                    >
                      {!isHome && (
                        <GripVertical className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      )}
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm font-medium flex-1 text-right">{item.title}</span>
                      {!isHome && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      {isHome && (
                        <span className="text-xs text-muted-foreground">ثابت</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* العناصر المخفية */}
            {hiddenItemsByGroup.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">العناصر المخفية</h3>
                <div className="space-y-4">
                  {hiddenItemsByGroup.map((group) => {
                    const GroupIcon = group.icon;
                    return (
                      <div key={group.label}>
                        <div className="flex items-center gap-2 mb-2">
                          <GroupIcon className="h-4 w-4 text-muted-foreground" />
                          <h4 className="text-sm font-medium text-muted-foreground">{group.label}</h4>
                        </div>
                        <div className="space-y-2">
                          {group.items.map((item) => {
                            const Icon = item.icon;
                            const canAdd = localVisibleIds.length < MAX_VISIBLE_ITEMS;
                            return (
                              <div
                                key={item.id}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-lg border bg-muted/30",
                                  canAdd && "hover:bg-muted/50"
                                )}
                              >
                                <Icon className="h-5 w-5 flex-shrink-0 text-muted-foreground" />
                                <span className="text-sm font-medium flex-1 text-right text-muted-foreground">
                                  {item.title}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => addItem(item.id)}
                                  disabled={!canAdd}
                                  className="h-7 w-7 p-0 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900/30"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>
            إلغاء
          </Button>
          <Button onClick={handleSave}>
            حفظ التغييرات
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
