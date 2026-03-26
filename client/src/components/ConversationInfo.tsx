import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Calendar, MessageSquare, Clock, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ConversationInfoProps {
  conversation: {
    id: number;
    customerName?: string | null;
    phoneNumber: string;
    lastMessageAt?: string | Date | null;
    unreadCount: number;
    leadId?: number | null;
    appointmentId?: number | null;
    offerLeadId?: number | null;
    campRegistrationId?: number | null;
  };
  messageCount?: number;
  onMarkAsImportant?: () => void;
  onArchive?: () => void;
}

export default function ConversationInfo({
  conversation,
  messageCount = 0,
  onMarkAsImportant,
  onArchive,
}: ConversationInfoProps) {
  const handleCopyPhone = () => {
    navigator.clipboard.writeText(conversation.phoneNumber);
    toast.success("تم نسخ رقم الهاتف");
  };

  return (
    <div className="space-y-3 p-3 sm:p-4">
      {/* Header Card */}
      <Card className="p-3 sm:p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-sm sm:text-base text-foreground truncate">
              {conversation.customerName || "عميل جديد"}
            </h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
              <Phone className="h-3 w-3 flex-shrink-0" />
              <span dir="ltr" className="font-mono text-[10px] sm:text-xs">
                {conversation.phoneNumber}
              </span>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 flex-shrink-0"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={handleCopyPhone}>
                <Phone className="h-3.5 w-3.5 ml-2" />
                نسخ رقم الهاتف
              </DropdownMenuItem>
              {onMarkAsImportant && (
                <DropdownMenuItem onClick={onMarkAsImportant}>
                  <span className="ml-2">⭐</span>
                  وضع علامة مهمة
                </DropdownMenuItem>
              )}
              {onArchive && (
                <DropdownMenuItem onClick={onArchive}>
                  <span className="ml-2">📦</span>
                  أرشفة المحادثة
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-2.5 sm:p-3">
          <div className="flex items-center gap-1.5">
            <MessageSquare className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground">الرسائل</p>
              <p className="font-bold text-sm sm:text-base text-foreground">
                {messageCount}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-2.5 sm:p-3">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-amber-600 flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-muted-foreground">آخر رسالة</p>
              <p className="font-bold text-sm sm:text-base text-foreground">
                {conversation.lastMessageAt
                  ? new Date(conversation.lastMessageAt).toLocaleDateString("ar-EG", {
                      month: "short",
                      day: "numeric",
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Related Items */}
      <div className="space-y-1.5">
        {conversation.appointmentId && (
          <Badge variant="outline" className="w-full justify-start gap-1.5 px-2 py-1 text-xs">
            <Calendar className="h-3 w-3" />
            <span className="truncate">موعد طبي مرتبط</span>
          </Badge>
        )}
        {conversation.offerLeadId && (
          <Badge variant="outline" className="w-full justify-start gap-1.5 px-2 py-1 text-xs">
            <Mail className="h-3 w-3" />
            <span className="truncate">عرض طبي مرتبط</span>
          </Badge>
        )}
        {conversation.campRegistrationId && (
          <Badge variant="outline" className="w-full justify-start gap-1.5 px-2 py-1 text-xs">
            <span>🏕️</span>
            <span className="truncate">تسجيل مخيم مرتبط</span>
          </Badge>
        )}
      </div>
    </div>
  );
}
