import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { insertPatientSchema, type InsertPatient } from "@shared/schema";
import { createPatient } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";

interface AddPatientModalProps {
  open: boolean;
  onClose: () => void;
  onPatientAdded: () => void;
}

export function AddPatientModal({ open, onClose, onPatientAdded }: AddPatientModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { doctor } = useAuth();
  const { toast } = useToast();

  const form = useForm<InsertPatient>({
    resolver: zodResolver(insertPatientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      age: 0,
      gender: "male",
      phoneNumber: "",
      email: "",
      address: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      medicalHistory: "",
      doctorId: doctor?.id || "",
    },
  });

  const onSubmit = async (data: InsertPatient) => {
    if (!doctor) {
      toast({
        title: "Authentication Error",
        description: "Please ensure you're logged in and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await createPatient({
        ...data,
        doctorId: doctor.id,
      });

      toast({
        title: "Success",
        description: "Patient added successfully",
      });

      form.reset();
      onPatientAdded();
      onClose();
    } catch (error) {
      console.error("Error adding patient:", error);
      toast({
        title: "Error",
        description: "Failed to add patient. Please ensure Firestore is enabled in Firebase Console.",
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
            Add New Patient
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                className="mt-1"
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-red-600 mt-1">
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
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.age.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="gender">Gender *</Label>
              <Select
                value={form.watch("gender")}
                onValueChange={(value) => form.setValue("gender", value as "male" | "female" | "other")}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bloodType">Blood Type</Label>
              <Select
                value={form.watch("bloodType") || ""}
                onValueChange={(value) => form.setValue("bloodType", value as any)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Blood Type" />
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="phoneNumber">Phone Number *</Label>
              <Input
                id="phoneNumber"
                type="tel"
                {...form.register("phoneNumber")}
                className="mt-1"
              />
              {form.formState.errors.phoneNumber && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.phoneNumber.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...form.register("address")}
              rows={3}
              className="mt-1 resize-none"
            />
          </div>

          <div>
            <Label>Emergency Contact</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              <Input
                placeholder="Contact Name"
                {...form.register("emergencyContactName")}
              />
              <Input
                placeholder="Contact Phone"
                type="tel"
                {...form.register("emergencyContactPhone")}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="medicalHistory">Initial Medical History</Label>
            <Textarea
              id="medicalHistory"
              {...form.register("medicalHistory")}
              rows={4}
              placeholder="Brief medical history, current medications, allergies, etc."
              className="mt-1 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-medical-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-medical-blue hover:bg-blue-700"
            >
              {isSubmitting ? "Adding..." : "Add Patient"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
