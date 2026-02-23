import { useCallback } from "react";

/**
 * usePhoneFormat - هوك لتوحيد تنسيق وعرض أرقام الهواتف
 * 
 * الاستخدام:
 * const { formatPhone, formatPhoneDisplay, getWhatsAppLink } = usePhoneFormat();
 * 
 * <td>{formatPhoneDisplay(lead.phone)}</td>
 * <a href={getWhatsAppLink(lead.phone)}>واتساب</a>
 */

/**
 * تنظيف رقم الهاتف من الأحرف غير الرقمية
 */
function cleanPhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "");
}

/**
 * تنسيق رقم الهاتف للعرض: +967 7XX XXX XXX
 */
function formatForDisplay(phone: string): string {
  const cleaned = cleanPhone(phone);
  
  // إذا كان يبدأ بـ 967
  if (cleaned.startsWith("967") && cleaned.length === 12) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 4)}${cleaned.slice(4, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }
  
  // إذا كان يبدأ بـ +967
  if (cleaned.startsWith("+967")) {
    const digits = cleaned.slice(1);
    if (digits.length === 12) {
      return `+${digits.slice(0, 3)} ${digits.slice(3, 4)}${digits.slice(4, 6)} ${digits.slice(6, 9)} ${digits.slice(9)}`;
    }
  }
  
  // إرجاع الرقم كما هو
  return phone;
}

/**
 * تنسيق رقم الهاتف للإرسال (بدون + أو مسافات)
 */
function formatForSend(phone: string): string {
  let cleaned = phone.replace(/[^\d]/g, "");
  
  if (cleaned.startsWith("00967")) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 10) {
    cleaned = "967" + cleaned.substring(1);
  } else if (cleaned.length === 9) {
    cleaned = "967" + cleaned;
  }
  
  return cleaned;
}

export function usePhoneFormat() {
  /** تنسيق للعرض: +967 7XX XXX XXX */
  const formatPhoneDisplay = useCallback((phone: string | null | undefined): string => {
    if (!phone) return "-";
    return formatForDisplay(phone);
  }, []);

  /** تنسيق للإرسال: 967XXXXXXXXX */
  const formatPhone = useCallback((phone: string | null | undefined): string => {
    if (!phone) return "";
    return formatForSend(phone);
  }, []);

  /** رابط واتساب */
  const getWhatsAppLink = useCallback((phone: string | null | undefined): string => {
    if (!phone) return "#";
    const formatted = formatForSend(phone);
    return `https://wa.me/${formatted}`;
  }, []);

  /** رابط اتصال */
  const getCallLink = useCallback((phone: string | null | undefined): string => {
    if (!phone) return "#";
    const formatted = formatForSend(phone);
    return `tel:+${formatted}`;
  }, []);

  return {
    formatPhoneDisplay,
    formatPhone,
    getWhatsAppLink,
    getCallLink,
  };
}

// === Standalone utility functions ===
export { formatForDisplay as formatPhoneDisplayUtil, formatForSend as formatPhoneUtil };
