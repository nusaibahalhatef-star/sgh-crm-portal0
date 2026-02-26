import { useAuth } from "@/_core/hooks/useAuth";
import { APP_LOGO } from "@/const";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Bell, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

interface TopNavbarProps {
  pageTitle?: string;
  pageDescription?: string;
}

export default function TopNavbar({ pageTitle, pageDescription }: TopNavbarProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="bg-white dark:bg-card dark:bg-gray-900 border-b border-border dark:border-gray-700 sticky top-0 z-20">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 md:px-6">
        {/* Page Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <img
            src="/icon-72x72.png"
            alt="المستشفى السعودي الألماني"
            className="h-9 md:h-10 w-auto object-contain flex-shrink-0 lg:hidden"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-foreground dark:text-gray-100 truncate">
              {pageTitle || "لوحة التحكم"}
            </h1>
            {pageDescription && (
              <p className="text-xs text-muted-foreground dark:text-muted-foreground hidden sm:block truncate">
                {pageDescription}
              </p>
            )}
          </div>
        </div>
        
        {/* Left Actions: Notifications + Theme + User */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9"
            onClick={() => setLocation('/dashboard/notifications')}
          >
            <Bell className="h-5 w-5" />
            {/* Notification Badge */}
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-medium leading-tight text-foreground dark:text-gray-100">{user?.name}</p>
                  <p className="text-[11px] text-muted-foreground dark:text-muted-foreground">{user?.role === 'admin' ? 'مدير النظام' : 'مستخدم'}</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center ring-2 ring-blue-100 dark:ring-blue-800">
                  <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="text-right">
                <div>
                  <p className="font-medium text-sm">{user?.name}</p>
                  <p className="text-[11px] text-muted-foreground">{user?.email || 'لا يوجد بريد إلكتروني'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-right text-sm"
                onClick={() => setLocation('/dashboard/profile')}
              >
                <User className="ml-2 h-4 w-4" />
                <span>الملف الشخصي</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer text-right text-sm"
                onClick={() => setLocation('/dashboard/settings')}
              >
                <Settings className="ml-2 h-4 w-4" />
                <span>الإعدادات</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-right text-sm text-red-600 focus:text-red-600"
                onClick={async () => {
                  await logout();
                  toast.success('تم تسجيل الخروج بنجاح');
                  setLocation('/');
                }}
              >
                <LogOut className="ml-2 h-4 w-4" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
