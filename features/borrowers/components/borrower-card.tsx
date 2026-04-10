import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";
import { BorrowerAvatar } from "@/features/borrowers/components/borrower-avatar";
import type { BorrowerProfile } from "@/features/borrowers/types";

type BorrowerCardProps = {
  borrower: BorrowerProfile;
  actions?: ReactNode;
};

export function BorrowerCard({ borrower, actions }: BorrowerCardProps) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <BorrowerAvatar name={borrower.name} image={borrower.image} />
        <div>
          <CardTitle className="text-lg">{borrower.name || "Unnamed borrower"}</CardTitle>
          <p className="text-sm text-muted-foreground">{borrower.schoolId}</p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>Type: {borrower.type}</p>
        {borrower.program ? <p>Program: {borrower.program}</p> : null}
        {borrower.yearLevel ? <p>Year Level: {borrower.yearLevel}</p> : null}
        {borrower.section ? <p>Section: {borrower.section}</p> : null}
        {borrower.contactNumber ? <p>Contact Number: {borrower.contactNumber}</p> : null}
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </CardContent>
    </Card>
  );
}
