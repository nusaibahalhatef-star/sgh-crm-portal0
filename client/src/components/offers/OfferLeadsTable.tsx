import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResizableTable, ResizableHeaderCell, FrozenTableCell } from "@/components/ResizableTable";
import { getColumnWidth, type ColumnConfig } from "@/components/ColumnVisibility";
import ActionButtons from "@/components/ActionButtons";
import CommentCount from "@/components/CommentCount";
import TaskCount from "@/components/TaskCount";
import { Badge } from "@/components/ui/badge";
import { Eye } from "lucide-react";

interface OfferLeadsTableProps {
  leads: any[];
  columns: ColumnConfig[];
  visibleColumns: Record<string, boolean>;
  columnOrder: string[];
  columnWidths: ReturnType<typeof import("@/components/ResizableTable").useColumnWidths>;
  frozenColumns: ReturnType<typeof import("@/components/ResizableTable").useFrozenColumns>;
  selectedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
  onEdit: (lead: any) => void;
  onPrint: (lead: any) => Promise<void>;
  formatPhoneDisplay: (phone: string) => string;
  formatDate: (date: any) => string;
}

const statusLabels = {
  new: "جديد",
  contacted: "تم التواصل",
  booked: "تم الحجز",
  not_interested: "غير مهتم",
  no_answer: "لم يرد",
};

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  booked: "bg-green-100 text-green-800",
  not_interested: "bg-red-100 text-red-800",
  no_answer: "bg-gray-100 text-gray-800",
};

export default function OfferLeadsTable({
  leads,
  columns,
  visibleColumns,
  columnOrder,
  columnWidths,
  frozenColumns,
  selectedIds,
  onSelectedIdsChange,
  onEdit,
  onPrint,
  formatPhoneDisplay,
  formatDate,
}: OfferLeadsTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <ResizableTable
        frozenColumns={frozenColumns.frozenColumns}
        columnWidths={columnWidths.columnWidths}
        visibleColumnOrder={columnOrder.filter(key => visibleColumns[key])}
      >
        <TableHeader>
          <TableRow>
            {columnOrder.filter(key => visibleColumns[key]).map(colKey => {
              const col = columns.find(c => c.key === colKey);
              if (!col) return null;
              
              if (colKey === 'checkbox') {
                return (
                  <ResizableHeaderCell key={colKey} columnKey={colKey} width={40} minWidth={40} maxWidth={40} onResize={() => {}}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length === leads.length && leads.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onSelectedIdsChange(leads.map(lead => lead.id));
                        } else {
                          onSelectedIdsChange([]);
                        }
                      }}
                      className="rounded border-border"
                    />
                  </ResizableHeaderCell>
                );
              }
              
              const widthConfig = getColumnWidth(colKey, col);
              return (
                <ResizableHeaderCell
                  key={colKey}
                  columnKey={colKey}
                  width={columnWidths.getWidth(colKey)}
                  minWidth={widthConfig.min}
                  maxWidth={widthConfig.max}
                  onResize={columnWidths.handleResize}
                >
                  {col.label}
                </ResizableHeaderCell>
              );
            })}
          </TableRow>
        </TableHeader>
        <TableBody>
          {leads.map((lead: any) => (
            <TableRow key={lead.id} className={`group ${lead.status === 'new' ? 'bg-blue-50/40 hover:bg-blue-50/60' : 'hover:bg-muted/30'}`}>
              {columnOrder.filter(key => visibleColumns[key]).map(colKey => {
                switch(colKey) {
                  case 'checkbox':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(lead.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              onSelectedIdsChange([...selectedIds, lead.id]);
                            } else {
                              onSelectedIdsChange(selectedIds.filter(id => id !== lead.id));
                            }
                          }}
                          className="rounded border-border"
                        />
                      </FrozenTableCell>
                    );
                  case 'receiptNumber':
                    return <FrozenTableCell key={colKey} columnKey={colKey} className="text-sm text-muted-foreground font-mono">{lead.receiptNumber || "-"}</FrozenTableCell>;
                  case 'name':
                    return <FrozenTableCell key={colKey} columnKey={colKey} className="font-medium">{lead.fullName}</FrozenTableCell>;
                  case 'phone':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{formatPhoneDisplay(lead.phone)}</span>
                          <ActionButtons
                            phoneNumber={formatPhoneDisplay(lead.phone)}
                            showWhatsApp={true}
                            whatsAppMessage={`مرحباً ${lead.fullName}، شكراً لاهتمامك بعرضنا الطبي. نود التواصل معك لتأكيد حجزك.`}
                            size="sm"
                            variant="ghost"
                          />
                        </div>
                      </FrozenTableCell>
                    );
                  case 'email':
                    return <FrozenTableCell key={colKey} columnKey={colKey} className="text-sm">{lead.email || '-'}</FrozenTableCell>;
                  case 'offer':
                    return <FrozenTableCell key={colKey} columnKey={colKey}>{lead.offerTitle || '-'}</FrozenTableCell>;
                  case 'status':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey}>
                        <Badge className={statusColors[lead.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                          {statusLabels[lead.status as keyof typeof statusLabels] || lead.status}
                        </Badge>
                      </FrozenTableCell>
                    );
                  case 'source':
                    return <FrozenTableCell key={colKey} columnKey={colKey} className="text-sm">{lead.source || '-'}</FrozenTableCell>;
                  case 'date':
                    return <FrozenTableCell key={colKey} columnKey={colKey} className="text-sm text-muted-foreground">{formatDate(lead.createdAt)}</FrozenTableCell>;
                  case 'comments':
                    return <FrozenTableCell key={colKey} columnKey={colKey}><CommentCount entityType="offerLead" entityId={lead.id} /></FrozenTableCell>;
                  case 'tasks':
                    return <FrozenTableCell key={colKey} columnKey={colKey}><TaskCount entityType="offerLead" entityId={lead.id} /></FrozenTableCell>;
                  case 'actions':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey}>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(lead)}
                            className="p-1 hover:bg-muted rounded"
                            title="تحرير"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </div>
                      </FrozenTableCell>
                    );
                  default:
                    return <FrozenTableCell key={colKey} columnKey={colKey}>-</FrozenTableCell>;
                }
              })}
            </TableRow>
          ))}
        </TableBody>
      </ResizableTable>
    </div>
  );
}
