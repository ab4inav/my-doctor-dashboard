import jsPDF from "jspdf";
import type { Prescription, Invoice, Patient, Doctor, ConsultationNote } from "@shared/schema";

// Helper function to add logo and header to PDF
const addLogoAndHeader = (doc: jsPDF, title: string) => {
  // Header background
  doc.setFillColor(0, 102, 204); // Medical blue
  doc.rect(0, 0, doc.internal.pageSize.width, 35, 'F');
  
  // Company logo/icon (simplified medical cross)
  doc.setFillColor(255, 255, 255);
  doc.circle(25, 17.5, 8);
  doc.setFillColor(0, 102, 204);
  doc.rect(21, 12, 8, 11);
  doc.rect(17, 16, 16, 3);
  
  // Company name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('MediPractice', 40, 20);
  
  // Tagline
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Healthcare Management System', 40, 28);
  
  // Document title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 20, 50);
  
  // Reset text color
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
};

// Helper function to add footer
const addFooter = (doc: jsPDF) => {
  const pageHeight = doc.internal.pageSize.height;
  
  // Footer line
  doc.setDrawColor(0, 102, 204);
  doc.setLineWidth(0.5);
  doc.line(20, pageHeight - 25, doc.internal.pageSize.width - 20, pageHeight - 25);
  
  // Footer text
  doc.setFontSize(9);
  doc.setTextColor(102, 102, 102);
  doc.text('UpchaarNepal Pvt Ltd | Kathmandu, Nepal', 20, pageHeight - 18);
  doc.text('Phone: +977-01-5902597 | Email: help@upchaarnepal.com', 20, pageHeight - 13);
  doc.text('Website: www.upchaarnepal.com', 20, pageHeight - 8);
  
  // Page number
  const pageNum = doc.getCurrentPageInfo().pageNumber;
  doc.text(`Page ${pageNum}`, doc.internal.pageSize.width - 30, pageHeight - 8);
};

// Helper function to create a professional info box
const addInfoBox = (doc: jsPDF, title: string, content: string[], x: number, y: number, width: number) => {
  // Box background
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(x, y, width, 6 + (content.length * 5), 'FD');
  
  // Title
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(51, 65, 85);
  doc.text(title, x + 3, y + 5);
  
  // Content
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  content.forEach((line, index) => {
    doc.text(line, x + 3, y + 10 + (index * 5));
  });
};

export function generatePrescriptionPDF(
  prescription: Prescription,
  patient: Patient,
  doctor: Doctor
) {
  const doc = new jsPDF();
  
  // Add professional header with logo
  addLogoAndHeader(doc, 'Medical Prescription');
  
  let yPosition = 65;
  
  // Doctor and Date info
  addInfoBox(doc, 'Prescribed by', [
    `Dr. ${doctor.firstName} ${doctor.lastName}`,
    `Prescription #: ${prescription.prescriptionNumber}`,
    `Date: ${prescription.date.toLocaleDateString()}`,
    `Time: ${prescription.date.toLocaleTimeString()}`
  ], 20, yPosition, 85);
  
  // Patient Information
  addInfoBox(doc, 'Patient Information', [
    `${patient.firstName} ${patient.lastName}`,
    `Age: ${patient.age} years | ${patient.gender}`,
    `Phone: ${patient.phoneNumber}`,
    `Email: ${patient.email || 'Not provided'}`
  ], 110, yPosition, 80);
  
  yPosition += 40;
  
  // Medications Section
  doc.setFillColor(0, 102, 204);
  doc.rect(20, yPosition, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('PRESCRIBED MEDICATIONS', 25, yPosition + 6);
  
  yPosition += 15;
  doc.setTextColor(0, 0, 0);
  
  prescription.medications.forEach((medication, index) => {
    // Medication box
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, yPosition, 170, 28, 'FD');
    
    // Medication number circle
    doc.setFillColor(0, 102, 204);
    doc.circle(30, yPosition + 8, 4);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text((index + 1).toString(), 28, yPosition + 10);
    
    // Medication details
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(medication.name, 40, yPosition + 8);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 51, 51);
    doc.text(`Dosage: ${medication.dosage}`, 40, yPosition + 15);
    doc.text(`Instructions: ${medication.instructions}`, 40, yPosition + 20);
    doc.text(`Duration: ${medication.duration} | Refills: ${medication.refills}`, 40, yPosition + 25);
    
    yPosition += 33;
  });
  
  // Professional separator
  yPosition += 5;
  
  // Validity notice
  yPosition += 35;
  doc.setFillColor(220, 220, 220);
  doc.rect(20, yPosition, 170, 12, 'F');
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text('This prescription is valid for 30 days from the date of issue.', 25, yPosition + 8);
  
  // Add footer
  addFooter(doc);
  
  // Download
  doc.save(`prescription-${prescription.prescriptionNumber}.pdf`);
}

export function generateInvoicePDF(
  invoice: Invoice,
  patient: Patient,
  doctor: Doctor
) {
  const doc = new jsPDF();
  
  // Add professional header with logo
  addLogoAndHeader(doc, 'Medical Invoice');
  
  let yPosition = 65;
  
  // Invoice details and status
  const statusColor = invoice.status === 'paid' ? [34, 197, 94] : 
                     invoice.status === 'pending' ? [251, 146, 60] : [239, 68, 68];
  
  addInfoBox(doc, 'Invoice Details', [
    `Invoice #: ${invoice.invoiceNumber}`,
    `Date: ${invoice.date.toLocaleDateString()}`,
    `Dr. ${doctor.firstName} ${doctor.lastName}`,
    `Status: ${invoice.status.toUpperCase()}`
  ], 20, yPosition, 85);
  
  // Patient/Bill to information
  addInfoBox(doc, 'Bill To', [
    `${patient.firstName} ${patient.lastName}`,
    `Phone: ${patient.phoneNumber}`,
    `Email: ${patient.email || 'Not provided'}`,
    `Age: ${patient.age} years`
  ], 110, yPosition, 80);
  
  yPosition += 35;
  
  // Services table header
  doc.setFillColor(0, 102, 204);
  doc.rect(20, yPosition, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('SERVICES & CHARGES', 25, yPosition + 6);
  
  yPosition += 15;
  
  // Table headers
  doc.setFillColor(240, 240, 240);
  doc.rect(20, yPosition, 170, 10, 'F');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', 25, yPosition + 7);
  doc.text('QTY', 120, yPosition + 7);
  doc.text('UNIT PRICE', 140, yPosition + 7);
  doc.text('TOTAL', 170, yPosition + 7);
  
  yPosition += 15;
  
  // Invoice items
  invoice.items.forEach((item, index) => {
    // Alternating row colors
    if (index % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, yPosition - 3, 170, 12, 'F');
    }
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(item.description, 25, yPosition + 5);
    doc.text(item.quantity.toString(), 125, yPosition + 5);
    doc.text(`NPR ${item.unitPrice.toFixed(2)}`, 145, yPosition + 5);
    doc.text(`NPR ${item.total.toFixed(2)}`, 175, yPosition + 5);
    yPosition += 12;
  });
  
  // Totals section
  yPosition += 10;
  
  // Subtotal
  doc.setFillColor(245, 245, 245);
  doc.rect(120, yPosition, 70, 8, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', 125, yPosition + 6);
  doc.text(`NPR ${invoice.subtotal.toFixed(2)}`, 170, yPosition + 6);
  
  yPosition += 10;
  
  // Total
  doc.setFillColor(0, 102, 204);
  doc.rect(120, yPosition, 70, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL:', 125, yPosition + 8);
  doc.text(`NPR ${invoice.total.toFixed(2)}`, 170, yPosition + 8);
  
  yPosition += 20;
  
  // Payment terms
  doc.setTextColor(0, 0, 0);
  doc.setFillColor(248, 250, 252);
  doc.rect(20, yPosition, 170, 15, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Payment Terms:', 25, yPosition + 7);
  doc.setFont('helvetica', 'normal');
  doc.text('Payment due within 30 days of invoice date.', 25, yPosition + 12);
  
  // Add footer
  addFooter(doc);
  
  // Download
  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
}

export function generateConsultationPDF(
  consultation: ConsultationNote,
  patient: Patient,
  doctor: Doctor
) {
  const doc = new jsPDF();
  
  // Add professional header with logo
  addLogoAndHeader(doc, 'Consultation Notes');
  
  let yPosition = 65;
  
  // Doctor and consultation info
  addInfoBox(doc, 'Consultation by', [
    `Dr. ${doctor.firstName} ${doctor.lastName}`,
    `Date: ${consultation.date.toLocaleDateString()}`,
    `Time: ${consultation.date.toLocaleTimeString()}`,
    `Title: ${consultation.title}`
  ], 20, yPosition, 85);
  
  // Patient Information
  addInfoBox(doc, 'Patient Information', [
    `${patient.firstName} ${patient.lastName}`,
    `Age: ${patient.age} years | ${patient.gender}`,
    `Phone: ${patient.phoneNumber}`,
    `Email: ${patient.email || 'Not provided'}`
  ], 110, yPosition, 80);
  
  yPosition += 40;
  
  // Consultation content section
  doc.setFillColor(0, 102, 204);
  doc.rect(20, yPosition, 170, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSULTATION NOTES', 25, yPosition + 6);
  
  // Consultation content area
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(200, 200, 200);
  
  // Calculate content height based on text length
  const contentHeight = Math.max(40, Math.ceil(consultation.content.length / 80) * 5 + 20);
  doc.rect(20, yPosition, 170, contentHeight, 'FD');
  
  // Render the consultation content with professional formatting
  const parseAndRenderContent = (content: string, startY: number) => {
    // Clean content and render in a professional format
    const cleanContent = content
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold markers for PDF
      .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
      .replace(/<u>(.*?)<\/u>/g, '$1'); // Remove underline markers
    
    const contentLines = doc.splitTextToSize(cleanContent, 160);
    let currentY = startY;
    
    contentLines.forEach((line: string) => {
      doc.text(line, 25, currentY);
      currentY += 5;
    });
    
    return currentY;
  };
  
  // Render the content
  parseAndRenderContent(consultation.content, yPosition + 8);
  
  // Add footer
  addFooter(doc);
  
  // Download
  doc.save(`consultation-${consultation.date.toISOString().split('T')[0]}.pdf`);
}
