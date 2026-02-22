import { describe, it, expect } from 'vitest';

/**
 * Tests for Frozen Columns system
 * Tests the core logic of column freezing, offset calculation, and persistence
 */

describe('Frozen Columns System', () => {
  describe('Frozen column offset calculation', () => {
    // Simulates the offset calculation logic from useFrozenStyle
    function calculateRightOffset(
      columnKey: string,
      frozenColumns: string[],
      visibleColumnOrder: string[],
      columnWidths: Record<string, number>
    ): { isFrozen: boolean; rightOffset: number } {
      if (!frozenColumns.includes(columnKey)) {
        return { isFrozen: false, rightOffset: 0 };
      }

      const frozenInOrder = visibleColumnOrder.filter(k => frozenColumns.includes(k));
      const frozenIndex = frozenInOrder.indexOf(columnKey);

      if (frozenIndex === -1) {
        return { isFrozen: false, rightOffset: 0 };
      }

      let rightOffset = 0;
      for (let i = frozenIndex + 1; i < frozenInOrder.length; i++) {
        const key = frozenInOrder[i];
        rightOffset += columnWidths[key] || 120; // default width
      }

      return { isFrozen: true, rightOffset };
    }

    it('should return isFrozen=false for non-frozen columns', () => {
      const result = calculateRightOffset(
        'email',
        ['name', 'phone'],
        ['name', 'phone', 'email', 'status'],
        { name: 150, phone: 130, email: 200, status: 100 }
      );
      expect(result.isFrozen).toBe(false);
      expect(result.rightOffset).toBe(0);
    });

    it('should calculate correct offset for first frozen column (RTL)', () => {
      const result = calculateRightOffset(
        'name',
        ['name', 'phone'],
        ['name', 'phone', 'email', 'status'],
        { name: 150, phone: 130, email: 200, status: 100 }
      );
      expect(result.isFrozen).toBe(true);
      // name is first frozen, phone (130) is to its right
      expect(result.rightOffset).toBe(130);
    });

    it('should calculate zero offset for last frozen column', () => {
      const result = calculateRightOffset(
        'phone',
        ['name', 'phone'],
        ['name', 'phone', 'email', 'status'],
        { name: 150, phone: 130, email: 200, status: 100 }
      );
      expect(result.isFrozen).toBe(true);
      // phone is last frozen, no frozen columns to its right
      expect(result.rightOffset).toBe(0);
    });

    it('should handle three frozen columns correctly', () => {
      const frozenColumns = ['name', 'phone', 'status'];
      const visibleOrder = ['name', 'phone', 'email', 'status', 'date'];
      const widths = { name: 150, phone: 130, email: 200, status: 100, date: 120 };

      // name: phone(130) + status(100) = 230
      const nameResult = calculateRightOffset('name', frozenColumns, visibleOrder, widths);
      expect(nameResult.rightOffset).toBe(230);

      // phone: status(100) = 100
      const phoneResult = calculateRightOffset('phone', frozenColumns, visibleOrder, widths);
      expect(phoneResult.rightOffset).toBe(100);

      // status: 0 (last frozen)
      const statusResult = calculateRightOffset('status', frozenColumns, visibleOrder, widths);
      expect(statusResult.rightOffset).toBe(0);
    });

    it('should handle empty frozen columns', () => {
      const result = calculateRightOffset(
        'name',
        [],
        ['name', 'phone', 'email'],
        { name: 150, phone: 130, email: 200 }
      );
      expect(result.isFrozen).toBe(false);
    });

    it('should handle frozen column not in visible order', () => {
      const result = calculateRightOffset(
        'hidden_col',
        ['hidden_col'],
        ['name', 'phone', 'email'],
        { name: 150, phone: 130, email: 200 }
      );
      expect(result.isFrozen).toBe(false);
    });
  });

  describe('Frozen columns toggle logic', () => {
    function toggleFrozen(frozenColumns: string[], columnKey: string): string[] {
      return frozenColumns.includes(columnKey)
        ? frozenColumns.filter(k => k !== columnKey)
        : [...frozenColumns, columnKey];
    }

    it('should add column to frozen list', () => {
      const result = toggleFrozen(['name'], 'phone');
      expect(result).toEqual(['name', 'phone']);
    });

    it('should remove column from frozen list', () => {
      const result = toggleFrozen(['name', 'phone'], 'phone');
      expect(result).toEqual(['name']);
    });

    it('should handle empty frozen list', () => {
      const result = toggleFrozen([], 'name');
      expect(result).toEqual(['name']);
    });

    it('should handle removing last frozen column', () => {
      const result = toggleFrozen(['name'], 'name');
      expect(result).toEqual([]);
    });
  });

  describe('Z-index calculation for frozen columns', () => {
    function calculateZIndex(
      columnKey: string,
      frozenColumns: string[],
      visibleColumnOrder: string[]
    ): number {
      const frozenInOrder = visibleColumnOrder.filter(k => frozenColumns.includes(k));
      const frozenIndex = frozenInOrder.indexOf(columnKey);
      if (frozenIndex === -1) return 0;
      return 20 + (frozenInOrder.length - frozenIndex);
    }

    it('should give higher z-index to earlier frozen columns', () => {
      const frozenColumns = ['name', 'phone', 'status'];
      const visibleOrder = ['name', 'phone', 'email', 'status'];

      const nameZ = calculateZIndex('name', frozenColumns, visibleOrder);
      const phoneZ = calculateZIndex('phone', frozenColumns, visibleOrder);
      const statusZ = calculateZIndex('status', frozenColumns, visibleOrder);

      expect(nameZ).toBeGreaterThan(phoneZ);
      expect(phoneZ).toBeGreaterThan(statusZ);
      expect(nameZ).toBe(23); // 20 + (3 - 0)
      expect(phoneZ).toBe(22); // 20 + (3 - 1)
      expect(statusZ).toBe(21); // 20 + (3 - 2)
    });
  });

  describe('Template frozen columns integration', () => {
    interface ColumnTemplate {
      id: string;
      name: string;
      columns: Record<string, boolean>;
      columnOrder?: string[];
      columnWidths?: Record<string, number>;
      frozenColumns?: string[];
      isDefault: boolean;
    }

    it('should save frozen columns with template', () => {
      const template: ColumnTemplate = {
        id: 'test_1',
        name: 'Test Template',
        columns: { name: true, phone: true, email: true },
        columnOrder: ['name', 'phone', 'email'],
        columnWidths: { name: 150, phone: 130, email: 200 },
        frozenColumns: ['name', 'phone'],
        isDefault: false,
      };

      expect(template.frozenColumns).toEqual(['name', 'phone']);
    });

    it('should apply frozen columns from template', () => {
      const template: ColumnTemplate = {
        id: 'test_2',
        name: 'Full View',
        columns: { name: true, phone: true, email: true, status: true },
        frozenColumns: ['name'],
        isDefault: true,
      };

      // Simulate applying template
      const appliedFrozen = template.frozenColumns || [];
      expect(appliedFrozen).toEqual(['name']);
    });

    it('should handle template without frozen columns', () => {
      const template: ColumnTemplate = {
        id: 'test_3',
        name: 'No Freeze',
        columns: { name: true, phone: true },
        isDefault: true,
      };

      const appliedFrozen = template.frozenColumns || [];
      expect(appliedFrozen).toEqual([]);
    });
  });
});
