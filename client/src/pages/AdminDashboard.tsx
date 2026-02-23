import ManualRegistrationForm from "@/components/ManualRegistrationForm";
import NotificationCenter from "@/components/NotificationCenter";
import SourceAnalytics from "@/components/SourceAnalytics";
import QuickPatientSearch from "@/components/QuickPatientSearch";
import DetailedStatsCards from "@/components/DetailedStatsCards";
import DashboardCharts from "@/components/DashboardCharts";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminDashboard() {
  return (
    <DashboardLayout
      pageTitle="لوحة التحكم الإدارية"
      pageDescription="إدارة حملات التسويق والعملاء"
    >
      <div className="container px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
        {/* Detailed Stats Cards */}
        <DetailedStatsCards />

        {/* Quick Patient Search & Manual Registration */}
        <div className="flex flex-col md:flex-row gap-3 mb-6 md:mb-8">
          <div className="flex-1">
            <QuickPatientSearch />
          </div>
          <div className="flex-shrink-0">
            <ManualRegistrationForm />
          </div>
        </div>

        {/* Notification Center */}
        <div className="mb-6 md:mb-8">
          <NotificationCenter />
        </div>

        {/* Analytics */}
        <div className="mb-6 md:mb-8">
          <SourceAnalytics />
        </div>

        {/* Charts Dashboard */}
        <div className="mb-6 md:mb-8">
          <DashboardCharts />
        </div>
      </div>
    </DashboardLayout>
  );
}
