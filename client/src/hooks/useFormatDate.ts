import { useCallback, useMemo } from "react";

/**
 * useFormatDate - هوك لتوحيد تنسيق التاريخ عبر المنصة
 * يمنع تكرار new Date().toLocaleDateString() في كل مكون
 * 
 * الاستخدام:
 * const { formatDate, formatDateTime, formatDateShort, formatRelativeTime } = useFormatDate();
 * 
 * // في الجدول:
 * <td>{formatDate(lead.createdAt)}</td>
 * <td>{formatDateTime(appointment.appointmentDate)}</td>
 */

const LOCALE = "ar-EG";

const DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
};

const DATE_SHORT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "short",
  day: "numeric",
};

const DATE_TIME_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
};

const DATE_COMPACT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
};

export function useFormatDate() {
  const formatters = useMemo(() => ({
    date: new Intl.DateTimeFormat(LOCALE, DATE_OPTIONS),
    dateShort: new Intl.DateTimeFormat(LOCALE, DATE_SHORT_OPTIONS),
    dateTime: new Intl.DateTimeFormat(LOCALE, DATE_TIME_OPTIONS),
    dateCompact: new Intl.DateTimeFormat(LOCALE, DATE_COMPACT_OPTIONS),
  }), []);

  /** تنسيق التاريخ الكامل: "23 فبراير 2026" */
  const formatDate = useCallback((date: string | Date | null | undefined): string => {
    if (!date) return "-";
    try {
      return formatters.date.format(new Date(date));
    } catch {
      return "-";
    }
  }, [formatters]);

  /** تنسيق التاريخ المختصر: "23 فبر 2026" */
  const formatDateShort = useCallback((date: string | Date | null | undefined): string => {
    if (!date) return "-";
    try {
      return formatters.dateShort.format(new Date(date));
    } catch {
      return "-";
    }
  }, [formatters]);

  /** تنسيق التاريخ والوقت: "23 فبراير 2026 02:30 م" */
  const formatDateTime = useCallback((date: string | Date | null | undefined): string => {
    if (!date) return "-";
    try {
      return formatters.dateTime.format(new Date(date));
    } catch {
      return "-";
    }
  }, [formatters]);

  /** تنسيق مضغوط: "23/02/2026" */
  const formatDateCompact = useCallback((date: string | Date | null | undefined): string => {
    if (!date) return "-";
    try {
      return formatters.dateCompact.format(new Date(date));
    } catch {
      return "-";
    }
  }, [formatters]);

  /** تنسيق نطاق تاريخ: "23 فبراير - 28 فبراير 2026" */
  const formatDateRange = useCallback((from: string | Date | null | undefined, to: string | Date | null | undefined): string => {
    const fromStr = formatDate(from);
    const toStr = formatDate(to);
    if (fromStr === "-" && toStr === "-") return "-";
    if (fromStr === "-") return toStr;
    if (toStr === "-") return fromStr;
    return `${fromStr} - ${toStr}`;
  }, [formatDate]);

  return {
    formatDate,
    formatDateShort,
    formatDateTime,
    formatDateCompact,
    formatDateRange,
  };
}

// === Standalone utility functions (for non-component contexts) ===

export function formatDateUtil(date: string | Date | null | undefined): string {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString(LOCALE, DATE_OPTIONS);
  } catch {
    return "-";
  }
}

export function formatDateTimeUtil(date: string | Date | null | undefined): string {
  if (!date) return "-";
  try {
    return new Date(date).toLocaleDateString(LOCALE, DATE_TIME_OPTIONS);
  } catch {
    return "-";
  }
}
