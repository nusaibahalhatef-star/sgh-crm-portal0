import React, { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { getColumnWidth, type ColumnConfig } from "./ColumnVisibility";

interface ResizableTableProps {
  children: React.ReactNode;
  className?: string;
}

export function ResizableTable({ children, className }: ResizableTableProps) {
  return (
    <div className="relative w-full overflow-x-auto border border-border rounded-md" data-slot="table-container">
      <table
        data-slot="table"
        className={cn("caption-bottom text-sm border-collapse table-fixed w-full", className)}
        style={{ minWidth: 'max-content' }}
      >
        {children}
      </table>
    </div>
  );
}

interface ResizableHeaderCellProps {
  children: React.ReactNode;
  columnKey: string;
  width: number;
  minWidth?: number;
  maxWidth?: number;
  onResize: (key: string, width: number) => void;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function ResizableHeaderCell({
  children,
  columnKey,
  width,
  minWidth = 50,
  maxWidth = 500,
  onResize,
  className,
  onClick,
  style,
}: ResizableHeaderCellProps) {
  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = width;
    },
    [width]
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      // RTL: moving left increases width
      const diff = startXRef.current - e.clientX;
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + diff));
      onResize(columnKey, newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, columnKey, minWidth, maxWidth, onResize]);

  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-3 text-right align-middle font-medium whitespace-nowrap relative group select-none",
        "border-b border-l border-border bg-muted/30",
        isResizing && "bg-muted/70",
        className
      )}
      style={{ width: `${width}px`, minWidth: `${minWidth}px`, maxWidth: `${maxWidth}px`, ...style }}
      onClick={!isResizing ? onClick : undefined}
    >
      {children}
      {/* Resize handle */}
      <div
        className={cn(
          "absolute top-0 left-0 h-full w-1.5 cursor-col-resize z-10",
          "hover:bg-primary/30 active:bg-primary/50",
          isResizing ? "bg-primary/50" : "bg-transparent group-hover:bg-border"
        )}
        onMouseDown={handleMouseDown}
        onClick={(e) => e.stopPropagation()}
      />
    </th>
  );
}

/** Hook to manage column widths with persistence */
export function useColumnWidths(
  columns: ColumnConfig[],
  columnOrder: string[],
  storageKey: string,
  dbSaveFn?: (widths: Record<string, number>) => void,
  dbWidths?: Record<string, number> | null
) {
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    // Try to load from localStorage
    try {
      const saved = localStorage.getItem(`columnWidths_${storageKey}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
    
    // Initialize with smart defaults
    const defaults: Record<string, number> = {};
    columns.forEach((col) => {
      const preset = getColumnWidth(col.key, col);
      defaults[col.key] = preset.width;
    });
    return defaults;
  });

  // Sync from database when loaded
  useEffect(() => {
    if (dbWidths && Object.keys(dbWidths).length > 0) {
      setColumnWidths(prev => {
        const merged = { ...prev, ...dbWidths };
        try {
          localStorage.setItem(`columnWidths_${storageKey}`, JSON.stringify(merged));
        } catch {}
        return merged;
      });
    }
  }, [dbWidths, storageKey]);

  // Debounce timer for database saves
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleResize = useCallback((key: string, width: number) => {
    setColumnWidths((prev) => {
      const updated = { ...prev, [key]: width };
      // Save to localStorage immediately
      try {
        localStorage.setItem(`columnWidths_${storageKey}`, JSON.stringify(updated));
      } catch {}
      // Debounce database save (save after 500ms of no resizing)
      if (dbSaveFn) {
        if (saveTimerRef.current) {
          clearTimeout(saveTimerRef.current);
        }
        saveTimerRef.current = setTimeout(() => {
          dbSaveFn(updated);
        }, 500);
      }
      return updated;
    });
  }, [storageKey, dbSaveFn]);

  const resetWidths = useCallback(() => {
    const defaults: Record<string, number> = {};
    columns.forEach((col) => {
      const preset = getColumnWidth(col.key, col);
      defaults[col.key] = preset.width;
    });
    setColumnWidths(defaults);
    try {
      localStorage.removeItem(`columnWidths_${storageKey}`);
    } catch {}
    if (dbSaveFn) {
      dbSaveFn(defaults);
    }
  }, [columns, storageKey, dbSaveFn]);

  const applyWidths = useCallback((widths: Record<string, number>) => {
    if (widths && Object.keys(widths).length > 0) {
      setColumnWidths(prev => {
        const merged = { ...prev, ...widths };
        try {
          localStorage.setItem(`columnWidths_${storageKey}`, JSON.stringify(merged));
        } catch {}
        return merged;
      });
    }
  }, [storageKey]);

  const getWidth = useCallback((key: string) => {
    if (columnWidths[key]) return columnWidths[key];
    const col = columns.find(c => c.key === key);
    return getColumnWidth(key, col).width;
  }, [columnWidths, columns]);

  const getMinWidth = useCallback((key: string) => {
    const col = columns.find(c => c.key === key);
    return getColumnWidth(key, col).min;
  }, [columns]);

  const getMaxWidth = useCallback((key: string) => {
    const col = columns.find(c => c.key === key);
    return getColumnWidth(key, col).max;
  }, [columns]);

  return {
    columnWidths,
    handleResize,
    resetWidths,
    applyWidths,
    getWidth,
    getMinWidth,
    getMaxWidth,
  };
}
