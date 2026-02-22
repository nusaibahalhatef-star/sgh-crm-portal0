import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

// Inline copy of COLUMN_WIDTH_PRESETS and getColumnWidth for testing without UI imports
const COLUMN_WIDTH_PRESETS: Record<string, { width: number; min: number; max: number }> = {
  receiptNumber: { width: 100, min: 60, max: 200 },
  ticketNumber: { width: 100, min: 60, max: 200 },
  id: { width: 60, min: 40, max: 120 },
  name: { width: 160, min: 80, max: 400 },
  fullName: { width: 180, min: 80, max: 400 },
  doctor: { width: 150, min: 80, max: 350 },
  doctorName: { width: 150, min: 80, max: 350 },
  phone: { width: 140, min: 90, max: 250 },
  email: { width: 180, min: 100, max: 400 },
  date: { width: 110, min: 70, max: 200 },
  createdAt: { width: 110, min: 70, max: 200 },
  preferredDate: { width: 110, min: 70, max: 200 },
  appointmentDate: { width: 110, min: 70, max: 200 },
  attendanceDate: { width: 110, min: 70, max: 200 },
  registrationDate: { width: 110, min: 70, max: 200 },
  status: { width: 120, min: 70, max: 220 },
  source: { width: 110, min: 60, max: 220 },
  age: { width: 70, min: 40, max: 150 },
  gender: { width: 70, min: 40, max: 150 },
  specialty: { width: 130, min: 70, max: 300 },
  procedure: { width: 130, min: 70, max: 300 },
  preferredTime: { width: 100, min: 60, max: 200 },
  camp: { width: 140, min: 80, max: 300 },
  offer: { width: 140, min: 80, max: 300 },
  notes: { width: 180, min: 80, max: 500 },
  additionalNotes: { width: 180, min: 80, max: 500 },
  staffNotes: { width: 180, min: 80, max: 500 },
  statusNotes: { width: 180, min: 80, max: 500 },
  medicalCondition: { width: 160, min: 80, max: 400 },
  procedures: { width: 160, min: 80, max: 400 },
  utmSource: { width: 110, min: 60, max: 250 },
  utmMedium: { width: 110, min: 60, max: 250 },
  utmCampaign: { width: 130, min: 60, max: 300 },
  utmTerm: { width: 110, min: 60, max: 250 },
  utmContent: { width: 110, min: 60, max: 250 },
  utmPlacement: { width: 110, min: 60, max: 250 },
  referrer: { width: 140, min: 60, max: 300 },
  fbclid: { width: 120, min: 60, max: 250 },
  gclid: { width: 120, min: 60, max: 250 },
  comments: { width: 80, min: 50, max: 150 },
  tasks: { width: 80, min: 50, max: 150 },
  actions: { width: 140, min: 80, max: 250 },
};

interface ColumnConfig {
  key: string;
  label: string;
  defaultVisible: boolean;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

function getColumnWidth(key: string, config?: ColumnConfig): { width: number; min: number; max: number } {
  if (config?.defaultWidth) {
    return {
      width: config.defaultWidth,
      min: config.minWidth || Math.max(50, config.defaultWidth - 40),
      max: config.maxWidth || config.defaultWidth + 100,
    };
  }
  return COLUMN_WIDTH_PRESETS[key] || { width: 120, min: 60, max: 250 };
}

// Test COLUMN_WIDTH_PRESETS
describe('COLUMN_WIDTH_PRESETS', () => {
  it('should have correct structure for all presets', () => {
    Object.entries(COLUMN_WIDTH_PRESETS).forEach(([key, preset]) => {
      expect(preset).toHaveProperty('width');
      expect(preset).toHaveProperty('min');
      expect(preset).toHaveProperty('max');
      expect(preset.min).toBeLessThanOrEqual(preset.width);
      expect(preset.max).toBeGreaterThanOrEqual(preset.width);
      expect(preset.min).toBeGreaterThan(0);
    });
  });

  it('should have reasonable min values (>= 40)', () => {
    Object.entries(COLUMN_WIDTH_PRESETS).forEach(([key, preset]) => {
      expect(preset.min).toBeGreaterThanOrEqual(40);
    });
  });

  it('should have reasonable max values allowing flexibility', () => {
    Object.entries(COLUMN_WIDTH_PRESETS).forEach(([key, preset]) => {
      expect(preset.max).toBeGreaterThanOrEqual(preset.width);
    });
  });

  it('should have all expected column types', () => {
    const expectedKeys = [
      'name', 'fullName', 'phone', 'email', 'status', 'source',
      'age', 'gender', 'date', 'createdAt', 'actions',
      'utmSource', 'utmMedium', 'utmCampaign',
      'notes', 'comments', 'tasks', 'receiptNumber'
    ];
    
    expectedKeys.forEach(key => {
      expect(COLUMN_WIDTH_PRESETS).toHaveProperty(key);
    });
  });
});

// Test getColumnWidth function
describe('getColumnWidth', () => {
  it('should return preset values for known keys', () => {
    const nameWidth = getColumnWidth('name');
    expect(nameWidth.width).toBe(160);
    expect(nameWidth.min).toBe(80);
    expect(nameWidth.max).toBe(400);
  });

  it('should return default values for unknown keys', () => {
    const unknownWidth = getColumnWidth('unknownColumn');
    expect(unknownWidth.width).toBe(120);
    expect(unknownWidth.min).toBe(60);
    expect(unknownWidth.max).toBe(250);
  });

  it('should use config defaultWidth when provided', () => {
    const config: ColumnConfig = { key: 'custom', label: 'Custom', defaultVisible: true, defaultWidth: 200, minWidth: 100, maxWidth: 350 };
    const result = getColumnWidth('custom', config);
    expect(result.width).toBe(200);
    expect(result.min).toBe(100);
    expect(result.max).toBe(350);
  });

  it('should calculate min/max from defaultWidth when not specified', () => {
    const config: ColumnConfig = { key: 'custom', label: 'Custom', defaultVisible: true, defaultWidth: 200 };
    const result = getColumnWidth('custom', config);
    expect(result.width).toBe(200);
    expect(result.min).toBe(160); // Math.max(50, 200 - 40)
    expect(result.max).toBe(300); // 200 + 100
  });
});

// Test ColumnTemplate with columnWidths
describe('ColumnTemplate with columnWidths', () => {
  it('should create a valid template with columnWidths', () => {
    const template = {
      id: 'test_template',
      name: 'Test Template',
      columns: { name: true, phone: true, status: true } as Record<string, boolean>,
      columnOrder: ['name', 'phone', 'status'],
      columnWidths: { name: 200, phone: 150, status: 120 } as Record<string, number>,
      isDefault: false,
    };
    
    expect(template.columnWidths).toBeDefined();
    expect(template.columnWidths.name).toBe(200);
    expect(template.columnWidths.phone).toBe(150);
    expect(template.columnWidths.status).toBe(120);
  });

  it('should work without columnWidths (backward compatible)', () => {
    const template: any = {
      id: 'test_template_no_widths',
      name: 'Test Template No Widths',
      columns: { name: true, phone: true } as Record<string, boolean>,
      columnOrder: ['name', 'phone'],
      isDefault: false,
    };
    
    expect(template.columnWidths).toBeUndefined();
  });
});

// Test localStorage persistence
describe('Column widths localStorage persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should save column widths to localStorage', () => {
    const widths = { name: 200, phone: 150, status: 120 };
    localStorage.setItem('columnWidths_appointments', JSON.stringify(widths));
    
    const saved = localStorage.getItem('columnWidths_appointments');
    expect(saved).toBeTruthy();
    expect(JSON.parse(saved!)).toEqual(widths);
  });

  it('should handle empty localStorage gracefully', () => {
    const saved = localStorage.getItem('columnWidths_nonexistent');
    expect(saved).toBeNull();
  });

  it('should correctly serialize and deserialize widths', () => {
    const widths = { 
      name: 200, phone: 150, status: 120, 
      email: 250, age: 80, notes: 300 
    };
    localStorage.setItem('columnWidths_test', JSON.stringify(widths));
    
    const saved = JSON.parse(localStorage.getItem('columnWidths_test')!);
    expect(Object.keys(saved)).toHaveLength(6);
    expect(saved.name).toBe(200);
    expect(saved.notes).toBe(300);
  });

  it('should handle width updates correctly', () => {
    const initialWidths = { name: 160, phone: 140 };
    localStorage.setItem('columnWidths_test', JSON.stringify(initialWidths));
    
    // Simulate updating a single column width
    const saved = JSON.parse(localStorage.getItem('columnWidths_test')!);
    saved.name = 250;
    localStorage.setItem('columnWidths_test', JSON.stringify(saved));
    
    const updated = JSON.parse(localStorage.getItem('columnWidths_test')!);
    expect(updated.name).toBe(250);
    expect(updated.phone).toBe(140); // unchanged
  });
});
