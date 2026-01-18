import { Construction } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Field Marketing Team Page
 * صفحة فريق التسويق الميداني
 * 
 * Features (قيد التطوير):
 * - إنشاء وتوزيع مهام الزيارات الميدانية
 * - متابعة الفعاليات والأنشطة
 * - رفع التقارير الميدانية
 * - تتبع المواقع والزيارات
 */
export default function FieldMarketingTeamPage() {
  return (
    <DashboardLayout
      pageTitle="فريق التسويق الميداني"
      pageDescription="إدارة ومتابعة فريق التسويق الميداني">
      <div className="container py-6 md:py-8">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            فريق التسويق الميداني
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            إدارة مهام الزيارات والفعاليات الميدانية
          </p>
        </div>

        {/* Under Development Notice */}
        <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Construction className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>
            <CardTitle className="text-xl md:text-2xl">قيد التطوير</CardTitle>
            <CardDescription className="text-base md:text-lg mt-2">
              هذه الصفحة قيد التطوير حالياً
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
              نعمل على إضافة نظام متكامل لإدارة مهام فريق التسويق الميداني، يشمل:
            </p>
            <ul className="text-sm md:text-base text-muted-foreground space-y-2 max-w-xl mx-auto text-right">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>إنشاء وتوزيع مهام الزيارات الميدانية</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>متابعة الفعاليات والأنشطة الترويجية</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>رفع التقارير الميدانية والصور</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>تتبع المواقع والمسارات</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>تقارير الأداء الميداني</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
