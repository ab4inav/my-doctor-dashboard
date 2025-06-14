import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertPatientSchema, type InsertPatient, type Patient } from "@shared/schema";
import { updatePatient } from "@/lib/firestore";

interface EditPatientModalProps {
  open: boolean;
  onClose: () => void;
  patient: Patient;
  onPatientUpdated: () => void;
}

export function EditPatientModal({ 
  open, 
  onClose, 
  patient,
  onPatientUpdated 
}: EditPatientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<InsertPatient>({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: {
      firstName: patient.firstName,
      lastName: patient.lastName,
      age: patient.age,
      gender: patient.gender,
      bloodType: patient.bloodType,
      phoneNumber: patient.phoneNumber,
      email: patient.email || "",
      address: patient.address || "",
      emergencyContactName: patient.emergencyContactName || "",
      emergencyContactPhone: patient.emergencyContactPhone || "",
      medicalHistory: patient.medicalHistory || "",
      doctorId: patient.doctorId,
    },
  });

  const onSubmit = async (data: InsertPatient) => {
    setIsSubmitting(true);
    try {
      await updatePatient(patient.id, data);

      toast({
        title: "Success",
        description: "Patient information updated successfully",
      });

      onPatientUpdated();
      onClose();
    } catch (error) {
      console.error("Error updating patient:", error);
      toast({
        title: "Error",
        description: "Failed to update patient information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-medical-gray-800">
            Edit Patient Information
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                className="mt-1"
              />
              {form.formState.errors.firstName && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                className="mt-1"
              />
              {form.formState.errors.lastName && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="0"
                max="150"
                {...form.register("age", { valueAsNumber: true })}
                className="mt-1"
              />
              {form.formState.errors.age && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.age.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select value={form.watch("gender")} onValueChange={(value) => form.setValue("gender", value as "male" | "female" | "other")}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.gender && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.gender.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select value={form.watch("bloodType") || ""} onValueChange={(value) => form.setValue("bloodType", value as "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-")}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                {...form.register("phoneNumber")}
                className="mt-1"
              />
              {form.formState.errors.phoneNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.phoneNumber.message}
                </p>
              )}
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                className="mt-1"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address *</Label>
            <Textarea
              id="address"
              {...form.register("address")}
              className="mt-1 resize-none"
              rows={3}
            />
            {form.formState.errors.address && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.address.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
              <Input
                id="emergencyContactName"
                {...form.register("emergencyContactName")}
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
              <Input
                id="emergencyContactPhone"
                {...form.register("emergencyContactPhone")}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              {...form.register("medicalHistory")}
              className="mt-1 resize-none"
              rows={4}
              placeholder="Enter patient's medical history..."
            />
          </div>



          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-medical-blue hover:bg-blue-700"
            >
              {isSubmitting ? "Updating..." : "Update Patient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}