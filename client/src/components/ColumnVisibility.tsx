import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

export interface ColumnConfig {
  key: string;
  label: string;
  defaultVisible: boolean;
}

interface ColumnVisibilityProps {
  columns: ColumnConfig[];
  visibleColumns: Record<string, boolean>;
  onVisibilityChange: (columnKey: string, visible: boolean) => void;
  onReset: () => void;
}

export function ColumnVisibility({
  columns,
  visibleColumns,
  onVisibilityChange,
  onReset,
}: ColumnVisibilityProps) {
  const visibleCount = Object.values(visibleColumns).filter(Boolean).length;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          <span className="hidden sm:inline">الأعمدة</span>
          <span className="text-xs text-muted-foreground">
            ({visibleCount}/{columns.length})
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">اختيار الأعمدة</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-auto p-1 text-xs"
            >
              إعادة تعيين
            </Button>
          </div>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {columns.map((column) => (
              <div key={column.key} className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id={`column-${column.key}`}
                  checked={visibleColumns[column.key] ?? column.defaultVisible}
                  onCheckedChange={(checked) =>
                    onVisibilityChange(column.key, checked as boolean)
                  }
                />
                <Label
                  htmlFor={`column-${column.key}`}
                  className="text-sm font-normal cursor-pointer flex-1"
                >
                  {column.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
