import { eq, desc, and, sql, like, or, isNull, gte, lte } from "drizzle-orm";
import { getDb } from "../db";
import { tasks, taskComments, taskAttachments, users, campaigns, type Task, type InsertTask, type TaskComment, type InsertTaskComment, type TaskAttachment, type InsertTaskAttachment } from "../../drizzle/schema";

// ============ TASKS ============

export async function getAllTasks(filters?: {
  status?: string;
  priority?: string;
  category?: string;
  assignedTo?: number;
  campaignId?: number;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let conditions = [];

  if (filters?.status && filters.status !== 'all') {
    conditions.push(eq(tasks.status, filters.status as any));
  }
  if (filters?.priority && filters.priority !== 'all') {
    conditions.push(eq(tasks.priority, filters.priority as any));
  }
  if (filters?.category && filters.category !== 'all') {
    conditions.push(eq(tasks.category, filters.category as any));
  }
  if (filters?.assignedTo) {
    conditions.push(eq(tasks.assignedTo, filters.assignedTo));
  }
  if (filters?.campaignId) {
    conditions.push(eq(tasks.campaignId, filters.campaignId));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(tasks.title, `%${filters.search}%`),
        like(tasks.description, `%${filters.search}%`)
      )
    );
  }

  const result = await db
    .select({
      task: tasks,
      assignedUser: {
        id: users.id,
        name: users.name,
        username: users.username,
      },
      campaign: {
        id: campaigns.id,
        name: campaigns.name,
      },
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assignedTo, users.id))
    .leftJoin(campaigns, eq(tasks.campaignId, campaigns.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(tasks.createdAt));

  return result.map(r => ({
    ...r.task,
    assignedUser: r.assignedUser?.id ? r.assignedUser : null,
    campaign: r.campaign?.id ? r.campaign : null,
  }));
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      task: tasks,
      assignedUser: {
        id: users.id,
        name: users.name,
        username: users.username,
      },
      campaign: {
        id: campaigns.id,
        name: campaigns.name,
      },
    })
    .from(tasks)
    .leftJoin(users, eq(tasks.assignedTo, users.id))
    .leftJoin(campaigns, eq(tasks.campaignId, campaigns.id))
    .where(eq(tasks.id, id))
    .limit(1);

  if (result.length === 0) return null;

  const r = result[0];
  return {
    ...r.task,
    assignedUser: r.assignedUser?.id ? r.assignedUser : null,
    campaign: r.campaign?.id ? r.campaign : null,
  };
}

export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(tasks).values(data);
  return { id: result[0].insertId };
}

export async function updateTask(id: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // If status is being changed to completed, set completedAt
  if (data.status === 'completed' && !data.completedAt) {
    data.completedAt = new Date();
  }

  await db.update(tasks).set(data).where(eq(tasks.id, id));
  return { success: true };
}

export async function deleteTask(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete related comments and attachments first
  await db.delete(taskComments).where(eq(taskComments.taskId, id));
  await db.delete(taskAttachments).where(eq(taskAttachments.taskId, id));
  await db.delete(tasks).where(eq(tasks.id, id));
  return { success: true };
}

export async function updateTaskStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = { status };
  if (status === 'completed') {
    updateData.completedAt = new Date();
  }

  await db.update(tasks).set(updateData).where(eq(tasks.id, id));
  return { success: true };
}

export async function getTasksStats() {
  const db = await getDb();
  if (!db) return { total: 0, todo: 0, inProgress: 0, review: 0, completed: 0, overdue: 0 };

  const now = new Date();

  const [total] = await db.select({ count: sql<number>`count(*)` }).from(tasks);
  const [todo] = await db.select({ count: sql<number>`count(*)` }).from(tasks).where(eq(tasks.status, 'todo'));
  const [inProgress] = await db.select({ count: sql<number>`count(*)` }).from(tasks).where(eq(tasks.status, 'in_progress'));
  const [review] = await db.select({ count: sql<number>`count(*)` }).from(tasks).where(eq(tasks.status, 'review'));
  const [completed] = await db.select({ count: sql<number>`count(*)` }).from(tasks).where(eq(tasks.status, 'completed'));
  const [overdue] = await db.select({ count: sql<number>`count(*)` }).from(tasks)
    .where(and(
      sql`${tasks.dueDate} < ${now}`,
      sql`${tasks.status} NOT IN ('completed', 'cancelled')`
    ));

  return {
    total: total?.count || 0,
    todo: todo?.count || 0,
    inProgress: inProgress?.count || 0,
    review: review?.count || 0,
    completed: completed?.count || 0,
    overdue: overdue?.count || 0,
  };
}

// ============ TASK COMMENTS ============

export async function getTaskComments(taskId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      comment: taskComments,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
      },
    })
    .from(taskComments)
    .leftJoin(users, eq(taskComments.userId, users.id))
    .where(eq(taskComments.taskId, taskId))
    .orderBy(desc(taskComments.createdAt));

  return result.map(r => ({
    ...r.comment,
    user: r.user,
  }));
}

export async function addTaskComment(data: InsertTaskComment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(taskComments).values(data);
  return { id: result[0].insertId };
}

export async function deleteTaskComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(taskComments).where(eq(taskComments.id, id));
  return { success: true };
}

// ============ TASK ATTACHMENTS ============

export async function getTaskAttachments(taskId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      attachment: taskAttachments,
      user: {
        id: users.id,
        name: users.name,
        username: users.username,
      },
    })
    .from(taskAttachments)
    .leftJoin(users, eq(taskAttachments.userId, users.id))
    .where(eq(taskAttachments.taskId, taskId))
    .orderBy(desc(taskAttachments.createdAt));

  return result.map(r => ({
    ...r.attachment,
    user: r.user,
  }));
}

export async function addTaskAttachment(data: InsertTaskAttachment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(taskAttachments).values(data);
  return { id: result[0].insertId };
}

export async function deleteTaskAttachment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(taskAttachments).where(eq(taskAttachments.id, id));
  return { success: true };
}

// ============ HELPERS ============

export async function getTasksByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(tasks)
    .where(eq(tasks.assignedTo, userId))
    .orderBy(desc(tasks.createdAt));
}

export async function getTasksByCampaign(campaignId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(tasks)
    .where(eq(tasks.campaignId, campaignId))
    .orderBy(desc(tasks.createdAt));
}

export async function getOverdueTasks() {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();

  return await db
    .select()
    .from(tasks)
    .where(and(
      sql`${tasks.dueDate} < ${now}`,
      sql`${tasks.status} NOT IN ('completed', 'cancelled')`
    ))
    .orderBy(tasks.dueDate);
}
