import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useMemo } from "react";
import { useLocation } from "wouter";

export default function PendingRequestsNotification() {
  const [, setLocation] = useLocation();
  
  // Fetch all pending requests
  const { data: unifiedLeads } = trpc.leads.unifiedList.useQuery();
  
  // Get last 5 pending requests
  const pendingRequests = useMemo(() => {
    if (!unifiedLeads) return [];
    
    const pending = unifiedLeads.filter(lead => 
      lead.status === 'pending' || lead.status === 'new'
    );
    
    // Sort by createdAt descending and take first 5
    return pending
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [unifiedLeads]);
  
  const totalPending = useMemo(() => {
    if (!unifiedLeads) return 0;
    return unifiedLeads.filter(lead => 
      lead.status === 'pending' || lead.status === 'new'
    ).length;
  }, [unifiedLeads]);
  
  const handleRequestClick = (request: any) => {
    // Navigate to bookings management page
    // The page will need to handle highlighting the selected request
    setLocation(`/dashboard/bookings?id=${request.id}&type=${request.type}`);
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
        >
          <Bell className="h-5 w-5" />
          {totalPending > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs font-bold rounded-full"
            >
              {totalPending}
            </Badge>
          )}
          <span className="sr-only">طلبات قيد الانتظار</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="font-semibold">
          طلبات قيد الانتظار
          {totalPending > 0 && (
            <span className="mr-2 text-sm text-muted-foreground">
              ({totalPending})
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {pendingRequests.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            لا توجد طلبات قيد الانتظار
          </div>
        ) : (
          <>
            {pendingRequests.map((request) => (
              <DropdownMenuItem
                key={`${request.type}-${request.id}`}
                className="cursor-pointer flex flex-col items-start gap-1 p-3"
                onClick={() => handleRequestClick(request)}
              >
                <div className="font-medium">{request.fullName}</div>
                <div className="text-xs text-muted-foreground">
                  {request.typeLabel}
                </div>
              </DropdownMenuItem>
            ))}
            {totalPending > 5 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer justify-center text-sm text-primary"
                  onClick={() => setLocation('/dashboard/bookings')}
                >
                  عرض جميع الطلبات ({totalPending})
                </DropdownMenuItem>
              </>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
