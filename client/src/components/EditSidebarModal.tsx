import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Check } from "lucide-react";
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

  // تحديث القائمة المحلية عند فتح الـ modal
  useEffect(() => {
    if (isOpen) {
      setLocalVisibleIds(visibleItemIds);
    }
  }, [isOpen, visibleItemIds]);

  // تبديل حالة العنصر
  const toggleItem = (itemId: string) => {
    // لا يمكن إزالة "الرئيسية"
    if (itemId === "home") return;

    setLocalVisibleIds(prev => {
      if (prev.includes(itemId)) {
        // إزالة العنصر
        return prev.filter(id => id !== itemId);
      } else {
        // إضافة العنصر إذا لم نصل للحد الأقصى
        if (prev.length >= MAX_VISIBLE_ITEMS) return prev;
        return [...prev, itemId];
      }
    });
  };

  // حفظ التغييرات
  const handleSave = () => {
    onSave(localVisibleIds);
    onClose();
  };

  // إعادة تعيين إلى الافتراضي
  const handleReset = () => {
    const defaultIds = ["home", "leads", "appointments", "offer-leads", "camp-registrations", "customers", "tasks", "reports", "whatsapp"];
    setLocalVisibleIds(defaultIds);
  };

  // الحصول على العناصر المرئية
  const visibleItems = localVisibleIds
    .map(id => allNavItems.find(item => item.id === id))
    .filter(Boolean) as NavItem[];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-lg font-bold text-foreground">تخصيص الأدوات مع الجمهور</h2>
            <p className="text-sm text-muted-foreground">
              يمكنك تحديد ما يصل إلى {MAX_VISIBLE_ITEMS} عناصر ({localVisibleIds.length}/{MAX_VISIBLE_ITEMS} محددة)
            </p>
          </div>
          <div className="w-9" /> {/* Spacer */}
        </div>

        {/* Content - Two Columns */}
        <div className="flex h-[calc(90vh-140px)]">
          {/* Left Column - "التفاعل مع الجمهور" (Selected Items) */}
          <div className="flex-1 border-l">
            <div className="px-4 py-3 border-b bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground">التفاعل مع الجمهور</h3>
            </div>
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {allToolsGroups.map((group) => {
                  // فلترة العناصر المحددة فقط
                  const selectedItems = group.items.filter(item => 
                    localVisibleIds.includes(item.id)
                  );

                  if (selectedItems.length === 0) return null;

                  const GroupIcon = group.icon;
                  return (
                    <div key={group.label} className="space-y-2">
                      {/* Group Header */}
                      <div className="flex items-center gap-2 px-2">
                        <GroupIcon className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-xs font-medium text-muted-foreground">{group.label}</h4>
                      </div>
                      
                      {/* Selected Items */}
                      <div className="space-y-1">
                        {selectedItems.map((item) => {
                          const Icon = item.icon;
                          const isHome = item.id === "home";
                          return (
                            <button
                              key={item.id}
                              onClick={() => toggleItem(item.id)}
                              disabled={isHome}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-right",
                                isHome 
                                  ? "bg-muted/50 cursor-not-allowed opacity-60"
                                  : "hover:bg-muted/70 cursor-pointer"
                              )}
                            >
                              <div className={cn(
                                "h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0",
                                "bg-primary border-primary"
                              )}>
                                <Check className="h-3 w-3 text-white" />
                              </div>
                              <Icon className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm flex-1">{item.title}</span>
                              {isHome && <span className="text-xs text-muted-foreground">(ثابت)</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right Column - "كل الأدوات" (All Items) */}
          <div className="flex-1">
            <div className="px-4 py-3 border-b bg-muted/30">
              <h3 className="text-sm font-semibold text-foreground">كل الأدوات</h3>
            </div>
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {allToolsGroups.map((group) => {
                  const GroupIcon = group.icon;
                  return (
                    <div key={group.label} className="space-y-2">
                      {/* Group Header */}
                      <div className="flex items-center gap-2 px-2">
                        <GroupIcon className="h-4 w-4 text-muted-foreground" />
                        <h4 className="text-xs font-medium text-muted-foreground">{group.label}</h4>
                      </div>
                      
                      {/* All Items */}
                      <div className="space-y-1">
                        {group.items.map((item) => {
                          const Icon = item.icon;
                          const isSelected = localVisibleIds.includes(item.id);
                          const isHome = item.id === "home";
                          const canSelect = localVisibleIds.length < MAX_VISIBLE_ITEMS || isSelected;
                          
                          return (
                            <button
                              key={item.id}
                              onClick={() => toggleItem(item.id)}
                              disabled={isHome || (!canSelect && !isSelected)}
                              className={cn(
                                "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-right",
                                isHome 
                                  ? "bg-muted/50 cursor-not-allowed opacity-60"
                                  : !canSelect && !isSelected
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:bg-muted/70 cursor-pointer"
                              )}
                            >
                              <div className={cn(
                                "h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                                isSelected 
                                  ? "bg-primary border-primary" 
                                  : "border-border"
                              )}>
                                {isSelected && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <Icon className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm flex-1">{item.title}</span>
                              {isHome && <span className="text-xs text-muted-foreground">(ثابت)</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <Button variant="ghost" onClick={handleReset} className="text-sm">
            إعادة تعيين
          </Button>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button onClick={handleSave}>
              حفظ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
