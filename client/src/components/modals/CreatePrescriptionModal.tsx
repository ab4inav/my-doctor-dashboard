import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import {
  insertPrescriptionSchema,
  type InsertPrescription,
} from "@shared/schema";
import { createPrescription } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";

interface CreatePrescriptionModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  onPrescriptionCreated: () => void;
}

export function CreatePrescriptionModal({
  open,
  onClose,
  patientId,
  onPrescriptionCreated,
}: CreatePrescriptionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const { doctor } = useAuth();
  const { toast } = useToast();

  const form = useForm<InsertPrescription>({
    resolver: zodResolver(insertPrescriptionSchema),
    defaultValues: {
      patientId,
      doctorId: doctor?.id || "",
      medications: [
        { name: "", dosage: "", duration: "", instructions: "", refills: 0 },
      ],
      date: new Date(),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications",
  });

  const onSubmit = async (data: InsertPrescription) => {
    if (!doctor) return;
    setIsSubmitting(true);
    try {
      await createPrescription({ ...data, patientId, doctorId: doctor.id });
      toast({
        title: "Success",
        description: "Prescription created successfully",
      });
      form.reset();
      onPrescriptionCreated();
      onClose();
    } catch {
      toast({
        title: "Error",
        description: "Failed to create prescription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setShowGuidelines(false);
      setAgreed(false);
    }
  };

  const addMedication = () => {
    append({
      name: "",
      dosage: "",
      duration: "",
      instructions: "",
      refills: 0,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-medical-gray-800">
            {showGuidelines
              ? "Prescription Regulations as per Drug Category Rules 2043 (1986)"
              : "Create Prescription"}
          </DialogTitle>
        </DialogHeader>
        {showGuidelines ? (
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-sm text-medical-gray-800 whitespace-pre-wrap">
                Prescribing medications, via telemedicine consultation is at the
                professional discretion of the medical practitioner. It entails
                the same professional accountability as in the traditional
                in-person consult. If a medical condition requires a protocol to
                diagnose and prescribe, a medical in-person consult, then the
                same prevailing principle will be applicable to a telemedicine
                consult. Prescribing medicines without an appropriate
                diagnosis/provisional diagnosis will amount to professional
                misconduct. Under any circumstances, medical practitioners
                should NOT prescribe drugs listed under Category “A” under Drug
                Category Rules 2043 (1986) via telemedicine. Prescription should
                include generic name in capital letters, drug form, strength,
                frequency, and duration.
              </p>
            </div>
            <table className="w-full text-left border-collapse border border-gray-200 mb-4">
              <thead>
                <tr className="bg-gray-100 font-medium text-medical-gray-800">
                  <th className="py-2 px-4">Drug Category</th>
                  <th className="py-2 px-4">Drug Category Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-2 px-4 border-b border-gray-200 text-medical-gray-700">
                    A
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200 text-medical-gray-700">
                    Category “A” consists of narcotic and poisonous drugs
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b border-gray-200 text-medical-gray-700">
                    B
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200 text-medical-gray-700">
                    Category “B” consists of antibiotics, hormones, etc. Sold
                    only on doctor’s prescription by a pharmacist or qualified
                    professional.
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-4 border-b border-gray-200 text-medical-gray-700">
                    C
                  </td>
                  <td className="py-2 px-4 border-b border-gray-200 text-medical-gray-700">
                    Category “C” may be sold by any seller without prescription.
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="flex items-start space-x-2">
              <Checkbox
                id="guidelines-agreement"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked as boolean)}
              />
              <Label
                htmlFor="guidelines-agreement"
                className="text-medical-gray-800"
              >
                I have read the telemedicine guidelines for registered medical
                practitioners in Nepal issued by Nepal Medical Council (May
                2020)
              </Label>
            </div>
            <div className="flex justify-end space-x-4 pt-4 border-t border-medical-gray-200">
              <Button
                variant="outline"
                onClick={() => setShowGuidelines(false)}
              >
                Back
              </Button>
              <Button
                disabled={!agreed || isSubmitting}
                className="bg-medical-blue hover:bg-blue-700"
                onClick={() => form.handleSubmit(onSubmit)()}
              >
                {isSubmitting ? "Creating..." : "I Agree"}
              </Button>
            </div>
          </div>
        ) : (
          <form className="space-y-6">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                {...form.register("date", { setValueAs: (v) => new Date(v) })}
                className="mt-1"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-4">
                <Label className="text-lg font-medium">Medications</Label>
                <Button
                  type="button"
                  onClick={addMedication}
                  className="bg-medical-blue hover:bg-blue-700"
                  size="sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Medication
                </Button>
              </div>
              <div className="space-y-6">
                {fields.map((field, i) => (
                  <div
                    key={field.id}
                    className="border border-medical-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-medical-gray-800">
                        Medication {i + 1}
                      </h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => remove(i)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`medications.${i}.name`}>
                          Medication Name *
                        </Label>
                        <Input
                          {...form.register(`medications.${i}.name`)}
                          className="mt-1"
                          placeholder="e.g., Lisinopril"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`medications.${i}.dosage`}>
                          Dosage *
                        </Label>
                        <Input
                          {...form.register(`medications.${i}.dosage`)}
                          className="mt-1"
                          placeholder="e.g., 10mg"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <Label htmlFor={`medications.${i}.duration`}>
                          Duration *
                        </Label>
                        <Input
                          {...form.register(`medications.${i}.duration`)}
                          className="mt-1"
                          placeholder="e.g., 30 days"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`medications.${i}.refills`}>
                          Refills
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          {...form.register(`medications.${i}.refills`, {
                            valueAsNumber: true,
                          })}
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Label htmlFor={`medications.${i}.instructions`}>
                        Instructions *
                      </Label>
                      <Textarea
                        {...form.register(`medications.${i}.instructions`)}
                        rows={3}
                        className="mt-1 resize-none"
                        placeholder="e.g., Take once daily in the morning with food"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-4 pt-4 border-t border-medical-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isSubmitting}
                className="bg-medical-blue hover:bg-blue-700"
                onClick={() => setShowGuidelines(true)}
              >
                {isSubmitting ? "Creating..." : "Create Prescription"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
