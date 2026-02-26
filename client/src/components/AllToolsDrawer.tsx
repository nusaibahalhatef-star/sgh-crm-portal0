import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Clock } from "lucide-react";
import { useRecentlyUsed } from "@/hooks/useRecentlyUsed";
import type { NavItem, NavGroup } from "./DashboardSidebarV2";

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
      <SheetContent side="right" className="w-full sm:w-[600px] p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle className="text-right text-xl font-bold">كل الأدوات</SheetTitle>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-80px)]">
          <div className="p-6 space-y-8">
            {/* Recently Used Section */}
            {recentItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground">المستخدمة مؤخراً</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {recentItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.href;
                    return (
                      <Button
                        key={item.id}
                        variant={isActive ? "default" : "outline"}
                        className="h-auto py-4 px-4 flex flex-col items-center justify-center gap-2 text-center"
                        onClick={() => handleNavigate(item.href)}
                      >
                        <Icon className="h-6 w-6" />
                        <span className="text-sm font-medium">{item.title}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All Tools Groups - Flat Layout (No Accordions) */}
            {allToolsGroups.map((group) => {
              const GroupIcon = group.icon;
              return (
                <div key={group.label}>
                  <div className="flex items-center gap-2 mb-4">
                    <GroupIcon className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">{group.label}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location === item.href;
                      return (
                        <Button
                          key={item.id}
                          variant={isActive ? "default" : "outline"}
                          className="h-auto py-4 px-4 flex flex-col items-center justify-center gap-2 text-center"
                          onClick={() => handleNavigate(item.href)}
                        >
                          <Icon className="h-6 w-6" />
                          <span className="text-sm font-medium">{item.title}</span>
                          {item.hasDot && (
                            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
                          )}
                        </Button>
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
