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
  
  // Additional Notes
  if (prescription.notes) {
    yPosition += 5;
    doc.setFillColor(255, 248, 220);
    doc.setDrawColor(255, 193, 7);
    const notesHeight = Math.max(20, Math.ceil(prescription.notes.length / 80) * 5 + 10);
    doc.rect(20, yPosition, 170, notesHeight, 'FD');
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Additional Notes:', 25, yPosition + 8);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const noteLines = doc.splitTextToSize(prescription.notes, 160);
    noteLines.forEach((line: string, index: number) => {
      doc.text(line, 25, yPosition + 15 + (index * 4));
    });
  }
  
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
  yPosition += 15;
  
  doc.text(`Subtotal: NPR ${invoice.subtotal.toFixed(2)}`, 140, yPosition);
  yPosition += 10;
  doc.text(`Tax (${(invoice.taxRate * 100).toFixed(1)}%): NPR ${invoice.taxAmount.toFixed(2)}`, 140, yPosition);
  yPosition += 10;
  doc.setFontSize(12);
  doc.text(`Total: NPR ${invoice.total.toFixed(2)}`, 140, yPosition);
  
  // Footer
  doc.setFontSize(10);
  doc.text("Thank you for your visit!", 20, doc.internal.pageSize.height - 20);
  
  // Download
  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
}

export function generateConsultationPDF(
  consultation: ConsultationNote,
  patient: Patient,
  doctor: Doctor
) {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(24);
  doc.text("UpchaarNepal Pvt Ltd", 20, 20);
  
  doc.setFontSize(12);
  doc.text("Kathmandu, Nepal", 20, 30);
  doc.text("Phone No. - +977-01-5902597", 20, 40);
  doc.text("Email: help@upchaarnepal.com", 20, 50);
  doc.text("Website: www.upchaarnpeal.com", 20, 60);
  
  doc.setFontSize(20);
  doc.text("Consultation Notes", 20, 80);
  
  doc.setFontSize(12);
  doc.text(`Dr. ${doctor.firstName} ${doctor.lastName}`, 20, 95);
  doc.text(`Consultation Date: ${consultation.date.toLocaleDateString()}`, 20, 105);
  
  // Patient Info
  doc.setFontSize(14);
  doc.text("Patient Information:", 20, 125);
  doc.setFontSize(12);
  doc.text(`Name: ${patient.firstName} ${patient.lastName}`, 20, 135);
  doc.text(`Age: ${patient.age} years`, 20, 145);
  doc.text(`Gender: ${patient.gender}`, 20, 155);
  doc.text(`Phone: ${patient.phoneNumber}`, 20, 165);
  
  // Consultation Details
  doc.setFontSize(14);
  doc.text("Consultation Details:", 20, 185);
  
  // Parse and render formatted content
  let yPosition = 195;
  const maxWidth = 170;
  const lineHeight = 6;
  
  // Function to parse formatting and render text
  const renderFormattedText = (text: string, startY: number) => {
    let currentY = startY;
    
    // Split by lines first
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.trim() === '') {
        currentY += lineHeight;
        continue;
      }
      
      // Parse formatting within each line
      const segments = [];
      let currentText = line;
      let currentPos = 0;
      
      // Find bold text **text**
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      
      while ((match = boldRegex.exec(line)) !== null) {
        // Add text before bold
        if (match.index > currentPos) {
          segments.push({
            text: line.substring(currentPos, match.index),
            style: 'normal'
          });
        }
        // Add bold text
        segments.push({
          text: match[1],
          style: 'bold'
        });
        currentPos = match.index + match[0].length;
      }
      
      // Add remaining text
      if (currentPos < line.length) {
        segments.push({
          text: line.substring(currentPos),
          style: 'normal'
        });
      }
      
      // If no formatting found, treat as normal text
      if (segments.length === 0) {
        segments.push({
          text: line,
          style: 'normal'
        });
      }
      
      // Render segments
      let xPosition = 20;
      for (const segment of segments) {
        if (segment.text.trim() === '') continue;
        
        // Clean up any remaining formatting
        let cleanText = segment.text
          .replace(/\*(.*?)\*/g, '$1') // Remove italic markers
          .replace(/<u>(.*?)<\/u>/g, '$1'); // Remove underline markers
        
        if (segment.style === 'bold') {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        
        doc.setFontSize(12);
        
        // Split text if it's too long for one line
        const textLines = doc.splitTextToSize(cleanText, maxWidth - (xPosition - 20));
        
        for (let i = 0; i < textLines.length; i++) {
          if (i === 0) {
            doc.text(textLines[i], xPosition, currentY);
            xPosition += doc.getTextWidth(textLines[i]);
          } else {
            currentY += lineHeight;
            doc.text(textLines[i], 20, currentY);
          }
        }
      }
      
      currentY += lineHeight;
    }
    
    return currentY;
  };
  
  renderFormattedText(consultation.content, yPosition);
  
  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text("End of Consultation Notes", 20, doc.internal.pageSize.height - 20);
  
  // Download
  doc.save(`consultation-${consultation.date.toISOString()}.pdf`);
}
