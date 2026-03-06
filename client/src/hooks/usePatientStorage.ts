/**
 * usePatientStorage - Hook لحفظ واسترجاع بيانات المريض من localStorage
 * يحفظ الاسم ورقم الهاتف والجنس بعد أول حجز ناجح ويملأها تلقائياً في الزيارات التالية
 */

const STORAGE_KEY = "sgh_patient_info";

export interface PatientInfo {
  fullName: string;
  phone: string;
  gender?: "male" | "female" | "";
}

export function usePatientStorage() {
  /**
   * قراءة بيانات المريض المحفوظة
   */
  function getSavedPatientInfo(): PatientInfo | null {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;
      const parsed = JSON.parse(saved) as PatientInfo;
      // التحقق من أن البيانات صالحة
      if (!parsed.fullName && !parsed.phone) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  /**
   * حفظ بيانات المريض بعد حجز ناجح
   */
  function savePatientInfo(info: PatientInfo): void {
    try {
      const toSave: PatientInfo = {
        fullName: info.fullName || "",
        phone: info.phone || "",
        gender: info.gender || "",
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // تجاهل أخطاء localStorage (مثلاً في وضع التصفح الخاص)
    }
  }

  /**
   * مسح بيانات المريض المحفوظة
   */
  function clearPatientInfo(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // تجاهل
    }
  }

  return { getSavedPatientInfo, savePatientInfo, clearPatientInfo };
}
