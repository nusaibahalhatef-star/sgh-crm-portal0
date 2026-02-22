import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock dependencies
const mockExportData = vi.fn();
const mockPrintTable = vi.fn();
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();

vi.mock('@/lib/advancedExport', () => ({
  exportData: (...args: any[]) => mockExportData(...args),
  printTable: (...args: any[]) => mockPrintTable(...args),
}));

vi.mock('sonner', () => ({
  toast: {
    success: (...args: any[]) => mockToastSuccess(...args),
    error: (...args: any[]) => mockToastError(...args),
  },
}));

vi.mock('@/_core/hooks/useAuth', () => ({
  useAuth: () => ({ user: { name: 'Test User' } }),
}));

import { useExportUtils, type ExportConfig } from '../useExportUtils';

const sampleConfig: ExportConfig<{ id: number; name: string; status: string }> = {
  tableName: 'اختبار الجدول',
  filenamePrefix: 'اختبار_الجدول',
  exportColumns: [
    { key: 'name', label: 'الاسم' },
    { key: 'status', label: 'الحالة' },
  ],
  printColumns: [
    { key: 'name', label: 'الاسم' },
    { key: 'status', label: 'الحالة' },
    { key: 'extra', label: 'إضافي' },
  ],
  mapToExportRow: (item) => ({
    name: item.name,
    status: item.status,
  }),
  mapToPrintRow: (item) => ({
    name: item.name,
    status: item.status,
    extra: '-',
  }),
};

const sampleData = [
  { id: 1, name: 'أحمد', status: 'active' },
  { id: 2, name: 'محمد', status: 'pending' },
  { id: 3, name: 'خالد', status: 'active' },
];

describe('useExportUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('buildActiveFilters', () => {
    it('should build filters from non-empty values', () => {
      const { result } = renderHook(() => useExportUtils(sampleConfig));

      const filters = result.current.buildActiveFilters([
        { label: 'البحث', value: 'أحمد' },
        { label: 'الحالة', value: 'نشط' },
        { label: 'المصدر', value: undefined },
        { label: 'فارغ', value: null },
      ]);

      expect(filters).toEqual({
        'البحث': 'أحمد',
        'الحالة': 'نشط',
      });
    });

    it('should return empty object when all values are empty', () => {
      const { result } = renderHook(() => useExportUtils(sampleConfig));

      const filters = result.current.buildActiveFilters([
        { label: 'البحث', value: undefined },
        { label: 'الحالة', value: null },
      ]);

      expect(filters).toEqual({});
    });

    it('should join array values with comma', () => {
      const { result } = renderHook(() => useExportUtils(sampleConfig));

      const filters = result.current.buildActiveFilters([
        { label: 'الحالة', value: ['نشط', 'معلق'] },
      ]);

      expect(filters).toEqual({
        'الحالة': 'نشط, معلق',
      });
    });
  });

  describe('formatDateRange', () => {
    it('should format date range in Arabic locale', () => {
      const { result } = renderHook(() => useExportUtils(sampleConfig));

      const from = new Date('2025-01-01');
      const to = new Date('2025-12-31');
      const formatted = result.current.formatDateRange(from, to);

      expect(formatted).toContain(' - ');
      expect(typeof formatted).toBe('string');
      expect(formatted.length).toBeGreaterThan(5);
    });
  });

  describe('handleExport', () => {
    it('should show error toast when data is empty', async () => {
      const { result } = renderHook(() => useExportUtils(sampleConfig));

      await act(async () => {
        await result.current.handleExport('excel', { data: [] });
      });

      expect(mockToastError).toHaveBeenCalledWith('لا توجد بيانات للتصدير');
      expect(mockExportData).not.toHaveBeenCalled();
    });

    it('should call exportData with correct parameters for excel', async () => {
      mockExportData.mockResolvedValue(undefined);
      const { result } = renderHook(() => useExportUtils(sampleConfig));

      await act(async () => {
        await result.current.handleExport('excel', {
          data: sampleData,
          activeFilters: { 'البحث': 'أحمد' },
          dateRangeStr: '01/01/2025 - 31/12/2025',
        });
      });

      expect(mockExportData).toHaveBeenCalledTimes(1);
      const callArgs = mockExportData.mock.calls[0][0];
      expect(callArgs.format).toBe('excel');
      expect(callArgs.metadata.tableName).toBe('اختبار الجدول');
      expect(callArgs.metadata.exportedBy).toBe('Test User');
      expect(callArgs.metadata.totalRecords).toBe(3);
      expect(callArgs.metadata.filters).toEqual({ 'البحث': 'أحمد' });
      expect(callArgs.data).toHaveLength(3);
      expect(callArgs.data[0]).toEqual({ name: 'أحمد', status: 'active' });
      expect(callArgs.filename).toContain('اختبار_الجدول_');
      expect(callArgs.filename).toContain('.xlsx');
      expect(mockToastSuccess).toHaveBeenCalledWith('تم تصدير البيانات بنجاح بتنسيق EXCEL');
    });

    it('should call exportData with csv extension for csv format', async () => {
      mockExportData.mockResolvedValue(undefined);
      const { result } = renderHook(() => useExportUtils(sampleConfig));

      await act(async () => {
        await result.current.handleExport('csv', { data: sampleData });
      });

      const callArgs = mockExportData.mock.calls[0][0];
      expect(callArgs.format).toBe('csv');
      expect(callArgs.filename).toContain('.csv');
    });

    it('should filter columns based on visibleColumns', async () => {
      mockExportData.mockResolvedValue(undefined);
      const { result } = renderHook(() => useExportUtils(sampleConfig));

      await act(async () => {
        await result.current.handleExport('excel', {
          data: sampleData,
          visibleColumns: { name: true, status: false },
        });
      });

      const callArgs = mockExportData.mock.calls[0][0];
      expect(callArgs.columns).toEqual([{ key: 'name', label: 'الاسم' }]);
    });

    it('should show error toast on export failure', async () => {
      mockExportData.mockRejectedValue(new Error('Export failed'));
      const { result } = renderHook(() => useExportUtils(sampleConfig));

      await act(async () => {
        await result.current.handleExport('excel', { data: sampleData });
      });

      expect(mockToastError).toHaveBeenCalledWith('حدث خطأ أثناء التصدير');
    });
  });

  describe('handlePrint', () => {
    it('should show error toast when data is empty', () => {
      const { result } = renderHook(() => useExportUtils(sampleConfig));

      act(() => {
        result.current.handlePrint({ data: [] });
      });

      expect(mockToastError).toHaveBeenCalledWith('لا توجد بيانات للطباعة');
      expect(mockPrintTable).not.toHaveBeenCalled();
    });

    it('should call printTable with printColumns and mapToPrintRow', () => {
      const { result } = renderHook(() => useExportUtils(sampleConfig));

      act(() => {
        result.current.handlePrint({ data: sampleData });
      });

      expect(mockPrintTable).toHaveBeenCalledTimes(1);
      const callArgs = mockPrintTable.mock.calls[0][0];
      expect(callArgs.format).toBe('pdf');
      expect(callArgs.metadata.tableName).toBe('اختبار الجدول');
      expect(callArgs.data).toHaveLength(3);
      // Should use mapToPrintRow which includes 'extra' field
      expect(callArgs.data[0]).toEqual({ name: 'أحمد', status: 'active', extra: '-' });
      // Should use printColumns
      expect(callArgs.columns).toEqual([
        { key: 'name', label: 'الاسم' },
        { key: 'status', label: 'الحالة' },
        { key: 'extra', label: 'إضافي' },
      ]);
    });

    it('should fall back to exportColumns and mapToExportRow when print-specific not provided', () => {
      const configWithoutPrint: ExportConfig<{ id: number; name: string; status: string }> = {
        ...sampleConfig,
        printColumns: undefined,
        mapToPrintRow: undefined,
      };
      const { result } = renderHook(() => useExportUtils(configWithoutPrint));

      act(() => {
        result.current.handlePrint({ data: sampleData });
      });

      const callArgs = mockPrintTable.mock.calls[0][0];
      // Should use exportColumns (no 'extra' column)
      expect(callArgs.columns).toEqual([
        { key: 'name', label: 'الاسم' },
        { key: 'status', label: 'الحالة' },
      ]);
      // Should use mapToExportRow (no 'extra' field)
      expect(callArgs.data[0]).toEqual({ name: 'أحمد', status: 'active' });
    });

    it('should filter print columns based on visibleColumns', () => {
      const { result } = renderHook(() => useExportUtils(sampleConfig));

      act(() => {
        result.current.handlePrint({
          data: sampleData,
          visibleColumns: { name: true, status: false, extra: true },
        });
      });

      const callArgs = mockPrintTable.mock.calls[0][0];
      expect(callArgs.columns).toEqual([
        { key: 'name', label: 'الاسم' },
        { key: 'extra', label: 'إضافي' },
      ]);
    });

    it('should show error toast on print failure', () => {
      mockPrintTable.mockImplementation(() => { throw new Error('Print failed'); });
      const { result } = renderHook(() => useExportUtils(sampleConfig));

      act(() => {
        result.current.handlePrint({ data: sampleData });
      });

      expect(mockToastError).toHaveBeenCalledWith('حدث خطأ أثناء الطباعة');
    });
  });
});
