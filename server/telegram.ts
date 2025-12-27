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
}): Promise<boolean> {
  return sendTelegramNotification({
    title: "موعد جديد",
    content: `الاسم: ${params.fullName}\nالهاتف: ${params.phone}\nالبريد: ${params.email || "غير متوفر"}\nالطبيب: ${params.doctorName}\nالتاريخ: ${params.preferredDate || "غير محدد"}\nالوقت: ${params.preferredTime || "غير محدد"}`,
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
}): Promise<boolean> {
  return sendTelegramNotification({
    title: "حجز عرض جديد",
    content: `الاسم: ${params.fullName}\nالهاتف: ${params.phone}\nالبريد: ${params.email || "غير متوفر"}\nالعرض: ${params.offerTitle}`,
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
}): Promise<boolean> {
  return sendTelegramNotification({
    title: "تسجيل مخيم جديد",
    content: `الاسم: ${params.fullName}\nالهاتف: ${params.phone}\nالبريد: ${params.email || "غير متوفر"}\nالمخيم: ${params.campTitle}\nالعمر: ${params.age || "غير محدد"}`,
    type: "camp",
  });
}
