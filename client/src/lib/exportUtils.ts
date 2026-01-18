import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// تنزيل خط عربي من Google Fonts أو استخدام خط مدمج
// للتبسيط، سنستخدم الخط الافتراضي مع تحسينات

export interface BookingData {
  id: number;
  patientName: string;
  phone: string;
  specialty: string;
  status: string;
  createdAt: Date;
}

export interface ReportStats {
  totalBookings: number;
  newLeads: number;
  conversionRate: number;
  revenue: number;
}

/**
 * تصدير التقارير إلى PDF
 */
export const exportToPDF = (
  bookings: BookingData[],
  stats: ReportStats,
  dateRange: { from: Date; to: Date }
) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // إعدادات الخط والاتجاه
  doc.setR2L(true);
  doc.setLanguage('ar');

  // العنوان الرئيسي
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('تقرير الحجوزات والمواعيد', doc.internal.pageSize.getWidth() / 2, 20, {
    align: 'center',
  });

  // معلومات المستشفى
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('المستشفى السعودي الألماني - صنعاء', doc.internal.pageSize.getWidth() / 2, 28, {
    align: 'center',
  });

  // الفترة الزمنية
  doc.setFontSize(10);
  const fromDate = dateRange.from.toLocaleDateString('ar-YE');
  const toDate = dateRange.to.toLocaleDateString('ar-YE');
  doc.text(`الفترة: من ${fromDate} إلى ${toDate}`, doc.internal.pageSize.getWidth() / 2, 35, {
    align: 'center',
  });

  // خط فاصل
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 38, doc.internal.pageSize.getWidth() - 20, 38);

  // الإحصائيات الرئيسية
  let yPos = 45;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('الإحصائيات الرئيسية', 20, yPos);

  yPos += 8;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const statsData = [
    ['إجمالي الحجوزات', stats.totalBookings.toString()],
    ['العملاء الجدد', stats.newLeads.toString()],
    ['معدل التحويل', `${stats.conversionRate.toFixed(1)}%`],
    ['الإيرادات', `${stats.revenue.toLocaleString('ar-YE')} ريال`],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [['المؤشر', 'القيمة']],
    body: statsData,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 10,
      cellPadding: 3,
      halign: 'right',
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 20, right: 20 },
  });

  // جدول الحجوزات التفصيلية
  yPos = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('الحجوزات التفصيلية', 20, yPos);

  yPos += 5;

  const bookingsData = bookings.map((booking, index) => [
    (index + 1).toString(),
    booking.patientName,
    booking.phone,
    booking.specialty,
    getStatusLabel(booking.status),
    new Date(booking.createdAt).toLocaleDateString('ar-YE'),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [['#', 'اسم المريض', 'الهاتف', 'التخصص', 'الحالة', 'التاريخ']],
    body: bookingsData,
    theme: 'striped',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 2,
      halign: 'right',
    },
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: [250, 250, 250],
    },
    margin: { left: 15, right: 15 },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 40 },
      2: { cellWidth: 30 },
      3: { cellWidth: 35 },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 30, halign: 'center' },
    },
  });

  // تذييل الصفحة
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `صفحة ${i} من ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
    doc.text(
      `تم الإنشاء: ${new Date().toLocaleString('ar-YE')}`,
      doc.internal.pageSize.getWidth() - 20,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }

  // حفظ الملف
  const fileName = `تقرير_الحجوزات_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

/**
 * تصدير التقارير إلى Excel
 */
export const exportToExcel = (
  bookings: BookingData[],
  stats: ReportStats,
  dateRange: { from: Date; to: Date }
) => {
  // إنشاء workbook جديد
  const wb = XLSX.utils.book_new();

  // ورقة الإحصائيات
  const statsData = [
    ['تقرير الحجوزات والمواعيد'],
    ['المستشفى السعودي الألماني - صنعاء'],
    [],
    ['الفترة الزمنية'],
    ['من', dateRange.from.toLocaleDateString('ar-YE')],
    ['إلى', dateRange.to.toLocaleDateString('ar-YE')],
    [],
    ['الإحصائيات الرئيسية'],
    ['المؤشر', 'القيمة'],
    ['إجمالي الحجوزات', stats.totalBookings],
    ['العملاء الجدد', stats.newLeads],
    ['معدل التحويل', `${stats.conversionRate.toFixed(1)}%`],
    ['الإيرادات (ريال)', stats.revenue],
  ];

  const statsWs = XLSX.utils.aoa_to_sheet(statsData);

  // تنسيق عرض الأعمدة
  statsWs['!cols'] = [
    { wch: 25 },
    { wch: 20 },
  ];

  // إضافة الورقة
  XLSX.utils.book_append_sheet(wb, statsWs, 'الإحصائيات');

  // ورقة الحجوزات التفصيلية
  const bookingsData = bookings.map((booking, index) => ({
    '#': index + 1,
    'اسم المريض': booking.patientName,
    'رقم الهاتف': booking.phone,
    'التخصص': booking.specialty,
    'الحالة': getStatusLabel(booking.status),
    'تاريخ الحجز': new Date(booking.createdAt).toLocaleDateString('ar-YE'),
  }));

  const bookingsWs = XLSX.utils.json_to_sheet(bookingsData);

  // تنسيق عرض الأعمدة
  bookingsWs['!cols'] = [
    { wch: 5 },
    { wch: 25 },
    { wch: 15 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
  ];

  // إضافة الورقة
  XLSX.utils.book_append_sheet(wb, bookingsWs, 'الحجوزات التفصيلية');

  // حفظ الملف
  const fileName = `تقرير_الحجوزات_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, fileName);
};

/**
 * دالة مساعدة للحصول على تسمية الحالة بالعربية
 */
function getStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'قيد الانتظار',
    'confirmed': 'مؤكد',
    'completed': 'مكتمل',
    'cancelled': 'ملغي',
  };
  return statusMap[status] || status;
}
