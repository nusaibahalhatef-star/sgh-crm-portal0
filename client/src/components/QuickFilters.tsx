import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface QuickFilter {
  label: string;
  value: string;
  count?: number;
  color?: string;
}

interface QuickFiltersProps {
  filters: QuickFilter[];
  activeFilter: string;
  onFilterChange: (value: string) => void;
}

/**
 * QuickFilters Component
 * 
 * مكون فلاتر سريعة لتصفية البيانات حسب الحالة
 * يعرض أزرار فلترة سريعة مع عدد العناصر لكل حالة
 */
export default function QuickFilters({ filters, activeFilter, onFilterChange }: QuickFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((filter) => {
        const isActive = activeFilter === filter.value;
        return (
          <Button
            key={filter.value}
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className={`
              ${isActive ? 'shadow-md' : ''}
              ${filter.color && !isActive ? filter.color : ''}
            `}
          >
            {filter.label}
            {filter.count !== undefined && (
              <Badge 
                variant={isActive ? "secondary" : "outline"} 
                className="mr-2 h-5 min-w-[20px] rounded-full px-1.5"
              >
                {filter.count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
