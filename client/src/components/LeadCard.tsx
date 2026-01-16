import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Calendar, Eye, MessageSquare } from "lucide-react";

const statusLabels = {
  new: "جديد",
  contacted: "تم التواصل",
  booked: "تم الحجز",
  not_interested: "غير مهتم",
  no_answer: "لم يرد",
};

const statusColors = {
  new: "bg-blue-500",
  contacted: "bg-yellow-500",
  booked: "bg-green-500",
  not_interested: "bg-red-500",
  no_answer: "bg-gray-500",
};

interface LeadCardProps {
  lead: any;
  onUpdateStatus: (lead: any) => void;
  onWhatsApp: (lead: any) => void;
}

export default function LeadCard({ lead, onUpdateStatus, onWhatsApp }: LeadCardProps) {
  return (
    <Card className={`mb-3 hover:shadow-md transition-shadow ${
      lead.status === 'pending' || lead.status === 'new' ? 'bg-red-50 border-red-200' : ''
    }`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-base mb-1">{lead.fullName}</h3>
            <Badge className={`${statusColors[lead.status as keyof typeof statusColors]} text-white text-xs`}>
              {statusLabels[lead.status as keyof typeof statusLabels]}
            </Badge>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span dir="ltr" className="font-medium">{lead.phone}</span>
          </div>

          {lead.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{lead.email}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>
              {new Date(lead.createdAt).toLocaleDateString("ar-YE", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => window.location.href = `tel:${lead.phone}`}
          >
            <Phone className="w-4 h-4 ml-1" />
            اتصال
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
            onClick={() => onWhatsApp(lead)}
          >
            <MessageSquare className="w-4 h-4 ml-1" />
            واتساب
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onUpdateStatus(lead)}
          >
            <Eye className="w-4 h-4 ml-1" />
            تحديث
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
