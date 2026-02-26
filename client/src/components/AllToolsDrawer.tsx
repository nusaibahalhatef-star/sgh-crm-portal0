import { Sheet, SheetContent } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLocation } from "wouter";
import { Clock, X } from "lucide-react";
import { useRecentlyUsed } from "@/hooks/useRecentlyUsed";
import type { NavItem, NavGroup } from "./DashboardSidebarV2";
import { cn } from "@/lib/utils";

interface AllToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  allToolsGroups: NavGroup[];
  allNavItems: NavItem[];
}

export default function AllToolsDrawer({ 
  isOpen, 
  onClose, 
  allToolsGroups,
  allNavItems 
}: AllToolsDrawerProps) {
  const [location, setLocation] = useLocation();
  const { recentlyUsed } = useRecentlyUsed();

  const handleNavigate = (href: string) => {
    setLocation(href);
    onClose();
  };

  // Get recently used items with full details
  const recentItems = recentlyUsed
    .map(tool => allNavItems.find(item => item.id === tool.id))
    .filter(Boolean) as NavItem[];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:w-[700px] p-0 bg-background">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="إغلاق"
          >
            <X className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-foreground">كل الأدوات</h2>
          <div className="w-9" /> {/* Spacer for centering */}
        </div>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-6 space-y-8">
            {/* Recently Used Section - Top Icons Style */}
            {recentItems.length > 0 && (
              <div>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-base font-semibold text-foreground">المستخدمة مؤخراً</h3>
                </div>
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  {recentItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNavigate(item.href)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-xl transition-all min-w-[80px]",
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "hover:bg-muted text-foreground"
                        )}
                      >
                        <div className={cn(
                          "p-3 rounded-xl transition-colors",
                          isActive ? "bg-primary/20" : "bg-muted"
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <span className="text-xs font-medium text-center">{item.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Tools Groups - Text Lists Style */}
            {allToolsGroups.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.label} className="space-y-3">
                  {/* Group Header */}
                  <div className="flex items-center gap-2 px-2">
                    <GroupIcon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
                  </div>
                  
                  {/* Group Items - Simple List */}
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.href;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigate(item.href)}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-right",
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "hover:bg-muted text-foreground"
                          )}
                        >
                          <Icon className="h-5 w-5 flex-shrink-0" />
                          <span className="text-sm flex-1">{item.title}</span>
                          {item.hasDot && !isActive && (
                            <span className="h-2 w-2 bg-red-500 rounded-full flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
