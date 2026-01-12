/**
 * Cron scheduler - runs deactivation jobs daily at midnight
 * جدولة المهام التلقائية - تشغيل مهام إلغاء التنشيط يومياً في منتصف الليل
 */
import { runDeactivationJobs } from "./deactivateExpired";

// Run every day at midnight (00:00)
const CRON_SCHEDULE = "0 0 * * *"; // minute hour day month weekday

/**
 * Initialize cron scheduler
 * تهيئة جدولة المهام
 */
export function initCronScheduler() {
  console.log("[Cron] Initializing scheduler...");
  
  // Run immediately on startup (for testing)
  runDeactivationJobs().then(() => {
    console.log("[Cron] Initial deactivation job completed");
  });

  // Schedule daily job at midnight
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0); // Next midnight
  
  const msUntilMidnight = midnight.getTime() - now.getTime();
  
  // Wait until midnight, then run every 24 hours
  setTimeout(() => {
    runDeactivationJobs();
    
    // Run every 24 hours
    setInterval(() => {
      runDeactivationJobs();
    }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  }, msUntilMidnight);
  
  console.log(`[Cron] Scheduler initialized. Next run in ${Math.round(msUntilMidnight / 1000 / 60)} minutes`);
}

/**
 * Alternative: Simple interval-based scheduler (runs every 24 hours from startup)
 * بديل: جدولة بسيطة بناءً على الفترة الزمنية (كل 24 ساعة من وقت التشغيل)
 */
export function initSimpleCronScheduler() {
  console.log("[Cron] Initializing simple scheduler (24h interval)...");
  
  // Run immediately on startup
  runDeactivationJobs();
  
  // Run every 24 hours
  setInterval(() => {
    runDeactivationJobs();
  }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  
  console.log("[Cron] Simple scheduler initialized. Running every 24 hours.");
}
