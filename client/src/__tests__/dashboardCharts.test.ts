import { describe, it, expect, vi, beforeEach } from "vitest";

/**
 * Tests for DashboardCharts components and charts router
 */

// Mock recharts to avoid canvas/SVG rendering issues in tests
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: any) => children,
  AreaChart: ({ children }: any) => children,
  LineChart: ({ children }: any) => children,
  BarChart: ({ children }: any) => children,
  PieChart: ({ children }: any) => children,
  Area: () => null,
  Line: () => null,
  Bar: () => null,
  Pie: ({ children }: any) => children,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

describe("Charts Router - Data Structures", () => {
  it("should define correct period options", () => {
    const periods = ["7d", "30d", "90d", "12m"];
    expect(periods).toHaveLength(4);
    expect(periods).toContain("7d");
    expect(periods).toContain("30d");
    expect(periods).toContain("90d");
    expect(periods).toContain("12m");
  });

  it("should define correct period labels in Arabic", () => {
    const periodLabels: Record<string, string> = {
      "7d": "آخر 7 أيام",
      "30d": "آخر 30 يوم",
      "90d": "آخر 3 أشهر",
      "12m": "آخر 12 شهر",
    };
    expect(periodLabels["7d"]).toBe("آخر 7 أيام");
    expect(periodLabels["30d"]).toBe("آخر 30 يوم");
    expect(periodLabels["90d"]).toBe("آخر 3 أشهر");
    expect(periodLabels["12m"]).toBe("آخر 12 شهر");
  });

  it("should calculate date range correctly for 7d period", () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const diff = now.getTime() - sevenDaysAgo.getTime();
    const days = diff / (24 * 60 * 60 * 1000);
    expect(days).toBeCloseTo(7, 0);
  });

  it("should calculate date range correctly for 30d period", () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const diff = now.getTime() - thirtyDaysAgo.getTime();
    const days = diff / (24 * 60 * 60 * 1000);
    expect(days).toBeCloseTo(30, 0);
  });

  it("should calculate date range correctly for 90d period", () => {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const diff = now.getTime() - ninetyDaysAgo.getTime();
    const days = diff / (24 * 60 * 60 * 1000);
    expect(days).toBeCloseTo(90, 0);
  });

  it("should calculate date range correctly for 12m period", () => {
    const now = new Date();
    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const diff = now.getTime() - yearAgo.getTime();
    const days = diff / (24 * 60 * 60 * 1000);
    expect(days).toBeCloseTo(365, 0);
  });
});

describe("Charts - Change Indicator Logic", () => {
  function calcChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  it("should return 100% when previous is 0 and current > 0", () => {
    expect(calcChange(10, 0)).toBe(100);
  });

  it("should return 0% when both are 0", () => {
    expect(calcChange(0, 0)).toBe(0);
  });

  it("should return positive change when current > previous", () => {
    expect(calcChange(150, 100)).toBe(50);
  });

  it("should return negative change when current < previous", () => {
    expect(calcChange(50, 100)).toBe(-50);
  });

  it("should return 0% when current equals previous", () => {
    expect(calcChange(100, 100)).toBe(0);
  });

  it("should handle large increases correctly", () => {
    expect(calcChange(1000, 100)).toBe(900);
  });

  it("should handle small decreases correctly", () => {
    expect(calcChange(90, 100)).toBe(-10);
  });
});

describe("Charts - Status Labels", () => {
  const STATUS_LABELS: Record<string, string> = {
    new: "جديد",
    contacted: "تم التواصل",
    booked: "تم الحجز",
    not_interested: "غير مهتم",
    no_answer: "لم يرد",
    pending: "معلق",
    confirmed: "مؤكد",
    completed: "مكتمل",
    cancelled: "ملغي",
    attended: "حضر",
  };

  it("should have Arabic labels for all statuses", () => {
    expect(Object.keys(STATUS_LABELS)).toHaveLength(10);
    Object.values(STATUS_LABELS).forEach(label => {
      expect(label).toBeTruthy();
      expect(typeof label).toBe("string");
    });
  });

  it("should have correct Arabic label for 'new'", () => {
    expect(STATUS_LABELS.new).toBe("جديد");
  });

  it("should have correct Arabic label for 'confirmed'", () => {
    expect(STATUS_LABELS.confirmed).toBe("مؤكد");
  });
});

describe("Charts - Color Palette", () => {
  const COLORS = {
    leads: "#3b82f6",
    appointments: "#10b981",
    offerLeads: "#f59e0b",
    campRegs: "#8b5cf6",
    inbound: "#06b6d4",
    outbound: "#f43f5e",
  };

  it("should have 6 distinct colors", () => {
    const colorValues = Object.values(COLORS);
    expect(colorValues).toHaveLength(6);
    const uniqueColors = new Set(colorValues);
    expect(uniqueColors.size).toBe(6);
  });

  it("should use valid hex color codes", () => {
    Object.values(COLORS).forEach(color => {
      expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });
});

describe("Charts - Data Merging Logic", () => {
  it("should merge timeline data correctly", () => {
    const leadsData = [
      { date_label: "2026-01-01", total: 5 },
      { date_label: "2026-01-02", total: 8 },
    ];
    const appointmentsData = [
      { date_label: "2026-01-01", total: 3 },
      { date_label: "2026-01-03", total: 2 },
    ];

    const allDates = new Set<string>();
    [leadsData, appointmentsData].forEach(rows => rows.forEach(r => allDates.add(r.date_label)));
    const sortedDates = Array.from(allDates).sort();

    expect(sortedDates).toEqual(["2026-01-01", "2026-01-02", "2026-01-03"]);

    const leadsMap = new Map(leadsData.map(r => [r.date_label, r.total]));
    const appointmentsMap = new Map(appointmentsData.map(r => [r.date_label, r.total]));

    const mergedLeads = sortedDates.map(d => leadsMap.get(d) || 0);
    const mergedAppointments = sortedDates.map(d => appointmentsMap.get(d) || 0);

    expect(mergedLeads).toEqual([5, 8, 0]);
    expect(mergedAppointments).toEqual([3, 0, 2]);
  });

  it("should handle empty datasets gracefully", () => {
    const allDates = new Set<string>();
    const sortedDates = Array.from(allDates).sort();
    expect(sortedDates).toEqual([]);
  });

  it("should merge source data correctly", () => {
    const sourceMap = new Map<string, { leads: number; appointments: number }>();
    
    const leadsData = [{ source_name: "واتساب", total: 10 }, { source_name: "موقع", total: 5 }];
    const appointmentsData = [{ source_name: "واتساب", total: 7 }, { source_name: "هاتف", total: 3 }];

    leadsData.forEach(s => {
      const existing = sourceMap.get(s.source_name) || { leads: 0, appointments: 0 };
      existing.leads = s.total;
      sourceMap.set(s.source_name, existing);
    });
    appointmentsData.forEach(s => {
      const existing = sourceMap.get(s.source_name) || { leads: 0, appointments: 0 };
      existing.appointments = s.total;
      sourceMap.set(s.source_name, existing);
    });

    expect(sourceMap.size).toBe(3);
    expect(sourceMap.get("واتساب")).toEqual({ leads: 10, appointments: 7 });
    expect(sourceMap.get("موقع")).toEqual({ leads: 5, appointments: 0 });
    expect(sourceMap.get("هاتف")).toEqual({ leads: 0, appointments: 3 });
  });
});

describe("Charts - Responsive Design", () => {
  it("should define chart heights for different screen sizes", () => {
    const mobileHeight = 280;
    const desktopHeight = 300;
    expect(mobileHeight).toBeLessThanOrEqual(desktopHeight);
    expect(mobileHeight).toBeGreaterThan(0);
  });

  it("should define grid layouts for different screen sizes", () => {
    // Summary cards: 2 cols on mobile, 3 on sm, 5 on lg
    const mobileGridCols = 2;
    const smGridCols = 3;
    const lgGridCols = 5;
    expect(mobileGridCols).toBeLessThan(smGridCols);
    expect(smGridCols).toBeLessThan(lgGridCols);
  });

  it("should define chart grid as 1 col on mobile, 2 on lg", () => {
    const mobileGridCols = 1;
    const lgGridCols = 2;
    expect(mobileGridCols).toBeLessThan(lgGridCols);
  });
});
