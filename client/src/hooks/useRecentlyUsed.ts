import { useState, useEffect, useCallback } from "react";

const RECENTLY_USED_KEY = "dashboard_recently_used_tools";
const MAX_RECENTLY_USED = 5;

export interface RecentlyUsedTool {
  id: string;
  title: string;
  href: string;
  timestamp: number;
}

/**
 * Hook مشترك لتتبع الأدوات المستخدمة مؤخراً
 * 
 * يحفظ آخر 5 أدوات تم فتحها في localStorage
 * ويعرضها في قسم "المستخدمة مؤخراً" في لوحة كل الأدوات
 * 
 * @returns {object} - قائمة الأدوات المستخدمة مؤخراً ودالة لإضافة أداة جديدة
 */
export function useRecentlyUsed() {
  const [recentlyUsed, setRecentlyUsed] = useState<RecentlyUsedTool[]>([]);

  // تحميل الأدوات المستخدمة مؤخراً من localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENTLY_USED_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentlyUsedTool[];
        // فلترة الأدوات القديمة (أكثر من 7 أيام)
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const filtered = parsed.filter(tool => tool.timestamp > sevenDaysAgo);
        setRecentlyUsed(filtered);
      }
    } catch (error) {
      console.error("[RecentlyUsed] Error loading from localStorage:", error);
    }
  }, []);

  // إضافة أداة جديدة إلى قائمة المستخدمة مؤخراً
  const addRecentlyUsed = useCallback((tool: Omit<RecentlyUsedTool, "timestamp">) => {
    setRecentlyUsed(prev => {
      // إزالة الأداة إذا كانت موجودة بالفعل
      const filtered = prev.filter(t => t.id !== tool.id);
      
      // إضافة الأداة الجديدة في البداية
      const updated = [
        { ...tool, timestamp: Date.now() },
        ...filtered,
      ].slice(0, MAX_RECENTLY_USED);

      // حفظ في localStorage
      try {
        localStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(updated));
      } catch (error) {
        console.error("[RecentlyUsed] Error saving to localStorage:", error);
      }

      return updated;
    });
  }, []);

  // مسح قائمة المستخدمة مؤخراً
  const clearRecentlyUsed = useCallback(() => {
    setRecentlyUsed([]);
    try {
      localStorage.removeItem(RECENTLY_USED_KEY);
    } catch (error) {
      console.error("[RecentlyUsed] Error clearing localStorage:", error);
    }
  }, []);

  return {
    recentlyUsed,
    addRecentlyUsed,
    clearRecentlyUsed,
  };
}
