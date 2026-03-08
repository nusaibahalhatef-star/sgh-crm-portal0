/**
 * Cookie Consent Banner - شريط موافقة ملفات تعريف الارتباط
 * 
 * Compliant with:
 * - Meta/WhatsApp Business API requirements
 * - GDPR principles
 * - SGH Group privacy standards
 * 
 * Cookie categories:
 * - Essential: Always enabled (session, security)
 * - Analytical: Traffic measurement and site improvement
 * - Marketing: Ads, Meta Pixel, retargeting
 */

import { useState, useEffect } from "react";
import { Shield, ChevronDown, ChevronUp, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export interface CookiePreferences {
  essential: boolean;   // Always true
  analytical: boolean;  // Google Analytics, etc.
  marketing: boolean;   // Meta Pixel, WhatsApp tracking
}

const COOKIE_CONSENT_KEY = "sgh_cookie_consent";
const COOKIE_PREFS_KEY = "sgh_cookie_preferences";

export function getCookiePreferences(): CookiePreferences {
  try {
    const stored = localStorage.getItem(COOKIE_PREFS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {}
  return { essential: true, analytical: false, marketing: false };
}

export function hasConsentBeenGiven(): boolean {
  return localStorage.getItem(COOKIE_CONSENT_KEY) === "true";
}

export function saveCookiePreferences(prefs: CookiePreferences): void {
  localStorage.setItem(COOKIE_PREFS_KEY, JSON.stringify({ ...prefs, essential: true }));
  localStorage.setItem(COOKIE_CONSENT_KEY, "true");
  // Dispatch event so other components can react
  window.dispatchEvent(new CustomEvent("cookieConsentUpdated", { detail: prefs }));
}

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [prefs, setPrefs] = useState<CookiePreferences>({
    essential: true,
    analytical: false,
    marketing: false,
  });

  useEffect(() => {
    // Show banner only if consent hasn't been given yet
    if (!hasConsentBeenGiven()) {
      // Small delay for better UX
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAcceptAll = () => {
    const allPrefs: CookiePreferences = { essential: true, analytical: true, marketing: true };
    setPrefs(allPrefs);
    saveCookiePreferences(allPrefs);
    setVisible(false);
  };

  const handleSaveSelection = () => {
    saveCookiePreferences({ ...prefs, essential: true });
    setVisible(false);
  };

  const handleRejectAll = () => {
    const minimalPrefs: CookiePreferences = { essential: true, analytical: false, marketing: false };
    saveCookiePreferences(minimalPrefs);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4"
      dir="rtl"
      role="dialog"
      aria-label="إعدادات ملفات تعريف الارتباط"
    >
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-green-700 text-white px-4 sm:px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            <span className="font-semibold text-sm sm:text-base">تفضيلات ملفات تعريف الارتباط</span>
          </div>
          <button
            onClick={handleRejectAll}
            className="text-green-200 hover:text-white transition-colors p-1"
            aria-label="رفض الكل وإغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-4 sm:px-5 py-3 sm:py-4">
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
            نستخدم ملفات تعريف الارتباط لتحسين تجربتك وقياس أداء خدماتنا. اختر ما تسمح به، أو اقبل الكل للحصول على أفضل تجربة.{" "}
            <Link href="/privacy-policy">
              <span className="text-green-700 underline cursor-pointer hover:text-green-800">سياسة الخصوصية</span>
            </Link>
          </p>

          {/* Toggle detailed settings */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-green-700 mt-2 hover:text-green-800 transition-colors"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{expanded ? "إخفاء التفاصيل" : "إدارة التفضيلات"}</span>
          </button>

          {/* Detailed settings */}
          {expanded && (
            <div className="mt-3 space-y-2.5 border-t border-gray-100 pt-3">
              {/* Essential */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800">الأساسية (مطلوبة دائماً)</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">تشغيل الموقع، الجلسات، الأمان. لا يمكن تعطيلها.</p>
                </div>
                <div className="flex items-center justify-center w-10 h-5 bg-green-600 rounded-full shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-white" />
                </div>
              </div>

              {/* Analytical */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800">التحليلية</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">قياس حركة المرور وتحسين الموقع (Google Analytics).</p>
                </div>
                <button
                  onClick={() => setPrefs(p => ({ ...p, analytical: !p.analytical }))}
                  className={`relative w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5 ${
                    prefs.analytical ? "bg-green-500" : "bg-gray-300"
                  }`}
                  role="switch"
                  aria-checked={prefs.analytical}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      prefs.analytical ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-gray-800">التسويقية</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">الإعلانات وإعادة الاستهداف (Meta Pixel، واتساب).</p>
                </div>
                <button
                  onClick={() => setPrefs(p => ({ ...p, marketing: !p.marketing }))}
                  className={`relative w-10 h-5 rounded-full transition-colors shrink-0 mt-0.5 ${
                    prefs.marketing ? "bg-green-500" : "bg-gray-300"
                  }`}
                  role="switch"
                  aria-checked={prefs.marketing}
                >
                  <span
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${
                      prefs.marketing ? "right-0.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 sm:px-5 pb-4 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Button
            onClick={handleAcceptAll}
            className="flex-1 bg-green-700 hover:bg-green-800 text-white text-xs sm:text-sm h-8 sm:h-9"
          >
            قبول الكل
          </Button>
          {expanded && (
            <Button
              onClick={handleSaveSelection}
              variant="outline"
              className="flex-1 border-green-700 text-green-700 hover:bg-green-50 text-xs sm:text-sm h-8 sm:h-9"
            >
              حفظ الاختيار
            </Button>
          )}
          <Button
            onClick={handleRejectAll}
            variant="outline"
            className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50 text-xs sm:text-sm h-8 sm:h-9"
          >
            الأساسية فقط
          </Button>
        </div>
      </div>
    </div>
  );
}
