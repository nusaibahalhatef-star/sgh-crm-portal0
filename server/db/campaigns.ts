import { eq, desc, and, gte, lte, sql, or, like } from "drizzle-orm";
import { campaigns, appointments, leads, offerLeads, campRegistrations } from "../../drizzle/schema";
import { getDb } from "../db";

/**
 * Get all campaigns with optional filters
 */
export async function getCampaigns(filters?: {
  status?: string;
  type?: string;
  search?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let conditions = [];
  
  if (filters?.status) {
    conditions.push(eq(campaigns.status, filters.status as any));
  }
  
  if (filters?.type) {
    conditions.push(eq(campaigns.type, filters.type as any));
  }
  
  if (filters?.search) {
    conditions.push(
      or(
        like(campaigns.name, `%${filters.search}%`),
        like(campaigns.description, `%${filters.search}%`)
      )
    );
  }

  const query = conditions.length > 0
    ? db.select().from(campaigns).where(and(...conditions)).orderBy(desc(campaigns.createdAt))
    : db.select().from(campaigns).orderBy(desc(campaigns.createdAt));

  return await query;
}

/**
 * Get campaign by ID
 */
export async function getCampaignById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(campaigns).where(eq(campaigns.id, id)).limit(1);
  return result[0];
}

/**
 * Get campaign by slug
 */
export async function getCampaignBySlug(slug: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.select().from(campaigns).where(eq(campaigns.slug, slug)).limit(1);
  return result[0];
}

/**
 * Create new campaign
 */
export async function createCampaign(data: typeof campaigns.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(campaigns).values(data);
  return result;
}

/**
 * Update campaign
 */
export async function updateCampaign(id: number, data: Partial<typeof campaigns.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(campaigns).set(data).where(eq(campaigns.id, id));
  return await getCampaignById(id);
}

/**
 * Delete campaign
 */
export async function deleteCampaign(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(campaigns).where(eq(campaigns.id, id));
  return { success: true };
}

/**
 * Get campaign statistics
 */
export async function getCampaignStats(campaignId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Get total leads
  const leadsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(leads)
    .where(eq(leads.campaignId, campaignId));
  
  const totalLeads = Number(leadsResult[0]?.count || 0);

  // Get total appointments
  const appointmentsResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(appointments)
    .where(eq(appointments.campaignId, campaignId));
  
  const totalAppointments = Number(appointmentsResult[0]?.count || 0);

  // Get conversion rate
  const conversionRate = totalLeads > 0 ? (totalAppointments / totalLeads) * 100 : 0;

  // Get leads by status
  const leadsByStatus = await db
    .select({
      status: leads.status,
      count: sql<number>`count(*)`,
    })
    .from(leads)
    .where(eq(leads.campaignId, campaignId))
    .groupBy(leads.status);

  // Get appointments by status
  const appointmentsByStatus = await db
    .select({
      status: appointments.status,
      count: sql<number>`count(*)`,
    })
    .from(appointments)
    .where(eq(appointments.campaignId, campaignId))
    .groupBy(appointments.status);

  return {
    totalLeads,
    totalAppointments,
    conversionRate: Math.round(conversionRate * 100) / 100,
    leadsByStatus: leadsByStatus.map(item => ({
      status: item.status,
      count: Number(item.count),
    })),
    appointmentsByStatus: appointmentsByStatus.map(item => ({
      status: item.status,
      count: Number(item.count),
    })),
  };
}

/**
 * Get campaigns overview statistics
 */
export async function getCampaignsOverview() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Total campaigns
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(campaigns);
  const totalCampaigns = Number(totalResult[0]?.count || 0);

  // Active campaigns
  const activeResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(campaigns)
    .where(eq(campaigns.status, "active"));
  const activeCampaigns = Number(activeResult[0]?.count || 0);

  // Total budget (planned)
  const budgetResult = await db
    .select({ total: sql<number>`SUM(plannedBudget)` })
    .from(campaigns);
  const totalPlannedBudget = Number(budgetResult[0]?.total || 0);

  // Total budget (actual)
  const actualBudgetResult = await db
    .select({ total: sql<number>`SUM(actualBudget)` })
    .from(campaigns);
  const totalActualBudget = Number(actualBudgetResult[0]?.total || 0);

  return {
    totalCampaigns,
    activeCampaigns,
    totalPlannedBudget,
    totalActualBudget,
  };
}
