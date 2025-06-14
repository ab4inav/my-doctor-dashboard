import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { ArrowLeft, Edit, Download, Plus, TriangleAlert, Pill, Heart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AddConsultationModal } from "@/components/modals/AddConsultationModal";
import { CreatePrescriptionModal } from "@/components/modals/CreatePrescriptionModal";
import { CreateInvoiceModal } from "@/components/modals/CreateInvoiceModal";
import { EditPatientModal } from "@/components/modals/EditPatientModal";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getPatient, 
  getConsultationNotesByPatient, 
  getPrescriptionsByPatient, 
  getInvoicesByPatient 
} from "@/lib/firestore";
import { generatePrescriptionPDF, generateInvoicePDF } from "@/lib/pdf";
import { useLocation } from "wouter";

export default function PatientProfile() {
  const params = useParams() as { id: string };
  const patientId = params.id;
  const [, navigate] = useLocation();
  const { doctor } = useAuth();

  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);

  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => getPatient(patientId),
    enabled: !!patientId,
  });

  const { data: consultationNotes = [], refetch: refetchNotes } = useQuery({
    queryKey: ["consultationNotes", patientId],
    queryFn: () => getConsultationNotesByPatient(patientId),
    enabled: !!patientId,
  });

  const { data: prescriptions = [], refetch: refetchPrescriptions } = useQuery({
    queryKey: ["prescriptions", patientId],
    queryFn: () => getPrescriptionsByPatient(patientId),
    enabled: !!patientId,
  });

  const { data: invoices = [], refetch: refetchInvoices } = useQuery({
    queryKey: ["invoices", patientId],
    queryFn: () => getInvoicesByPatient(patientId),
    enabled: !!patientId,
  });

  if (!patient || !doctor) {
    return (
      <div className="p-6">
        <div className="text-center">
          <p className="text-medical-gray-600">Loading patient information...</p>
        </div>
      </div>
    );
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleDownloadPrescription = (prescription: any) => {
    generatePrescriptionPDF(prescription, patient, doctor);
  };

  const handleDownloadInvoice = (invoice: any) => {
    generateInvoicePDF(invoice, patient, doctor);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": return "bg-medical-green text-white";
      case "pending": return "bg-orange-100 text-orange-600";
      case "overdue": return "bg-red-100 text-red-600";
      default: return "bg-medical-gray-100 text-medical-gray-600";
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/patients")}
          className="mr-4 text-medical-gray-500 hover:text-medical-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-medical-gray-800">Patient Profile</h2>
          <p className="text-medical-gray-600 mt-1">Complete patient information and medical records</p>
        </div>
      </div>

      {/* Patient Info Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-medical-blue rounded-full flex items-center justify-center">
                <span className="text-white text-xl font-medium">
                  {getInitials(patient.firstName, patient.lastName)}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-medical-gray-800">
                  {patient.firstName} {patient.lastName}
                </h3>
                <p className="text-medical-gray-600">Patient ID: {patient.id.slice(-8)}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className="text-medical-gray-600">
                    Age: <span className="font-medium">{patient.age} years</span>
                  </span>
                  <span className="text-medical-gray-600">
                    Gender: <span className="font-medium capitalize">{patient.gender}</span>
                  </span>
                  <span className="text-medical-gray-600">
                    Contact: <span className="font-medium">{patient.phoneNumber}</span>
                  </span>
                </div>
              </div>
            </div>
            <Button variant="outline" className="border-medical-gray-300">
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <Tabs defaultValue="consultation" className="w-full">
          <div className="border-b border-medical-gray-200">
            <TabsList className="h-auto p-0 bg-transparent">
              <TabsTrigger 
                value="consultation" 
                className="border-b-2 border-transparent data-[state=active]:border-medical-blue data-[state=active]:text-medical-blue rounded-none px-6 py-4"
              >
                Consultation Notes
              </TabsTrigger>
              <TabsTrigger 
                value="prescriptions" 
                className="border-b-2 border-transparent data-[state=active]:border-medical-blue data-[state=active]:text-medical-blue rounded-none px-6 py-4"
              >
                Prescriptions
              </TabsTrigger>
              <TabsTrigger 
                value="invoices" 
                className="border-b-2 border-transparent data-[state=active]:border-medical-blue data-[state=active]:text-medical-blue rounded-none px-6 py-4"
              >
                Invoices
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="border-b-2 border-transparent data-[state=active]:border-medical-blue data-[state=active]:text-medical-blue rounded-none px-6 py-4"
              >
                Medical History
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="consultation" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-medical-gray-800">Consultation Notes</h4>
              <Button
                onClick={() => setShowConsultationModal(true)}
                className="bg-medical-blue hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </div>

            {consultationNotes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-medical-gray-600">No consultation notes yet</p>
                <Button
                  onClick={() => setShowConsultationModal(true)}
                  className="mt-4 bg-medical-blue hover:bg-blue-700"
                >
                  Add First Note
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {consultationNotes.map((note) => (
                  <Card key={note.id} className="border border-medical-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-medium text-medical-gray-800">{note.title}</h5>
                          <p className="text-sm text-medical-gray-600">
                            {note.date.toLocaleDateString()} - {note.date.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="prose prose-sm max-w-none text-medical-gray-700">
                        {note.content.split('\n').map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="prescriptions" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-medical-gray-800">Prescriptions</h4>
              <Button
                onClick={() => setShowPrescriptionModal(true)}
                className="bg-medical-blue hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Prescription
              </Button>
            </div>

            {prescriptions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-medical-gray-600">No prescriptions created yet</p>
                <Button
                  onClick={() => setShowPrescriptionModal(true)}
                  className="mt-4 bg-medical-blue hover:bg-blue-700"
                >
                  Create First Prescription
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {prescriptions.map((prescription) => (
                  <Card key={prescription.id} className="bg-medical-gray-50 border border-medical-gray-200">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h5 className="font-medium text-medical-gray-800">
                            Prescription #{prescription.prescriptionNumber}
                          </h5>
                          <p className="text-sm text-medical-gray-600">
                            {prescription.date.toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleDownloadPrescription(prescription)}
                          className="bg-medical-blue hover:bg-blue-700"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {prescription.medications.map((medication, index) => (
                          <div key={index} className="bg-white rounded-lg border border-medical-gray-200 p-3">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-medium text-medical-gray-800">{medication.name} {medication.dosage}</p>
                                <p className="text-sm text-medical-gray-600">{medication.instructions}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium text-medical-gray-800">{medication.duration}</p>
                                <p className="text-xs text-medical-gray-600">{medication.refills} refills</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="invoices" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-medical-gray-800">Invoices</h4>
              <Button
                onClick={() => setShowInvoiceModal(true)}
                className="bg-medical-blue hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </div>

            {invoices.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-medical-gray-600">No invoices created yet</p>
                <Button
                  onClick={() => setShowInvoiceModal(true)}
                  className="mt-4 bg-medical-blue hover:bg-blue-700"
                >
                  Create First Invoice
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <Card key={invoice.id} className="border border-medical-gray-200">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h5 className="font-medium text-medical-gray-800">
                            Invoice #{invoice.invoiceNumber}
                          </h5>
                          <p className="text-sm text-medical-gray-600">
                            {invoice.date.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice)}
                            className="bg-medical-blue hover:bg-blue-700"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {invoice.items.map((item, index) => (
                          <div key={index} className="flex justify-between items-center p-3 bg-medical-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-medical-gray-800">{item.description}</p>
                              <p className="text-sm text-medical-gray-600">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-medical-gray-600">Unit: Rs. {item.unitPrice.toFixed(2)}</p>
                              <p className="font-medium text-medical-gray-800">Rs. {item.total.toFixed(2)}</p>
                            </div>
                          </div>
                        ))}

                        <div className="border-t border-medical-gray-200 pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-medical-gray-600">Subtotal:</span>
                            <span className="font-medium text-medical-gray-800">Rs. {invoice.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-medical-gray-600">
                              Tax ({(invoice.taxRate * 100).toFixed(1)}%):
                            </span>
                            <span className="font-medium text-medical-gray-800">Rs. {invoice.taxAmount.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-lg font-semibold text-medical-gray-800 border-t border-medical-gray-200 pt-2 mt-2">
                            <span>Total:</span>
                            <span>Rs. {invoice.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-lg font-semibold text-medical-gray-800">Medical History</h4>
              <Button variant="outline" className="border-medical-gray-300">
                <Edit className="h-4 w-4 mr-2" />
                Update History
              </Button>
            </div>

            <div className="space-y-6">
              {/* Initial Medical History */}
              {patient.medicalHistory && (
                <Card className="border border-medical-gray-200">
                  <CardContent className="p-6">
                    <h5 className="font-semibold text-medical-gray-800 mb-4 flex items-center">
                      <Heart className="text-medical-blue mr-2 h-5 w-5" />
                      Initial Medical History
                    </h5>
                    <div className="prose prose-sm max-w-none text-medical-gray-700">
                      <p>{patient.medicalHistory}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Blood Type */}
              {patient.bloodType && (
                <Card className="border border-medical-gray-200">
                  <CardContent className="p-6">
                    <h5 className="font-semibold text-medical-gray-800 mb-4 flex items-center">
                      <Heart className="text-medical-red mr-2 h-5 w-5" />
                      Blood Type
                    </h5>
                    <div className="p-3 bg-medical-gray-50 rounded-lg">
                      <span className="font-medium text-medical-gray-800">{patient.bloodType}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Emergency Contact */}
              {patient.emergencyContactName && (
                <Card className="border border-medical-gray-200">
                  <CardContent className="p-6">
                    <h5 className="font-semibold text-medical-gray-800 mb-4 flex items-center">
                      <Users className="text-medical-gray-600 mr-2 h-5 w-5" />
                      Emergency Contact
                    </h5>
                    <div className="p-3 bg-medical-gray-50 rounded-lg">
                      <p className="font-medium text-medical-gray-800">{patient.emergencyContactName}</p>
                      {patient.emergencyContactPhone && (
                        <p className="text-sm text-medical-gray-600">{patient.emergencyContactPhone}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Modals */}
      <AddConsultationModal
        open={showConsultationModal}
        onClose={() => setShowConsultationModal(false)}
        patientId={patientId}
        onConsultationAdded={refetchNotes}
      />

      <CreatePrescriptionModal
        open={showPrescriptionModal}
        onClose={() => setShowPrescriptionModal(false)}
        patientId={patientId}
        onPrescriptionCreated={refetchPrescriptions}
      />

      <CreateInvoiceModal
        open={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        patientId={patientId}
        onInvoiceCreated={refetchInvoices}
      />
    </div>
  );
}
