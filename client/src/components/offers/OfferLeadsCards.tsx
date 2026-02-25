import OfferLeadCard from "@/components/OfferLeadCard";

interface OfferLeadsCardsProps {
  leads: any[];
  onEdit: (lead: any) => void;
  onPrint: (lead: any) => Promise<void>;
}

export default function OfferLeadsCards({
  leads,
  onEdit,
  onPrint,
}: OfferLeadsCardsProps) {
  return (
    <>
      {leads.map((lead: any) => (
        <OfferLeadCard
          key={lead.id}
          lead={{
            id: lead.id,
            fullName: lead.fullName,
            phone: lead.phone,
            email: lead.email,
            status: lead.status,
            offerName: lead.offerTitle,
            createdAt: lead.createdAt,
          }}
          onEdit={() => onEdit(lead)}
          onPrint={() => onPrint(lead)}
        />
      ))}
    </>
  );
}
