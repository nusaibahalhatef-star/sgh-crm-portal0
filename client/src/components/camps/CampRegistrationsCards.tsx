import CampRegistrationCard from "@/components/CampRegistrationCard";

interface CampRegistrationsCardsProps {
  registrations: any[];
  onEdit: (registration: any) => void;
  onPrint: (registration: any) => Promise<void>;
}

export default function CampRegistrationsCards({
  registrations,
  onEdit,
  onPrint,
}: CampRegistrationsCardsProps) {
  return (
    <>
      {registrations.map((reg: any) => (
        <CampRegistrationCard
          key={reg.id}
          registration={{
            id: reg.id,
            fullName: reg.fullName,
            phone: reg.phone,
            email: reg.email,
            status: reg.status,
            campName: reg.campTitle,
            createdAt: reg.createdAt,
          }}
          onEdit={() => onEdit(reg)}
          onPrint={() => onPrint(reg)}
          onViewDetails={() => onEdit(reg)}
        />
      ))}
    </>
  );
}
