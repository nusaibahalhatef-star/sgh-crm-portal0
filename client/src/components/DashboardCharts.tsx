import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, TrendingDown, Minus, BarChart3, PieChart as PieChartIcon, Activity, MessageSquare } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Area, AreaChart,
} from "recharts";

type Period = "7d" | "30d" | "90d" | "12m";

const periodLabels: Record<Period, string> = {
  "7d": "آخر 7 أيام",
  "30d": "آخر 30 يوم",
  "90d": "آخر 3 أشهر",
  "12m": "آخر 12 شهر",
};

// Color palette that works in both light and dark modes
const COLORS = {
  leads: "#3b82f6",        // blue
  appointments: "#10b981", // emerald
  offerLeads: "#f59e0b",   // amber
  campRegs: "#8b5cf6",     // violet
  inbound: "#06b6d4",      // cyan
  outbound: "#f43f5e",     // rose
};

const STATUS_COLORS: Record<string, string> = {
  // الحالات الموحدة السبع
  pending: "#f59e0b",
  contacted: "#f97316",
  no_answer: "#6b7280",
  confirmed: "#10b981",
  attended: "#3b82f6",
  completed: "#059669",
  cancelled: "#ef4444",
  // حالات العملاء المحتملين (للتوافق مع البيانات القديمة)
  new: "#3b82f6",
  booked: "#10b981",
  not_interested: "#ef4444",
};

const STATUS_LABELS: Record<string, string> = {
  // الحالات الموحدة السبع
  pending: "قيد الانتظار",
  contacted: "تم التواصل",
  no_answer: "لم يرد",
  confirmed: "مؤكد",
  attended: "حضر",
  completed: "مكتمل",
  cancelled: "ملغي",
  // حالات العملاء المحتملين (للتوافق مع البيانات القديمة)
  new: "جديد",
  booked: "تم الحجز",
  not_interested: "غير مهتم",
};

const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f43f5e", "#6b7280"];

function ChartSkeleton() {
  return (
    <div className="flex items-center justify-center h-[280px] sm:h-[300px]">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function ChangeIndicator({ change }: { change: number }) {
  if (change > 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
        <TrendingUp className="h-3 w-3" />
        +{change}%
      </span>
    );
  }
  if (change < 0) {
    return (
      <span className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 font-medium">
        <TrendingDown className="h-3 w-3" />
        {change}%
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
      <Minus className="h-3 w-3" />
      0%
    </span>
  );
}

// Custom tooltip for Arabic RTL
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-3 text-sm" dir="rtl">
      <p className="font-medium mb-1.5 text-xs text-muted-foreground">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-foreground">{entry.name}: <strong>{entry.value}</strong></span>
        </div>
      ))}
    </div>
  );
}

function CustomPieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="bg-popover text-popover-foreground border border-border rounded-lg shadow-lg p-3 text-sm" dir="rtl">
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.payload.fill }} />
        <span>{entry.name}: <strong>{entry.value}</strong></span>
      </div>
    </div>
  );
}

/**
 * RegistrationsTrendChart - رسم بياني خطي لاتجاه التسجيلات
 */
function RegistrationsTrendChart({ period }: { period: Period }) {
  const { data, isLoading } = trpc.charts.registrationsTrend.useQuery({ period });

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.labels.map((label, i) => ({
      date: label,
      "العملاء": data.datasets.leads[i],
      "المواعيد": data.datasets.appointments[i],
      "حجوزات العروض": data.datasets.offerLeads[i],
      "تسجيلات المخيمات": data.datasets.campRegistrations[i],
    }));
  }, [data]);

  if (isLoading) return <ChartSkeleton />;
  if (!chartData.length) return <div className="flex items-center justify-center h-[280px] sm:h-[300px] text-muted-foreground text-sm">لا توجد بيانات</div>;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.leads} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.leads} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.appointments} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.appointments} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorOfferLeads" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.offerLeads} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.offerLeads} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorCampRegs" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.campRegs} stopOpacity={0.3} />
            <stop offset="95%" stopColor={COLORS.campRegs} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
        <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
        <Area type="monotone" dataKey="العملاء" stroke={COLORS.leads} fill="url(#colorLeads)" strokeWidth={2} />
        <Area type="monotone" dataKey="المواعيد" stroke={COLORS.appointments} fill="url(#colorAppointments)" strokeWidth={2} />
        <Area type="monotone" dataKey="حجوزات العروض" stroke={COLORS.offerLeads} fill="url(#colorOfferLeads)" strokeWidth={2} />
        <Area type="monotone" dataKey="تسجيلات المخيمات" stroke={COLORS.campRegs} fill="url(#colorCampRegs)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/**
 * LeadStatusPieChart - رسم بياني دائري لتوزيع حالات العملاء
 */
function LeadStatusPieChart() {
  const { data, isLoading } = trpc.charts.leadStatusDistribution.useQuery();

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map(d => ({
      name: STATUS_LABELS[d.status] || d.status,
      value: d.total,
      fill: STATUS_COLORS[d.status] || "#6b7280",
    }));
  }, [data]);

  if (isLoading) return <ChartSkeleton />;
  if (!chartData.length) return <div className="flex items-center justify-center h-[280px] sm:h-[300px] text-muted-foreground text-sm">لا توجد بيانات</div>;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={{ strokeWidth: 1 }}
          style={{ fontSize: "11px" }}
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * AppointmentStatusPieChart - رسم بياني دائري لحالات المواعيد
 */
function AppointmentStatusPieChart() {
  const { data, isLoading } = trpc.charts.appointmentStatusDistribution.useQuery();

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.map(d => ({
      name: STATUS_LABELS[d.status] || d.status,
      value: d.total,
      fill: STATUS_COLORS[d.status] || "#6b7280",
    }));
  }, [data]);

  if (isLoading) return <ChartSkeleton />;
  if (!chartData.length) return <div className="flex items-center justify-center h-[280px] sm:h-[300px] text-muted-foreground text-sm">لا توجد بيانات</div>;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          labelLine={{ strokeWidth: 1 }}
          style={{ fontSize: "11px" }}
        >
          {chartData.map((entry, index) => (
            <Cell key={index} fill={entry.fill} />
          ))}
        </Pie>
        <Tooltip content={<CustomPieTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/**
 * SourceBarChart - رسم بياني شريطي للتسجيلات حسب المصدر
 */
function SourceBarChart() {
  const { data, isLoading } = trpc.charts.registrationsBySource.useQuery();

  const chartData = useMemo(() => {
    if (!data) return [];
    // Merge all sources
    const sourceMap = new Map<string, { leads: number; appointments: number; offerLeads: number }>();
    
    data.leads.forEach(s => {
      const existing = sourceMap.get(s.source_name) || { leads: 0, appointments: 0, offerLeads: 0 };
      existing.leads = s.total;
      sourceMap.set(s.source_name, existing);
    });
    data.appointments.forEach(s => {
      const existing = sourceMap.get(s.source_name) || { leads: 0, appointments: 0, offerLeads: 0 };
      existing.appointments = s.total;
      sourceMap.set(s.source_name, existing);
    });
    data.offerLeads.forEach(s => {
      const existing = sourceMap.get(s.source_name) || { leads: 0, appointments: 0, offerLeads: 0 };
      existing.offerLeads = s.total;
      sourceMap.set(s.source_name, existing);
    });

    return Array.from(sourceMap.entries())
      .map(([name, counts]) => ({
        source: name.length > 15 ? name.slice(0, 15) + "..." : name,
        "العملاء": counts.leads,
        "المواعيد": counts.appointments,
        "حجوزات العروض": counts.offerLeads,
      }))
      .sort((a, b) => (b["العملاء"] + b["المواعيد"] + b["حجوزات العروض"]) - (a["العملاء"] + a["المواعيد"] + a["حجوزات العروض"]))
      .slice(0, 8);
  }, [data]);

  if (isLoading) return <ChartSkeleton />;
  if (!chartData.length) return <div className="flex items-center justify-center h-[280px] sm:h-[300px] text-muted-foreground text-sm">لا توجد بيانات</div>;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="source" tick={{ fontSize: 10 }} className="text-muted-foreground" angle={-15} textAnchor="end" height={50} />
        <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
        <Bar dataKey="العملاء" fill={COLORS.leads} radius={[4, 4, 0, 0]} />
        <Bar dataKey="المواعيد" fill={COLORS.appointments} radius={[4, 4, 0, 0]} />
        <Bar dataKey="حجوزات العروض" fill={COLORS.offerLeads} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * OffersAndCampsChart - رسم بياني شريطي لأداء العروض والمخيمات
 */
function OffersAndCampsChart() {
  const { data, isLoading } = trpc.charts.offersAndCampsPerformance.useQuery();

  const chartData = useMemo(() => {
    if (!data) return { offers: [] as any[], camps: [] as any[] };
    return {
      offers: data.offers.map(o => ({
        name: o.name.length > 20 ? o.name.slice(0, 20) + "..." : o.name,
        "إجمالي": o.total,
        "محول": o.converted,
      })),
      camps: data.camps.map(c => ({
        name: c.name.length > 20 ? c.name.slice(0, 20) + "..." : c.name,
        "إجمالي": c.total,
        "محول": c.converted,
      })),
    };
  }, [data]);

  if (isLoading) return <ChartSkeleton />;

  const combined = [...chartData.offers.map(o => ({ ...o, type: "عرض" })), ...chartData.camps.map(c => ({ ...c, type: "مخيم" }))];
  if (!combined.length) return <div className="flex items-center justify-center h-[280px] sm:h-[300px] text-muted-foreground text-sm">لا توجد بيانات</div>;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={combined} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="name" tick={{ fontSize: 9 }} className="text-muted-foreground" angle={-20} textAnchor="end" height={60} />
        <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
        <Bar dataKey="إجمالي" fill={COLORS.leads} radius={[4, 4, 0, 0]} />
        <Bar dataKey="محول" fill={COLORS.appointments} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/**
 * WhatsAppTrendChart - رسم بياني خطي لاتجاه رسائل واتساب
 */
function WhatsAppTrendChart({ period }: { period: Period }) {
  const { data, isLoading } = trpc.charts.whatsappTrend.useQuery({ period });

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.labels.map((label, i) => ({
      date: label,
      "واردة": data.datasets.inbound[i],
      "صادرة": data.datasets.outbound[i],
    }));
  }, [data]);

  if (isLoading) return <ChartSkeleton />;
  if (!chartData.length) return <div className="flex items-center justify-center h-[280px] sm:h-[300px] text-muted-foreground text-sm">لا توجد بيانات</div>;

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} className="text-muted-foreground" />
        <YAxis tick={{ fontSize: 11 }} className="text-muted-foreground" allowDecimals={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }} />
        <Line type="monotone" dataKey="واردة" stroke={COLORS.inbound} strokeWidth={2} dot={{ r: 3 }} />
        <Line type="monotone" dataKey="صادرة" stroke={COLORS.outbound} strokeWidth={2} dot={{ r: 3 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/**
 * SummaryCards - بطاقات ملخص مع مقارنة بالفترة السابقة
 */
function SummaryCards({ period }: { period: Period }) {
  const { data, isLoading } = trpc.charts.summaryComparison.useQuery({ period });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-3 sm:p-4">
              <div className="h-3 bg-muted rounded w-16 mb-2" />
              <div className="h-6 bg-muted rounded w-10 mb-1" />
              <div className="h-3 bg-muted rounded w-12" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) return null;

  const items = [
    { label: "الإجمالي", ...data.total, color: "text-foreground" },
    { label: "العملاء", ...data.leads, color: "text-blue-600 dark:text-blue-400" },
    { label: "المواعيد", ...data.appointments, color: "text-emerald-600 dark:text-emerald-400" },
    { label: "حجوزات العروض", ...data.offerLeads, color: "text-amber-600 dark:text-amber-400" },
    { label: "تسجيلات المخيمات", ...data.campRegistrations, color: "text-violet-600 dark:text-violet-400" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 stagger-cards">
      {items.map((item, i) => (
        <Card key={i} className="stat-card-animated">
          <CardContent className="p-3 sm:p-4">
            <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{item.label}</p>
            <p className={`text-lg sm:text-2xl font-bold mt-0.5 ${item.color}`}>{item.current}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <ChangeIndicator change={item.change} />
              <span className="text-[10px] text-muted-foreground">مقارنة بالسابق</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * DashboardCharts - المكون الرئيسي للوحة الإحصائيات الرسومية
 */
export default function DashboardCharts() {
  const [period, setPeriod] = useState<Period>("30d");

  return (
    <div className="space-y-4 sm:space-y-6" dir="rtl">
      {/* Header with period selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-base sm:text-lg font-bold text-foreground">لوحة الإحصائيات الرسومية</h2>
        </div>
        <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
          <SelectTrigger className="w-[160px] h-8 text-xs sm:text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(periodLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary comparison cards */}
      <SummaryCards period={period} />

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Registrations trend (area chart) */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              <CardTitle className="text-sm sm:text-base">اتجاه التسجيلات عبر الزمن</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-1 sm:px-4 pb-3 sm:pb-6">
            <RegistrationsTrendChart period={period} />
          </CardContent>
        </Card>

        {/* Lead status distribution (pie) */}
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-blue-500" />
              <CardTitle className="text-sm sm:text-base">توزيع حالات العملاء</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-1 sm:px-4 pb-3 sm:pb-6">
            <LeadStatusPieChart />
          </CardContent>
        </Card>

        {/* Appointment status distribution (pie) */}
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-emerald-500" />
              <CardTitle className="text-sm sm:text-base">توزيع حالات المواعيد</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-1 sm:px-4 pb-3 sm:pb-6">
            <AppointmentStatusPieChart />
          </CardContent>
        </Card>

        {/* Source bar chart */}
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-sm sm:text-base">التسجيلات حسب المصدر</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-1 sm:px-4 pb-3 sm:pb-6">
            <SourceBarChart />
          </CardContent>
        </Card>

        {/* Offers and camps performance */}
        <Card>
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-violet-500" />
              <CardTitle className="text-sm sm:text-base">أداء العروض والمخيمات</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-1 sm:px-4 pb-3 sm:pb-6">
            <OffersAndCampsChart />
          </CardContent>
        </Card>

        {/* WhatsApp trend */}
        <Card className="col-span-1 lg:col-span-2">
          <CardHeader className="pb-2 px-3 sm:px-6 pt-3 sm:pt-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-green-500" />
              <CardTitle className="text-sm sm:text-base">اتجاه رسائل واتساب</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-1 sm:px-4 pb-3 sm:pb-6">
            <WhatsAppTrendChart period={period} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
