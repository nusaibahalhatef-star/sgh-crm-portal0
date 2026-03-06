/**
 * Telegram Bot Integration
 * Sends notifications to the admin via Telegram
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || "";

interface TelegramMessage {
  title: string;
  content: string;
  type?: "lead" | "appointment" | "offer" | "camp";
}

/**
 * Send a notification message to Telegram
 */
export async function sendTelegramNotification(params: TelegramMessage): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn("[Telegram] Bot token or chat ID not configured");
    return false;
  }

  try {
    const emoji = getEmojiForType(params.type);
    const message = `${emoji} *${params.title}*\n\n${params.content}`;

    const response = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
          parse_mode: "Markdown",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error("[Telegram] Failed to send message:", errorData);
      return false;
    }

    console.log("[Telegram] Message sent successfully");
    return true;
  } catch (error) {
    console.error("[Telegram] Error sending message:", error);
    return false;
  }
}

/**
 * Get emoji based on notification type
 */
function getEmojiForType(type?: string): string {
  switch (type) {
    case "lead":
      return "👤";
    case "appointment":
      return "📅";
    case "offer":
      return "🎁";
    case "camp":
      return "⛺";
    default:
      return "🔔";
  }
}

/**
 * Send new lead notification
 */
export async function sendNewLeadTelegram(params: {
  fullName: string;
  phone: string;
  email?: string;
  source?: string;
}): Promise<boolean> {
  return sendTelegramNotification({
    title: "عميل جديد",
    content: `الاسم: ${params.fullName}\nالهاتف: ${params.phone}\nالبريد: ${params.email || "غير متوفر"}\nالمصدر: ${params.source || "غير محدد"}`,
    type: "lead",
  });
}

/**
 * Send new appointment notification
 */
export async function sendNewAppointmentTelegram(params: {
  fullName: string;
  phone: string;
  email?: string;
  doctorName: string;
  preferredDate?: string;
  preferredTime?: string;
  procedure?: string;
  patientMessage?: string;
}): Promise<boolean> {
  const lines = [
    `الاسم: ${params.fullName}`,
    `الهاتف: ${params.phone}`,
    `البريد: ${params.email || "غير متوفر"}`,
    `الطبيب: ${params.doctorName}`,
    `التاريخ: ${params.preferredDate || "غير محدد"}`,
    `الوقت: ${params.preferredTime || "غير محدد"}`,
  ];
  if (params.procedure) {
    lines.push(`الإجراء المطلوب: ${params.procedure}`);
  }
  if (params.patientMessage) {
    lines.push(`رسالة المريض: ${params.patientMessage}`);
  }
  return sendTelegramNotification({
    title: "موعد جديد",
    content: lines.join("\n"),
    type: "appointment",
  });
}

/**
 * Send new offer lead notification
 */
export async function sendNewOfferLeadTelegram(params: {
  fullName: string;
  phone: string;
  email?: string;
  offerTitle: string;
  age?: number;
  patientMessage?: string;
}): Promise<boolean> {
  const lines = [
    `الاسم: ${params.fullName}`,
    `الهاتف: ${params.phone}`,
    `البريد: ${params.email || "غير متوفر"}`,
    `العرض: ${params.offerTitle}`,
  ];
  if (params.age) {
    lines.push(`العمر: ${params.age}`);
  }
  if (params.patientMessage) {
    lines.push(`رسالة المريض: ${params.patientMessage}`);
  }
  return sendTelegramNotification({
    title: "حجز عرض جديد",
    content: lines.join("\n"),
    type: "offer",
  });
}

/**
 * Send new camp registration notification
 */
export async function sendNewCampRegistrationTelegram(params: {
  fullName: string;
  phone: string;
  email?: string;
  campTitle: string;
  age?: number;
  procedures?: string;
  patientMessage?: string;
}): Promise<boolean> {
  const lines = [
    `الاسم: ${params.fullName}`,
    `الهاتف: ${params.phone}`,
    `البريد: ${params.email || "غير متوفر"}`,
    `المخيم: ${params.campTitle}`,
    `العمر: ${params.age || "غير محدد"}`,
  ];
  if (params.procedures) {
    try {
      const parsed = JSON.parse(params.procedures);
      if (Array.isArray(parsed) && parsed.length > 0) {
        lines.push(`الإجراءات المطلوبة: ${parsed.join("، ")}`);
      }
    } catch {
      lines.push(`الإجراءات المطلوبة: ${params.procedures}`);
    }
  }
  if (params.patientMessage) {
    lines.push(`رسالة المريض: ${params.patientMessage}`);
  }
  return sendTelegramNotification({
    title: "تسجيل مخيم جديد",
    content: lines.join("\n"),
    type: "camp",
  });
}
