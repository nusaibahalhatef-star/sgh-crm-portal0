import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { campRegistrations } from "../../drizzle/schema";
import { sendNewCampRegistrationTelegram } from "../telegram";
import { serverCache, CacheKeys, CacheTTL } from "../cache";
import { createAuditLog } from "./auditLogs";
import { sendCampRegistrationEvent, sendStatusChangeEvent } from "../facebookCAPI";
import { normalizePhoneNumber } from "../db";
// sendCampRegistrationConfirmation moved to dispatchWhatsAppMessage flow
import { dispatchWhatsAppMessage } from "../services/whatsappMessageDispatcher";

export const campRegistrationsRouter = router({
  // Submit a new camp registration (public)
  submit: publicProcedure
    .input(
      z.object({
        campId: z.number(),
        fullName: z.string().min(1),
        phone: z.string().min(9).regex(
          /^(\+?967)?7\d{8}$|^07\d{8}$|^7\d{8}$/,
          "رقم الهاتف يجب أن يبدأ بالرقم 7 ويتكون من 9 أرقام"
        ),
        email: z.string().email().optional(),
        age: z.number().optional(),
        gender: z.enum(["male", "female"]).optional(),
        procedures: z.string().optional(), // JSON string of selected procedures
        medicalCondition: z.string().optional(),
        patientMessage: z.string().max(500).optional(),
        notes: z.string().optional(),
        source: z.string().optional(),
        status: z.enum(["pending", "contacted", "no_answer", "confirmed", "attended", "completed", "cancelled"]).optional(), // Manual registration status
        utmSource: z.string().optional(),
        utmMedium: z.string().optional(),
        utmCampaign: z.string().optional(),
        utmTerm: z.string().optional(),
        utmContent: z.string().optional(),
        utmPlacement: z.string().optional(),
        referrer: z.string().optional(),
        fbclid: z.string().optional(),
        gclid: z.string().optional(),
        preferredDate: z.string().optional(), // YYYY-MM-DD تاريخ الحضور المفضل
        preferredTimeSlot: z.enum(["morning", "evening"]).optional(), // الوقت المفضل
      })
    )
    .mutation(async ({ input, ctx }) => {
      const normalizedPhone = normalizePhoneNumber(input.phone);
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // التحقق من عدم تكرار التسجيل بنفس الرقم ونفس المخيم خلال 3 أيام - معطل
      // const threeDaysAgo = new Date();
      // threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      // const allRegs = await db
      //   .select({ id: campRegistrations.id, phone: campRegistrations.phone })
      //   .from(campRegistrations)
      //   .where(
      //     and(
      //       eq(campRegistrations.campId, input.campId),
      //       gte(campRegistrations.createdAt, threeDaysAgo)
      //     )
      //   )
      //   .limit(100);
      // const existingReg = allRegs.filter(r => normalizePhoneNumber(r.phone) === normalizedPhone);
      // if (existingReg.length > 0) {
      //   throw new TRPCError({
      //     code: "CONFLICT",
      //     message: "لقد تم تسجيل طلب بنفس رقم الهاتف لهذا المخيم خلال الأيام الثلاثة الماضية",
      //   });
      // }

      // Build timestamp fields based on initial status
      const nowCamp = new Date();
      const campStatusTimestamps: Record<string, Date> = {};
      const campInitialStatus = input.status || "pending";
      if (campInitialStatus === 'contacted') campStatusTimestamps.contactedAt = nowCamp;
      else if (campInitialStatus === 'confirmed') campStatusTimestamps.confirmedAt = nowCamp;
      else if (campInitialStatus === 'attended') campStatusTimestamps.attendedAt = nowCamp;
      else if (campInitialStatus === 'completed') campStatusTimestamps.completedAt = nowCamp;
      else if (campInitialStatus === 'cancelled') campStatusTimestamps.cancelledAt = nowCamp;

      // Auto-assign date/time if not provided by the user
      let assignedDate: Date | undefined = input.preferredDate ? new Date(input.preferredDate) : undefined;
      let assignedTimeSlot: "morning" | "evening" | undefined = input.preferredTimeSlot;

      if (!assignedDate) {
        // Get camp to check dates and capacity
        const { camps: campsTable } = await import("../../drizzle/schema");
        const [campForDate] = await db.select().from(campsTable).where(eq(campsTable.id, input.campId)).limit(1);
        if (campForDate && campForDate.startDate && campForDate.endDate) {
          const morningTime = (campForDate as any).morningTime as string | null;
          const eveningTime = (campForDate as any).eveningTime as string | null;
          const dailyCapacity = (campForDate as any).dailyCapacity as number | null;
          const start = new Date(campForDate.startDate);
          const end = new Date(campForDate.endDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const allDays: string[] = [];
          const d = new Date(start);
          while (d <= end) {
            if (d >= today) allDays.push(d.toISOString().split('T')[0]);
            d.setDate(d.getDate() + 1);
          }
          if (allDays.length > 0) {
            if (dailyCapacity && (morningTime || eveningTime)) {
              // Count confirmed per day/slot
              const confirmedRegs = await db
                .select({
                  preferredDate: (campRegistrations as any).preferredDate,
                  preferredTimeSlot: (campRegistrations as any).preferredTimeSlot,
                  count: sql<number>`count(*)`,
                })
                .from(campRegistrations)
                .where(and(
                  eq(campRegistrations.campId, input.campId),
                  sql`status IN ('confirmed', 'attended', 'completed')`,
                  sql`preferredDate IS NOT NULL`
                ))
                .groupBy((campRegistrations as any).preferredDate, (campRegistrations as any).preferredTimeSlot);
              const countMap: Record<string, { morning: number; evening: number }> = {};
              for (const row of confirmedRegs) {
                const dk = row.preferredDate ? new Date(row.preferredDate).toISOString().split('T')[0] : null;
                if (!dk) continue;
                if (!countMap[dk]) countMap[dk] = { morning: 0, evening: 0 };
                if (row.preferredTimeSlot === 'morning') countMap[dk].morning += Number(row.count);
                else if (row.preferredTimeSlot === 'evening') countMap[dk].evening += Number(row.count);
              }
              // Find first available day/slot
              for (const day of allDays) {
                const counts = countMap[day] || { morning: 0, evening: 0 };
                if (morningTime && counts.morning < dailyCapacity) {
                  assignedDate = new Date(day);
                  assignedTimeSlot = 'morning';
                  break;
                }
                if (eveningTime && counts.evening < dailyCapacity) {
                  assignedDate = new Date(day);
                  assignedTimeSlot = 'evening';
                  break;
                }
              }
            } else {
              // No capacity limit - assign first day
              assignedDate = new Date(allDays[0]);
              assignedTimeSlot = morningTime ? 'morning' : (eveningTime ? 'evening' : undefined);
            }
          }
        }
      }

      const [registration] = await db.insert(campRegistrations).values({
        campId: input.campId,
        fullName: input.fullName,
        phone: normalizedPhone,
        email: input.email,
        age: input.age,
        gender: input.gender,
        procedures: input.procedures,
        medicalCondition: input.medicalCondition,
        patientMessage: input.patientMessage,
        notes: input.notes,
        source: input.source || "website",
        utmSource: input.utmSource,
        utmMedium: input.utmMedium,
        utmCampaign: input.utmCampaign,
        utmTerm: input.utmTerm,
        utmContent: input.utmContent,
        utmPlacement: input.utmPlacement,
        referrer: input.referrer,
        fbclid: input.fbclid,
        gclid: input.gclid,
        status: campInitialStatus,
        ...campStatusTimestamps,
        preferredDate: assignedDate ? assignedDate.toISOString().split('T')[0] : undefined,
        preferredTimeSlot: assignedTimeSlot,
      } as any);

      // Get camp details for notification
      const { camps } = await import("../../drizzle/schema");
      const [camp] = await db.select().from(camps).where(eq(camps.id, input.campId)).limit(1);

      // Send Telegram notification
      if (camp) {
        await sendNewCampRegistrationTelegram({
          fullName: input.fullName,
          phone: input.phone,
          email: input.email,
          campTitle: camp.name,
          age: input.age,
          procedures: input.procedures,
          patientMessage: input.patientMessage,
        });
      }

      // إرسال الرسائل التلقائية بناءً على نوع التسجيل والحالة المختارة
      if (camp) {
        const regId = Number(registration.insertId);
        // التسجيل اليدوي: source=admin أو حالة مختارة غير pending
        const isManualRegistration = input.source === 'admin' || (input.status && input.status !== 'pending');

        if (!isManualRegistration || campInitialStatus === 'pending') {
          // ── تسجيل من الواجهة العامة أو تسجيل يدوي بحالة pending ──
          // أرسل رسالة on_create وحدّث الحالة إلى contacted بعد الإرسال
          // camp_reg_verification (150005) يقبل 5 متغيرات: name, camp_name, date, time, location
          dispatchWhatsAppMessage({
            entityType: "camp_registration",
            triggerEvent: "on_create",
            phone: input.phone,
            recipientName: input.fullName,
            variables: {
              name: input.fullName,
              camp_name: camp.name,
              date: assignedDate
                ? assignedDate.toLocaleDateString("ar-YE")
                : (camp.startDate ? new Date(camp.startDate).toLocaleDateString("ar-YE") : "غير محدد"),
              time: assignedTimeSlot === 'morning'
                ? `صباحاً ${(camp as any).morningTime || ''}`.trim()
                : assignedTimeSlot === 'evening'
                ? `مساءً ${(camp as any).eveningTime || ''}`.trim()
                : "غير محدد",
              location: "صنعاء - الستين الشمالي - قبل جولة الجمنه",
            },
            entityId: regId,
          }).then(async (result) => {
            if (result?.success) {
              // تحديث الحالة إلى "تم التواصل" بعد إرسال رسالة التسجيل بنجاح
              const dbInner = await getDb();
              if (dbInner) {
                await dbInner
                  .update(campRegistrations)
                  .set({ status: "contacted", contactedAt: new Date(), updatedAt: new Date() })
                  .where(eq(campRegistrations.id, regId));
                serverCache.invalidateByPrefix("paginated:campRegistrations:");
                serverCache.invalidate("list:campRegistrations");
                serverCache.invalidate(CacheKeys.campRegistrationStats());
                console.log(`[CampReg] Auto-updated registration ${regId} to contacted after on_create send`);
              }
            }
          }).catch(error => {
            console.error("[WhatsApp Dispatcher] Failed to send camp registration on_create:", error);
          });
        } else {
          // ── تسجيل يدوي بحالة محددة (غير pending) ──
          // أرسل الرسالة المناسبة للحالة المختارة فقط، بدون تحديث الحالة تلقائياً
          const manualTriggerMap: Record<string, string> = {
            "confirmed": "on_confirmed",
            "attended": "on_arrived",
            "completed": "on_completed",
            "cancelled": "on_cancelled",
          };
          const manualTrigger = manualTriggerMap[campInitialStatus];
          if (manualTrigger) {
            dispatchWhatsAppMessage({
              entityType: "camp_registration",
              triggerEvent: manualTrigger as any,
              phone: input.phone,
              recipientName: input.fullName,
              variables: {
                name: input.fullName,
                camp_name: camp.name,
                date: assignedDate
                  ? assignedDate.toLocaleDateString("ar-YE")
                  : (camp.startDate ? new Date(camp.startDate).toLocaleDateString("ar-YE") : "غير محدد"),
                time: assignedTimeSlot === 'morning'
                  ? `صباحاً ${(camp as any).morningTime || ''}`
                  : assignedTimeSlot === 'evening'
                  ? `مساءً ${(camp as any).eveningTime || ''}`
                  : "غير محدد",
                location: "صنعاء - الستين الشمالي - قبل جولة الجمنه",
              },
              entityId: regId,
            }).catch(error => {
              console.error(`[WhatsApp Dispatcher] Failed to send camp registration ${manualTrigger}:`, error);
            });
          } else {
            // حالات contacted / no_answer / no_show لا ترسل رسالة تلقائية
            console.log(`[CampReg] Manual registration ${regId} with status "${campInitialStatus}" - no auto message sent`);
          }
        }
      }

      // Send Facebook Conversions API event (fire-and-forget)
      // لا تُرسَل بيانات طبية حساسة وفق سياسة Meta لمزودي الرعاية الصحية
      sendCampRegistrationEvent({
        fullName: input.fullName,
        phone: input.phone,
        email: input.email,
        clientIpAddress: ctx.req.ip || (ctx.req.socket as any)?.remoteAddress,
        clientUserAgent: ctx.req.headers["user-agent"] as string,
        fbc: ctx.req.cookies?.["_fbc"],
        fbp: ctx.req.cookies?.["_fbp"],
        eventSourceUrl: input.referrer,
        eventId: `camp_${registration?.insertId || Date.now()}`,
      }).catch((err) => console.error("[CAPI] Camp registration error:", err));

      // Invalidate camp registration caches after new submission
      serverCache.invalidateByPrefix("paginated:campRegistrations:");
      serverCache.invalidate("list:campRegistrations");
      serverCache.invalidate(CacheKeys.campRegistrationStats());

      return { success: true, id: registration.insertId };
    }),

  // List all camp registrations (protected)
  list: protectedProcedure.query(async () => {
    return serverCache.getOrCompute(
      "list:campRegistrations",
      CacheTTL.LIST,
      async () => {
        const db = await getDb();
        if (!db) return [];

        const { camps } = await import("../../drizzle/schema");
        
        const results = await db
          .select({
            id: campRegistrations.id,
            campId: campRegistrations.campId,
            campName: camps.name,
            fullName: campRegistrations.fullName,
            phone: campRegistrations.phone,
            email: campRegistrations.email,
            age: campRegistrations.age,
            procedures: campRegistrations.procedures,
            medicalCondition: campRegistrations.medicalCondition,
            notes: campRegistrations.notes,
            source: campRegistrations.source,
            status: campRegistrations.status,
            createdAt: campRegistrations.createdAt,
            updatedAt: campRegistrations.updatedAt,
          })
          .from(campRegistrations)
          .leftJoin(camps, eq(camps.id, campRegistrations.campId))
          .orderBy(desc(campRegistrations.createdAt));

        return results;
      }
    );
  }),

  // List camp registrations with pagination (protected)
  listPaginated: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        limit: z.number().min(1).max(100000).default(20),
        searchTerm: z.string().optional(),
        campIds: z.array(z.number()).optional(),
        sources: z.array(z.string()).optional(),
        statuses: z.array(z.string()).optional(),
        dateFilter: z.enum(["all", "today", "week", "month"]).optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const cacheKey = CacheKeys.campRegistrationsPaginated(input);
      return serverCache.getOrCompute(
        cacheKey,
        CacheTTL.PAGINATED,
        async () => {
          const { getCampRegistrationsPaginated } = await import('../db');
          return getCampRegistrationsPaginated(
            input.page,
            input.limit,
            input.searchTerm,
            input.campIds,
            input.sources,
            input.statuses,
            input.dateFilter,
            input.dateFrom,
            input.dateTo
          );
        }
      );
    }),

  // Get stats for camp registrations (protected)
  stats: protectedProcedure.query(async () => {
    return serverCache.getOrCompute(
      CacheKeys.campRegistrationStats(),
      CacheTTL.STATS,
      async () => {
        const db = await getDb();
        if (!db) return { total: 0, pending: 0, confirmed: 0, attended: 0, cancelled: 0 };

        const all = await db.select().from(campRegistrations);

        return {
          total: all.length,
          pending: all.filter((r) => r.status === "pending").length,
          confirmed: all.filter((r) => r.status === "confirmed").length,
          attended: all.filter((r) => r.status === "attended").length,
          cancelled: all.filter((r) => r.status === "cancelled").length,
        };
      }
    );
  }),

  // Update camp registration status (protected)
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "contacted", "no_answer", "confirmed", "attended", "completed", "cancelled"]),
        notes: z.string().optional(),
        fullName: z.string().optional(),
        phone: z.string().optional(),
        attendanceDate: z.date().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get old status for audit log
      const [old] = await db.select({ status: campRegistrations.status }).from(campRegistrations).where(eq(campRegistrations.id, input.id)).limit(1);
      const oldStatus = old?.status || '';

      const now = new Date();
      const updateData: any = {
        status: input.status,
        statusNotes: input.notes,
        updatedAt: now,
      };

      // حفظ وقت كل حالة عند التغيير
      if (input.status === 'contacted') updateData.contactedAt = now;
      else if (input.status === 'confirmed') updateData.confirmedAt = now;
      else if (input.status === 'attended') updateData.attendedAt = now;
      else if (input.status === 'completed') updateData.completedAt = now;
      else if (input.status === 'cancelled') updateData.cancelledAt = now;

      // إضافة البيانات المعدلة إذا تم توفيرها
      if (input.fullName) updateData.fullName = input.fullName;
      if (input.phone) updateData.phone = input.phone;
      if (input.attendanceDate) updateData.attendanceDate = input.attendanceDate;

      await db
        .update(campRegistrations)
        .set(updateData)
        .where(eq(campRegistrations.id, input.id));

      // Create audit log
      await createAuditLog({
        entityType: 'campRegistration',
        entityId: input.id,
        action: 'status_change',
        oldValue: oldStatus,
        newValue: input.status,
        userId: ctx.user?.id,
        userName: ctx.user?.name,
        notes: input.notes,
      });

      // ── Send CAPI funnel event for status change (fire-and-forget) ────────────
      {
        const [regRow] = await db
          .select({ fullName: campRegistrations.fullName, phone: campRegistrations.phone, email: campRegistrations.email })
          .from(campRegistrations)
          .where(eq(campRegistrations.id, input.id))
          .limit(1);
        if (regRow?.phone) {
          sendStatusChangeEvent({
            status: input.status,
            fullName: regRow.fullName || "",
            phone: regRow.phone,
            email: regRow.email || undefined,
            serviceType: "camp",
            bookingId: input.id,
          }).catch((err) => console.error("[CAPI] Camp status change error:", err));
        }
      }

      // ── WhatsApp Dispatcher: إرسال رسالة تلقائية بناءً على الحالة ──
      {
        const [reg] = await db.select().from(campRegistrations).where(eq(campRegistrations.id, input.id)).limit(1);
        if (reg?.phone) {
          const { camps } = await import("../../drizzle/schema");
          const [camp] = await db.select().from(camps).where(eq(camps.id, reg.campId)).limit(1);
          const triggerMap: Record<string, string> = {
            "confirmed": "on_confirmed",
            "attended": "on_arrived",
            "completed": "on_completed",
            "cancelled": "on_cancelled",
          };
          const triggerEvent = triggerMap[input.status];
          if (triggerEvent) {
            dispatchWhatsAppMessage({
              entityType: "camp_registration",
              triggerEvent: triggerEvent as any,
              phone: reg.phone,
              recipientName: reg.fullName || undefined,
              variables: {
                name: reg.fullName || "المسجل",
                camp_name: camp?.name || "المخيم",
                date: (reg as any).preferredDate
                  ? new Date((reg as any).preferredDate).toLocaleDateString("ar-YE")
                  : (camp?.startDate ? new Date(camp.startDate).toLocaleDateString("ar-YE") : "غير محدد"),
                time: (reg as any).preferredTimeSlot === 'morning'
                  ? `صباحاً ${(camp as any)?.morningTime || ''}`
                  : (reg as any).preferredTimeSlot === 'evening'
                  ? `مساءً ${(camp as any)?.eveningTime || ''}`
                  : "غير محدد",
                location: "صنعاء - الستين الشمالي - قبل جولة الجمنه",
              },
              entityId: input.id,
              sentBy: ctx.user?.id,
            }).catch(err => console.error("[WhatsApp Dispatcher] Camp status trigger error:", err));
          }
          // ملاحظة: تم إزالة sendCampPatientArrivalWelcome القديمة - dispatchWhatsAppMessage يتولى الإرسال عبر إعدادات الرسائل
        }
      }

      // Invalidate camp registration caches after status update
      serverCache.invalidateByPrefix("paginated:campRegistrations:");
      serverCache.invalidate("list:campRegistrations");
      serverCache.invalidate(CacheKeys.campRegistrationStats());

      return { success: true };
    }),

  // Bulk update status for multiple registrations (protected)
  bulkUpdateStatus: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.number()),
        status: z.enum(["pending", "contacted", "no_answer", "confirmed", "attended", "completed", "cancelled"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const now = new Date();
      const updateData: any = {
        status: input.status,
        statusNotes: input.notes,
        updatedAt: now,
      };

      // حفظ وقت كل حالة عند التغيير
      if (input.status === 'contacted') updateData.contactedAt = now;
      else if (input.status === 'confirmed') updateData.confirmedAt = now;
      else if (input.status === 'attended') updateData.attendedAt = now;
      else if (input.status === 'completed') updateData.completedAt = now;
      else if (input.status === 'cancelled') updateData.cancelledAt = now;

      // Update all selected registrations
      for (const id of input.ids) {
        await db
          .update(campRegistrations)
          .set(updateData)
          .where(eq(campRegistrations.id, id));
      }

      // Create audit logs for bulk update
      for (const id of input.ids) {
        await createAuditLog({
          entityType: 'campRegistration',
          entityId: id,
          action: 'bulk_status_change',
          newValue: input.status,
          userId: ctx.user?.id,
          userName: ctx.user?.name,
          notes: input.notes,
        });
      }

      // Invalidate camp registration caches after bulk update
      serverCache.invalidateByPrefix("paginated:campRegistrations:");
      serverCache.invalidate("list:campRegistrations");
      serverCache.invalidate(CacheKeys.campRegistrationStats());

      return { success: true, count: input.ids.length };
    }),

  // Delete camp registration (protected)
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.delete(campRegistrations).where(eq(campRegistrations.id, input.id));

      // Invalidate camp registration caches after deletion
      serverCache.invalidateByPrefix("paginated:campRegistrations:");
      serverCache.invalidate("list:campRegistrations");
      serverCache.invalidate(CacheKeys.campRegistrationStats());

      return { success: true };
    }),

  // Generate and save receipt number
  generateReceiptNumber: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if receipt number already exists
      const [registration] = await db.select().from(campRegistrations).where(eq(campRegistrations.id, input.id)).limit(1);
      if (!registration) {
        throw new Error("التسجيل غير موجود");
      }

      // If already has receipt number, return it
      if (registration.receiptNumber) {
        return { receiptNumber: registration.receiptNumber };
      }

      // Generate new receipt number
      const year = new Date().getFullYear();
      
      // Get the count of camp registrations with receipt numbers this year
      const { sql } = await import("drizzle-orm");
      const [result] = await db.execute(sql`
        SELECT COUNT(*) as count 
        FROM campRegistrations 
        WHERE receiptNumber LIKE CONCAT('SGH-', ${year}, '-%')
      `);
      
      const count = (result as any).count || 0;
      const sequenceNumber = count + 1;
      const paddedNumber = String(sequenceNumber).padStart(3, '0');
      const receiptNumber = `SGH-${year}-${paddedNumber}`;

      // Save receipt number
      await db.update(campRegistrations).set({ receiptNumber }).where(eq(campRegistrations.id, input.id));

      return { receiptNumber };
    }),

  // Schedule camp stats report
  scheduleReport: protectedProcedure
    .input(z.object({
      email: z.string().email(),
      frequency: z.enum(["daily", "weekly", "monthly"]),
      campId: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      // TODO: Implement actual report scheduling
      // This would typically:
      // 1. Store the schedule configuration in a database table
      // 2. Set up a cron job to generate and send reports
      // 3. Use an email service to send the reports
      
      // For now, return success as a placeholder
      return {
        success: true,
        message: `تم جدولة التقرير للإرسال إلى ${input.email} (${input.frequency === "daily" ? "يومياً" : input.frequency === "weekly" ? "أسبوعياً" : "شهرياً"})`,
        schedule: {
          email: input.email,
          frequency: input.frequency,
          campId: input.campId,
        },
      };
    }),
});
