import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }),
  username: varchar("username", { length: 50 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "manager", "staff", "viewer", "team_leader"]).default("user").notNull(),
  isActive: mysqlEnum("isActive", ["yes", "no"]).default("yes").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Campaigns table - stores comprehensive marketing campaign information
 * يخزّن معلومات شاملة عن الحملات التسويقية
 */
export const campaigns = mysqlTable("campaigns", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  
  // Campaign Type & Status
  type: mysqlEnum("type", ["digital", "field", "awareness", "mixed"]).default("digital").notNull(),
  status: mysqlEnum("status", ["draft", "active", "paused", "completed", "cancelled"]).default("draft").notNull(),
  
  // Budget
  plannedBudget: int("plannedBudget"), // الميزانية المخططة
  actualBudget: int("actualBudget"), // الميزانية الفعلية
  currency: varchar("currency", { length: 10 }).default("YER"),
  
  // Dates
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  
  // Platforms (JSON array)
  platforms: text("platforms"), // ["facebook", "instagram", "google", "whatsapp", "field"]
  
  // Goals & KPIs
  goals: text("goals"), // الأهداف (JSON)
  targetLeads: int("targetLeads"), // هدف العملاء المحتملين
  targetBookings: int("targetBookings"), // هدف الحجوزات
  targetROI: int("targetROI"), // هدف عائد الاستثمار (%)
  
  // Team
  teamLeaderId: int("teamLeaderId"), // قائد الفريق
  teamMembers: text("teamMembers"), // JSON array of user IDs
  
  // Meta/Facebook Integration
  metaPixelId: varchar("metaPixelId", { length: 100 }),
  metaAccessToken: text("metaAccessToken"),
  
  // WhatsApp Integration
  whatsappEnabled: boolean("whatsappEnabled").default(false).notNull(),
  whatsappWelcomeMessage: text("whatsappWelcomeMessage"),
  
  // Legacy field
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;

/**
 * Leads table - stores customer registration data
 */
export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }),
  status: mysqlEnum("status", ["new", "contacted", "booked", "not_interested", "no_answer"]).default("new").notNull(),
  source: varchar("source", { length: 100 }),
  utmSource: varchar("utmSource", { length: 100 }),
  utmMedium: varchar("utmMedium", { length: 100 }),
  utmCampaign: varchar("utmCampaign", { length: 100 }),
  utmContent: varchar("utmContent", { length: 100 }),
  notes: text("notes"),
  emailSent: boolean("emailSent").default(false).notNull(),
  whatsappSent: boolean("whatsappSent").default(false).notNull(),
  bookingConfirmationSent: boolean("bookingConfirmationSent").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

/**
 * Lead status history - tracks all status changes
 */
export const leadStatusHistory = mysqlTable("leadStatusHistory", {
  id: int("id").autoincrement().primaryKey(),
  leadId: int("leadId").notNull(),
  userId: int("userId"),
  oldStatus: varchar("oldStatus", { length: 50 }),
  newStatus: varchar("newStatus", { length: 50 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LeadStatusHistory = typeof leadStatusHistory.$inferSelect;
export type InsertLeadStatusHistory = typeof leadStatusHistory.$inferInsert;

/**
 * Settings table - stores system configuration
 */
export const settings = mysqlTable("settings", {
  id: int("id").autoincrement().primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  description: text("description"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;

/**
 * Doctors table - stores information about hospital doctors
 */
export const doctors = mysqlTable("doctors", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  specialty: varchar("specialty", { length: 255 }).notNull(),
  image: varchar("image", { length: 500 }),
  bio: text("bio"),
  experience: varchar("experience", { length: 255 }),
  languages: varchar("languages", { length: 255 }),
  consultationFee: varchar("consultationFee", { length: 100 }),
  procedures: text("procedures"), // JSON array of available procedures
  isVisiting: mysqlEnum("isVisiting", ["yes", "no"]).default("no").notNull(), // Visiting doctor flag
  available: mysqlEnum("available", ["yes", "no"]).default("yes").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Doctor = typeof doctors.$inferSelect;
export type InsertDoctor = typeof doctors.$inferInsert;

/**
 * Appointments table - stores appointment bookings
 */
export const appointments = mysqlTable("appointments", {
  id: int("id").autoincrement().primaryKey(),
  campaignId: int("campaignId").notNull(),
  doctorId: int("doctorId").notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }),
  age: int("age"), // Patient age
  procedure: varchar("procedure", { length: 255 }), // Selected procedure
  preferredDate: varchar("preferredDate", { length: 50 }),
  preferredTime: varchar("preferredTime", { length: 50 }),
  appointmentDate: timestamp("appointmentDate"), // Confirmed appointment date/time
  notes: text("notes"), // Patient notes
  additionalNotes: text("additionalNotes"), // Additional patient notes
  staffNotes: text("staffNotes"), // Staff notes (admin only)
  status: mysqlEnum("status", ["pending", "confirmed", "cancelled", "completed"]).default("pending").notNull(),
  source: varchar("source", { length: 100 }), // Booking source (web, phone, manual)
  utmSource: varchar("utmSource", { length: 100 }),
  utmMedium: varchar("utmMedium", { length: 100 }),
  utmCampaign: varchar("utmCampaign", { length: 100 }),
  utmContent: varchar("utmContent", { length: 100 }),
  referrer: varchar("referrer", { length: 500 }),
  fbclid: varchar("fbclid", { length: 255 }),
  gclid: varchar("gclid", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;

/**
 * Access Requests table - stores access requests
 */
export const accessRequests = mysqlTable("accessRequests", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }),
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  reason: text("reason"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  requestedAt: timestamp("requestedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
  reviewedBy: int("reviewedBy"),
});

export type AccessRequest = typeof accessRequests.$inferSelect;
export type InsertAccessRequest = typeof accessRequests.$inferInsert;

/**
 * Offers table - stores special medical offers and promotions
 * يخزن العروض الطبية الخاصة والعروض الترويجية
 */
export const offers = mysqlTable("offers", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  isActive: boolean("isActive").default(true).notNull(),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Offer = typeof offers.$inferSelect;
export type InsertOffer = typeof offers.$inferInsert;

/**
 * Camps table - stores information about medical camps
 * يخزن معلومات المخيمات الطبية
 */
export const camps = mysqlTable("camps", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  isActive: boolean("isActive").default(true).notNull(),
  // New fields for advanced camp management
  freeOffers: text("freeOffers"), // Free offers (one per line)
  discountedOffers: text("discountedOffers"), // Discounted offers (one per line)
  availableProcedures: text("availableProcedures"), // JSON array of available procedures
  galleryImages: text("galleryImages"), // JSON array of image URLs
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Camp = typeof camps.$inferSelect;
export type InsertCamp = typeof camps.$inferInsert;

/**
 * Offer Leads table - stores customer requests for special offers
 * يخزن طلبات العملاء للعروض الخاصة
 */
export const offerLeads = mysqlTable("offerLeads", {
  id: int("id").autoincrement().primaryKey(),
  offerId: int("offerId").notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["new", "contacted", "booked", "not_interested", "no_answer"]).default("new").notNull(),
  statusNotes: text("statusNotes"),
  source: varchar("source", { length: 100 }),
  utmSource: varchar("utmSource", { length: 100 }),
  utmMedium: varchar("utmMedium", { length: 100 }),
  utmCampaign: varchar("utmCampaign", { length: 100 }),
  utmContent: varchar("utmContent", { length: 100 }),
  referrer: varchar("referrer", { length: 500 }),
  fbclid: varchar("fbclid", { length: 255 }),
  gclid: varchar("gclid", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type OfferLead = typeof offerLeads.$inferSelect;
export type InsertOfferLead = typeof offerLeads.$inferInsert;

/**
 * Camp Registrations table - stores registrations for medical camps
 * يخزن تسجيلات المخيمات الطبية
 */
export const campRegistrations = mysqlTable("campRegistrations", {
  id: int("id").autoincrement().primaryKey(),
  campId: int("campId").notNull(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  email: varchar("email", { length: 320 }),
  age: int("age"),
  gender: mysqlEnum("gender", ["male", "female"]),
  procedures: text("procedures"), // JSON array of selected procedures
  medicalCondition: text("medicalCondition"),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "confirmed", "attended", "cancelled"]).default("pending").notNull(),
  statusNotes: text("statusNotes"),
  attendanceDate: timestamp("attendanceDate"),
  source: varchar("source", { length: 100 }),
  utmSource: varchar("utmSource", { length: 100 }),
  utmMedium: varchar("utmMedium", { length: 100 }),
  utmCampaign: varchar("utmCampaign", { length: 100 }),
  utmContent: varchar("utmContent", { length: 100 }),
  referrer: varchar("referrer", { length: 500 }),
  fbclid: varchar("fbclid", { length: 255 }),
  gclid: varchar("gclid", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CampRegistration = typeof campRegistrations.$inferSelect;
export type InsertCampRegistration = typeof campRegistrations.$inferInsert;

/**
 * Teams table - stores team information
 * جدول الفرق - يخزن معلومات الفرق
 */
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  leaderId: int("leaderId"), // User ID of team leader
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

/**
 * Team Members table - stores team membership
 * جدول أعضاء الفرق - يخزن عضوية الفرق
 */
export const teamMembers = mysqlTable("teamMembers", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["leader", "member"]).default("member").notNull(),
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

/**
 * Projects table - stores project/campaign information for task management
 * جدول المشاريع - يخزن معلومات المشاريع/الحملات لإدارة المهام
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  startDate: timestamp("startDate"),
  endDate: timestamp("endDate"),
  status: mysqlEnum("status", ["planning", "active", "completed", "on_hold", "cancelled"]).default("planning").notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Tasks table - stores task information for digital marketing team
 * جدول المهام - يخزن معلومات مهام فريق التسويق الرقمي
 */
export const tasks = mysqlTable("tasks", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId"), // Optional: link to project
  teamId: int("teamId"),
  campaignId: int("campaignId"), // Link to campaign
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  assignedTo: int("assignedTo"), // User ID
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  status: mysqlEnum("status", ["todo", "in_progress", "review", "completed", "cancelled"]).default("todo").notNull(),
  category: mysqlEnum("category", ["content", "design", "ads", "seo", "social_media", "analytics", "other"]).default("other").notNull(),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  estimatedHours: int("estimatedHours"),
  actualHours: int("actualHours"),
  tags: text("tags"), // JSON array of tags
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type InsertTask = typeof tasks.$inferInsert;

/**
 * Task Deliverables table - stores task deliverables/submissions
 * جدول تسليمات المهام - يخزن تسليمات/تقديمات المهام
 */
export const taskDeliverables = mysqlTable("taskDeliverables", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  userId: int("userId").notNull(), // Who submitted
  fileUrl: varchar("fileUrl", { length: 500 }),
  notes: text("notes"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "revision_needed"]).default("pending").notNull(),
  reviewNotes: text("reviewNotes"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedBy: int("reviewedBy"), // Who reviewed
  reviewedAt: timestamp("reviewedAt"),
});

export type TaskDeliverable = typeof taskDeliverables.$inferSelect;
export type InsertTaskDeliverable = typeof taskDeliverables.$inferInsert;

/**
 * Task Comments table - stores comments on tasks
 * جدول تعليقات المهام - يخزن التعليقات على المهام
 */
export const taskComments = mysqlTable("task_comments", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  userId: int("userId").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TaskComment = typeof taskComments.$inferSelect;
export type InsertTaskComment = typeof taskComments.$inferInsert;

/**
 * Task Attachments table - stores attachments/deliverables for tasks
 * جدول مرفقات المهام - يخزن المرفقات والتسليمات للمهام
 */
export const taskAttachments = mysqlTable("task_attachments", {
  id: int("id").autoincrement().primaryKey(),
  taskId: int("taskId").notNull(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileType: varchar("fileType", { length: 100 }),
  fileSize: int("fileSize"),
  attachmentType: mysqlEnum("attachmentType", ["deliverable", "reference", "other"]).default("other").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TaskAttachment = typeof taskAttachments.$inferSelect;
export type InsertTaskAttachment = typeof taskAttachments.$inferInsert;
