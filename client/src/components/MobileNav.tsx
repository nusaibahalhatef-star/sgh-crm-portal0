import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Home,
  Calendar,
  Tag,
  Tent,
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { APP_LOGO, APP_TITLE } from "@/const";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("تم تسجيل الخروج بنجاح");
      window.location.href = "/";
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
    setOpen(false);
  };

  const publicLinks = [
    { href: "/", label: "الرئيسية", icon: Home },
    { href: "/doctors", label: "الأطباء", icon: Users },
    { href: "/offers", label: "العروض", icon: Tag },
    { href: "/camps", label: "المخيمات الطبية", icon: Tent },
  ];

  const dashboardLinks = [
    { href: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    { href: "/dashboard/bookings", label: "إدارة الحجوزات", icon: Calendar },
    { href: "/dashboard/content", label: "إدارة المحتوى", icon: Settings },
    { href: "/dashboard/users", label: "إدارة المستخدمين", icon: Users },
  ];

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b">
      <div className="flex items-center justify-between px-4 h-16">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] sm:w-[320px]">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center gap-3 pb-6 border-b">
                {APP_LOGO && (
                  <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10 object-contain" />
                )}
                <div className="flex-1">
                  <h2 className="font-bold text-lg">{APP_TITLE}</h2>
                  {isAuthenticated && user && (
                    <p className="text-sm text-muted-foreground">{user.name || user.username}</p>
                  )}
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 py-6 space-y-1">
                {/* Public Links */}
                <div className="space-y-1">
                  {publicLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link key={link.href} href={link.href}>
                        <Button
                          variant={isActive(link.href) ? "secondary" : "ghost"}
                          className="w-full justify-start gap-3 h-12"
                          onClick={() => setOpen(false)}
                        >
                          <Icon className="h-5 w-5" />
                          {link.label}
                        </Button>
                      </Link>
                    );
                  })}
                </div>

                {/* Dashboard Links (if authenticated) */}
                {isAuthenticated && (
                  <>
                    <div className="py-3">
                      <div className="h-px bg-border" />
                    </div>
                    <div className="space-y-1">
                      {dashboardLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                          <Link key={link.href} href={link.href}>
                            <Button
                              variant={isActive(link.href) ? "secondary" : "ghost"}
                              className="w-full justify-start gap-3 h-12"
                              onClick={() => setOpen(false)}
                            >
                              <Icon className="h-5 w-5" />
                              {link.label}
                            </Button>
                          </Link>
                        );
                      })}
                    </div>
                  </>
                )}
              </nav>

              {/* Footer Actions */}
              <div className="pt-6 border-t space-y-2">
                {isAuthenticated ? (
                  <>
                    <Link href="/dashboard/profile">
                      <Button
                        variant="outline"
                        className="w-full justify-start gap-3 h-12"
                        onClick={() => setOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        الملف الشخصي
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-700"
                      onClick={handleLogout}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="h-5 w-5" />
                      تسجيل الخروج
                    </Button>
                  </>
                ) : (
                  <Link href="/dashboard">
                    <Button className="w-full h-12" onClick={() => setOpen(false)}>
                      تسجيل الدخول
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Logo in center */}
        <Link href="/">
          <div className="flex items-center gap-2">
            {APP_LOGO && (
              <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8 object-contain" />
            )}
            <span className="font-bold text-sm">{APP_TITLE}</span>
          </div>
        </Link>

        {/* Placeholder for balance */}
        <div className="w-10" />
      </div>
    </div>
  );
}
