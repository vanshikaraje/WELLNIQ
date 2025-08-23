// import { integer, pgTable, text, timestamp, varchar, serial } from "drizzle-orm/pg-core";

// // ✅ Users Table
// export const usersTable = pgTable("users", {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),
//   name: varchar({ length: 255 }).notNull(),
//   email: varchar({ length: 255 }).notNull().unique(),
//   age: integer().notNull(),
//   credits: integer().default(0),
// });

// // ✅ Session Chat Table (Auto-increment sessionId)
// export const SessionChatTable = pgTable("session_chat", {
//   sessionId: serial("session_id").primaryKey(),
//   doctorId: text("doctor_id").notNull(),
//   doctorName: text("doctor_name").notNull(),
//   specialization: text("specialization").notNull(),
//   note: text("note").notNull(),
//   createdAt: timestamp("created_at").defaultNow(),
// });
// import { integer, pgTable, text, timestamp, varchar, serial, jsonb, uuid } from "drizzle-orm/pg-core";

// // ✅ Users Table
// export const usersTable = pgTable("users", {
//   id: integer().primaryKey().generatedAlwaysAsIdentity(),
//   name: varchar({ length: 255 }).notNull(),
//   email: varchar({ length: 255 }).notNull().unique(),
//   age: integer().notNull(),
//   credits: integer().default(0),
// });

// // ✅ Session Chat Table (Auto-increment sessionId)
// export const SessionChatTable = pgTable("session_chat", {
//   sessionId: serial("session_id").primaryKey(),
//   doctorId: text("doctor_id").notNull(),
//   doctorName: text("doctor_name").notNull(),
//   specialization: text("specialization").notNull(),
//   note: text("note").notNull(),
//   createdAt: timestamp("created_at").defaultNow(),
// });

// // ✅ Medical Reports Table
// export const medicalReports = pgTable('medical_reports', {
//   id: uuid('id').defaultRandom().primaryKey(),
//   sessionId: text('session_id').notNull(),
//   patientSummary: text('patient_summary').notNull(),
//   chiefComplaints: jsonb('chief_complaints').$type<string[]>().notNull(),
//   symptoms: jsonb('symptoms').$type<string[]>().notNull(),
//   assessment: text('assessment').notNull(),
//   recommendations: jsonb('recommendations').$type<string[]>().notNull(),
//   followUp: text('follow_up').notNull(),
//   medications: jsonb('medications').$type<string[]>().notNull(),
//   riskFactors: jsonb('risk_factors').$type<string[]>().notNull(),
//   reportDate: timestamp('report_date').notNull(),
//   consultationSummary: text('consultation_summary').notNull(),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
//   updatedAt: timestamp('updated_at').defaultNow().notNull(),
// });

// export type MedicalReport = typeof medicalReports.$inferSelect;
// export type NewMedicalReport = typeof medicalReports.$inferInsert;
import { 
  integer, 
  pgTable, 
  text, 
  timestamp, 
  varchar, 
  serial, 
  jsonb, 
  uuid 
} from "drizzle-orm/pg-core";

// ✅ Users Table
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
  age: integer().notNull(),
  credits: integer().default(0),
});

// ✅ Session Chat Table (Auto-increment sessionId)
export const SessionChatTable = pgTable("session_chat", {
  sessionId: serial("session_id").primaryKey(),
  doctorId: text("doctor_id").notNull(),
  doctorName: text("doctor_name").notNull(),
  specialization: text("specialization").notNull(), // ✅ consistent
  note: text("note").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// ✅ Medical Reports Table
export const medicalReports = pgTable("medical_reports", {
  id: uuid("id").defaultRandom().primaryKey(),
  sessionId: text("session_id").notNull(),
  patientSummary: text("patient_summary").notNull(),
  chiefComplaints: jsonb("chief_complaints").$type<string[]>().notNull(),
  symptoms: jsonb("symptoms").$type<string[]>().notNull(),
  assessment: text("assessment").notNull(),
  recommendations: jsonb("recommendations").$type<string[]>().notNull(),
  followUp: text("follow_up").notNull(),
  medications: jsonb("medications").$type<string[]>().notNull(),
  riskFactors: jsonb("risk_factors").$type<string[]>().notNull(),
  reportDate: timestamp("report_date").notNull(),
  consultationSummary: text("consultation_summary").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ✅ Types
export type MedicalReport = typeof medicalReports.$inferSelect;
export type NewMedicalReport = typeof medicalReports.$inferInsert;
