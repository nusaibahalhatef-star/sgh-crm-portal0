/**
 * Cron job to automatically deactivate expired offers and camps
 * يقوم بإلغاء تنشيط العروض والمخيمات المنتهية تلقائياً
 */
import { eq, and, lte } from "drizzle-orm";
import { getDb } from "../db";
import { offers, camps } from "../../drizzle/schema";

/**
 * Deactivate expired offers
 * إلغاء تنشيط العروض المنتهية
 */
export async function deactivateExpiredOffers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Cron] Database not available for deactivateExpiredOffers");
    return { success: false, deactivated: 0 };
  }

  try {
    const now = new Date();
    
    // Find active offers with endDate in the past
    const expiredOffers = await db
      .select()
      .from(offers)
      .where(
        and(
          eq(offers.isActive, true),
          lte(offers.endDate, now)
        )
      );

    if (expiredOffers.length === 0) {
      console.log("[Cron] No expired offers found");
      return { success: true, deactivated: 0 };
    }

    // Deactivate each expired offer
    for (const offer of expiredOffers) {
      await db
        .update(offers)
        .set({ isActive: false })
        .where(eq(offers.id, offer.id));
      
      console.log(`[Cron] Deactivated expired offer: ${offer.title} (ID: ${offer.id})`);
    }

    console.log(`[Cron] Deactivated ${expiredOffers.length} expired offer(s)`);
    return { success: true, deactivated: expiredOffers.length };
  } catch (error) {
    console.error("[Cron] Error deactivating expired offers:", error);
    return { success: false, deactivated: 0, error };
  }
}

/**
 * Deactivate expired camps
 * إلغاء تنشيط المخيمات المنتهية
 */
export async function deactivateExpiredCamps() {
  const db = await getDb();
  if (!db) {
    console.warn("[Cron] Database not available for deactivateExpiredCamps");
    return { success: false, deactivated: 0 };
  }

  try {
    const now = new Date();
    
    // Find active camps with endDate in the past
    const expiredCamps = await db
      .select()
      .from(camps)
      .where(
        and(
          eq(camps.isActive, true),
          lte(camps.endDate, now)
        )
      );

    if (expiredCamps.length === 0) {
      console.log("[Cron] No expired camps found");
      return { success: true, deactivated: 0 };
    }

    // Deactivate each expired camp
    for (const camp of expiredCamps) {
      await db
        .update(camps)
        .set({ isActive: false })
        .where(eq(camps.id, camp.id));
      
      console.log(`[Cron] Deactivated expired camp: ${camp.name} (ID: ${camp.id})`);
    }

    console.log(`[Cron] Deactivated ${expiredCamps.length} expired camp(s)`);
    return { success: true, deactivated: expiredCamps.length };
  } catch (error) {
    console.error("[Cron] Error deactivating expired camps:", error);
    return { success: false, deactivated: 0, error };
  }
}

/**
 * Run all deactivation jobs
 * تشغيل جميع مهام إلغاء التنشيط
 */
export async function runDeactivationJobs() {
  console.log("[Cron] Running deactivation jobs...");
  
  const offersResult = await deactivateExpiredOffers();
  const campsResult = await deactivateExpiredCamps();
  
  const totalDeactivated = offersResult.deactivated + campsResult.deactivated;
  
  console.log(`[Cron] Deactivation jobs completed. Total deactivated: ${totalDeactivated}`);
  
  return {
    success: offersResult.success && campsResult.success,
    offers: offersResult,
    camps: campsResult,
    totalDeactivated,
  };
}
