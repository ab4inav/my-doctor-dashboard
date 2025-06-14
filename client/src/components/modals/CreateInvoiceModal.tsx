import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { insertInvoiceSchema, type InsertInvoice } from "@shared/schema";
import { createInvoice } from "@/lib/firestore";
import { useAuth } from "@/contexts/AuthContext";

interface CreateInvoiceModalProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  onInvoiceCreated: () => void;
}

export function CreateInvoiceModal({ 
  open, 
  onClose, 
  patientId, 
  onInvoiceCreated 
}: CreateInvoiceModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { doctor } = useAuth();
  const { toast } = useToast();

  const form = useForm<InsertInvoice>({
    resolver: zodResolver(insertInvoiceSchema),
    defaultValues: {
      patientId,
      doctorId: doctor?.id || "",
      items: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ],
      taxRate: 0.085, // 8.5% default tax rate
      status: "pending",
      date: new Date(),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");

  const calculateItemTotal = (index: number) => {
    const item = watchedItems[index];
    if (item) {
      const total = item.quantity * item.unitPrice;
      form.setValue(`items.${index}.total`, total);
      return total;
    }
    return 0;
  };

  const onSubmit = async (data: InsertInvoice) => {
    if (!doctor) return;

    setIsSubmitting(true);
    try {
      await createInvoice({
        ...data,
        patientId,
        doctorId: doctor.id,
      });

      toast({
        title: "Success",
        description: "Invoice created successfully",
      });

      form.reset();
      onInvoiceCreated();
      onClose();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    append({
      description: "",
      quantity: 1,
      unitPrice: 0,
      total: 0,
    });
  };

  const subtotal = watchedItems.reduce((sum, item) => sum + (item?.total || 0), 0);
  const taxAmount = subtotal * (form.watch("taxRate") || 0);
  const total = subtotal + taxAmount;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-medical-gray-800">
            Create Invoice
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Label htmlFor="status">Status</Label>
              <Select
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as any)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-medium">Services/Items</Label>
              <Button
                type="button"
                onClick={addItem}
                className="bg-medical-blue hover:bg-blue-700"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border border-medical-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-medical-gray-800">
                      Item {index + 1}
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

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor={`items.${index}.description`}>Description *</Label>
                      <Input
                        {...form.register(`items.${index}.description`)}
                        className="mt-1"
                        placeholder="e.g., Consultation Fee"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`items.${index}.quantity`}>Quantity *</Label>
                      <Input
                        type="number"
                        min="1"
                        {...form.register(`items.${index}.quantity`, {
                          valueAsNumber: true,
                          onChange: () => setTimeout(() => calculateItemTotal(index), 0),
                        })}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`items.${index}.unitPrice`}>Unit Price *</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        {...form.register(`items.${index}.unitPrice`, {
                          valueAsNumber: true,
                          onChange: () => setTimeout(() => calculateItemTotal(index), 0),
                        })}
                        className="mt-1"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="mt-4 text-right">
                    <span className="text-sm text-medical-gray-600">
                      Total: ${(watchedItems[index]?.total || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="taxRate">Tax Rate</Label>
            <Input
              id="taxRate"
              type="number"
              min="0"
              max="1"
              step="0.001"
              {...form.register("taxRate", {
                valueAsNumber: true,
              })}
              className="mt-1 max-w-32"
              placeholder="0.085"
            />
            <p className="text-xs text-medical-gray-600 mt-1">
              Enter as decimal (e.g., 0.085 for 8.5%)
            </p>
          </div>

          {/* Invoice Summary */}
          <div className="border-t border-medical-gray-200 pt-4">
            <div className="bg-medical-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-medical-gray-600">Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-medical-gray-600">
                  Tax ({((form.watch("taxRate") || 0) * 100).toFixed(1)}%):
                </span>
                <span className="font-medium">${taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-medical-gray-200 pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
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
              {isSubmitting ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
