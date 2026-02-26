import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";

/**
 * Hook مشترك لإدارة حالة الشريط الجانبي (expanded/collapsed)
 * 
 * السلوك الديناميكي (Meta Business Suite Style):
 * - في الصفحة الرئيسية (/dashboard): الشريط مفتوح بالكامل (expanded)
 * - في باقي الصفحات: الشريط مطوي (collapsed)
 * - عند hover: يتمدد مؤقتاً ليظهر النصوص
 * 
 * @returns {object} - حالة الشريط ودوال التحكم
 */
export function useSidebarState() {
  const [location] = useLocation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // تحديد ما إذا كنا في الصفحة الرئيسية
  const isHomePage = location === "/dashboard" || location === "/dashboard/";

  // تحديث حالة الشريط بناءً على الصفحة الحالية
  useEffect(() => {
    setIsExpanded(isHomePage);
    setIsHovered(false);
  }, [isHomePage]);

  // دوال التحكم
  const handleMouseEnter = useCallback(() => {
    if (!isHomePage) {
      setIsHovered(true);
    }
  }, [isHomePage]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen(prev => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  // حالة العرض النهائية: مفتوح إذا كان expanded أو hovered
  const shouldShowText = isExpanded || isHovered;

  return {
    isExpanded,
    isHovered,
    isMobileOpen,
    shouldShowText,
    isHomePage,
    handleMouseEnter,
    handleMouseLeave,
    toggleMobile,
    closeMobile,
  };
}
