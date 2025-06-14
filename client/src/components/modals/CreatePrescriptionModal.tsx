import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { insertPrescriptionSchema, type InsertPrescription } from "@shared/schema";
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
  onPrescriptionCreated 
}: CreatePrescriptionModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { doctor } = useAuth();
  const { toast } = useToast();

  const form = useForm<InsertPrescription>({
    resolver: zodResolver(insertPrescriptionSchema),
    defaultValues: {
      patientId,
      doctorId: doctor?.id || "",
      medications: [
        {
          name: "",
          dosage: "",
          duration: "",
          instructions: "",
          refills: 0,
        },
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
      await createPrescription({
        ...data,
        patientId,
        doctorId: doctor.id,
      });

      toast({
        title: "Success",
        description: "Prescription created successfully",
      });

      form.reset();
      onPrescriptionCreated();
      onClose();
    } catch (error) {
      console.error("Error creating prescription:", error);
      toast({
        title: "Error",
        description: "Failed to create prescription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
            Create Prescription
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...form.register("date", {
                setValueAs: (value) => new Date(value),
              })}
              className="mt-1"
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
              {fields.map((field, index) => (
                <div key={field.id} className="border border-medical-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-medical-gray-800">
                      Medication {index + 1}
                    </h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`medications.${index}.name`}>Medication Name *</Label>
                      <Input
                        {...form.register(`medications.${index}.name`)}
                        className="mt-1"
                        placeholder="e.g., Lisinopril"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`medications.${index}.dosage`}>Dosage *</Label>
                      <Input
                        {...form.register(`medications.${index}.dosage`)}
                        className="mt-1"
                        placeholder="e.g., 10mg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <Label htmlFor={`medications.${index}.duration`}>Duration *</Label>
                      <Input
                        {...form.register(`medications.${index}.duration`)}
                        className="mt-1"
                        placeholder="e.g., 30 days"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`medications.${index}.refills`}>Refills</Label>
                      <Input
                        type="number"
                        min="0"
                        {...form.register(`medications.${index}.refills`, {
                          valueAsNumber: true,
                        })}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label htmlFor={`medications.${index}.instructions`}>Instructions *</Label>
                    <Textarea
                      {...form.register(`medications.${index}.instructions`)}
                      className="mt-1 resize-none"
                      rows={3}
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
              type="submit"
              disabled={isSubmitting}
              className="bg-medical-blue hover:bg-blue-700"
            >
              {isSubmitting ? "Creating..." : "Create Prescription"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
