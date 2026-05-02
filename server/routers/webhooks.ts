import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { appointments, offerLeads, campRegistrations, doctors, offers, camps } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { dispatchWhatsAppMessage } from "../services/whatsappMessageDispatcher";
import { serverCache, CacheKeys } from "../cache";

/**
 * WhatsApp Webhook Router
 * يستقبل ردود المستخدمين على الأزرار التفاعلية من WhatsApp Business API
 */

// Webhook verification (Meta requirement)
const verifyWebhookSchema = z.object({
  "hub.mode": z.string(),
  "hub.verify_token": z.string(),
  "hub.challenge": z.string(),
});

// Enhanced webhook schema to support multiple webhook types
const webhookSchema = z.object({
  object: z.string(),
  entry: z.array(
    z.object({
      id: z.string(),
      changes: z.array(
        z.object({
          value: z.object({
            messaging_product: z.string(),
            metadata: z.object({
              display_phone_number: z.string(),
              phone_number_id: z.string(),
            }),
            messages: z
              .array(
                z.object({
                  from: z.string(),
                  id: z.string(),
                  timestamp: z.string(),
                  type: z.string(),
                  button: z
                    .object({
                      payload: z.string(),
                      text: z.string(),
                    })
                    .optional(),
                  // Support for text messages
                  text: z
                    .object({
                      body: z.string(),
                    })
                    .optional(),
                })
              )
              .optional(),
            // Support for statuses (message delivery/read status)
            statuses: z
              .array(
                z.object({
                  id: z.string(),
                  status: z.enum(["sent", "delivered", "read", "failed"]),
                  timestamp: z.string(),
                  recipient_id: z.string(),
                  errors: z.array(z.object({
                    code: z.number(),
                    title: z.string(),
                    message: z.string().optional(),
                  })).optional(),
                })
              )
              .optional(),
          }),
          field: z.string(),
        })
      ),
    })
  ),
});

export const webhooksRouter = router({
  /**
   * Webhook verification endpoint (GET)
   * Meta يستخدم هذا للتحقق من صحة الـ webhook
   */
  verify: publicProcedure
    .input(
      z.object({
        mode: z.string(),
        token: z.string(),
        challenge: z.string(),
      })
    )
    .query(({ input }) => {
      const VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "sgh_crm_webhook_2024";

      if (input.mode === "subscribe" && input.token === VERIFY_TOKEN) {
        console.log("[Webhook] Verification successful");
        return { challenge: input.challenge };
      } else {
        console.error("[Webhook] Verification failed");
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Verification token mismatch",
        });
      }
    }),

  /**
   * Webhook receiver endpoint (POST)
   * يستقبل ردود المستخدمين على الأزرار التفاعلية وحالة الرسائل
   */
  receive: publicProcedure.input(webhookSchema).mutation(async ({ input }) => {
    try {
      console.log("[Webhook] Received:", JSON.stringify(input, null, 2));

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // معالجة كل entry
      for (const entry of input.entry) {
        for (const change of entry.changes) {
          // معالجة message statuses (sent, delivered, read, failed)
          const statuses = change.value.statuses;
          if (statuses && statuses.length > 0) {
            for (const status of statuses) {
              console.log(`[Webhook] Message status: ${status.status} for message ${status.id}`);
              
              // Log failed messages
              if (status.status === 'failed' && status.errors) {
                for (const error of status.errors) {
                  console.error(`[Webhook] Message failed - Code: ${error.code}, Title: ${error.title}, Message: ${error.message || 'N/A'}`);
                }
              }
              
              // TODO: Store message status in database for tracking
            }
          }

          // معالجة incoming messages
          const messages = change.value.messages;
          if (!messages || messages.length === 0) continue;

          for (const message of messages) {
            const userPhone = message.from;
            
            if (message.type === "button" && message.button) {
              const payload = message.button.payload;

              console.log(`[Webhook] Button clicked: ${payload} from ${userPhone}`);

              // تحليل الـ payload لمعرفة نوع الحجز والإجراء
              // Format: CONFIRM_APPOINTMENT_123 أو CANCEL_APPOINTMENT_123
              const [action, type, id] = payload.split("_");

              if (!action || !type || !id) {
                console.error(`[Webhook] Invalid payload format: ${payload}`);
                continue;
              }

              const bookingId = parseInt(id);
              if (isNaN(bookingId)) {
                console.error(`[Webhook] Invalid booking ID: ${id}`);
                continue;
              }

              // تحديث الحالة حسب نوع الحجز
              if (type === "APPOINTMENT") {
                const newStatus = action === "CONFIRM" ? "confirmed" : "cancelled";
                const now = new Date();
                const apptUpdateData: any = { status: newStatus, updatedAt: now };
                if (newStatus === "confirmed") apptUpdateData.confirmedAt = now;
                else if (newStatus === "cancelled") apptUpdateData.cancelledAt = now;

                await db.update(appointments).set(apptUpdateData).where(eq(appointments.id, bookingId));
                console.log(`[Webhook] Appointment ${bookingId} updated to ${newStatus}`);

                // إرسال رسالة WhatsApp تلقائية
                const [appt] = await db
                  .select({ phone: appointments.phone, fullName: appointments.fullName, preferredDate: appointments.preferredDate, preferredTime: appointments.preferredTime, procedure: appointments.procedure, doctorId: appointments.doctorId })
                  .from(appointments).where(eq(appointments.id, bookingId)).limit(1);
                if (appt?.phone) {
                  const [doc] = appt.doctorId
                    ? await db.select({ name: doctors.name }).from(doctors).where(eq(doctors.id, appt.doctorId)).limit(1)
                    : [undefined];
                  const triggerEvent = newStatus === "confirmed" ? "on_confirmed" : "on_cancelled";
                  dispatchWhatsAppMessage({
                    entityType: "appointment",
                    triggerEvent,
                    phone: appt.phone,
                    recipientName: appt.fullName || undefined,
                    variables: {
                      name: appt.fullName || "المريض",
                      doctor: doc?.name || "غير محدد",
                      date: appt.preferredDate || "غير محدد",
                      time: appt.preferredTime || "غير محدد",
                      service: appt.procedure || "فحص عام",
                    },
                    entityId: bookingId,
                  }).catch(err => console.error(`[Webhook] Failed to send ${triggerEvent} for appt ${bookingId}:`, err));
                }

                serverCache.invalidateByPrefix("paginated:appointments:");
                serverCache.invalidate("list:appointments");
                serverCache.invalidate(CacheKeys.appointmentStats());

              } else if (type === "OFFER") {
                const newStatus = action === "CONFIRM" ? "confirmed" : "cancelled";
                const now = new Date();
                const offerUpdateData: any = { status: newStatus, updatedAt: now };
                if (newStatus === "confirmed") offerUpdateData.confirmedAt = now;
                else if (newStatus === "cancelled") offerUpdateData.cancelledAt = now;

                await db.update(offerLeads).set(offerUpdateData).where(eq(offerLeads.id, bookingId));
                console.log(`[Webhook] Offer lead ${bookingId} updated to ${newStatus}`);

                // إرسال رسالة WhatsApp تلقائية
                const [lead] = await db
                  .select({ phone: offerLeads.phone, fullName: offerLeads.fullName, offerId: offerLeads.offerId })
                  .from(offerLeads).where(eq(offerLeads.id, bookingId)).limit(1);
                if (lead?.phone) {
                  const [offer] = lead.offerId
                    ? await db.select({ title: offers.title }).from(offers).where(eq(offers.id, lead.offerId)).limit(1)
                    : [undefined];
                  const triggerEvent = newStatus === "confirmed" ? "on_confirmed" : "on_cancelled";
                  dispatchWhatsAppMessage({
                    entityType: "offer_lead",
                    triggerEvent,
                    phone: lead.phone,
                    recipientName: lead.fullName || undefined,
                    variables: {
                      name: lead.fullName || "العميل",
                      service: offer?.title || "العرض",
                    },
                    entityId: bookingId,
                  }).catch(err => console.error(`[Webhook] Failed to send ${triggerEvent} for offer ${bookingId}:`, err));
                }

                serverCache.invalidateByPrefix("paginated:offerLeads:");
                serverCache.invalidate("list:offerLeads");
                serverCache.invalidate(CacheKeys.offerLeadStats());

              } else if (type === "CAMP") {
                const newStatus = action === "CONFIRM" ? "confirmed" : "cancelled";
                const now = new Date();
                const campUpdateData: any = { status: newStatus, updatedAt: now };
                if (newStatus === "confirmed") campUpdateData.confirmedAt = now;
                else if (newStatus === "cancelled") campUpdateData.cancelledAt = now;

                await db
                  .update(campRegistrations)
                  .set(campUpdateData)
                  .where(eq(campRegistrations.id, bookingId));

                console.log(`[Webhook] Camp registration ${bookingId} updated to ${newStatus}`);

                // إرسال رسالة WhatsApp تلقائية بناءً على الحالة الجديدة
                const [reg] = await db.select().from(campRegistrations).where(eq(campRegistrations.id, bookingId)).limit(1);
                if (reg?.phone) {
                  const { camps } = await import("../../drizzle/schema");
                  const [camp] = await db.select().from(camps).where(eq(camps.id, reg.campId)).limit(1);
                  const triggerEvent = newStatus === "confirmed" ? "on_confirmed" : "on_cancelled";
                  dispatchWhatsAppMessage({
                    entityType: "camp_registration",
                    triggerEvent,
                    phone: reg.phone,
                    recipientName: reg.fullName || undefined,
                    variables: {
                      name: reg.fullName || "المسجل",
                      camp_name: camp?.name || "المخيم",
                      date: (reg as any).preferredDate
                        ? new Date((reg as any).preferredDate).toLocaleDateString("ar-YE")
                        : (camp?.startDate ? new Date(camp.startDate).toLocaleDateString("ar-YE") : "غير محدد"),
                      time: (reg as any).preferredTimeSlot === "morning"
                        ? `صباحاً ${(camp as any)?.morningTime || ""}`
                        : (reg as any).preferredTimeSlot === "evening"
                        ? `مساءً ${(camp as any)?.eveningTime || ""}`
                        : "غير محدد",
                      location: "صنعاء - الستين الشمالي - قبل جولة الجمنه",
                    },
                    entityId: bookingId,
                  }).catch(err => console.error(`[Webhook] Failed to send ${triggerEvent} for camp reg ${bookingId}:`, err));
                }

                // إبطال الـ cache
                serverCache.invalidateByPrefix("paginated:campRegistrations:");
                serverCache.invalidate("list:campRegistrations");
                serverCache.invalidate(CacheKeys.campRegistrationStats());
              }

              // معالجة APPOINTMENT و OFFER: إرسال رسائل تلقائية أيضاً
            } else if (message.type === "text" && message.text) {
              // معالجة الرسائل النصية الواردة
              console.log(`[Webhook] Text message from ${userPhone}: ${message.text.body}`);
              // TODO: معالجة الرسائل النصية (مثل الردود التلقائية)
            }
          }
        }
      }

      // Always return 200 OK to Meta (even if processing failed internally)
      return { success: true, message: "Webhook processed successfully" };
    } catch (error) {
      console.error("[Webhook] Error processing webhook:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to process webhook",
      });
    }
  }),
});
