import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StatusOption {
  value: string;
  label: string;
  color: string;
}

interface InlineStatusEditorProps {
  currentStatus: string;
  statusOptions: StatusOption[];
  onSave: (newStatus: string) => Promise<void>;
  disabled?: boolean;
}

/**
 * InlineStatusEditor Component
 * 
 * مكون تعديل الحالة مباشرة من الجدول
 * يعرض Badge قابل للنقر يتحول إلى Select عند النقر
 */
export default function InlineStatusEditor({
  currentStatus,
  statusOptions,
  onSave,
  disabled = false,
}: InlineStatusEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isSaving, setIsSaving] = useState(false);

  const currentOption = statusOptions.find((opt) => opt.value === currentStatus);

  const handleSave = async () => {
    if (selectedStatus === currentStatus) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(selectedStatus);
      toast.success("تم تحديث الحالة بنجاح");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("فشل في تحديث الحالة");
      setSelectedStatus(currentStatus); // Reset to original
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedStatus(currentStatus);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <Badge
        className={`${currentOption?.color} cursor-pointer hover:opacity-80 transition-opacity`}
        onClick={() => !disabled && setIsEditing(true)}
      >
        {currentOption?.label || currentStatus}
      </Badge>
    );
  }

  return (
    <div className="flex items-center gap-1">
      <Select
        value={selectedStatus}
        onValueChange={setSelectedStatus}
        disabled={isSaving || disabled}
      >
        <SelectTrigger className="h-8 w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${option.color}`} />
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={handleSave}
        disabled={isSaving || disabled}
      >
        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={handleCancel}
        disabled={isSaving || disabled}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
