/**
 * OfflineIndicator - مؤشر الاتصال بالإنترنت
 * Shows online/offline status with smooth transitions
 */
import { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      
      // Hide indicator after 3 seconds when back online
      setTimeout(() => {
        setShowIndicator(false);
      }, 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Don't show anything if online and indicator is hidden
  if (isOnline && !showIndicator) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        showIndicator ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      )}
    >
      <div
        className={cn(
          "px-4 py-2 text-center text-sm font-medium text-white shadow-lg",
          isOnline
            ? "bg-green-600"
            : "bg-red-600"
        )}
        dir="rtl"
      >
        <div className="flex items-center justify-center gap-2">
          {isOnline ? (
            <>
              <Wifi className="w-4 h-4" />
              <span>تم استعادة الاتصال بالإنترنت</span>
            </>
          ) : (
            <>
              <WifiOff className="w-4 h-4" />
              <span>لا يوجد اتصال بالإنترنت - تعمل في وضع عدم الاتصال</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
