import { useState, useRef, useEffect } from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
}

export default function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "اختر...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = useState(false);

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleSelectAll = () => {
    onChange(options.map((opt) => opt.value));
  };

  const selectedLabels = selected
    .map((val) => options.find((opt) => opt.value === val)?.label)
    .filter(Boolean);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between text-right",
            selected.length === 0 && "text-muted-foreground",
            className
          )}
        >
          <div className="flex items-center gap-1 flex-wrap flex-1 overflow-hidden">
            {selected.length === 0 ? (
              <span>{placeholder}</span>
            ) : selected.length === 1 ? (
              <span>{selectedLabels[0]}</span>
            ) : (
              <span>
                {selected.length} {selected.length === 1 ? "مصدر" : selected.length === 2 ? "مصدران" : "مصادر"}
              </span>
            )}
          </div>
          <ChevronDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="max-h-[300px] overflow-auto">
          {/* Header with Select All / Clear All */}
          <div className="flex items-center justify-between p-2 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSelectAll}
              className="h-8 text-xs"
            >
              اختر الكل
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-8 text-xs"
              disabled={selected.length === 0}
            >
              مسح الكل
            </Button>
          </div>

          {/* Options List */}
          <div className="p-1">
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <div
                  key={option.value}
                  onClick={() => handleToggle(option.value)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-2 cursor-pointer rounded-sm hover:bg-accent text-right",
                    isSelected && "bg-accent"
                  )}
                >
                  <div
                    className={cn(
                      "h-4 w-4 border rounded flex items-center justify-center shrink-0",
                      isSelected
                        ? "bg-primary border-primary"
                        : "border-input"
                    )}
                  >
                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                  </div>
                  <span className="flex-1 text-sm">{option.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Items Preview */}
        {selected.length > 0 && (
          <div className="border-t p-2">
            <div className="flex flex-wrap gap-1">
              {selectedLabels.map((label, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="text-xs"
                >
                  {label}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const value = options.find((opt) => opt.label === label)?.value;
                      if (value) handleToggle(value);
                    }}
                    className="mr-1 hover:bg-muted rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
