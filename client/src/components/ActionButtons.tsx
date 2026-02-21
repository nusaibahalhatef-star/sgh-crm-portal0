import { Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ActionButtonsProps {
  phoneNumber: string;
  showWhatsApp?: boolean;
  whatsAppMessage?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "ghost";
}

export default function ActionButtons({
  phoneNumber,
  showWhatsApp = true,
  whatsAppMessage,
  size = "sm",
  variant = "ghost",
}: ActionButtonsProps) {
  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsApp = () => {
    const message = whatsAppMessage || "";
    const url = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}${
      message ? `?text=${encodeURIComponent(message)}` : ""
    }`;
    window.open(url, "_blank");
  };

  return (
    <div className="flex gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            onClick={handleCall}
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Phone className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>اتصال مباشر</p>
        </TooltipContent>
      </Tooltip>

      {showWhatsApp && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              onClick={handleWhatsApp}
              className="text-green-600 hover:text-green-700 hover:bg-green-50"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>إرسال رسالة واتساب</p>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
