import { describe, it, expect } from "vitest";

describe("Telegram Integration", () => {
  it("should validate Telegram Bot credentials", async () => {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    expect(TELEGRAM_BOT_TOKEN).toBeDefined();
    expect(TELEGRAM_CHAT_ID).toBeDefined();

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      throw new Error("Telegram credentials not configured");
    }

    // Test bot token by calling getMe API
    const botResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`
    );

    expect(botResponse.ok).toBe(true);

    const botData = await botResponse.json();
    expect(botData.ok).toBe(true);
    expect(botData.result).toBeDefined();
    expect(botData.result.is_bot).toBe(true);

    console.log(`✅ Bot verified: @${botData.result.username}`);

    // Test sending a message to verify chat ID
    const testMessage = "🔔 اختبار إشعارات Telegram - النظام جاهز!";
    const sendResponse = await fetch(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: testMessage,
        }),
      }
    );

    const sendData = await sendResponse.json();
    
    if (!sendResponse.ok || !sendData.ok) {
      console.error("❌ Telegram send error:", JSON.stringify(sendData, null, 2));
      throw new Error(`Failed to send message: ${sendData.description || "Unknown error"}. Please check TELEGRAM_CHAT_ID is correct.`);
    }

    expect(sendData.ok).toBe(true);
    console.log("✅ Test notification sent successfully");
  }, 15000); // 15 second timeout for API calls
});
