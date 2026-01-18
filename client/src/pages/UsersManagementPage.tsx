import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Power, 
  Search, 
  UserCheck, 
  UserX, 
  Mail, 
  Phone,
  Users,
  UserCog,
  Shield,
  Download,
  Loader2,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import RecentActivity from "@/components/RecentActivity";

const roleLabels: Record<string, string> = {
  admin: "مسؤول",
  manager: "مدير",
  staff: "موظف",
  viewer: "مشاهد",
  user: "مستخدم",
};

const roleColors: Record<string, string> = {
  admin: "bg-red-100 text-red-800 border-red-200",
  manager: "bg-blue-100 text-blue-800 border-blue-200",
  staff: "bg-green-100 text-green-800 border-green-200",
  viewer: "bg-gray-100 text-gray-800 border-gray-200",
  user: "bg-purple-100 text-purple-800 border-purple-200",
};

// Helper function to get initials from name
const getInitials = (name: string) => {
  if (!name) return "؟";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return parts[0][0] + parts[1][0];
  }
  return name[0];
};

// Helper function to export users to CSV
const exportToCSV = (users: any[]) => {
  const headers = ["اسم المستخدم", "الاسم الكامل", "البريد الإلكتروني", "الدور", "الحالة", "آخر تسجيل دخول"];
  const rows = users.map(user => [
    user.username,
    user.name || "-",
    user.email || "-",
    roleLabels[user.role],
    user.isActive === "yes" ? "نشط" : "معطل",
    user.lastSignedIn ? new Date(user.lastSignedIn).toLocaleDateString("ar-EG") : "-"
  ]);
  
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");
  
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

export default function UsersManagementPage() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [activeSection, setActiveSection] = useState<"users" | "requests" | "activity">("users");
  const [editingUser, setEditingUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "user" as "user" | "admin" | "manager" | "staff" | "viewer",
    isActive: "yes" as "yes" | "no",
  });

  const { data: users, isLoading, refetch } = trpc.users.getAll.useQuery();
  const { data: accessRequests, refetch: refetchRequests } = trpc.accessRequests.pending.useQuery();

  const approveMutation = trpc.accessRequests.approve.useMutation({
    onSuccess: () => {
      toast.success("تمت الموافقة على الطلب بنجاح");
      refetchRequests();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء معالجة الطلب");
    },
  });

  const rejectMutation = trpc.accessRequests.reject.useMutation({
    onSuccess: () => {
      toast.success("تم رفض الطلب");
      refetchRequests();
    },
    onError: () => {
      toast.error("حدث خطأ أثناء معالجة الطلب");
    },
  });

  const createMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      toast.success("تم إنشاء المستخدم بنجاح");
      refetch();
      resetForm();
      setShowAddDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "فشل إنشاء المستخدم");
    },
  });

  const updateMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المستخدم بنجاح");
      refetch();
      resetForm();
      setShowAddDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || "فشل تحديث المستخدم");
    },
  });

  const deleteMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف المستخدم بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل حذف المستخدم");
    },
  });

  const toggleActiveMutation = trpc.users.toggleActive.useMutation({
    onSuccess: (data) => {
      toast.success(data.newStatus === "yes" ? "تم تفعيل المستخدم" : "تم تعطيل المستخدم");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "فشل تغيير حالة المستخدم");
    },
  });

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      name: "",
      email: "",
      role: "user",
      isActive: "yes",
    });
    setEditingUser(null);
  };

  const handleSubmit = () => {
    if (editingUser) {
      const updateData: any = {
        id: editingUser.id,
        ...formData,
      };
      if (!formData.password) {
        delete updateData.password;
      }
      updateMutation.mutate(updateData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: "",
      name: user.name || "",
      email: user.email || "",
      role: user.role,
      isActive: user.isActive,
    });
    setShowAddDialog(true);
  };

  const handleDelete = (userId: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      deleteMutation.mutate({ id: userId });
    }
  };

  const handleToggleActive = (userId: number) => {
    toggleActiveMutation.mutate({ id: userId });
  };

  // Filter users
  const filteredUsers = users?.filter((user) => {
    const matchesSearch = 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.isActive === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Calculate statistics
  const totalUsers = users?.length || 0;
  const activeUsers = users?.filter(u => u.isActive === "yes").length || 0;
  const adminUsers = users?.filter(u => u.role === "admin").length || 0;

  if (isLoading) {
    return (
      <DashboardLayout
        pageTitle="إدارة المستخدمين"
        pageDescription="إدارة ومتابعة مستخدمي النظام"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      pageTitle="إدارة المستخدمين"
      pageDescription="إدارة ومتابعة مستخدمي النظام"
    >
      <div className="space-y-6">
        {/* Section Tabs */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeSection === "users" ? "default" : "outline"}
            onClick={() => setActiveSection("users")}
            className="flex-1 sm:flex-none"
          >
            <Users className="w-4 h-4 ml-2" />
            إدارة المستخدمين
          </Button>
          <Button
            variant={activeSection === "requests" ? "default" : "outline"}
            onClick={() => setActiveSection("requests")}
            className="flex-1 sm:flex-none relative"
          >
            <UserCheck className="w-4 h-4 ml-2" />
            طلبات التصريح
            {accessRequests && accessRequests.length > 0 && (
              <Badge className="mr-2 bg-red-500 text-white">
                {accessRequests.length}
              </Badge>
            )}
          </Button>
          <Button
            variant={activeSection === "activity" ? "default" : "outline"}
            onClick={() => setActiveSection("activity")}
            className="flex-1 sm:flex-none"
          >
            <UserCog className="w-4 h-4 ml-2" />
            تتبع النشاط
          </Button>
        </div>

        {/* Users Section */}
        {activeSection === "users" && (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    إجمالي المستخدمين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalUsers}</div>
                  <p className="text-xs text-gray-500 mt-1">جميع المستخدمين المسجلين</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <UserCheck className="h-4 w-4" />
                    المستخدمون النشطون
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{activeUsers}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0}% من الإجمالي
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    المسؤولون
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{adminUsers}</div>
                  <p className="text-xs text-gray-500 mt-1">مستخدمون بصلاحيات كاملة</p>
                </CardContent>
              </Card>
            </div>

            {/* Main Card */}
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle>قائمة المستخدمين</CardTitle>
                    <CardDescription>إدارة المستخدمين والأدوار والصلاحيات</CardDescription>
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => filteredUsers && exportToCSV(filteredUsers)}
                      className="flex-1 sm:flex-none"
                    >
                      <Download className="w-4 h-4 ml-2" />
                      تصدير
                    </Button>
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                      <DialogTrigger asChild>
                        <Button onClick={resetForm} size="sm" className="flex-1 sm:flex-none">
                          <UserPlus className="w-4 h-4 ml-2" />
                          إضافة مستخدم
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {editingUser ? "تعديل مستخدم" : "إضافة مستخدم جديد"}
                          </DialogTitle>
                          <DialogDescription>
                            {editingUser ? "تحديث معلومات المستخدم" : "إنشاء حساب مستخدم جديد في النظام"}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="username">اسم المستخدم *</Label>
                            <Input
                              id="username"
                              value={formData.username}
                              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                              placeholder="أدخل اسم المستخدم"
                              disabled={!!editingUser}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">
                              كلمة المرور {editingUser ? "(اتركها فارغة لعدم التغيير)" : "*"}
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              placeholder="أدخل كلمة المرور"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="name">الاسم الكامل</Label>
                            <Input
                              id="name"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="أدخل الاسم الكامل"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="example@domain.com"
                              dir="ltr"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="role">الدور *</Label>
                            <Select
                              value={formData.role}
                              onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">مستخدم</SelectItem>
                                <SelectItem value="viewer">مشاهد</SelectItem>
                                <SelectItem value="staff">موظف</SelectItem>
                                <SelectItem value="manager">مدير</SelectItem>
                                <SelectItem value="admin">مسؤول</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="isActive">الحالة *</Label>
                            <Select
                              value={formData.isActive}
                              onValueChange={(value: any) => setFormData({ ...formData, isActive: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="yes">نشط</SelectItem>
                                <SelectItem value="no">معطل</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => {
                              resetForm();
                              setShowAddDialog(false);
                            }}
                          >
                            إلغاء
                          </Button>
                          <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                            {(createMutation.isPending || updateMutation.isPending) && (
                              <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                            )}
                            {editingUser ? "تحديث" : "إضافة"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="بحث عن مستخدم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="w-4 h-4 ml-2" />
                      <SelectValue placeholder="الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأدوار</SelectItem>
                      <SelectItem value="admin">مسؤول</SelectItem>
                      <SelectItem value="manager">مدير</SelectItem>
                      <SelectItem value="staff">موظف</SelectItem>
                      <SelectItem value="viewer">مشاهد</SelectItem>
                      <SelectItem value="user">مستخدم</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <Filter className="w-4 h-4 ml-2" />
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="yes">نشط</SelectItem>
                      <SelectItem value="no">معطل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">المستخدم</TableHead>
                        <TableHead className="text-right hidden md:table-cell">البريد الإلكتروني</TableHead>
                        <TableHead className="text-right">الدور</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right hidden lg:table-cell">آخر تسجيل</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers && filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                                    {getInitials(user.name || user.username)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{user.name || user.username}</div>
                                  <div className="text-sm text-gray-500">@{user.username}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell" dir="ltr">
                              {user.email || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge className={roleColors[user.role] + " border"}>
                                {roleLabels[user.role]}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.isActive === "yes" ? "default" : "secondary"}>
                                {user.isActive === "yes" ? "نشط" : "معطل"}
                              </Badge>
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-sm text-gray-500">
                              {user.lastSignedIn
                                ? new Date(user.lastSignedIn).toLocaleDateString("ar-EG")
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEdit(user)}
                                  title="تعديل"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleActive(user.id)}
                                  title={user.isActive === "yes" ? "تعطيل" : "تفعيل"}
                                >
                                  <Power className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDelete(user.id)}
                                  className="text-red-600 hover:text-red-700"
                                  title="حذف"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <div className="text-gray-500">
                              <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                              <p>لا توجد نتائج</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Results Count */}
                {filteredUsers && filteredUsers.length > 0 && (
                  <div className="mt-4 text-sm text-gray-600">
                    عرض {filteredUsers.length} من أصل {totalUsers} مستخدم
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Role Descriptions */}
            <Card>
              <CardHeader>
                <CardTitle>وصف الأدوار والصلاحيات</CardTitle>
                <CardDescription>تفاصيل الصلاحيات لكل دور في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <Badge className={roleColors.admin + " mb-2 border"}>مسؤول</Badge>
                    <p className="text-sm text-gray-600">
                      صلاحيات كاملة لإدارة النظام، المستخدمين، والإعدادات
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Badge className={roleColors.manager + " mb-2 border"}>مدير</Badge>
                    <p className="text-sm text-gray-600">
                      إدارة المحتوى والحجوزات والتقارير
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Badge className={roleColors.staff + " mb-2 border"}>موظف</Badge>
                    <p className="text-sm text-gray-600">
                      معالجة الحجوزات وتحديث البيانات
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Badge className={roleColors.viewer + " mb-2 border"}>مشاهد</Badge>
                    <p className="text-sm text-gray-600">
                      عرض البيانات والتقارير فقط دون تعديل
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <Badge className={roleColors.user + " mb-2 border"}>مستخدم</Badge>
                    <p className="text-sm text-gray-600">
                      صلاحيات محدودة للوصول الأساسي
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Access Requests Section */}
        {activeSection === "requests" && (
          <Card>
            <CardHeader>
              <CardTitle>طلبات التصريح المعلقة</CardTitle>
              <CardDescription>مراجعة والموافقة على طلبات الوصول الجديدة</CardDescription>
            </CardHeader>
            <CardContent>
              {!accessRequests || accessRequests.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-gray-600 mb-2">
                    لا توجد طلبات معلقة
                  </p>
                  <p className="text-sm text-gray-500">
                    جميع طلبات الوصول تمت معالجتها
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الاسم</TableHead>
                        <TableHead className="text-right hidden md:table-cell">البريد الإلكتروني</TableHead>
                        <TableHead className="text-right hidden lg:table-cell">الهاتف</TableHead>
                        <TableHead className="text-right hidden xl:table-cell">السبب</TableHead>
                        <TableHead className="text-right">تاريخ الطلب</TableHead>
                        <TableHead className="text-right">الإجراءات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell className="font-medium">{request.name}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-sm" dir="ltr">{request.email}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {request.phone ? (
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span dir="ltr">{request.phone}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400 text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            <span className="text-sm text-gray-600">
                              {request.reason || "غير محدد"}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-gray-600">
                              {new Date(request.requestedAt).toLocaleDateString('ar-YE')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => approveMutation.mutate({ requestId: request.id })}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                              >
                                <UserCheck className="w-4 h-4 ml-1" />
                                موافقة
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => rejectMutation.mutate({ requestId: request.id })}
                                disabled={approveMutation.isPending || rejectMutation.isPending}
                              >
                                <UserX className="w-4 h-4 ml-1" />
                                رفض
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Activity Section */}
        {activeSection === "activity" && (
          <Card>
            <CardHeader>
              <CardTitle>تتبع النشاط الحي</CardTitle>
              <CardDescription>عرض آخر الأنشطة والعمليات في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
