/**
 * MetaPixel - مكوّن Meta Pixel
 *
 * سياسة التتبع (وفق توجيهات Meta لمزودي الرعاية الصحية):
 * - PageView: يُرسَل لجميع الزوار فور تحميل الصفحة (لبناء جمهور شامل)
 * - أحداث التحويل (Lead, ViewContent, ...): تُرسَل فقط عند موافقة المستخدم
 *   على الكوكيز التسويقية
 * - لا تُرسَل أي بيانات طبية حساسة (تشخيصات، أدوية، حالات مرضية)
 *
 * يستخدم VITE_META_PIXEL_ID من متغيرات البيئة.
 * يُضاف مرة واحدة في App.tsx ليعمل على جميع صفحات الموقع.
 */

import { useEffect, useRef } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _fbq: any;
    FB_PIXEL_LOADED?: boolean;
  }
}

const PIXEL_ID = (import.meta.env.VITE_META_PIXEL_ID as string | undefined) || "";

// مفاتيح localStorage — يجب أن تتطابق مع CookieConsentBanner.tsx
const COOKIE_CONSENT_KEY = "sgh_cookie_consent";
const COOKIE_PREFS_KEY = "sgh_cookie_preferences";

/** تحقق من موافقة المستخدم على الكوكيز التسويقية */
function hasMarketingConsent(): boolean {
  try {
    if (localStorage.getItem(COOKIE_CONSENT_KEY) !== "true") return false;
    const prefs = localStorage.getItem(COOKIE_PREFS_KEY);
    if (!prefs) return false;
    const parsed = JSON.parse(prefs);
    return parsed?.marketing === true;
  } catch {
    return false;
  }
}

/**
 * تحميل سكريبت Meta Pixel ديناميكياً
 *
 * يستخدم fbq('consent', 'revoke') أولاً لإيقاف التتبع التفصيلي،
 * ثم يُرسل PageView لجميع الزوار (مسموح به لأغراض بناء الجمهور).
 * عند الموافقة على الكوكيز التسويقية يُستدعى fbq('consent', 'grant').
 */
function loadPixelScript(pixelId: string): void {
  if (window.FB_PIXEL_LOADED || !pixelId) return;
  window.FB_PIXEL_LOADED = true;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = true;
    n.version = "2.0";
    n.queue = [];
    t = b.createElement(e);
    t.async = true;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

  // تهيئة Pixel في وضع Limited Data Use (LDU) افتراضياً
  // يسمح بـ PageView لبناء الجمهور لكن يحدّ من التتبع التفصيلي
  window.fbq("consent", "revoke");
  window.fbq("init", pixelId);
  window.fbq("track", "PageView");

  // إذا وافق المستخدم مسبقاً، منح الإذن الكامل فوراً
  if (hasMarketingConsent()) {
    window.fbq("consent", "grant");
  }
}

/** منح إذن التتبع الكامل بعد موافقة المستخدم */
function grantConsent(): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("consent", "grant");
  }
}

// ─── Exported tracking helpers ────────────────────────────────────────────────
// ملاحظة: جميع هذه الدوال تتحقق من وجود fbq قبل الإرسال.
// أحداث التحويل تُرسَل فقط عند موافقة المستخدم (يتم التحقق في موضع الاستدعاء).

/** إرسال حدث PageView يدوياً */
export function trackPageView(): void {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", "PageView");
  }
}

/**
 * إرسال حدث ViewContent عند مشاهدة صفحة محتوى
 * يُرسَل فقط عند موافقة المستخدم على الكوكيز التسويقية
 * لا تُدرج تشخيصات أو حالات مرضية في content_name
 */
export function trackViewContent(data: {
  content_name: string;
  content_category?: string;
  content_ids?: string[];
  content_type?: string;
}): void {
  if (typeof window !== "undefined" && window.fbq && hasMarketingConsent()) {
    window.fbq("track", "ViewContent", {
      content_category: "Healthcare",
      content_type: "product",
      ...data,
    });
  }
}

/**
 * إرسال حدث Lead عند إرسال نموذج حجز
 * يُرسَل فقط عند موافقة المستخدم على الكوكيز التسويقية
 */
export function trackMetaLead(data?: { content_name?: string; content_category?: string }): void {
  if (typeof window !== "undefined" && window.fbq && hasMarketingConsent()) {
    window.fbq("track", "Lead", {
      content_category: "Healthcare",
      ...data,
    });
  }
}

/**
 * إرسال حدث Schedule عند حجز موعد طبيب
 * يُرسَل فقط عند موافقة المستخدم على الكوكيز التسويقية
 */
export function trackMetaSchedule(data?: { content_name?: string }): void {
  if (typeof window !== "undefined" && window.fbq && hasMarketingConsent()) {
    window.fbq("track", "Schedule", data || {});
  }
}

/**
 * إرسال حدث CompleteRegistration عند تسجيل مخيم أو عرض
 * يُرسَل فقط عند موافقة المستخدم على الكوكيز التسويقية
 */
export function trackMetaCompleteRegistration(data?: {
  content_name?: string;
  content_category?: string;
}): void {
  if (typeof window !== "undefined" && window.fbq && hasMarketingConsent()) {
    window.fbq("track", "CompleteRegistration", data || {});
  }
}

/**
 * إرسال حدث InitiateCheckout عند بدء ملء نموذج الحجز
 * يُرسَل فقط عند موافقة المستخدم على الكوكيز التسويقية
 */
export function trackInitiateCheckout(data?: {
  content_name?: string;
  content_category?: string;
}): void {
  if (typeof window !== "undefined" && window.fbq && hasMarketingConsent()) {
    window.fbq("track", "InitiateCheckout", {
      content_category: "Healthcare",
      ...data,
    });
  }
}

/**
 * إرسال حدث مخصص
 * يُرسَل فقط عند موافقة المستخدم على الكوكيز التسويقية
 */
export function trackMetaEvent(
  eventName: string,
  data?: Record<string, unknown>
): void {
  if (typeof window !== "undefined" && window.fbq && hasMarketingConsent()) {
    window.fbq("track", eventName, data);
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * مكوّن MetaPixel — يُضاف مرة واحدة في App.tsx
 *
 * يُحمَّل Pixel فور تحميل الصفحة لجميع الزوار (PageView).
 * يُرسَل PageView عند كل تنقل بين الصفحات.
 * يستمع لموافقة الكوكيز لمنح إذن التتبع الكامل.
 */
export default function MetaPixel() {
  const [location] = useLocation();
  const initialized = useRef(false);

  useEffect(() => {
    if (!PIXEL_ID) return;

    // تحميل Pixel لجميع الزوار فور تحميل الصفحة
    if (!initialized.current) {
      initialized.current = true;
      loadPixelScript(PIXEL_ID);
    }

    // استمع لموافقة الكوكيز لمنح إذن التتبع الكامل
    const handleConsent = () => grantConsent();
    window.addEventListener("cookieConsentUpdated", handleConsent);
    return () => window.removeEventListener("cookieConsentUpdated", handleConsent);
  }, []);

  // إرسال PageView عند كل تنقل بين الصفحات
  useEffect(() => {
    if (initialized.current && window.fbq) {
      window.fbq("track", "PageView");
    }
  }, [location]);

  return null;
}
