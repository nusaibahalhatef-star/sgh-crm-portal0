import { Construction } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Customer Service Team Page
 * صفحة فريق خدمة العملاء
 * 
 * Features (قيد التطوير):
 * - إنشاء وتوزيع مهام متابعة العملاء
 * - متابعة رحلة العميل
 * - رفع التقارير والملاحظات
 * - تحسين تجربة العميل
 */
export default function CustomerServiceTeamPage() {
  return (
    <DashboardLayout>
      <div className="container py-6 md:py-8">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            فريق خدمة العملاء
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            متابعة رحلة العميل وتحسين التجربة
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
              نعمل على إضافة نظام متكامل لإدارة مهام فريق خدمة العملاء، يشمل:
            </p>
            <ul className="text-sm md:text-base text-muted-foreground space-y-2 max-w-xl mx-auto text-right">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>إنشاء وتوزيع مهام متابعة العملاء</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>متابعة رحلة العميل من التسجيل إلى ما بعد الخدمة</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>رفع التقارير والملاحظات</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>تحليل رضا العملاء</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>تقارير تحسين التجربة</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
