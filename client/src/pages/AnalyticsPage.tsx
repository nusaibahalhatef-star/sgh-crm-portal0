import UnderDevelopmentPage from "@/components/UnderDevelopmentPage";
import { BarChart3 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <UnderDevelopmentPage
      title="التحليلات"
      description="تحليلات متقدمة وإحصائيات تفصيلية"
      icon={BarChart3}
      currentPath="/dashboard/analytics"
      features={[
        "لوحة تحليلات تفاعلية",
        "رسوم بيانية لأداء الحملات",
        "تحليل سلوك المستخدمين",
        "مقارنة الأداء عبر الفترات الزمنية",
        "توصيات ذكية لتحسين الأداء",
      ]}
    />
  );
}
