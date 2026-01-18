import { Construction } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldCheck } from "lucide-react";

/**
 * Review & Approval Page
 * صفحة المراجعة والاعتماد
 * 
 * Access: Admin & Team Leaders only
 * الصلاحيات: المدير ورؤساء الفرق فقط
 * 
 * Features (قيد التطوير):
 * - عرض جميع التسليمات المرفوعة
 * - مراجعة واعتماد التسليمات
 * - طلب التعديلات
 * - تقارير الجودة
 */
export default function ReviewApprovalPage() {
  return (
    <DashboardLayout>
      <div className="container py-6 md:py-8">
        {/* Page Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            المراجعة والاعتماد
          </h1>
          <p className="text-sm md:text-base text-muted-foreground">
            مراجعة واعتماد تسليمات الفرق
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
              نعمل على إضافة نظام متكامل للمراجعة والاعتماد، يشمل:
            </p>
            <ul className="text-sm md:text-base text-muted-foreground space-y-2 max-w-xl mx-auto text-right">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>عرض جميع التسليمات المرفوعة من الفرق</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>مراجعة التسليمات (فيديوهات، تقارير، تصاميم، إلخ)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>اعتماد أو رفض التسليمات</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>طلب التعديلات والملاحظات</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>تقارير الجودة والأداء</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
