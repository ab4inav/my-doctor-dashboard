import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { 
  Patient, 
  InsertPatient, 
  Doctor, 
  InsertDoctor,
  ConsultationNote,
  InsertConsultationNote,
  Prescription,
  InsertPrescription,
  Invoice,
  InsertInvoice
} from "@shared/schema";

// Doctor functions
export async function createDoctor(data: InsertDoctor): Promise<Doctor> {
  try {
    const docRef = await addDoc(collection(db, "doctors"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    const doctorDoc = await getDoc(docRef);
    return {
      id: docRef.id,
      ...data,
      createdAt: (doctorDoc.data()?.createdAt as Timestamp).toDate(),
      updatedAt: (doctorDoc.data()?.updatedAt as Timestamp).toDate(),
    };
  } catch (error) {
    console.error("Error creating doctor:", error);
    throw new Error("Failed to create doctor profile. Please ensure Firestore is enabled in Firebase Console.");
  }
}

export async function getDoctorByUid(uid: string): Promise<Doctor | null> {
  try {
    const q = query(collection(db, "doctors"), where("uid", "==", uid));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return null;
    
    const doc = querySnapshot.docs[0];
    const data = doc.data();
    
    return {
      id: doc.id,
      uid: data.uid,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate(),
    };
  } catch (error) {
    console.error("Firestore access error:", error);
    return null;
  }
}

// Patient functions
export async function createPatient(data: InsertPatient): Promise<Patient> {
  try {
    const docRef = await addDoc(collection(db, "patients"), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    const patientDoc = await getDoc(docRef);
    const docData = patientDoc.data();
    
    return {
      id: docRef.id,
      ...data,
      createdAt: docData?.createdAt ? (docData.createdAt as Timestamp).toDate() : new Date(),
      updatedAt: docData?.updatedAt ? (docData.updatedAt as Timestamp).toDate() : new Date(),
    };
  } catch (error) {
    console.error("Firestore create patient error:", error);
    throw new Error("Failed to create patient. Please ensure Firestore is properly configured with correct security rules.");
  }
}

export async function getPatientsByDoctor(doctorId: string): Promise<Patient[]> {
  try {
    // Simple query without orderBy to avoid index requirements
    const q = query(
      collection(db, "patients"), 
      where("doctorId", "==", doctorId)
    );
    const querySnapshot = await getDocs(q);
    
    const patients = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        firstName: data.firstName,
        lastName: data.lastName,
        age: data.age,
        gender: data.gender,
        bloodType: data.bloodType,
        phoneNumber: data.phoneNumber,
        email: data.email,
        address: data.address,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        medicalHistory: data.medicalHistory,
        allergies: data.allergies,
        currentMedications: data.currentMedications,
        doctorId: data.doctorId,
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
        updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : new Date(),
      };
    });
    
    // Sort by createdAt in memory instead of using Firestore orderBy
    return patients.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    console.error("Error fetching patients:", error);
    return [];
  }
}

export async function getPatient(id: string): Promise<Patient | null> {
  const docRef = doc(db, "patients", id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    firstName: data.firstName,
    lastName: data.lastName,
    age: data.age,
    gender: data.gender,
    bloodType: data.bloodType,
    phoneNumber: data.phoneNumber,
    email: data.email,
    address: data.address,
    emergencyContactName: data.emergencyContactName,
    emergencyContactPhone: data.emergencyContactPhone,
    medicalHistory: data.medicalHistory,
    doctorId: data.doctorId,
    createdAt: (data.createdAt as Timestamp).toDate(),
    updatedAt: (data.updatedAt as Timestamp).toDate(),
  };
}

export async function updatePatient(id: string, data: Partial<InsertPatient>): Promise<void> {
  const docRef = doc(db, "patients", id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

// Consultation Notes functions
export async function createConsultationNote(data: InsertConsultationNote): Promise<ConsultationNote> {
  try {
    const docRef = await addDoc(collection(db, "consultationNotes"), {
      ...data,
      date: Timestamp.fromDate(data.date),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    const noteDoc = await getDoc(docRef);
    const docData = noteDoc.data();
    
    return {
      id: docRef.id,
      ...data,
      createdAt: docData?.createdAt ? (docData.createdAt as Timestamp).toDate() : new Date(),
      updatedAt: docData?.updatedAt ? (docData.updatedAt as Timestamp).toDate() : new Date(),
    };
  } catch (error) {
    console.error("Error creating consultation note:", error);
    throw new Error("Failed to create consultation note. Please ensure Firestore is properly configured.");
  }
}

export async function getConsultationNotesByPatient(patientId: string): Promise<ConsultationNote[]> {
  try {
    const q = query(
      collection(db, "consultationNotes"), 
      where("patientId", "==", patientId)
    );
    const querySnapshot = await getDocs(q);
    
    const notes = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        patientId: data.patientId,
        doctorId: data.doctorId,
        title: data.title,
        content: data.content,
        date: (data.date as Timestamp).toDate(),
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
        updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : new Date(),
      };
    });
    
    // Sort by date in memory instead of using Firestore orderBy
    return notes.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error("Error fetching consultation notes:", error);
    return [];
  }
}

// Prescription functions
export async function createPrescription(data: InsertPrescription): Promise<Prescription> {
  try {
    const prescriptionNumber = `RX${Date.now()}`;
    const docRef = await addDoc(collection(db, "prescriptions"), {
      ...data,
      prescriptionNumber,
      date: Timestamp.fromDate(data.date),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    const prescriptionDoc = await getDoc(docRef);
    const docData = prescriptionDoc.data();
    
    return {
      id: docRef.id,
      prescriptionNumber,
      ...data,
      createdAt: docData?.createdAt ? (docData.createdAt as Timestamp).toDate() : new Date(),
      updatedAt: docData?.updatedAt ? (docData.updatedAt as Timestamp).toDate() : new Date(),
    };
  } catch (error) {
    console.error("Error creating prescription:", error);
    throw new Error("Failed to create prescription. Please ensure Firestore is properly configured.");
  }

}
  
export async function getPrescriptionCountByDoctor(doctorId: string): Promise<number> {
  try {
    const q = query(collection(db, "prescriptions"), where("doctorId", "==", doctorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error("Error fetching prescription count:", error);
    return 0;
  }
}

export async function getPrescriptionsByPatient(patientId: string): Promise<Prescription[]> {
  try {
    const q = query(
      collection(db, "prescriptions"), 
      where("patientId", "==", patientId)
    );
    const querySnapshot = await getDocs(q);
    
    const prescriptions = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        patientId: data.patientId,
        doctorId: data.doctorId,
        prescriptionNumber: data.prescriptionNumber,
        medications: data.medications,
        date: (data.date as Timestamp).toDate(),
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
        updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : new Date(),
      };
    });
    
    // Sort by date in memory instead of using Firestore orderBy
    return prescriptions.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error("Error fetching prescriptions:", error);
    return [];
  }
}

// Invoice functions
export async function createInvoice(data: InsertInvoice): Promise<Invoice> {
  const invoiceNumber = `INV${Date.now()}`;
  const subtotal = data.items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = subtotal * data.taxRate;
  const total = subtotal + taxAmount;
  
  const docRef = await addDoc(collection(db, "invoices"), {
    ...data,
    invoiceNumber,
    subtotal,
    taxAmount,
    total,
    date: Timestamp.fromDate(data.date),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  
  const invoiceDoc = await getDoc(docRef);
  return {
    id: docRef.id,
    invoiceNumber,
    subtotal,
    taxAmount,
    total,
    ...data,
    createdAt: (invoiceDoc.data()?.createdAt as Timestamp).toDate(),
    updatedAt: (invoiceDoc.data()?.updatedAt as Timestamp).toDate(),
  };
}

export async function getInvoicesByPatient(patientId: string): Promise<Invoice[]> {
  try {
    const q = query(
      collection(db, "invoices"), 
      where("patientId", "==", patientId)
    );
    const querySnapshot = await getDocs(q);
    
    const invoices = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        patientId: data.patientId,
        doctorId: data.doctorId,
        invoiceNumber: data.invoiceNumber,
        items: data.items,
        subtotal: data.subtotal,
        taxRate: data.taxRate,
        taxAmount: data.taxAmount,
        total: data.total,
        status: data.status,
        date: (data.date as Timestamp).toDate(),
        createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
        updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : new Date(),
      };
    });
    
    // Sort by date in memory instead of using Firestore orderBy
    return invoices.sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return [];
  }
}

export async function updateInvoiceStatus(id: string, status: "pending" | "paid" | "overdue"): Promise<void> {
  const docRef = doc(db, "invoices", id);
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}
