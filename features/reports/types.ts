import type { BorrowerType } from "@/core/db/schema";

export type AcknowledgementReportItem = {
  transactionId: number;
  toolId: number;
  toolName: string;
  barcode: string;
  category: string | null;
  borrowedAt: Date;
  issuedByName: string | null;
  issuedByDetails: string | null;
};

export type AcknowledgementReportGroup = {
  id: string;
  slipNumber: string;
  borrowerId: string | null;
  borrowerSchoolId: string | null;
  borrowerName: string;
  borrowerType: BorrowerType | null;
  borrowerProgram: string | null;
  borrowerYearLevel: number | null;
  borrowerSection: string | null;
  issuedByNames: string[];
  dateFrom: Date;
  dateTo: Date;
  items: AcknowledgementReportItem[];
};
