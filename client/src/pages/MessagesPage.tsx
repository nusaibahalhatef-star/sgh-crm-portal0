import UnderDevelopmentPage from "@/components/UnderDevelopmentPage";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <UnderDevelopmentPage
      title="الرسائل"
      description="إدارة الرسائل والتواصل مع العملاء"
      icon={MessageSquare}
      currentPath="/dashboard/messages"
      features={[
        "صندوق وارد موحد لجميع الرسائل",
        "الرد على رسائل العملاء",
        "تصنيف الرسائل حسب الأولوية",
        "بحث متقدم في الرسائل",
        "أرشفة الرسائل القديمة",
      ]}
    />
  );
}
