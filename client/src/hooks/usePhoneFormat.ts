import { useCallback } from "react";

/**
 * usePhoneFormat - هوك لتوحيد تنسيق وعرض أرقام الهواتف
 * 
 * الاستخدام:
 * const { formatPhone, formatPhoneDisplay, getWhatsAppLink, validateYemeniPhone, convertArabicToEnglish } = usePhoneFormat();
 */

/**
 * تحويل الأرقام العربية/الهندية إلى أرقام إنجليزية
 * ٠١٢٣٤٥٦٧٨٩ → 0123456789
 */
export function convertArabicToEnglish(input: string): string {
  return input
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}

/**
 * تنظيف رقم الهاتف: تحويل الأرقام العربية ثم إزالة الأحرف غير الرقمية
 */
function cleanPhone(phone: string): string {
  const converted = convertArabicToEnglish(phone);
  return converted.replace(/[^\d+]/g, "");
}

/**
 * استخراج الـ 9 أرقام المحلية من أي صيغة للرقم اليمني
 * يدعم: 7XXXXXXXX | 07XXXXXXXX | 9677XXXXXXXX | +9677XXXXXXXX | 009677XXXXXXXX
 */
function extractLocalDigits(phone: string): string | null {
  const cleaned = cleanPhone(phone);

  // +9677XXXXXXXX أو 9677XXXXXXXX
  if (cleaned.startsWith("9677") && cleaned.length === 13) {
    return cleaned.slice(3); // 7XXXXXXXX
  }
  if (cleaned.startsWith("+9677") && cleaned.length === 14) {
    return cleaned.slice(4);
  }
  // 009677XXXXXXXX
  if (cleaned.startsWith("009677") && cleaned.length === 15) {
    return cleaned.slice(5);
  }
  // 07XXXXXXXX
  if (cleaned.startsWith("0") && cleaned.length === 10) {
    return cleaned.slice(1);
  }
  // 7XXXXXXXX (9 digits starting with 7)
  if (cleaned.length === 9) {
    return cleaned;
  }

  return null;
}

/**
 * التحقق من صحة رقم الهاتف اليمني
 * - يجب أن يبدأ بـ 7
 * - يجب أن يكون 9 أرقام (بعد إزالة مفتاح الدولة)
 */
export function validateYemeniPhone(phone: string): { valid: boolean; message?: string } {
  if (!phone || phone.trim() === "") {
    return { valid: false, message: "رقم الهاتف مطلوب" };
  }

  const local = extractLocalDigits(phone);

  if (!local) {
    return {
      valid: false,
      message: "رقم الهاتف غير صحيح - يجب أن يكون 9 أرقام",
    };
  }

  if (!local.startsWith("7")) {
    return {
      valid: false,
      message: "رقم الهاتف اليمني يجب أن يبدأ بالرقم 7",
    };
  }

  return { valid: true };
}

/**
 * تنسيق رقم الهاتف للعرض: +967 7XX XXX XXX
 */
function formatForDisplay(phone: string): string {
  const local = extractLocalDigits(phone);
  if (local && local.startsWith("7") && local.length === 9) {
    return `+967 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6)}`;
  }
  // إرجاع الرقم كما هو (بعد تحويل العربية)
  return convertArabicToEnglish(phone);
}

/**
 * تنسيق رقم الهاتف للإرسال (بدون + أو مسافات): 9677XXXXXXXX
 */
function formatForSend(phone: string): string {
  const local = extractLocalDigits(phone);
  if (local) {
    return "967" + local;
  }
  // fallback: تنظيف وإرجاع
  return cleanPhone(phone);
}

/**
 * معالجة إدخال رقم الهاتف في real-time:
 * - تحويل الأرقام العربية إلى إنجليزية
 * - إزالة الأحرف غير المسموح بها (يُبقي + في البداية)
 * - تقييد الطول
 */
export function processPhoneInput(raw: string): string {
  // تحويل الأرقام العربية أولاً
  let value = convertArabicToEnglish(raw);
  // السماح فقط بالأرقام و + في البداية
  value = value.replace(/[^\d+]/g, "");
  // + مسموح فقط في البداية
  if (value.indexOf("+") > 0) {
    value = value.replace(/\+/g, "");
  }
  // تقييد الطول إلى 15 رقم كحد أقصى
  if (value.length > 15) {
    value = value.slice(0, 15);
  }
  return value;
}

export function usePhoneFormat() {
  /** تنسيق للعرض: +967 7XX XXX XXX */
  const formatPhoneDisplay = useCallback((phone: string | null | undefined): string => {
    if (!phone) return "-";
    return formatForDisplay(phone);
  }, []);

  /** تنسيق للإرسال: 9677XXXXXXXX */
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
    validateYemeniPhone,
    convertArabicToEnglish,
    processPhoneInput,
  };
}

// === Standalone utility functions ===
export { formatForDisplay as formatPhoneDisplayUtil, formatForSend as formatPhoneUtil };
