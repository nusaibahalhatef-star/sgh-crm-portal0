import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { leads, appointments, offerLeads, campRegistrations, whatsappConversations, whatsappMessages } from "../../drizzle/schema";
import { sql, count, eq, gte, lte, and } from "drizzle-orm";

/**
 * Charts Router - يوفر بيانات الرسوم البيانية للوحة التحكم
 * Provides chart data for the admin dashboard
 */

const periodSchema = z.enum(["7d", "30d", "90d", "12m"]).default("30d");

function getDateRange(period: string): { startDate: Date; groupBy: string; dateFormat: string } {
  const now = new Date();
  let startDate: Date;
  let groupBy: string;
  let dateFormat: string;

  switch (period) {
    case "7d":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      groupBy = "DATE(createdAt)";
      dateFormat = "%Y-%m-%d";
      break;
    case "30d":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = "DATE(createdAt)";
      dateFormat = "%Y-%m-%d";
      break;
    case "90d":
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      groupBy = "YEARWEEK(createdAt, 1)";
      dateFormat = "%x-W%v";
      break;
    case "12m":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      groupBy = "DATE_FORMAT(createdAt, '%Y-%m')";
      dateFormat = "%Y-%m";
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      groupBy = "DATE(createdAt)";
      dateFormat = "%Y-%m-%d";
  }

  return { startDate, groupBy, dateFormat };
}

export const chartsRouter = router({
  /**
   * اتجاه التسجيلات عبر الزمن (خطي)
   * Registrations trend over time - combines leads, appointments, offer leads, camp registrations
   */
  registrationsTrend: protectedProcedure
    .input(z.object({ period: periodSchema }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { startDate, groupBy, dateFormat } = getDateRange(input.period);

      // Leads trend
      const leadsTrend = await db.execute(sql`
        SELECT DATE_FORMAT(createdAt, ${dateFormat}) as date_label, ${sql.raw(groupBy)} as date_group, COUNT(*) as total
        FROM leads
        WHERE createdAt >= ${startDate}
        GROUP BY date_group, date_label
        ORDER BY date_group ASC
      `);

      // Appointments trend
      const appointmentsTrend = await db.execute(sql`
        SELECT DATE_FORMAT(createdAt, ${dateFormat}) as date_label, ${sql.raw(groupBy)} as date_group, COUNT(*) as total
        FROM appointments
        WHERE createdAt >= ${startDate}
        GROUP BY date_group, date_label
        ORDER BY date_group ASC
      `);

      // Offer leads trend
      const offerLeadsTrend = await db.execute(sql`
        SELECT DATE_FORMAT(createdAt, ${dateFormat}) as date_label, ${sql.raw(groupBy)} as date_group, COUNT(*) as total
        FROM offerLeads
        WHERE createdAt >= ${startDate}
        GROUP BY date_group, date_label
        ORDER BY date_group ASC
      `);

      // Camp registrations trend
      const campRegsTrend = await db.execute(sql`
        SELECT DATE_FORMAT(createdAt, ${dateFormat}) as date_label, ${sql.raw(groupBy)} as date_group, COUNT(*) as total
        FROM campRegistrations
        WHERE createdAt >= ${startDate}
        GROUP BY date_group, date_label
        ORDER BY date_group ASC
      `);

      // Merge all dates into a unified timeline
      const allDates = new Set<string>();
      const extractRows = (result: any): Array<{ date_label: string; total: number }> => {
        const rows = Array.isArray(result) ? result : (result as any)?.[0] || [];
        return rows.map((r: any) => ({
          date_label: String(r.date_label),
          total: Number(r.total),
        }));
      };

      const leadsRows = extractRows(leadsTrend);
      const appointmentsRows = extractRows(appointmentsTrend);
      const offerLeadsRows = extractRows(offerLeadsTrend);
      const campRegsRows = extractRows(campRegsTrend);

      [leadsRows, appointmentsRows, offerLeadsRows, campRegsRows].forEach(rows => {
        rows.forEach(r => allDates.add(r.date_label));
      });

      const sortedDates = Array.from(allDates).sort();

      const toMap = (rows: Array<{ date_label: string; total: number }>) => {
        const map = new Map<string, number>();
        rows.forEach(r => map.set(r.date_label, r.total));
        return map;
      };

      const leadsMap = toMap(leadsRows);
      const appointmentsMap = toMap(appointmentsRows);
      const offerLeadsMap = toMap(offerLeadsRows);
      const campRegsMap = toMap(campRegsRows);

      return {
        labels: sortedDates,
        datasets: {
          leads: sortedDates.map(d => leadsMap.get(d) || 0),
          appointments: sortedDates.map(d => appointmentsMap.get(d) || 0),
          offerLeads: sortedDates.map(d => offerLeadsMap.get(d) || 0),
          campRegistrations: sortedDates.map(d => campRegsMap.get(d) || 0),
        },
      };
    }),

  /**
   * توزيع حالات العملاء (دائري)
   * Lead status distribution
   */
  leadStatusDistribution: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select({
          status: leads.status,
          total: count(),
        })
        .from(leads)
        .groupBy(leads.status);

      return result.map(r => ({
        status: r.status,
        total: r.total,
      }));
    }),

  /**
   * التسجيلات حسب المصدر (شريطي)
   * Registrations by source
   */
  registrationsBySource: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Leads by source
      const leadsResult = await db.execute(sql`
        SELECT COALESCE(source, 'غير محدد') as source_name, COUNT(*) as total
        FROM leads
        GROUP BY source_name
        ORDER BY total DESC
        LIMIT 10
      `);

      // Appointments by source
      const appointmentsResult = await db.execute(sql`
        SELECT COALESCE(source, 'غير محدد') as source_name, COUNT(*) as total
        FROM appointments
        GROUP BY source_name
        ORDER BY total DESC
        LIMIT 10
      `);

      // Offer leads by source
      const offerLeadsResult = await db.execute(sql`
        SELECT COALESCE(source, 'غير محدد') as source_name, COUNT(*) as total
        FROM offerLeads
        GROUP BY source_name
        ORDER BY total DESC
        LIMIT 10
      `);

      const extractRows = (result: any): Array<{ source_name: string; total: number }> => {
        const rows = Array.isArray(result) ? result : (result as any)?.[0] || [];
        return rows.map((r: any) => ({
          source_name: String(r.source_name),
          total: Number(r.total),
        }));
      };

      return {
        leads: extractRows(leadsResult),
        appointments: extractRows(appointmentsResult),
        offerLeads: extractRows(offerLeadsResult),
      };
    }),

  /**
   * أداء العروض والمخيمات (شريطي)
   * Offers and camps performance
   */
  offersAndCampsPerformance: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Offer leads count per offer
      const offersPerformance = await db.execute(sql`
        SELECT o.title as name, COUNT(ol.id) as total,
          SUM(CASE WHEN ol.status IN ('confirmed', 'completed', 'booked') THEN 1 ELSE 0 END) as converted
        FROM offers o
        LEFT JOIN offerLeads ol ON o.id = ol.offerId
        GROUP BY o.id, o.title
        ORDER BY total DESC
        LIMIT 8
      `);

      // Camp registrations count per camp
      const campsPerformance = await db.execute(sql`
        SELECT c.name, COUNT(cr.id) as total,
          SUM(CASE WHEN cr.status IN ('confirmed', 'attended') THEN 1 ELSE 0 END) as converted
        FROM camps c
        LEFT JOIN campRegistrations cr ON c.id = cr.campId
        GROUP BY c.id, c.name
        ORDER BY total DESC
        LIMIT 8
      `);

      const extractRows = (result: any): Array<{ name: string; total: number; converted: number }> => {
        const rows = Array.isArray(result) ? result : (result as any)?.[0] || [];
        return rows.map((r: any) => ({
          name: String(r.name),
          total: Number(r.total),
          converted: Number(r.converted || 0),
        }));
      };

      return {
        offers: extractRows(offersPerformance),
        camps: extractRows(campsPerformance),
      };
    }),

  /**
   * إحصائيات المواعيد حسب الحالة (دائري)
   * Appointments by status
   */
  appointmentStatusDistribution: protectedProcedure
    .query(async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const result = await db
        .select({
          status: appointments.status,
          total: count(),
        })
        .from(appointments)
        .groupBy(appointments.status);

      return result.map(r => ({
        status: r.status,
        total: r.total,
      }));
    }),

  /**
   * إحصائيات واتساب (خطي)
   * WhatsApp messages trend
   */
  whatsappTrend: protectedProcedure
    .input(z.object({ period: periodSchema }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const { startDate, groupBy, dateFormat } = getDateRange(input.period);

      const inboundTrend = await db.execute(sql`
        SELECT DATE_FORMAT(createdAt, ${dateFormat}) as date_label, ${sql.raw(groupBy)} as date_group, COUNT(*) as total
        FROM whatsapp_messages
        WHERE direction = 'inbound' AND createdAt >= ${startDate}
        GROUP BY date_group, date_label
        ORDER BY date_group ASC
      `);

      const outboundTrend = await db.execute(sql`
        SELECT DATE_FORMAT(createdAt, ${dateFormat}) as date_label, ${sql.raw(groupBy)} as date_group, COUNT(*) as total
        FROM whatsapp_messages
        WHERE direction = 'outbound' AND createdAt >= ${startDate}
        GROUP BY date_group, date_label
        ORDER BY date_group ASC
      `);

      const extractRows = (result: any): Array<{ date_label: string; total: number }> => {
        const rows = Array.isArray(result) ? result : (result as any)?.[0] || [];
        return rows.map((r: any) => ({
          date_label: String(r.date_label),
          total: Number(r.total),
        }));
      };

      const inboundRows = extractRows(inboundTrend);
      const outboundRows = extractRows(outboundTrend);

      const allDates = new Set<string>();
      [inboundRows, outboundRows].forEach(rows => rows.forEach(r => allDates.add(r.date_label)));
      const sortedDates = Array.from(allDates).sort();

      const toMap = (rows: Array<{ date_label: string; total: number }>) => {
        const map = new Map<string, number>();
        rows.forEach(r => map.set(r.date_label, r.total));
        return map;
      };

      return {
        labels: sortedDates,
        datasets: {
          inbound: sortedDates.map(d => toMap(inboundRows).get(d) || 0),
          outbound: sortedDates.map(d => toMap(outboundRows).get(d) || 0),
        },
      };
    }),

  /**
   * ملخص سريع للإحصائيات مع مقارنة بالفترة السابقة
   * Quick summary with period comparison
   */
  summaryComparison: protectedProcedure
    .input(z.object({ period: periodSchema }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const now = new Date();
      let periodDays: number;
      switch (input.period) {
        case "7d": periodDays = 7; break;
        case "30d": periodDays = 30; break;
        case "90d": periodDays = 90; break;
        case "12m": periodDays = 365; break;
        default: periodDays = 30;
      }

      const currentStart = new Date(now.getTime() - periodDays * 24 * 60 * 60 * 1000);
      const previousStart = new Date(currentStart.getTime() - periodDays * 24 * 60 * 60 * 1000);

      const getCount = async (table: any, start: Date, end: Date) => {
        const result = await db.execute(sql`
          SELECT COUNT(*) as total FROM ${table}
          WHERE createdAt >= ${start} AND createdAt < ${end}
        `);
        const rows = Array.isArray(result) ? result : (result as any)?.[0] || [];
        return Number(rows[0]?.total || 0);
      };

      const [
        currentLeads, previousLeads,
        currentAppointments, previousAppointments,
        currentOfferLeads, previousOfferLeads,
        currentCampRegs, previousCampRegs,
      ] = await Promise.all([
        getCount(leads, currentStart, now),
        getCount(leads, previousStart, currentStart),
        getCount(appointments, currentStart, now),
        getCount(appointments, previousStart, currentStart),
        getCount(offerLeads, currentStart, now),
        getCount(offerLeads, previousStart, currentStart),
        getCount(campRegistrations, currentStart, now),
        getCount(campRegistrations, previousStart, currentStart),
      ]);

      const calcChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return Math.round(((current - previous) / previous) * 100);
      };

      return {
        leads: { current: currentLeads, previous: previousLeads, change: calcChange(currentLeads, previousLeads) },
        appointments: { current: currentAppointments, previous: previousAppointments, change: calcChange(currentAppointments, previousAppointments) },
        offerLeads: { current: currentOfferLeads, previous: previousOfferLeads, change: calcChange(currentOfferLeads, previousOfferLeads) },
        campRegistrations: { current: currentCampRegs, previous: previousCampRegs, change: calcChange(currentCampRegs, previousCampRegs) },
        total: {
          current: currentLeads + currentAppointments + currentOfferLeads + currentCampRegs,
          previous: previousLeads + previousAppointments + previousOfferLeads + previousCampRegs,
          change: calcChange(
            currentLeads + currentAppointments + currentOfferLeads + currentCampRegs,
            previousLeads + previousAppointments + previousOfferLeads + previousCampRegs
          ),
        },
      };
    }),
});
