import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTasksStats,
  getTaskComments,
  addTaskComment,
  deleteTaskComment,
  getTaskAttachments,
  addTaskAttachment,
  deleteTaskAttachment,
  getTasksByUser,
  getOverdueTasks,
} from "../db/tasks";

export const tasksRouter = router({
  // Get all tasks with filters
  list: protectedProcedure
    .input(z.object({
      status: z.string().optional(),
      priority: z.string().optional(),
      category: z.string().optional(),
      assignedTo: z.number().optional(),
      campaignId: z.number().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await getAllTasks(input);
    }),

  // Get single task by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getTaskById(input.id);
    }),

  // Create new task
  create: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
      status: z.enum(["todo", "in_progress", "review", "completed", "cancelled"]).default("todo"),
      category: z.enum(["content", "design", "ads", "seo", "social_media", "analytics", "other"]).default("other"),
      assignedTo: z.number().optional(),
      campaignId: z.number().optional(),
      projectId: z.number().optional(),
      teamId: z.number().optional(),
      dueDate: z.date().optional(),
      estimatedHours: z.number().optional(),
      tags: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      return await createTask({
        ...input,
        createdBy: ctx.user.id,
      });
    }),

  // Update task
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
      status: z.enum(["todo", "in_progress", "review", "completed", "cancelled"]).optional(),
      category: z.enum(["content", "design", "ads", "seo", "social_media", "analytics", "other"]).optional(),
      assignedTo: z.number().nullable().optional(),
      campaignId: z.number().nullable().optional(),
      dueDate: z.date().nullable().optional(),
      completedAt: z.date().nullable().optional(),
      estimatedHours: z.number().nullable().optional(),
      actualHours: z.number().nullable().optional(),
      tags: z.string().nullable().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      return await updateTask(id, data);
    }),

  // Delete task
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteTask(input.id);
    }),

  // Update task status (for drag & drop)
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["todo", "in_progress", "review", "completed", "cancelled"]),
    }))
    .mutation(async ({ input }) => {
      return await updateTaskStatus(input.id, input.status);
    }),

  // Get tasks statistics
  stats: protectedProcedure.query(async () => {
    return await getTasksStats();
  }),

  // Get my tasks
  myTasks: protectedProcedure.query(async ({ ctx }) => {
    return await getTasksByUser(ctx.user.id);
  }),

  // Get overdue tasks
  overdue: protectedProcedure.query(async () => {
    return await getOverdueTasks();
  }),

  // ============ COMMENTS ============

  // Get task comments
  getComments: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .query(async ({ input }) => {
      return await getTaskComments(input.taskId);
    }),

  // Add comment
  addComment: protectedProcedure
    .input(z.object({
      taskId: z.number(),
      content: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      return await addTaskComment({
        taskId: input.taskId,
        userId: ctx.user.id,
        content: input.content,
      });
    }),

  // Delete comment
  deleteComment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteTaskComment(input.id);
    }),

  // ============ ATTACHMENTS ============

  // Get task attachments
  getAttachments: protectedProcedure
    .input(z.object({ taskId: z.number() }))
    .query(async ({ input }) => {
      return await getTaskAttachments(input.taskId);
    }),

  // Add attachment
  addAttachment: protectedProcedure
    .input(z.object({
      taskId: z.number(),
      fileName: z.string(),
      fileUrl: z.string(),
      fileType: z.string().optional(),
      fileSize: z.number().optional(),
      attachmentType: z.enum(["deliverable", "reference", "other"]).default("other"),
    }))
    .mutation(async ({ input, ctx }) => {
      return await addTaskAttachment({
        taskId: input.taskId,
        userId: ctx.user.id,
        fileName: input.fileName,
        fileUrl: input.fileUrl,
        fileType: input.fileType,
        fileSize: input.fileSize,
        attachmentType: input.attachmentType,
      });
    }),

  // Delete attachment
  deleteAttachment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await deleteTaskAttachment(input.id);
    }),
});
