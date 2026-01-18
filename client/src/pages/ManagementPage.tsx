import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import OffersManagement from "@/components/OffersManagement";
import CampsManagement from "@/components/CampsManagement";
import DoctorsManagement from "@/components/DoctorsManagement";

export default function ManagementPage() {
  const { user, loading, error } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("offers");
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل الخروج بنجاح");
      setLocation("/");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error || !user || user.role !== "admin") {
    setLocation("/unauthorized");
    return null;
  }

  return (
    <DashboardLayout
      pageTitle="الإدارة"
      pageDescription="إدارة العروض والمخيمات والأطباء"
    >
      {/* Main Content */}
      <main className="flex-1 container py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-2xl mx-auto">
            <TabsTrigger value="offers">إدارة العروض</TabsTrigger>
            <TabsTrigger value="camps">إدارة المخيمات</TabsTrigger>
            <TabsTrigger value="doctors">إدارة الأطباء</TabsTrigger>
          </TabsList>
          
          <TabsContent value="offers" className="space-y-6">
            <OffersManagement />
          </TabsContent>
          
          <TabsContent value="camps" className="space-y-6">
            <CampsManagement />
          </TabsContent>
          
          <TabsContent value="doctors" className="space-y-6">
            <DoctorsManagement />
          </TabsContent>
        </Tabs>
      </main>
    </DashboardLayout>
  );
}
