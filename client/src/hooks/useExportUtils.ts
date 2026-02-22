import { useCallback } from 'react';
import { toast } from 'sonner';
import { exportData, printTable, type ExportMetadata } from '@/lib/advancedExport';
import { useAuth } from '@/_core/hooks/useAuth';

/**
 * تعريف عمود للتصدير
 */
export interface ExportColumnDef {
  key: string;
  label: string;
}

/**
 * خيارات فلتر نشط
 */
export interface ActiveFilter {
  label: string;
  value: string;
}

/**
 * إعدادات التصدير/الطباعة لجدول معين
 */
export interface ExportConfig<T> {
  /** اسم الجدول بالعربية (مثل: "مواعيد الأطباء") */
  tableName: string;
  /** بادئة اسم الملف (مثل: "مواعيد_الأطباء") */
  filenamePrefix: string;
  /** تعريفات أعمدة التصدير */
  exportColumns: ExportColumnDef[];
  /** تعريفات أعمدة الطباعة (قد تتضمن أعمدة إضافية مثل التعليقات والمهام) */
  printColumns?: ExportColumnDef[];
  /** دالة تحويل عنصر واحد إلى صف تصدير */
  mapToExportRow: (item: T) => Record<string, any>;
  /** دالة تحويل عنصر واحد إلى صف طباعة (اختيارية، تستخدم mapToExportRow إن لم تحدد) */
  mapToPrintRow?: (item: T) => Record<string, any>;
}

/**
 * خيارات الاستدعاء
 */
export interface ExportCallOptions {
  /** البيانات المفلترة */
  data: any[];
  /** الفلاتر النشطة */
  activeFilters?: Record<string, string>;
  /** نطاق التاريخ (نص) */
  dateRangeStr?: string;
  /** الأعمدة المرئية (من useTableFeatures) - مفاتيح الأعمدة المرئية */
  visibleColumns?: Record<string, boolean>;
}

/**
 * useExportUtils - Hook مشترك لتوحيد وظائف التصدير والطباعة
 * 
 * يوفر دوال handleExport و handlePrint جاهزة للاستخدام
 * مع تحضير تلقائي لـ metadata والأعمدة المرئية
 */
export function useExportUtils<T>(config: ExportConfig<T>) {
  const { user } = useAuth();

  /**
   * بناء metadata مشتركة
   */
  const buildMetadata = useCallback((
    data: any[],
    activeFilters?: Record<string, string>,
    dateRangeStr?: string,
  ): ExportMetadata => {
    return {
      tableName: config.tableName,
      dateRange: dateRangeStr,
      filters: activeFilters && Object.keys(activeFilters).length > 0 ? activeFilters : undefined,
      totalRecords: data.length,
      exportedRecords: data.length,
      exportDate: new Date().toLocaleString('ar-SA'),
      exportedBy: user?.name || 'مستخدم',
    };
  }, [config.tableName, user?.name]);

  /**
   * تحضير الأعمدة المرئية من visibleColumns map
   */
  const getVisibleColumns = useCallback((
    columnDefs: ExportColumnDef[],
    visibleColumns?: Record<string, boolean>,
  ): ExportColumnDef[] => {
    if (!visibleColumns) return columnDefs;

    return Object.entries(visibleColumns)
      .filter(([_, visible]) => visible)
      .map(([key]) => {
        const col = columnDefs.find(c => c.key === key);
        return col || { key, label: key };
      })
      .filter(Boolean);
  }, []);

  /**
   * تصدير البيانات (Excel / CSV / PDF)
   */
  const handleExport = useCallback(async (
    format: 'excel' | 'csv' | 'pdf',
    options: ExportCallOptions,
  ) => {
    const { data, activeFilters, dateRangeStr, visibleColumns } = options;

    if (!data || data.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    try {
      const metadata = buildMetadata(data, activeFilters, dateRangeStr);
      const dataToExport = data.map(item => config.mapToExportRow(item as T));

      // تحضير الأعمدة المرئية
      let visibleCols: ExportColumnDef[];
      if (visibleColumns) {
        visibleCols = Object.entries(visibleColumns)
          .filter(([_, visible]) => visible)
          .map(([key]) => {
            const col = config.exportColumns.find(c => c.key === key);
            return col || { key, label: key };
          });
      } else {
        visibleCols = config.exportColumns;
      }

      const filename = `${config.filenamePrefix}_${Date.now()}.${format === 'excel' ? 'xlsx' : format}`;

      await exportData({
        format,
        metadata,
        columns: visibleCols,
        data: dataToExport,
        filename,
      });

      toast.success(`تم تصدير البيانات بنجاح بتنسيق ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('حدث خطأ أثناء التصدير');
    }
  }, [buildMetadata, config]);

  /**
   * طباعة البيانات
   */
  const handlePrint = useCallback((options: ExportCallOptions) => {
    const { data, activeFilters, dateRangeStr, visibleColumns } = options;

    if (!data || data.length === 0) {
      toast.error("لا توجد بيانات للطباعة");
      return;
    }

    try {
      const metadata = buildMetadata(data, activeFilters, dateRangeStr);

      // استخدام mapToPrintRow إن وجدت، وإلا mapToExportRow
      const mapFn = config.mapToPrintRow || config.mapToExportRow;
      const dataToExport = data.map(item => mapFn(item as T));

      // استخدام printColumns إن وجدت، وإلا exportColumns
      const allColumns = config.printColumns || config.exportColumns;

      // تحضير الأعمدة المرئية
      let visibleCols: ExportColumnDef[];
      if (visibleColumns) {
        visibleCols = Object.entries(visibleColumns)
          .filter(([_, visible]) => visible)
          .map(([key]) => {
            const col = allColumns.find(c => c.key === key);
            return col || { key, label: key };
          });
      } else {
        visibleCols = allColumns;
      }

      printTable({
        format: 'pdf',
        metadata,
        columns: visibleCols,
        data: dataToExport,
      });
    } catch (error) {
      console.error('Print error:', error);
      toast.error('حدث خطأ أثناء الطباعة');
    }
  }, [buildMetadata, config]);

  /**
   * دالة مساعدة لبناء الفلاتر النشطة
   * تقبل مصفوفة من الفلاتر وتعيد Record<string, string>
   */
  const buildActiveFilters = useCallback((
    filters: Array<{ label: string; value: string | string[] | undefined | null }>
  ): Record<string, string> => {
    const result: Record<string, string> = {};
    for (const filter of filters) {
      if (!filter.value) continue;
      const val = Array.isArray(filter.value) 
        ? filter.value.join(', ') 
        : filter.value;
      if (val) {
        result[filter.label] = val;
      }
    }
    return result;
  }, []);

  /**
   * دالة مساعدة لتحضير نطاق التاريخ كنص
   */
  const formatDateRange = useCallback((from: Date, to: Date): string => {
    return `${from.toLocaleDateString('ar-SA')} - ${to.toLocaleDateString('ar-SA')}`;
  }, []);

  return {
    handleExport,
    handlePrint,
    buildActiveFilters,
    formatDateRange,
  };
}
