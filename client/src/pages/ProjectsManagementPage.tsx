import { Construction } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

/**
 * Projects Management Page
 * صفحة إدارة الحملات والمشاريع
 * 
 * Access: Admin & Team Leaders only
 * الصلاحيات: المدير ورؤساء الفرق فقط
 * 
 * Features (قيد التطوير):
 * - إنشاء وإدارة المشاريع والحملات
 * - ربط المهام بالأهداف الكبيرة
 * - متابعة التقدم الإجمالي
 * - تقارير الأداء
 */
export default function ProjectsManagementPage() {
  return (
    <DashboardLayout>
      <div className="container py-6 md:py-8">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            إدارة الحملات والمشاريع
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            ربط المهام بالأهداف الكبيرة ومتابعة التقدم الإجمالي
          </p>
        </div>

        {/* Access Notice */}
        <Alert className="mb-6 border-primary/20 bg-primary/5">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm md:text-base">
            هذه الصفحة مخصصة للمدير ورؤساء الفرق فقط
          </AlertDescription>
        </Alert>

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
              نعمل على إضافة نظام متكامل لإدارة الحملات والمشاريع، يشمل:
            </p>
            <ul className="text-sm md:text-base text-muted-foreground space-y-2 max-w-xl mx-auto text-right">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>إنشاء وإدارة المشاريع والحملات الكبرى</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>ربط المهام بالأهداف الاستراتيجية</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>متابعة التقدم الإجمالي للمشاريع</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>تحليل الأداء عبر الفرق</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>تقارير شاملة للإدارة</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
