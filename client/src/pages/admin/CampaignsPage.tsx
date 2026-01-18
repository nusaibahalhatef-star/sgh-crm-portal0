import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Filter,
  TrendingUp,
  Target,
  DollarSign,
  Activity,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

// Helper functions
const getCampaignTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    digital: "رقمية",
    field: "ميدانية",
    awareness: "توعوية",
    mixed: "مختلطة",
  };
  return labels[type] || type;
};

const getCampaignStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    draft: "مسودة",
    active: "نشطة",
    paused: "متوقفة",
    completed: "مكتملة",
    cancelled: "ملغاة",
  };
  return labels[status] || status;
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    active: "bg-green-100 text-green-800",
    paused: "bg-yellow-100 text-yellow-800",
    completed: "bg-blue-100 text-blue-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
};

export default function CampaignsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  // Queries
  const { data: overview, isLoading: loadingOverview } = trpc.campaigns.getOverview.useQuery();
  const { data: campaigns, isLoading: loadingCampaigns, refetch } = trpc.campaigns.list.useQuery({
    status: statusFilter || undefined,
    type: typeFilter || undefined,
    search: searchQuery || undefined,
  });

  // Mutations
  const utils = trpc.useUtils();
  const createMutation = trpc.campaigns.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء الحملة بنجاح");
      setIsCreateDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل إنشاء الحملة: ${error.message}`);
    },
  });

  const updateMutation = trpc.campaigns.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الحملة بنجاح");
      setIsEditDialogOpen(false);
      setSelectedCampaign(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل تحديث الحملة: ${error.message}`);
    },
  });

  const deleteMutation = trpc.campaigns.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الحملة بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(`فشل حذف الحملة: ${error.message}`);
    },
  });

  const handleCreateCampaign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createMutation.mutate({
      name: formData.get("name") as string,
      slug: formData.get("slug") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as any,
      status: formData.get("status") as any,
      plannedBudget: formData.get("plannedBudget") ? Number(formData.get("plannedBudget")) : undefined,
      targetLeads: formData.get("targetLeads") ? Number(formData.get("targetLeads")) : undefined,
      targetBookings: formData.get("targetBookings") ? Number(formData.get("targetBookings")) : undefined,
    });
  };

  const handleEditCampaign = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCampaign) return;
    
    const formData = new FormData(e.currentTarget);
    
    updateMutation.mutate({
      id: selectedCampaign.id,
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      type: formData.get("type") as any,
      status: formData.get("status") as any,
      plannedBudget: formData.get("plannedBudget") ? Number(formData.get("plannedBudget")) : undefined,
      targetLeads: formData.get("targetLeads") ? Number(formData.get("targetLeads")) : undefined,
      targetBookings: formData.get("targetBookings") ? Number(formData.get("targetBookings")) : undefined,
    });
  };

  const handleDeleteCampaign = (id: number) => {
    if (confirm("هل أنت متأكد من حذف هذه الحملة؟")) {
      deleteMutation.mutate({ id });
    }
  };

  return (
    <DashboardLayout
      pageTitle="إدارة الحملات"
      pageDescription="إدارة الحملات التسويقية والمشاريع"
    >
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                إجمالي الحملات
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOverview ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{overview?.totalCampaigns || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                الحملات النشطة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOverview ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold text-green-600">{overview?.activeCampaigns || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                الميزانية المخططة
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOverview ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold">{overview?.totalPlannedBudget?.toLocaleString() || 0} ريال</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Target className="h-4 w-4" />
                الميزانية الفعلية
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOverview ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <div className="text-2xl font-bold text-blue-600">{overview?.totalActualBudget?.toLocaleString() || 0} ريال</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>قائمة الحملات</CardTitle>
                <CardDescription>إدارة جميع الحملات التسويقية</CardDescription>
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="ml-2 h-4 w-4" />
                إضافة حملة جديدة
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="بحث في الحملات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="active">نشطة</SelectItem>
                  <SelectItem value="paused">متوقفة</SelectItem>
                  <SelectItem value="completed">مكتملة</SelectItem>
                  <SelectItem value="cancelled">ملغاة</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="النوع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الأنواع</SelectItem>
                  <SelectItem value="digital">رقمية</SelectItem>
                  <SelectItem value="field">ميدانية</SelectItem>
                  <SelectItem value="awareness">توعوية</SelectItem>
                  <SelectItem value="mixed">مختلطة</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {loadingCampaigns ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الاسم</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">الميزانية المخططة</TableHead>
                      <TableHead className="text-right">الهدف</TableHead>
                      <TableHead className="text-right">تاريخ البدء</TableHead>
                      <TableHead className="text-right">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign: any) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>{getCampaignTypeLabel(campaign.type)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(campaign.status)}>
                            {getCampaignStatusLabel(campaign.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {campaign.plannedBudget ? `${campaign.plannedBudget.toLocaleString()} ${campaign.currency || 'YER'}` : '-'}
                        </TableCell>
                        <TableCell>
                          {campaign.targetLeads ? `${campaign.targetLeads} عميل` : '-'}
                        </TableCell>
                        <TableCell>
                          {campaign.startDate ? format(new Date(campaign.startDate), 'dd MMM yyyy', { locale: ar }) : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedCampaign(campaign);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCampaign(campaign.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                لا توجد حملات
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>إضافة حملة جديدة</DialogTitle>
              <DialogDescription>
                أدخل معلومات الحملة التسويقية
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateCampaign}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">اسم الحملة *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="slug">الرابط المختصر *</Label>
                  <Input id="slug" name="slug" required placeholder="campaign-name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">الوصف</Label>
                  <Textarea id="description" name="description" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="type">النوع *</Label>
                    <Select name="type" required defaultValue="digital">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">رقمية</SelectItem>
                        <SelectItem value="field">ميدانية</SelectItem>
                        <SelectItem value="awareness">توعوية</SelectItem>
                        <SelectItem value="mixed">مختلطة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="status">الحالة *</Label>
                    <Select name="status" required defaultValue="draft">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">مسودة</SelectItem>
                        <SelectItem value="active">نشطة</SelectItem>
                        <SelectItem value="paused">متوقفة</SelectItem>
                        <SelectItem value="completed">مكتملة</SelectItem>
                        <SelectItem value="cancelled">ملغاة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="plannedBudget">الميزانية المخططة</Label>
                    <Input id="plannedBudget" name="plannedBudget" type="number" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="targetLeads">هدف العملاء</Label>
                    <Input id="targetLeads" name="targetLeads" type="number" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="targetBookings">هدف الحجوزات</Label>
                    <Input id="targetBookings" name="targetBookings" type="number" />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                  إنشاء الحملة
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل الحملة</DialogTitle>
              <DialogDescription>
                تحديث معلومات الحملة التسويقية
              </DialogDescription>
            </DialogHeader>
            {selectedCampaign && (
              <form onSubmit={handleEditCampaign}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-name">اسم الحملة *</Label>
                    <Input id="edit-name" name="name" required defaultValue={selectedCampaign.name} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-description">الوصف</Label>
                    <Textarea id="edit-description" name="description" rows={3} defaultValue={selectedCampaign.description || ""} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-type">النوع *</Label>
                      <Select name="type" required defaultValue={selectedCampaign.type}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="digital">رقمية</SelectItem>
                          <SelectItem value="field">ميدانية</SelectItem>
                          <SelectItem value="awareness">توعوية</SelectItem>
                          <SelectItem value="mixed">مختلطة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-status">الحالة *</Label>
                      <Select name="status" required defaultValue={selectedCampaign.status}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">مسودة</SelectItem>
                          <SelectItem value="active">نشطة</SelectItem>
                          <SelectItem value="paused">متوقفة</SelectItem>
                          <SelectItem value="completed">مكتملة</SelectItem>
                          <SelectItem value="cancelled">ملغاة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-plannedBudget">الميزانية المخططة</Label>
                      <Input id="edit-plannedBudget" name="plannedBudget" type="number" defaultValue={selectedCampaign.plannedBudget || ""} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-targetLeads">هدف العملاء</Label>
                      <Input id="edit-targetLeads" name="targetLeads" type="number" defaultValue={selectedCampaign.targetLeads || ""} />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-targetBookings">هدف الحجوزات</Label>
                      <Input id="edit-targetBookings" name="targetBookings" type="number" defaultValue={selectedCampaign.targetBookings || ""} />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
                    حفظ التغييرات
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
