import jsPDF from "jspdf";
import type { Prescription, Invoice, Patient, Doctor } from "@shared/schema";

export function generatePrescriptionPDF(
  prescription: Prescription,
  patient: Patient,
  doctor: Doctor
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("Medical Prescription", 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Dr. ${doctor.firstName} ${doctor.lastName}`, 20, 35);
  doc.text(`Prescription #: ${prescription.prescriptionNumber}`, 20, 45);
  doc.text(`Date: ${prescription.date.toLocaleDateString()}`, 20, 55);
  
  // Patient Info
  doc.setFontSize(14);
  doc.text("Patient Information:", 20, 75);
  doc.setFontSize(12);
  doc.text(`Name: ${patient.firstName} ${patient.lastName}`, 20, 85);
  doc.text(`Age: ${patient.age} years`, 20, 95);
  doc.text(`Gender: ${patient.gender}`, 20, 105);
  doc.text(`Phone: ${patient.phoneNumber}`, 20, 115);
  
  // Medications
  doc.setFontSize(14);
  doc.text("Prescribed Medications:", 20, 135);
  
  let yPosition = 150;
  prescription.medications.forEach((medication, index) => {
    doc.setFontSize(12);
    doc.text(`${index + 1}. ${medication.name} - ${medication.dosage}`, 25, yPosition);
    doc.text(`   Instructions: ${medication.instructions}`, 25, yPosition + 10);
    doc.text(`   Duration: ${medication.duration}`, 25, yPosition + 20);
    doc.text(`   Refills: ${medication.refills}`, 25, yPosition + 30);
    yPosition += 45;
  });
  
  // Footer
  doc.setFontSize(10);
  doc.text("This prescription is valid for 30 days from the date of issue.", 20, doc.internal.pageSize.height - 20);
  
  // Download
  doc.save(`prescription-${prescription.prescriptionNumber}.pdf`);
}

export function generateInvoicePDF(
  invoice: Invoice,
  patient: Patient,
  doctor: Doctor
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.text("Medical Invoice", 20, 20);
  
  doc.setFontSize(12);
  doc.text(`Dr. ${doctor.firstName} ${doctor.lastName}`, 20, 35);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 20, 45);
  doc.text(`Date: ${invoice.date.toLocaleDateString()}`, 20, 55);
  doc.text(`Status: ${invoice.status.toUpperCase()}`, 20, 65);
  
  // Patient Info
  doc.setFontSize(14);
  doc.text("Bill To:", 20, 85);
  doc.setFontSize(12);
  doc.text(`${patient.firstName} ${patient.lastName}`, 20, 95);
  doc.text(`${patient.phoneNumber}`, 20, 105);
  if (patient.email) {
    doc.text(`${patient.email}`, 20, 115);
  }
  
  // Invoice Items
  doc.setFontSize(14);
  doc.text("Services:", 20, 135);
  
  // Table headers
  doc.setFontSize(10);
  doc.text("Description", 25, 150);
  doc.text("Qty", 120, 150);
  doc.text("Unit Price", 140, 150);
  doc.text("Total", 170, 150);
  
  // Table line
  doc.line(20, 155, 190, 155);
  
  let yPosition = 165;
  invoice.items.forEach((item) => {
    doc.text(item.description, 25, yPosition);
    doc.text(item.quantity.toString(), 120, yPosition);
    doc.text(`$${item.unitPrice.toFixed(2)}`, 140, yPosition);
    doc.text(`$${item.total.toFixed(2)}`, 170, yPosition);
    yPosition += 15;
  });
  
  // Totals
  yPosition += 10;
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 15;
  
  doc.text(`Subtotal: $${invoice.subtotal.toFixed(2)}`, 140, yPosition);
  yPosition += 10;
  doc.text(`Tax (${(invoice.taxRate * 100).toFixed(1)}%): $${invoice.taxAmount.toFixed(2)}`, 140, yPosition);
  yPosition += 10;
  doc.setFontSize(12);
  doc.text(`Total: $${invoice.total.toFixed(2)}`, 140, yPosition);
  
  // Footer
  doc.setFontSize(10);
  doc.text("Thank you for your visit!", 20, doc.internal.pageSize.height - 20);
  
  // Download
  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
}
