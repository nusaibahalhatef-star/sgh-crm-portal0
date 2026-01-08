import UnderDevelopmentPage from "@/components/UnderDevelopmentPage";
import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <UnderDevelopmentPage
      title="التقارير"
      description="تقارير مفصلة عن أداء المنصة"
      icon={FileText}
      currentPath="/dashboard/reports"
      features={[
        "تقارير الحجوزات والمواعيد",
        "تقارير العملاء الجدد",
        "تقارير معدلات التحويل",
        "تقارير الإيرادات والأرباح",
        "تصدير التقارير بصيغة PDF و Excel",
      ]}
    />
  );
}
