/**
 * FilterPresets - مكون مشترك لحفظ واستدعاء مجموعات الفلاتر المستخدمة بكثرة
 * 
 * يوفر:
 * - حفظ مجموعات الفلاتر المخصصة
 * - استدعاء الفلاتر المحفوظة بنقرة واحدة
 * - حذف الفلاتر المحفوظة
 * - فلاتر سريعة مُعرّفة مسبقاً (Quick Presets)
 * - دعم الفلاتر المشتركة للمدراء
 */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, Save, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

export interface FilterPreset {
  id: string;
  name: string;
  filters: Record<string, any>;
  isQuick?: boolean;
  isShared?: boolean;
  createdBy?: string;
  createdAt?: Date;
}

interface QuickPreset {
  id: string;
  name: string;
  icon?: React.ReactNode;
  filters: Record<string, any>;
}

interface FilterPresetsProps {
  /** مفتاح الصفحة لحفظ الفلاتر */
  pageKey: string;
  /** الفلاتر الحالية */
  currentFilters: Record<string, any>;
  /** دالة تطبيق الفلاتر */
  onApplyFilters: (filters: Record<string, any>) => void;
  /** الفلاتر السريعة المُعرّفة مسبقاً */
  quickPresets?: QuickPreset[];
  /** هل المستخدم مدير */
  isAdmin?: boolean;
  /** CSS class إضافي */
  className?: string;
}

export default function FilterPresets({
  pageKey,
  currentFilters,
  onApplyFilters,
  quickPresets = [],
  isAdmin = false,
  className = "",
}: FilterPresetsProps) {
  const [presets, setPresets] = useState<FilterPreset[]>(() => {
    const saved = localStorage.getItem(`filter-presets-${pageKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [sharedPresets, setSharedPresets] = useState<FilterPreset[]>(() => {
    const saved = localStorage.getItem(`filter-presets-${pageKey}-shared`);
    return saved ? JSON.parse(saved) : [];
  });

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [saveAsShared, setSaveAsShared] = useState(false);

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast.error("الرجاء إدخال اسم للفلتر");
      return;
    }

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      filters: currentFilters,
      isShared: saveAsShared,
      createdAt: new Date(),
    };

    if (saveAsShared && isAdmin) {
      const updated = [...sharedPresets, newPreset];
      setSharedPresets(updated);
      localStorage.setItem(`filter-presets-${pageKey}-shared`, JSON.stringify(updated));
      toast.success(`تم حفظ الفلتر المشترك "${presetName}" بنجاح`);
    } else {
      const updated = [...presets, newPreset];
      setPresets(updated);
      localStorage.setItem(`filter-presets-${pageKey}`, JSON.stringify(updated));
      toast.success(`تم حفظ الفلتر "${presetName}" بنجاح`);
    }

    setPresetName("");
    setSaveAsShared(false);
    setSaveDialogOpen(false);
  };

  const handleDeletePreset = (id: string, isShared: boolean = false) => {
    if (isShared && isAdmin) {
      const updated = sharedPresets.filter(p => p.id !== id);
      setSharedPresets(updated);
      localStorage.setItem(`filter-presets-${pageKey}-shared`, JSON.stringify(updated));
      toast.success("تم حذف الفلتر المشترك");
    } else {
      const updated = presets.filter(p => p.id !== id);
      setPresets(updated);
      localStorage.setItem(`filter-presets-${pageKey}`, JSON.stringify(updated));
      toast.success("تم حذف الفلتر");
    }
  };

  const handleApplyPreset = (filters: Record<string, any>, name: string) => {
    onApplyFilters(filters);
    toast.success(`تم تطبيق الفلتر "${name}"`);
  };

  const hasActiveFilters = Object.values(currentFilters).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'string') return value !== '' && value !== 'all';
    return value !== null && value !== undefined;
  });

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={`gap-2 h-9 ${className}`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">الفلاتر المحفوظة</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {/* Quick Presets */}
          {quickPresets.length > 0 && (
            <>
              <DropdownMenuLabel className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                فلاتر سريعة
              </DropdownMenuLabel>
              <DropdownMenuGroup>
                {quickPresets.map(preset => (
                  <DropdownMenuItem
                    key={preset.id}
                    onClick={() => handleApplyPreset(preset.filters, preset.name)}
                    className="flex items-center gap-2"
                  >
                    {preset.icon}
                    <span>{preset.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Shared Presets (للمدراء) */}
          {isAdmin && sharedPresets.length > 0 && (
            <>
              <DropdownMenuLabel>الفلاتر المشتركة</DropdownMenuLabel>
              <DropdownMenuGroup>
                {sharedPresets.map(preset => (
                  <DropdownMenuItem
                    key={preset.id}
                    className="flex items-center justify-between group"
                  >
                    <button
                      onClick={() => handleApplyPreset(preset.filters, preset.name)}
                      className="flex-1 text-right"
                    >
                      {preset.name}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(preset.id, true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}

          {/* User Presets */}
          {presets.length > 0 && (
            <>
              <DropdownMenuLabel>الفلاتر المحفوظة</DropdownMenuLabel>
              <DropdownMenuGroup>
                {presets.map(preset => (
                  <DropdownMenuItem
                    key={preset.id}
                    className="flex items-center justify-between group"
                  >
                    <button
                      onClick={() => handleApplyPreset(preset.filters, preset.name)}
                      className="flex-1 text-right"
                    >
                      {preset.name}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(preset.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 rounded"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Save Current Filters */}
          <DropdownMenuItem
            onClick={() => setSaveDialogOpen(true)}
            disabled={!hasActiveFilters}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            <span>حفظ الفلاتر الحالية</span>
          </DropdownMenuItem>

          {presets.length === 0 && sharedPresets.length === 0 && quickPresets.length === 0 && (
            <div className="px-2 py-6 text-center text-sm text-muted-foreground">
              لا توجد فلاتر محفوظة
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Save Preset Dialog */}
      <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حفظ الفلاتر الحالية</DialogTitle>
            <DialogDescription>
              احفظ مجموعة الفلاتر الحالية لاستخدامها لاحقاً
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="preset-name">اسم الفلتر</Label>
              <Input
                id="preset-name"
                placeholder="مثال: مواعيد اليوم - قيد الانتظار"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSavePreset();
                  }
                }}
              />
            </div>
            {isAdmin && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="save-as-shared"
                  checked={saveAsShared}
                  onChange={(e) => setSaveAsShared(e.target.checked)}
                  className="rounded border-border"
                />
                <Label htmlFor="save-as-shared" className="cursor-pointer">
                  حفظ كفلتر مشترك (متاح لجميع المستخدمين)
                </Label>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSavePreset}>
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
