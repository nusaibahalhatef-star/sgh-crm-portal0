import UnderDevelopmentPage from "@/components/UnderDevelopmentPage";
import { MessageCircle } from "lucide-react";

export default function WhatsAppPage() {
  return (
    <UnderDevelopmentPage
      title="واتس اب"
      description="إدارة رسائل واتس اب والتذكيرات التلقائية"
      icon={MessageCircle}
      currentPath="/dashboard/whatsapp"
      features={[
        "إرسال رسائل واتس اب جماعية",
        "تذكيرات تلقائية قبل المواعيد",
        "قوالب رسائل جاهزة",
        "تتبع حالة الرسائل (تم الإرسال/القراءة)",
        "ردود تلقائية على الاستفسارات الشائعة",
      ]}
    />
  );
}
