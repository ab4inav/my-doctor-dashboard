import { z } from "zod";

// Patient Schema
export const patientSchema = z.object({
  id: z.string(),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  age: z.number().min(0).max(150),
  gender: z.enum(["male", "female", "other"]),
  bloodType: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]).optional(),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  medicalHistory: z.string().optional(),
  doctorId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertPatientSchema = patientSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Consultation Notes Schema
export const consultationNoteSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  doctorId: z.string(),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  date: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertConsultationNoteSchema = consultationNoteSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Prescription Schema
export const medicationSchema = z.object({
  name: z.string().min(1, "Medication name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  duration: z.string().min(1, "Duration is required"),
  instructions: z.string().min(1, "Instructions are required"),
  refills: z.number().min(0).default(0),
});

export const prescriptionSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  doctorId: z.string(),
  prescriptionNumber: z.string(),
  medications: z.array(medicationSchema),
  date: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertPrescriptionSchema = prescriptionSchema.omit({
  id: true,
  prescriptionNumber: true,
  createdAt: true,
  updatedAt: true,
});

// Invoice Schema
export const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
  total: z.number().min(0),
});

export const invoiceSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  doctorId: z.string(),
  invoiceNumber: z.string(),
  items: z.array(invoiceItemSchema),
  subtotal: z.number().min(0),
  taxRate: z.number().min(0).max(1),
  taxAmount: z.number().min(0),
  total: z.number().min(0),
  status: z.enum(["pending", "paid", "overdue"]),
  date: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertInvoiceSchema = invoiceSchema.omit({
  id: true,
  invoiceNumber: true,
  subtotal: true,
  taxAmount: true,
  total: true,
  createdAt: true,
  updatedAt: true,
});

// Doctor Schema
export const doctorSchema = z.object({
  id: z.string(),
  uid: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertDoctorSchema = doctorSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type Patient = z.infer<typeof patientSchema>;
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type ConsultationNote = z.infer<typeof consultationNoteSchema>;
export type InsertConsultationNote = z.infer<typeof insertConsultationNoteSchema>;
export type Prescription = z.infer<typeof prescriptionSchema>;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;
export type Medication = z.infer<typeof medicationSchema>;
export type Invoice = z.infer<typeof invoiceSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InvoiceItem = z.infer<typeof invoiceItemSchema>;
export type Doctor = z.infer<typeof doctorSchema>;
export type InsertDoctor = z.infer<typeof insertDoctorSchema>;
