import { Construction } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Digital Marketing Team Page
 * صفحة فريق التسويق الرقمي
 * 
 * Features (قيد التطوير):
 * - إنشاء وتوزيع مهام المحتوى الرقمي
 * - متابعة الحملات الإلكترونية
 * - رفع التسليمات (تصاميم، منشورات، إلخ)
 * - تقارير الأداء الرقمي
 */
export default function DigitalMarketingTeamPage() {
  return (
    <DashboardLayout>
      <div className="container py-6 md:py-8">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            فريق التسويق الرقمي
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            إدارة مهام المحتوى الرقمي والحملات الإلكترونية
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
              نعمل على إضافة نظام متكامل لإدارة مهام فريق التسويق الرقمي، يشمل:
            </p>
            <ul className="text-sm md:text-base text-muted-foreground space-y-2 max-w-xl mx-auto text-right">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>إنشاء وتوزيع المهام (منشورات، تصاميم، حملات إعلانية)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>متابعة التقدم والمواعيد النهائية</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>رفع التسليمات ومراجعتها</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>تقارير الأداء والإحصائيات</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>التكامل مع أدوات التسويق الرقمي</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
