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
import { SOURCE_LABELS } from "@shared/sources";

interface CampRegistrationsTableProps {
  registrations: any[];
  columns: ColumnConfig[];
  visibleColumns: Record<string, boolean>;
  columnOrder: string[];
  columnWidths: ReturnType<typeof import("@/components/ResizableTable").useColumnWidths>;
  frozenColumns: ReturnType<typeof import("@/components/ResizableTable").useFrozenColumns>;
  selectedIds: number[];
  onSelectedIdsChange: (ids: number[]) => void;
  onEdit: (registration: any) => void;
  onPrint: (registration: any) => Promise<void>;
  formatPhoneDisplay: (phone: string) => string;
  formatDate: (date: any) => string;
}

const statusLabels = {
  pending: "قيد الانتظار",
  confirmed: "مؤكد",
  attended: "حضر",
  cancelled: "ملغي",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-green-100 text-green-800",
  attended: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function CampRegistrationsTable({
  registrations,
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
}: CampRegistrationsTableProps) {
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
                      checked={selectedIds.length === registrations.length && registrations.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          onSelectedIdsChange(registrations.map(reg => reg.id));
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
          {registrations.map((reg: any) => (
            <TableRow key={reg.id} className={`group ${reg.status === 'pending' ? 'bg-yellow-50/40 hover:bg-yellow-50/60' : 'hover:bg-muted/30'}`}>
              {columnOrder.filter(key => visibleColumns[key]).map(colKey => {
                switch(colKey) {
                  case 'checkbox':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey}>
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(reg.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              onSelectedIdsChange([...selectedIds, reg.id]);
                            } else {
                              onSelectedIdsChange(selectedIds.filter(id => id !== reg.id));
                            }
                          }}
                          className="rounded border-border"
                        />
                      </FrozenTableCell>
                    );
                  case 'receiptNumber':
                    return <FrozenTableCell key={colKey} columnKey={colKey} className="text-sm text-muted-foreground font-mono">{reg.receiptNumber || "-"}</FrozenTableCell>;
                  case 'name':
                    return <FrozenTableCell key={colKey} columnKey={colKey} className="font-medium">{reg.fullName}</FrozenTableCell>;
                  case 'phone':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{formatPhoneDisplay(reg.phone)}</span>
                          <ActionButtons
                            phoneNumber={formatPhoneDisplay(reg.phone)}
                            showWhatsApp={true}
                            whatsAppMessage={`مرحباً ${reg.fullName}، شكراً لتسجيلك في المخيم. نود التواصل معك لتأكيد حضورك.`}
                            size="sm"
                            variant="ghost"
                          />
                        </div>
                      </FrozenTableCell>
                    );
                  case 'email':
                    return <FrozenTableCell key={colKey} columnKey={colKey} className="text-sm">{reg.email || '-'}</FrozenTableCell>;
                  case 'camp':
                    return <FrozenTableCell key={colKey} columnKey={colKey}>{reg.campTitle || '-'}</FrozenTableCell>;
                  case 'procedures':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey} className="text-sm">
                        {reg.procedures ? JSON.parse(reg.procedures).length : 0} إجراء
                      </FrozenTableCell>
                    );
                  case 'status':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey}>
                        <Badge className={statusColors[reg.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                          {statusLabels[reg.status as keyof typeof statusLabels] || reg.status}
                        </Badge>
                      </FrozenTableCell>
                    );
                  case 'source':
                    return <FrozenTableCell key={colKey} columnKey={colKey} className="text-sm">{SOURCE_LABELS[reg.source] || reg.source || '-'}</FrozenTableCell>;
                  case 'date':
                    return <FrozenTableCell key={colKey} columnKey={colKey} className="text-sm text-muted-foreground">{formatDate(reg.createdAt)}</FrozenTableCell>;
                  case 'comments':
                    return <FrozenTableCell key={colKey} columnKey={colKey}><CommentCount entityType="campRegistration" entityId={reg.id} /></FrozenTableCell>;
                  case 'tasks':
                    return <FrozenTableCell key={colKey} columnKey={colKey}><TaskCount entityType="campRegistration" entityId={reg.id} /></FrozenTableCell>;
                  case 'actions':
                    return (
                      <FrozenTableCell key={colKey} columnKey={colKey}>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(reg)}
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
