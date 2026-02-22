import { eq, and, gt, desc } from "drizzle-orm";
import { getDb } from "../db";
import { patients, patientOtps, patientResults, appointments, offerLeads, campRegistrations } from "../../drizzle/schema";

// ============ Patient CRUD ============

export async function getPatientByPhone(phone: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(patients).where(eq(patients.phone, phone)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getPatientById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(patients).where(eq(patients.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function createPatient(data: {
  fullName: string;
  phone: string;
  address?: string;
  age?: number;
  gender: "male" | "female";
  email?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(patients).values({
    fullName: data.fullName,
    phone: data.phone,
    address: data.address || null,
    age: data.age || null,
    gender: data.gender,
    email: data.email || null,
  });
  
  return getPatientByPhone(data.phone);
}

export async function updatePatientLastLogin(patientId: number) {
  const db = await getDb();
  if (!db) return;
  await db.update(patients).set({ lastLoginAt: new Date() }).where(eq(patients.id, patientId));
}

export async function updatePatientProfile(patientId: number, data: {
  fullName?: string;
  address?: string;
  age?: number;
  email?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = {};
  if (data.fullName) updateData.fullName = data.fullName;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.age !== undefined) updateData.age = data.age;
  if (data.email !== undefined) updateData.email = data.email;
  
  if (Object.keys(updateData).length > 0) {
    await db.update(patients).set(updateData).where(eq(patients.id, patientId));
  }
  
  return getPatientById(patientId);
}

// ============ OTP Management ============

export async function createOtp(phone: string): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Generate 6-digit OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Expire in 5 minutes
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  
  // Invalidate old OTPs for this phone
  await db.update(patientOtps)
    .set({ isUsed: true })
    .where(and(eq(patientOtps.phone, phone), eq(patientOtps.isUsed, false)));
  
  // Create new OTP
  await db.insert(patientOtps).values({
    phone,
    code,
    expiresAt,
  });
  
  return code;
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const result = await db.select().from(patientOtps).where(
    and(
      eq(patientOtps.phone, phone),
      eq(patientOtps.code, code),
      eq(patientOtps.isUsed, false),
      gt(patientOtps.expiresAt, new Date())
    )
  ).limit(1);
  
  if (result.length === 0) return false;
  
  // Mark OTP as used
  await db.update(patientOtps).set({ isUsed: true }).where(eq(patientOtps.id, result[0].id));
  
  return true;
}

// ============ Patient Appointments ============

export async function getPatientAppointments(phone: string) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(appointments)
    .where(eq(appointments.phone, phone))
    .orderBy(desc(appointments.createdAt));
  
  return result;
}

// ============ Patient Offer Leads ============

export async function getPatientOfferLeads(phone: string) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(offerLeads)
    .where(eq(offerLeads.phone, phone))
    .orderBy(desc(offerLeads.createdAt));
  
  return result;
}

// ============ Patient Camp Registrations ============

export async function getPatientCampRegistrations(phone: string) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(campRegistrations)
    .where(eq(campRegistrations.phone, phone))
    .orderBy(desc(campRegistrations.createdAt));
  
  return result;
}

// ============ Patient Results ============

export async function getPatientResults(patientId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select().from(patientResults)
    .where(eq(patientResults.patientId, patientId))
    .orderBy(desc(patientResults.createdAt));
  
  return result;
}
