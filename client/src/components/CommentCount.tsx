import { trpc } from "@/lib/trpc";
import { MessageSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface CommentCountProps {
  entityType: "appointment" | "lead" | "offerLead" | "campRegistration";
  entityId: number;
}

export default function CommentCount({ entityType, entityId }: CommentCountProps) {
  const { data: count, isLoading } = trpc.comments.getCount.useQuery({
    entityType,
    entityId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <MessageSquare className="h-3.5 w-3.5" />
        <span className="text-xs">-</span>
      </div>
    );
  }

  if (!count || count === 0) {
    return (
      <div className="flex items-center gap-1 text-muted-foreground">
        <MessageSquare className="h-3.5 w-3.5" />
        <span className="text-xs">0</span>
      </div>
    );
  }

  return (
    <Badge variant="secondary" className="flex items-center gap-1 px-2 py-0.5">
      <MessageSquare className="h-3.5 w-3.5" />
      <span className="text-xs">{count}</span>
    </Badge>
  );
}
