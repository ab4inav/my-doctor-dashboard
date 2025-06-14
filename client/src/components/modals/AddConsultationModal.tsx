import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { insertConsultationNoteSchema, type InsertConsultationNote } from "@shared/schema";
import { createConsultationNote } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";

interface AddConsultationModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  onConsultationAdded: () => void;
}

export function AddConsultationModal({ 
  open, 
  onClose, 
  patientId, 
  onConsultationAdded 
}: AddConsultationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");
  const { doctor } = useAuth();
  const { toast } = useToast();

  const form = useForm<InsertConsultationNote>({
    resolver: zodResolver(insertConsultationNoteSchema),
    defaultValues: {
      patientId,
      doctorId: doctor?.id || "",
      title: "",
      content: "",
      date: new Date(),
    },
  });

  const onSubmit = async (data: InsertConsultationNote) => {
    console.log("onSubmit called with:", data);
    console.log("Content state:", content);
    console.log("Doctor:", doctor);
    
    if (!doctor) {
      toast({
        title: "Authentication Error",
        description: "Please ensure you're logged in and try again.",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "Content Required",
        description: "Please add some content to the consultation note.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Creating consultation note with data:", {
        ...data,
        content,
        patientId,
        doctorId: doctor.id,
      });
      
      await createConsultationNote({
        ...data,
        content,
        patientId,
        doctorId: doctor.id,
      });

      toast({
        title: "Success",
        description: "Consultation note added successfully",
      });

      form.reset();
      setContent("");
      onConsultationAdded();
      onClose();
    } catch (error) {
      console.error("Error adding consultation note:", error);
      toast({
        title: "Error",
        description: "Failed to add consultation note. Please ensure Firestore is properly configured.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-medical-gray-800">
            Add Consultation Note
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit, (errors) => console.log("Form validation errors:", errors))} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...form.register("title")}
                className="mt-1"
                placeholder="e.g., Regular Checkup, Follow-up Visit"
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-600 mt-1">
                  {form.formState.errors.title.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="datetime-local"
                {...form.register("date", {
                  setValueAs: (value) => new Date(value),
                })}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="content">Consultation Notes *</Label>
            <div className="mt-1">
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write detailed consultation notes here..."
                className="min-h-96"
              />
            </div>
            {!content && (
              <p className="text-sm text-red-600 mt-1">
                Content is required
              </p>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-4 border-t border-medical-gray-200">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-medical-blue hover:bg-blue-700"
              onClick={() => console.log("Button clicked, content:", content, "content length:", content.length)}
            >
              {isSubmitting ? "Adding..." : "Add Note"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
